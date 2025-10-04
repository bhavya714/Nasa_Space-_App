// Comprehensive data loading system to ensure all 562 articles are available on deployment
import fs from 'fs';
import path from 'path';
import { getEmbeddedData } from '@/data/embeddedData';

export interface DataLoadResult {
  success: boolean;
  source: 'filesystem' | 'embedded' | 'none';
  articlesCount: number;
  totalWords: number;
  error?: string;
}

// Comprehensive data verification
export function verifyDataAvailability(): DataLoadResult {
  console.log('🔍 Verifying NASA research data availability...');
  
  try {
    // Try to access the main CSV file
    const summaryPath = path.join(process.cwd(), 'SB_publications-main', 'scraped_summary.csv');
    
    if (fs.existsSync(summaryPath)) {
      console.log('✅ Found scraped_summary.csv');
      
      // Verify we can read it
      const csvContent = fs.readFileSync(summaryPath, 'utf-8');
      const lines = csvContent.trim().split('\n');
      const articleCount = lines.length - 1; // Minus header
      
      console.log(`📊 CSV contains ${articleCount} article records`);
      
      // Verify articles directory exists
      const articlesDir = path.join(process.cwd(), 'SB_publications-main', 'scraped_articles');
      
      if (fs.existsSync(articlesDir)) {
        const articleFiles = fs.readdirSync(articlesDir);
        console.log(`📁 Articles directory contains ${articleFiles.length} files`);
        
        // Test reading a few article files
        let totalWords = 0;
        let readableFiles = 0;
        
        for (let i = 0; i < Math.min(5, articleFiles.length); i++) {
          try {
            const articlePath = path.join(articlesDir, articleFiles[i]);
            const content = fs.readFileSync(articlePath, 'utf-8');
            totalWords += content.split(' ').length;
            readableFiles++;
          } catch (error) {
            console.warn(`⚠️ Could not read ${articleFiles[i]}`);
          }
        }
        
        console.log(`✅ Successfully read ${readableFiles} test articles`);
        
        return {
          success: true,
          source: 'filesystem',
          articlesCount: articleCount,
          totalWords: totalWords * (articleFiles.length / Math.min(5, articleFiles.length)), // Estimate
          error: undefined
        };
      } else {
        console.warn('⚠️ Articles directory not found');
      }
    } else {
      console.warn('⚠️ scraped_summary.csv not found');
    }
    
  } catch (error) {
    console.error('❌ Filesystem access failed:', error);
  }
  
  // Fallback to embedded data
  console.log('🔄 Falling back to embedded data...');
  const embeddedData = getEmbeddedData();
  
  return {
    success: true,
    source: 'embedded',
    articlesCount: Object.keys(embeddedData.articleTexts).length,
    totalWords: 80000, // Estimated from embedded content
    error: 'Filesystem not accessible, using embedded data'
  };
}

// Enhanced CSV parser with better error handling
export function parseCSVSafely(csvContent: string): any[] {
  try {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV appears to be empty or malformed');
    }
    
    const headers = lines[0].split(',');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      try {
        // Handle CSV with quotes and commas properly
        const values = parseCSVLine(lines[i]);
        const row: any = {};
        
        headers.forEach((header, index) => {
          row[header.trim()] = values[index]?.trim().replace(/^"(.*)"$/, '$1') || '';
        });
        
        // Validate required fields
        if (row.article_id && row.url && row.saved_file_path) {
          data.push(row);
        }
      } catch (error) {
        console.warn(`Warning: Skipping malformed CSV line ${i + 1}`);
      }
    }
    
    console.log(`✅ Successfully parsed ${data.length} article records from CSV`);
    return data;
    
  } catch (error) {
    console.error('❌ CSV parsing failed:', error);
    throw error;
  }
}

// Proper CSV line parsing to handle quotes and commas
function parseCSVLine(line: string): string[] {
  const values = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current);
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  // Add the last field
  values.push(current);
  return values;
}

// Safe file reading with multiple attempts
export function readArticleFileSafely(filePath: string): string | null {
  try {
    // Try different encodings if needed
    const encodings = ['utf-8', 'latin1', 'ascii'];
    
    for (const encoding of encodings) {
      try {
        const content = fs.readFileSync(filePath, encoding as BufferEncoding);
        if (content && content.length > 100) {
          return content;
        }
      } catch (error) {
        continue;
      }
    }
    
    console.warn(`⚠️ Could not read file with any encoding: ${filePath}`);
    return null;
    
  } catch (error) {
    console.warn(`⚠️ File read error: ${filePath}`, error);
    return null;
  }
}

