import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getDataSource, logDeploymentInfo, safeReadFile, fallbackStats, getEmbeddedArticlesData } from '@/utils/deployment';

interface ArticleStats {
  totalArticles: number;
  totalWords: number;
  averageWords: number;
  contentTypes: { [key: string]: number };
  topKeywords: { keyword: string; count: number }[];
  categoriesCount: { [key: string]: number };
  monthlyPublications: { month: string; count: number }[];
  dailyActivity: { date: string; articles: number; words: number }[];
  researchTrends: { topic: string; articles: number; growth: number }[];
}

// Simple CSV parser
function parseCSV(csvContent: string) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: any = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim().replace(/"/g, '');
    });
    data.push(row);
  }

  return data;
}

let statsCache: ArticleStats | null = null;
let lastStatsLoad = 0;

async function generateStats(): Promise<ArticleStats> {
  // Cache for 5 minutes
  if (statsCache && Date.now() - lastStatsLoad < 300000) {
    return statsCache;
  }

  // Log deployment info for debugging
  logDeploymentInfo();
  
  const dataSource = getDataSource();
  
  if (dataSource === 'fallback') {
    console.log('Using fallback stats - filesystem not accessible');
    statsCache = fallbackStats;
    lastStatsLoad = Date.now();
    return fallbackStats;
  }
  
  if (dataSource === 'embedded') {
    console.log('Using embedded data for stats generation');
    const embeddedStats = generateStatsFromEmbeddedData();
    statsCache = embeddedStats;
    lastStatsLoad = Date.now();
    return embeddedStats;
  }

  try {
    const summaryPath = path.join(process.cwd(), 'SB_publications-main', 'scraped_summary.csv');
    
    const csvContent = safeReadFile(summaryPath);
    if (!csvContent) {
      console.warn('Summary CSV not found, using fallback stats');
      statsCache = fallbackStats;
      lastStatsLoad = Date.now();
      return fallbackStats;
    }

    const records = parseCSV(csvContent);

    // Initialize counters
    const contentTypes: { [key: string]: number } = {};
    const keywordCounts: { [key: string]: number } = {};
    const categoriesCount: { [key: string]: number } = {};
    let totalWords = 0;

    // Biological keywords for analysis
    const bioKeywords = [
      'microgravity', 'space', 'cell', 'biology', 'protein', 'gene', 'DNA', 'RNA',
      'metabolism', 'growth', 'tissue', 'molecular', 'cellular', 'genetic',
      'enzyme', 'hormone', 'neuron', 'muscle', 'bone', 'immune', 'cancer',
      'stem cell', 'chromosome', 'mutation', 'research', 'study', 'experiment',
      'development', 'differentiation', 'proliferation', 'apoptosis', 'inflammation'
    ];

    // Process each article
    for (const record of records) {
      try {
        const wordCount = parseInt(record.word_count) || 0;
        totalWords += wordCount;

        // Content types
        const contentType = record.content_type || 'HTML';
        contentTypes[contentType] = (contentTypes[contentType] || 0) + 1;

        // Try to read article content for keyword and category analysis
        const filePath = path.join(process.cwd(), 'SB_publications-main', record.saved_file_path);
        
        const content = safeReadFile(filePath);
        if (content) {
          const lowerContent = content.toLowerCase();
          
          // Count keywords
          bioKeywords.forEach(keyword => {
            if (lowerContent.includes(keyword.toLowerCase())) {
              keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
            }
          });

          // Categorize article
          const categories = categorizeArticle(lowerContent, record.url);
          categories.forEach(category => {
            categoriesCount[category] = (categoriesCount[category] || 0) + 1;
          });
        }
      } catch (error) {
        console.error(`Error processing article stats for ${record.article_id}:`, error);
      }
    }

    // Get top keywords
    const topKeywords = Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([keyword, count]) => ({ keyword, count }));

    // Generate monthly publication data (mock for visualization)
    const monthlyPublications = generateMonthlyData();
    
    // Generate daily activity data
    const dailyActivity = generateDailyActivity();

    // Generate research trends
    const researchTrends = generateResearchTrends(topKeywords);

    const stats: ArticleStats = {
      totalArticles: records.length,
      totalWords,
      averageWords: records.length > 0 ? Math.round(totalWords / records.length) : 0,
      contentTypes,
      topKeywords,
      categoriesCount,
      monthlyPublications,
      dailyActivity,
      researchTrends
    };

    statsCache = stats;
    lastStatsLoad = Date.now();
    
    return stats;
  } catch (error) {
    console.error('Error generating stats, using fallback data:', error);
    statsCache = fallbackStats;
    lastStatsLoad = Date.now();
    return fallbackStats;
  }
}

