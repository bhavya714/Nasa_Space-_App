import fs from 'fs';
import path from 'path';
// Removed external CSV parser to avoid extra dependency

export interface Article {
  id: number;
  title: string;
  url: string;
  content: string;
  wordCount: number;
  contentType: 'HTML' | 'PDF';
  filePath: string;
  abstract?: string;
  keywords?: string[];
  authors?: string[];
  publishedDate?: string;
  journal?: string;
  pmcId?: string;
  categories?: string[];
}

export interface ArticleStats {
  totalArticles: number;
  totalWords: number;
  averageWords: number;
  contentTypes: { [key: string]: number };
  topKeywords: { keyword: string; count: number; }[];
  categoriesCount: { [key: string]: number };
  monthlyPublications: { month: string; count: number; }[];
}

class ArticleProcessor {
  private static instance: ArticleProcessor;
  private articles: Article[] = [];
  private isLoaded = false;

  public static getInstance(): ArticleProcessor {
    if (!ArticleProcessor.instance) {
      ArticleProcessor.instance = new ArticleProcessor();
    }
    return ArticleProcessor.instance;
  }

  public async loadArticles(): Promise<Article[]> {
    if (this.isLoaded && this.articles.length > 0) {
      return this.articles;
    }

    try {
      const summaryPath = path.join(process.cwd(), 'SB_publications-main', 'scraped_summary.csv');
      const articlesDir = path.join(process.cwd(), 'SB_publications-main', 'scraped_articles');

      if (!fs.existsSync(summaryPath)) {
        console.warn('Summary CSV not found, returning empty articles array');
        return [];
      }

      const csvContent = fs.readFileSync(summaryPath, 'utf-8');
      const records = this.simpleParseCSV(csvContent);

      const articles: Article[] = [];

      for (const record of records) {
        try {
          const filePath = path.join(process.cwd(), 'SB_publications-main', record.saved_file_path);
          
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const processedArticle = this.processArticleContent(content, record);
            articles.push(processedArticle);
          }
        } catch (error) {
          console.error(`Error processing article ${record.article_id}:`, error);
        }
      }

      this.articles = articles;
      this.isLoaded = true;
      console.log(`Loaded ${articles.length} articles successfully`);
      return articles;
    } catch (error) {
      console.error('Error loading articles:', error);
      return [];
    }
  }

  private simpleParseCSV(csvContent: string): any[] {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim().replace(/"/g, '');
      });
      data.push(row);
    }
    return data;
  }

  private processArticleContent(content: string, record: any): Article {
    const lines = content.split('\n').filter(line => line.trim());
    const title = this.extractTitle(lines, record.url);
    const abstract = this.extractAbstract(lines);
    const keywords = this.extractKeywords(content);
    const authors = this.extractAuthors(lines);
    const pmcId = this.extractPMCId(record.url);
    const categories = this.categorizeArticle(content, title);
    
    return {
      id: parseInt(record.article_id),
      title,
      url: record.url,
      content: content,
      wordCount: parseInt(record.word_count),
      contentType: record.content_type as 'HTML' | 'PDF',
      filePath: record.saved_file_path,
      abstract,
      keywords,
      authors,
      pmcId,
      categories
    };
  }

  private extractTitle(lines: string[], url: string): string {
    // Look for title patterns in the first few lines
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].trim();
      if (line.length > 20 && line.length < 200 && !line.includes('doi:') && !line.includes('PMC')) {
        // Clean up common artifacts
        let cleanTitle = line.replace(/^\d+\|/, ''); // Remove line numbers
        cleanTitle = cleanTitle.replace(/^[^\w]*/, ''); // Remove leading non-word chars
        cleanTitle = cleanTitle.replace(/[^\w\s\-\:\(\)]*$/, ''); // Remove trailing artifacts
        
        if (cleanTitle.length > 10) {
          return cleanTitle;
        }
      }
    }
    
    // Fallback to PMC ID
    const pmcMatch = url.match(/PMC\d+/);
    return pmcMatch ? `Biology Research Article - ${pmcMatch[0]}` : 'Biology Research Article';
  }

  private extractAbstract(lines: string[]): string {
    const abstractStart = lines.findIndex(line => 
      line.toLowerCase().includes('abstract') && line.length < 50
    );
    
    if (abstractStart >= 0 && abstractStart < lines.length - 1) {
      // Get the next few lines as abstract
      const abstractLines = lines.slice(abstractStart + 1, abstractStart + 8);
      const abstract = abstractLines.join(' ').slice(0, 500);
      return abstract.trim();
    }
    
    // Fallback: use first substantial paragraph
    for (let i = 1; i < Math.min(20, lines.length); i++) {
      const line = lines[i].trim();
      if (line.length > 100 && line.length < 800) {
        return line.slice(0, 500) + '...';
      }
    }
    
    return 'Abstract not available';
  }

  private extractKeywords(content: string): string[] {
    const keywords: string[] = [];
    
    // Biological science keywords to look for
    const bioKeywords = [
      'microgravity', 'space', 'cell', 'biology', 'protein', 'gene', 'DNA', 'RNA',
      'metabolism', 'growth', 'development', 'tissue', 'organ', 'system', 'molecular',
      'cellular', 'biochemical', 'physiological', 'genetic', 'genomic', 'transcription',
      'translation', 'enzyme', 'hormone', 'neuron', 'muscle', 'bone', 'cardiovascular',
      'immune', 'cancer', 'stem cell', 'differentiation', 'proliferation', 'apoptosis',
      'inflammation', 'oxidative stress', 'mitochondria', 'nucleus', 'chromosome',
      'mutation', 'expression', 'regulation', 'pathway', 'signaling', 'receptor',
      'antibody', 'antigen', 'vaccine', 'therapy', 'treatment', 'drug', 'medicine',
      'experiment', 'research', 'study', 'analysis', 'method', 'technique', 'assay',
      'culture', 'in vitro', 'in vivo', 'mouse', 'rat', 'human', 'animal', 'model'
    ];

    const lowerContent = content.toLowerCase();
    
    bioKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowerContent.match(regex);
      if (matches && matches.length >= 2) {
        keywords.push(keyword);
      }
    });

    return keywords.slice(0, 10); // Return top 10 keywords
  }

  private extractAuthors(lines: string[]): string[] {
    // Look for author patterns in the first 20 lines
    const authorPatterns = [
      /^([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s*,\s*([A-Z][a-z]+\s+[A-Z][a-z]+))*$/,
      /Author[s]?:\s*(.+)$/i,
      /By:\s*(.+)$/i
    ];

    for (let i = 0; i < Math.min(20, lines.length); i++) {
      const line = lines[i].trim();
      
      for (const pattern of authorPatterns) {
        const match = line.match(pattern);
        if (match) {
          return match[1].split(',').map(author => author.trim()).slice(0, 5);
        }
      }
    }

    return [];
  }

  private extractPMCId(url: string): string | undefined {
    const match = url.match(/PMC(\d+)/);
    return match ? match[1] : undefined;
  }

  private categorizeArticle(content: string, title: string): string[] {
    const categories: string[] = [];
    const text = (content + ' ' + title).toLowerCase();

    const categoryKeywords = {
      'Space Biology': ['space', 'microgravity', 'astronaut', 'spaceflight', 'orbital', 'zero gravity'],
      'Cell Biology': ['cell', 'cellular', 'membrane', 'organelle', 'cytoplasm', 'nucleus'],
      'Molecular Biology': ['dna', 'rna', 'gene', 'genetic', 'molecular', 'protein', 'enzyme'],
      'Physiology': ['physiological', 'organ', 'system', 'function', 'homeostasis', 'metabolism'],
      'Neuroscience': ['neuron', 'brain', 'nervous', 'neural', 'cognition', 'behavior'],
      'Immunology': ['immune', 'antibody', 'antigen', 'lymphocyte', 'cytokine', 'inflammation'],
      'Cancer Research': ['cancer', 'tumor', 'oncology', 'carcinoma', 'malignant', 'metastasis'],
      'Stem Cell': ['stem cell', 'differentiation', 'pluripotent', 'regenerative', 'tissue engineering'],
      'Genetics': ['chromosome', 'mutation', 'inheritance', 'genomic', 'allele', 'phenotype'],
      'Biochemistry': ['biochemical', 'metabolic', 'enzyme', 'substrate', 'catalysis', 'pathway']
    };

    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      const matchCount = keywords.reduce((count, keyword) => {
        return count + (text.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (matchCount >= 2) {
        categories.push(category);
      }
    });

    return categories.length > 0 ? categories : ['General Biology'];
  }

  public getArticleStats(): ArticleStats {
    if (!this.isLoaded || this.articles.length === 0) {
      return {
        totalArticles: 0,
        totalWords: 0,
        averageWords: 0,
        contentTypes: {},
        topKeywords: [],
        categoriesCount: {},
        monthlyPublications: []
      };
    }

    const totalWords = this.articles.reduce((sum, article) => sum + article.wordCount, 0);
    const contentTypes: { [key: string]: number } = {};
    const keywordCounts: { [key: string]: number } = {};
    const categoriesCount: { [key: string]: number } = {};

    this.articles.forEach(article => {
      // Content types
      contentTypes[article.contentType] = (contentTypes[article.contentType] || 0) + 1;

      // Keywords
      article.keywords?.forEach(keyword => {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
      });

      // Categories
      article.categories?.forEach(category => {
        categoriesCount[category] = (categoriesCount[category] || 0) + 1;
      });
    });

    const topKeywords = Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([keyword, count]) => ({ keyword, count }));

    // Generate mock monthly data for visualization
    const monthlyPublications = this.generateMonthlyData();

    return {
      totalArticles: this.articles.length,
      totalWords,
      averageWords: Math.round(totalWords / this.articles.length),
      contentTypes,
      topKeywords,
      categoriesCount,
      monthlyPublications
    };
  }

  private generateMonthlyData() {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    return months.map(month => ({
      month,
      count: Math.floor(Math.random() * 60) + 30 // Random data for visualization
    }));
  }

  public searchArticles(query: string, limit: number = 20): Article[] {
    if (!query || !this.isLoaded) return this.articles.slice(0, limit);

    const searchTerms = query.toLowerCase().split(' ');
    
    const scored = this.articles.map(article => {
      let score = 0;
      const searchableText = (
        article.title + ' ' + 
        article.abstract + ' ' + 
        article.keywords?.join(' ') + ' ' + 
        article.content.slice(0, 1000)
      ).toLowerCase();

      searchTerms.forEach(term => {
        const titleMatches = (article.title.toLowerCase().match(new RegExp(term, 'g')) || []).length;
        const abstractMatches = (article.abstract?.toLowerCase().match(new RegExp(term, 'g')) || []).length;
        const keywordMatches = article.keywords?.filter(k => k.toLowerCase().includes(term)).length || 0;
        const contentMatches = (searchableText.match(new RegExp(term, 'g')) || []).length;

        score += titleMatches * 10 + abstractMatches * 5 + keywordMatches * 8 + contentMatches * 1;
      });

      return { article, score };
    });

    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.article);
  }

  public getArticleById(id: number): Article | undefined {
    return this.articles.find(article => article.id === id);
  }

  public getArticlesByCategory(category: string, limit: number = 20): Article[] {
    return this.articles
      .filter(article => article.categories?.includes(category))
      .slice(0, limit);
  }

  public getTopKeywords(limit: number = 10): { keyword: string; count: number }[] {
    return this.getArticleStats().topKeywords.slice(0, limit);
  }
}

export default ArticleProcessor;