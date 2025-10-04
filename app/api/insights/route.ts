import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { AIInsight } from '@/types';

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

// Cache for insights
let insightsCache: AIInsight[] | null = null;
let lastInsightsLoad = 0;

async function generateInsights(): Promise<AIInsight[]> {
  // Cache for 15 minutes
  if (insightsCache && Date.now() - lastInsightsLoad < 900000) {
    return insightsCache;
  }

  try {
    const summaryPath = path.join(process.cwd(), 'SB_publications-main', 'scraped_summary.csv');
    
    if (!fs.existsSync(summaryPath)) {
      console.warn('Summary CSV not found');
      return [];
    }

    const csvContent = fs.readFileSync(summaryPath, 'utf-8');
    const records = parseCSV(csvContent);

    // Analyze the scraped data to generate insights
    const insights: AIInsight[] = [];
    const contentAnalysis = await analyzeScrapedContent(records);
    
    // Generate different types of insights based on the data
    insights.push(...generateTrendInsights(contentAnalysis));
    insights.push(...generateGapInsights(contentAnalysis));
    insights.push(...generateRecommendationInsights(contentAnalysis));
    insights.push(...generatePredictionInsights(contentAnalysis));

    insightsCache = insights;
    lastInsightsLoad = Date.now();
    
    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    return [];
  }
}

interface ContentAnalysis {
  totalArticles: number;
  keywordFrequency: { [key: string]: number };
  categoryDistribution: { [key: string]: number };
  contentTypes: { [key: string]: number };
  averageWordCount: number;
  commonTopics: string[];
  researchGaps: string[];
}

async function analyzeScrapedContent(records: any[]): Promise<ContentAnalysis> {
  const keywordFrequency: { [key: string]: number } = {};
  const categoryDistribution: { [key: string]: number } = {};
  const contentTypes: { [key: string]: number } = {};
  let totalWordCount = 0;
  const allContent: string[] = [];

  // Biological keywords to track
  const bioKeywords = [
    'microgravity', 'space', 'cell', 'biology', 'protein', 'gene', 'DNA', 'RNA',
    'metabolism', 'growth', 'tissue', 'molecular', 'cellular', 'genetic',
    'enzyme', 'hormone', 'neuron', 'muscle', 'bone', 'immune', 'cancer',
    'stem cell', 'chromosome', 'mutation', 'research', 'study', 'experiment',
    'astronaut', 'spaceflight', 'radiation', 'weightlessness', 'adaptation',
    'physiological', 'biochemical', 'therapeutic', 'clinical', 'biomarker'
  ];

  for (const record of records) {
    try {
      const wordCount = parseInt(record.word_count) || 0;
      totalWordCount += wordCount;

      // Track content types
      const contentType = record.content_type || 'HTML';
      contentTypes[contentType] = (contentTypes[contentType] || 0) + 1;

      // Try to read article content
      const filePath = path.join(process.cwd(), 'SB_publications-main', record.saved_file_path);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8').toLowerCase();
        allContent.push(content);

        // Count keywords
        bioKeywords.forEach(keyword => {
          if (content.includes(keyword.toLowerCase())) {
            keywordFrequency[keyword] = (keywordFrequency[keyword] || 0) + 1;
          }
        });

        // Categorize content
        const categories = categorizeContent(content);
        categories.forEach(category => {
          categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
        });
      }
    } catch (error) {
      console.error(`Error analyzing record ${record.article_id}:`, error);
    }
  }

  const commonTopics = Object.entries(keywordFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([topic]) => topic);

  const researchGaps = identifyResearchGaps(keywordFrequency, categoryDistribution);

  return {
    totalArticles: records.length,
    keywordFrequency,
    categoryDistribution,
    contentTypes,
    averageWordCount: records.length > 0 ? totalWordCount / records.length : 0,
    commonTopics,
    researchGaps
  };
}