function getEmptyStats(): ArticleStats {
  return {
    totalArticles: 0,
    totalWords: 0,
    averageWords: 0,
    contentTypes: {},
    topKeywords: [],
    categoriesCount: {},
    monthlyPublications: [],
    dailyActivity: [],
    researchTrends: []
  };
}

function categorizeArticle(content: string, url: string): string[] {
  const categories: string[] = [];

  const categoryKeywords = {
    'Space Biology': ['space', 'microgravity', 'astronaut', 'spaceflight', 'orbital'],
    'Cell Biology': ['cell', 'cellular', 'membrane', 'organelle', 'cytoplasm'],
    'Molecular Biology': ['dna', 'rna', 'gene', 'genetic', 'molecular', 'protein'],
    'Physiology': ['physiological', 'organ', 'system', 'function', 'metabolism'],
    'Neuroscience': ['neuron', 'brain', 'nervous', 'neural', 'cognition'],
    'Immunology': ['immune', 'antibody', 'antigen', 'inflammation', 'cytokine'],
    'Cancer Research': ['cancer', 'tumor', 'oncology', 'malignant', 'carcinoma'],
    'Stem Cell Research': ['stem cell', 'differentiation', 'pluripotent', 'regenerative'],
    'Genetics': ['chromosome', 'mutation', 'genomic', 'inheritance', 'allele'],
    'Biochemistry': ['biochemical', 'metabolic', 'enzyme', 'substrate', 'pathway']
  };

  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    const matchCount = keywords.reduce((count, keyword) => {
      return count + (content.includes(keyword) ? 1 : 0);
    }, 0);
    
    if (matchCount >= 1) {
      categories.push(category);
    }
  });

  return categories.length > 0 ? categories : ['General Biology'];
}

function generateMonthlyData() {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  return months.map(month => ({
    month,
    count: Math.floor(Math.random() * 60) + 30
  }));
}

function generateDailyActivity() {
  const days = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    days.push({
      date: date.toISOString().split('T')[0],
      articles: Math.floor(Math.random() * 15) + 5,
      words: Math.floor(Math.random() * 50000) + 25000
    });
  }
  
  return days;
}

// Generate stats from embedded data
function generateStatsFromEmbeddedData(): ArticleStats {
  const embeddedArticles = getEmbeddedArticlesData();
  
  // Initialize counters
  const contentTypes: { [key: string]: number } = {};
  const keywordCounts: { [key: string]: number } = {};
  const categoriesCount: { [key: string]: number } = {};
  let totalWords = 0;

  // Process embedded articles
  embeddedArticles.forEach(article => {
    totalWords += article.wordCount;
    
    // Content types
    const contentType = article.contentType || 'HTML';
    contentTypes[contentType] = (contentTypes[contentType] || 0) + 1;
    
    // Count keywords
    article.keywords.forEach(keyword => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
    
    // Count categories
    article.categories.forEach(category => {
      categoriesCount[category] = (categoriesCount[category] || 0) + 1;
    });
  });
  
  // Get top keywords
  const topKeywords = Object.entries(keywordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([keyword, count]) => ({ keyword, count }));
    
  return {
    totalArticles: embeddedArticles.length,
    totalWords,
    averageWords: embeddedArticles.length > 0 ? Math.round(totalWords / embeddedArticles.length) : 0,
    contentTypes,
    topKeywords,
    categoriesCount,
    monthlyPublications: generateMonthlyData(),
    dailyActivity: generateDailyActivity(),
    researchTrends: generateResearchTrends(topKeywords)
  };
}

function generateResearchTrends(topKeywords: { keyword: string; count: number }[]) {
  return topKeywords.slice(0, 10).map(item => ({
    topic: item.keyword,
    articles: item.count,
    growth: Math.floor(Math.random() * 40) - 20 // -20% to +20% growth
  }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    const stats = await generateStats();

    switch (type) {
      case 'overview':
        return NextResponse.json({
          success: true,
          data: {
            totalArticles: stats.totalArticles,
            totalWords: stats.totalWords,
            averageWords: stats.averageWords,
            contentTypes: stats.contentTypes
          }
        });

      case 'keywords':
        return NextResponse.json({
          success: true,
          data: {
            topKeywords: stats.topKeywords,
            total: stats.topKeywords.length
          }
        });

      case 'categories':
        return NextResponse.json({
          success: true,
          data: {
            categoriesCount: stats.categoriesCount,
            total: Object.keys(stats.categoriesCount).length
          }
        });

      case 'trends':
        return NextResponse.json({
          success: true,
          data: {
            monthlyPublications: stats.monthlyPublications,
            dailyActivity: stats.dailyActivity,
            researchTrends: stats.researchTrends
          }
        });

      case 'full':
      default:
        return NextResponse.json({
          success: true,
          data: stats
        });
    }

  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}