// Comprehensive article loading with progress tracking
export function loadAllArticlesRobustly(): any[] {
  const verification = verifyDataAvailability();
  
  if (verification.source === 'embedded') {
    console.log('📦 Using embedded data system');
    return getEmbeddedArticlesFromData();
  }
  
  console.log('💾 Loading articles from filesystem...');
  
  try {
    const summaryPath = path.join(process.cwd(), 'SB_publications-main', 'scraped_summary.csv');
    const csvContent = fs.readFileSync(summaryPath, 'utf-8');
    const records = parseCSVSafely(csvContent);
    
    const articles = [];
    let loadedCount = 0;
    let skippedCount = 0;
    
    console.log(`📚 Processing ${records.length} article records...`);
    
    for (const record of records) {
      try {
        const filePath = path.join(process.cwd(), 'SB_publications-main', record.saved_file_path);
        const content = readArticleFileSafely(filePath);
        
        if (content) {
          articles.push({
            id: parseInt(record.article_id),
            title: record.title || extractTitleFromContent(content) || `Research Article ${record.article_id}`,
            url: record.url,
            content: content.slice(0, 2000), // Truncate for API response
            wordCount: parseInt(record.word_count) || content.split(' ').length,
            contentType: (record.content_type as 'HTML' | 'PDF') || 'HTML',
            abstract: extractAbstractFromContent(content),
            keywords: extractKeywordsFromContent(content),
            categories: categorizeContent(content),
            pmcId: extractPMCId(record.url)
          });
          
          loadedCount++;
          
          // Progress logging
          if (loadedCount % 50 === 0) {
            console.log(`📈 Loaded ${loadedCount} articles...`);
          }
        } else {
          skippedCount++;
        }
        
      } catch (error) {
        skippedCount++;
        console.warn(`⚠️ Error processing article ${record.article_id}:`, error);
      }
    }
    
    console.log(`✅ Successfully loaded ${loadedCount} articles (skipped ${skippedCount})`);
    return articles;
    
  } catch (error) {
    console.error('❌ Failed to load filesystem data, falling back to embedded:', error);
    return getEmbeddedArticlesFromData();
  }
}

// Helper functions for content processing
function extractTitleFromContent(content: string): string | null {
  const lines = content.split('\n').filter(line => line.trim());
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length > 20 && line.length < 200 && !line.includes('doi:') && !line.includes('PMC')) {
      return line.replace(/^\\d+\\|/, '').trim();
    }
  }
  return null;
}

function extractAbstractFromContent(content: string): string {
  const abstractMatch = content.match(/Abstract\\s*([\\s\\S]*?)\\s*(Introduction|Methods|Results)/i);
  if (abstractMatch) {
    return abstractMatch[1].trim().slice(0, 300) + '...';
  }
  
  const lines = content.split('\n').filter(line => line.trim());
  for (let i = 1; i < Math.min(15, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length > 100 && line.length < 500) {
      return line.slice(0, 300) + '...';
    }
  }
  
  return 'Abstract not available';
}

function extractKeywordsFromContent(content: string): string[] {
  const bioKeywords = [
    'microgravity', 'space', 'cell', 'biology', 'protein', 'gene', 'DNA', 'RNA',
    'metabolism', 'growth', 'tissue', 'molecular', 'cellular', 'genetic',
    'enzyme', 'hormone', 'neuron', 'muscle', 'bone', 'immune', 'cancer',
    'stem cell', 'chromosome', 'mutation', 'research', 'study', 'experiment'
  ];
  
  const lowerContent = content.toLowerCase();
  const keywords = bioKeywords.filter(keyword => 
    lowerContent.includes(keyword.toLowerCase())
  );
  
  return keywords.slice(0, 8);
}

function categorizeContent(content: string): string[] {
  const lowerContent = content.toLowerCase();
  const categories = [];
  
  const categoryMap = {
    'Space Biology': ['space', 'microgravity', 'astronaut', 'spaceflight'],
    'Cell Biology': ['cell', 'cellular', 'membrane', 'organelle'],
    'Molecular Biology': ['dna', 'rna', 'gene', 'genetic', 'molecular', 'protein'],
    'Human Physiology': ['human', 'physiological', 'cardiovascular', 'muscle'],
    'Neuroscience': ['neuron', 'brain', 'nervous', 'neural'],
    'Immunology': ['immune', 'antibody', 'antigen', 'inflammation'],
    'Cancer Research': ['cancer', 'tumor', 'oncology', 'malignant']
  };
  
  Object.entries(categoryMap).forEach(([category, keywords]) => {
    const matches = keywords.filter(keyword => lowerContent.includes(keyword));
    if (matches.length > 0) {
      categories.push(category);
    }
  });
  
  return categories.length > 0 ? categories : ['General Biology'];
}

function extractPMCId(url: string): string | undefined {
  const match = url.match(/PMC(\\d+)/);
  return match ? match[1] : undefined;
}

function getEmbeddedArticlesFromData(): any[] {
  const embeddedData = getEmbeddedData();
  const articles = [];
  
  const lines = embeddedData.csvData.trim().split('\n');
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const fileName = values[5]?.split('/')[1];
    const content = embeddedData.articleTexts[fileName] || 'Article content not available';
    
    articles.push({
      id: parseInt(values[0]),
      title: values[2]?.replace(/"/g, '') || `Research Article ${values[0]}`,
      url: values[1],
      content: content,
      wordCount: parseInt(values[4]) || 2500,
      contentType: values[3] as 'HTML' | 'PDF' || 'HTML',
      abstract: extractAbstractFromContent(content),
      keywords: extractKeywordsFromContent(content),
      categories: categorizeContent(content),
      pmcId: extractPMCId(values[1])
    });
  }
  
  return articles;
}