function categorizeContent(content: string): string[] {
  const categories: string[] = [];

  const categoryKeywords = {
    'Space Biology': ['space', 'microgravity', 'astronaut', 'spaceflight', 'orbital'],
    'Cell Biology': ['cell', 'cellular', 'membrane', 'organelle', 'cytoplasm'],
    'Molecular Biology': ['dna', 'rna', 'gene', 'genetic', 'molecular', 'protein'],
    'Human Physiology': ['physiological', 'organ', 'system', 'function', 'metabolism'],
    'Neuroscience': ['neuron', 'brain', 'nervous', 'neural', 'cognition'],
    'Immunology': ['immune', 'antibody', 'antigen', 'inflammation', 'cytokine'],
    'Cancer Research': ['cancer', 'tumor', 'oncology', 'malignant', 'carcinoma'],
    'Stem Cell Research': ['stem cell', 'differentiation', 'pluripotent', 'regenerative'],
    'Radiation Biology': ['radiation', 'cosmic rays', 'radioprotection', 'dna damage']
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

function identifyResearchGaps(keywordFreq: { [key: string]: number }, categories: { [key: string]: number }): string[] {
  const gaps: string[] = [];
  
  // Identify underrepresented areas
  const totalArticles = Object.values(categories).reduce((sum, count) => sum + count, 0);
  
  if ((categories['Radiation Biology'] || 0) / totalArticles < 0.1) {
    gaps.push('Radiation biology research in space environments');
  }
  
  if ((categories['Neuroscience'] || 0) / totalArticles < 0.15) {
    gaps.push('Neurological adaptations to microgravity');
  }
  
  if ((keywordFreq['therapeutic'] || 0) < 5) {
    gaps.push('Therapeutic interventions for space-related health issues');
  }
  
  if ((keywordFreq['biomarker'] || 0) < 3) {
    gaps.push('Biomarker identification for space medicine');
  }

  return gaps;
}

function generateTrendInsights(analysis: ContentAnalysis): AIInsight[] {
  const insights: AIInsight[] = [];
  
  const topTopic = analysis.commonTopics[0];
  if (topTopic) {
    insights.push({
      id: `trend-${Date.now()}-1`,
      type: 'trend',
      title: `Rising Interest in ${topTopic.charAt(0).toUpperCase() + topTopic.slice(1)} Research`,
      description: `Analysis of ${analysis.totalArticles} articles shows ${topTopic} is the most frequently mentioned topic, appearing in ${analysis.keywordFrequency[topTopic]} publications. This indicates strong research focus in this area.`,
      confidence: 0.85,
      evidence: [
        `${analysis.keywordFrequency[topTopic]} articles mention ${topTopic}`,
        `Represents ${((analysis.keywordFrequency[topTopic] / analysis.totalArticles) * 100).toFixed(1)}% of all publications`,
        'Consistent appearance across multiple research categories'
      ],
      implications: [
        'Indicates high priority research area for NASA bioscience',
        'Suggests established expertise and ongoing investment',
        'Potential for breakthrough discoveries in this field'
      ],
      actionable: true,
      priority: 'high',
      createdAt: new Date().toISOString()
    });
  }

  // Content type trend
  const pdfRatio = (analysis.contentTypes['PDF'] || 0) / analysis.totalArticles;
  if (pdfRatio > 0.3) {
    insights.push({
      id: `trend-${Date.now()}-2`,
      type: 'trend',
      title: 'High Proportion of PDF-Based Research Publications',
      description: `${(pdfRatio * 100).toFixed(1)}% of articles are in PDF format, suggesting formal publication standards and peer-reviewed content quality.`,
      confidence: 0.92,
      evidence: [
        `${analysis.contentTypes['PDF'] || 0} PDF documents out of ${analysis.totalArticles} total`,
        'PDF format indicates formal publication process',
        'Suggests academic rigor in research documentation'
      ],
      implications: [
        'High quality, peer-reviewed research content',
        'Formal documentation standards being maintained',
        'Research suitable for academic and policy references'
      ],
      actionable: false,
      priority: 'medium',
      createdAt: new Date().toISOString()
    });
  }

  return insights;
}

function generateGapInsights(analysis: ContentAnalysis): AIInsight[] {
  const insights: AIInsight[] = [];

  analysis.researchGaps.forEach((gap, index) => {
    insights.push({
      id: `gap-${Date.now()}-${index + 1}`,
      type: 'gap',
      title: `Research Gap Identified: ${gap}`,
      description: `Analysis reveals limited research coverage in ${gap.toLowerCase()}, representing an opportunity for future investigations.`,
      confidence: 0.75,
      evidence: [
        'Low frequency of related keywords in current literature',
        'Underrepresented in major research categories',
        'Important for comprehensive space biology understanding'
      ],
      implications: [
        'Potential area for new research initiatives',
        'May require additional funding allocation',
        'Could yield significant scientific insights if pursued'
      ],
      actionable: true,
      priority: 'medium',
      createdAt: new Date().toISOString()
    });
  });

  return insights;
}

function generateRecommendationInsights(analysis: ContentAnalysis): AIInsight[] {
  const insights: AIInsight[] = [];

  // Cross-disciplinary research recommendation
  if (Object.keys(analysis.categoryDistribution).length > 3) {
    insights.push({
      id: `rec-${Date.now()}-1`,
      type: 'recommendation',
      title: 'Promote Cross-Disciplinary Research Integration',
      description: `With ${Object.keys(analysis.categoryDistribution).length} distinct research categories identified, there's significant potential for cross-disciplinary collaboration to yield novel insights.`,
      confidence: 0.80,
      evidence: [
        `${Object.keys(analysis.categoryDistribution).length} different research categories present`,
        'Multiple overlapping research domains',
        'Strong foundation in diverse biological sciences'
      ],
      implications: [
        'Enhanced research outcomes through collaboration',
        'More comprehensive understanding of space biology',
        'Efficient resource utilization across disciplines'
      ],
      actionable: true,
      priority: 'high',
      createdAt: new Date().toISOString()
    });
  }

  // Data standardization recommendation
  insights.push({
    id: `rec-${Date.now()}-2`,
    type: 'recommendation',
    title: 'Implement Standardized Research Data Formats',
    description: `Analysis of content structure reveals opportunities for improved data standardization to enhance research accessibility and meta-analysis capabilities.`,
    confidence: 0.70,
    evidence: [
      'Varying content structures across publications',
      'Mix of PDF and HTML formats',
      'Potential for improved data extraction'
    ],
    implications: [
      'Better data integration and analysis capabilities',
      'Enhanced research discoverability',
      'Improved meta-analysis opportunities'
    ],
    actionable: true,
    priority: 'medium',
    createdAt: new Date().toISOString()
  });

  return insights;
}

function generatePredictionInsights(analysis: ContentAnalysis): AIInsight[] {
  const insights: AIInsight[] = [];

  const cellBiologyRatio = (analysis.categoryDistribution['Cell Biology'] || 0) / analysis.totalArticles;
  if (cellBiologyRatio > 0.2) {
    insights.push({
      id: `pred-${Date.now()}-1`,
      type: 'prediction',
      title: 'Cell Biology Research Likely to Drive Future Breakthroughs',
      description: `With ${(cellBiologyRatio * 100).toFixed(1)}% of research focused on cell biology, this field is positioned to produce significant advances in understanding space-related biological changes.`,
      confidence: 0.72,
      evidence: [
        `${analysis.categoryDistribution['Cell Biology'] || 0} articles in cell biology category`,
        'Strong foundation of cellular research',
        'Critical for understanding space adaptation mechanisms'
      ],
      implications: [
        'Anticipated breakthroughs in cellular adaptation mechanisms',
        'Potential for novel therapeutic targets',
        'Enhanced astronaut health countermeasures'
      ],
      actionable: false,
      priority: 'high',
      createdAt: new Date().toISOString()
    });
  }

  return insights;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');

    const insights = await generateInsights();
    
    let filteredInsights = insights;
    
    if (type !== 'all') {
      filteredInsights = insights.filter(insight => insight.type === type);
    }
    
    filteredInsights = filteredInsights.slice(0, limit);

    return NextResponse.json({
      success: true,
      insights: filteredInsights,
      total: filteredInsights.length
    });

  } catch (error) {
    console.error('Insights API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}