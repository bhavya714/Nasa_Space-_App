import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getDataSource, logDeploymentInfo, safeReadFile, fallbackArticles, fallbackStats, getEmbeddedArticlesData } from '@/utils/deployment';
import { loadAllArticlesRobustly, verifyDataAvailability } from '@/utils/dataLoader';

// Simple CSV parser for now (without external dependency)
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

// Article interface
interface Article {
  id: number;
  title: string;
  url: string;
  content: string;
  wordCount: number;
  contentType: 'HTML' | 'PDF';
  abstract: string;
  keywords: string[];
  categories: string[];
  pmcId?: string;
}

// Cache for articles
let articlesCache: Article[] | null = null;
let lastLoadTime = 0;

async function loadArticles(): Promise<Article[]> {
  // Cache for 10 minutes
  if (articlesCache && Date.now() - lastLoadTime < 600000) {
    return articlesCache;
  }

  console.log('🚀 Loading NASA research articles with robust data loader...');
  
  // Use the comprehensive data loader that handles all 562 articles
  try {
    const articles = loadAllArticlesRobustly();
    console.log(`✅ Successfully loaded ${articles.length} research articles`);
    
    articlesCache = articles;
    lastLoadTime = Date.now();
    return articles;
    
  } catch (error) {
    console.error('❌ Robust data loader failed, using basic fallback:', error);
    articlesCache = fallbackArticles;
    lastLoadTime = Date.now();
    return fallbackArticles;
  }
}

function processArticleContent(content: string, record: any): Article {
  const lines = content.split('\n').filter(line => line.trim());
  const title = extractTitle(lines, record.url);
  const abstract = extractAbstract(lines);
  const keywords = extractKeywords(content);
  const categories = categorizeArticle(content, title);
  const pmcId = extractPMCId(record.url);
  
  return {
    id: parseInt(record.article_id),
    title,
    url: record.url,
    content: content.slice(0, 2000), // Truncate for API response
    wordCount: parseInt(record.word_count),
    contentType: record.content_type as 'HTML' | 'PDF',
    abstract,
    keywords,
    categories,
    pmcId
  };
}

function extractTitle(lines: string[], url: string): string {
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length > 20 && line.length < 200 && !line.includes('doi:') && !line.includes('PMC')) {
      let cleanTitle = line.replace(/^\d+\|/, '');
      cleanTitle = cleanTitle.replace(/^[^\w]*/, '');
      cleanTitle = cleanTitle.replace(/[^\w\s\-\:\(\)]*$/, '');
      
      if (cleanTitle.length > 10) {
        return cleanTitle;
      }
    }
  }
  
  const pmcMatch = url.match(/PMC\d+/);
  return pmcMatch ? `Biology Research Article - ${pmcMatch[0]}` : 'Biology Research Article';
}

function extractAbstract(lines: string[]): string {
  const abstractStart = lines.findIndex(line => 
    line.toLowerCase().includes('abstract') && line.length < 50
  );
  
  if (abstractStart >= 0 && abstractStart < lines.length - 1) {
    const abstractLines = lines.slice(abstractStart + 1, abstractStart + 5);
    return abstractLines.join(' ').slice(0, 300);
  }
  
  for (let i = 1; i < Math.min(15, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length > 100 && line.length < 500) {
      return line.slice(0, 300) + '...';
    }
  }
  
  return 'Abstract not available';
}

function extractKeywords(content: string): string[] {
  const bioKeywords = [
    'microgravity', 'space', 'cell', 'biology', 'protein', 'gene', 'DNA', 'RNA',
    'metabolism', 'growth', 'tissue', 'molecular', 'cellular', 'genetic',
    'enzyme', 'hormone', 'neuron', 'muscle', 'bone', 'immune', 'cancer',
    'stem cell', 'chromosome', 'mutation', 'research', 'study', 'experiment'
  ];

  const keywords: string[] = [];
  const lowerContent = content.toLowerCase();
  
  bioKeywords.forEach(keyword => {
    if (lowerContent.includes(keyword.toLowerCase())) {
      keywords.push(keyword);
    }
  });

  return keywords.slice(0, 8);
}

function extractPMCId(url: string): string | undefined {
  const match = url.match(/PMC(\d+)/);
  return match ? match[1] : undefined;
}

function categorizeArticle(content: string, title: string): string[] {
  const text = (content + ' ' + title).toLowerCase();
  const categories: string[] = [];

  const categoryKeywords = {
    'Space Biology': ['space', 'microgravity', 'astronaut', 'spaceflight'],
    'Cell Biology': ['cell', 'cellular', 'membrane', 'organelle'],
    'Molecular Biology': ['dna', 'rna', 'gene', 'genetic', 'molecular', 'protein'],
    'Neuroscience': ['neuron', 'brain', 'nervous', 'neural'],
    'Immunology': ['immune', 'antibody', 'antigen', 'inflammation'],
    'Cancer Research': ['cancer', 'tumor', 'oncology', 'malignant'],
    'Genetics': ['chromosome', 'mutation', 'genomic', 'inheritance']
  };

  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    const matchCount = keywords.reduce((count, keyword) => {
      return count + (text.includes(keyword) ? 1 : 0);
    }, 0);
    
    if (matchCount >= 1) {
      categories.push(category);
    }
  });

  return categories.length > 0 ? categories : ['General Biology'];
}

function searchArticles(articles: Article[], query: string, limit: number = 20): Article[] {
  if (!query) return articles.slice(0, limit);

  const searchTerms = query.toLowerCase().split(' ');
  
  const scored = articles.map(article => {
    let score = 0;
    const searchableText = (
      article.title + ' ' + 
      article.abstract + ' ' + 
      article.keywords.join(' ')
    ).toLowerCase();

    searchTerms.forEach(term => {
      const titleMatches = (article.title.toLowerCase().match(new RegExp(term, 'g')) || []).length;
      const abstractMatches = (article.abstract.toLowerCase().match(new RegExp(term, 'g')) || []).length;
      const keywordMatches = article.keywords.filter(k => k.toLowerCase().includes(term)).length;

      score += titleMatches * 10 + abstractMatches * 5 + keywordMatches * 8;
    });

    return { article, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.article);
}

// API Routes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');

    const articles = await loadArticles();

    let filteredArticles = articles;

    if (category) {
      filteredArticles = articles.filter(article => 
        article.categories.includes(category)
      );
    }

    if (query) {
      filteredArticles = searchArticles(filteredArticles, query, limit);
    } else {
      filteredArticles = filteredArticles.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      articles: filteredArticles,
      total: filteredArticles.length,
      query: query || null
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (action === 'search') {
      const articles = await loadArticles();
      const results = searchArticles(articles, data.query, data.limit || 20);
      
      return NextResponse.json({
        success: true,
        articles: results,
        total: results.length
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}