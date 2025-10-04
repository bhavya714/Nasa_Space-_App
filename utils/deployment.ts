import fs from 'fs';
import path from 'path';

// Deployment platform detection
export function getDeploymentPlatform(): string {
  return process.env.DEPLOYMENT_PLATFORM || 'local';
}

// Check if running in a deployment environment
export function isDeploymentEnvironment(): boolean {
  return process.env.NODE_ENV === 'production' || 
         process.env.VERCEL === '1' || 
         process.env.RENDER === 'true' ||
         process.env.REPLIT_DB_URL !== undefined;
}

// Check if data files are accessible
export function isDataAccessible(): boolean {
  try {
    const summaryPath = path.join(process.cwd(), 'SB_publications-main', 'scraped_summary.csv');
    return fs.existsSync(summaryPath);
  } catch (error) {
    return false;
  }
}

// Get data source strategy
export function getDataSource(): 'filesystem' | 'fallback' {
  const configuredSource = process.env.DATA_SOURCE;
  
  if (configuredSource === 'fallback') {
    return 'fallback';
  }
  
  // Auto-detect based on file availability
  return isDataAccessible() ? 'filesystem' : 'fallback';
}

// Safe file system operations with fallback
export function safeReadFile(filePath: string): string | null {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
  } catch (error) {
    console.warn(`Unable to read file: ${filePath}`, error);
  }
  return null;
}

// Enhanced path resolution for different platforms
export function getDataPath(relativePath: string): string {
  const platform = getDeploymentPlatform();
  
  switch (platform) {
    case 'render':
      return path.join('/opt/render/project/src', relativePath);
    case 'replit':
      return path.join(process.cwd(), relativePath);
    case 'vercel':
      return path.join('/tmp', relativePath);
    default:
      return path.join(process.cwd(), relativePath);
  }
}

// Log deployment information for debugging
export function logDeploymentInfo(): void {
  console.log('=== Deployment Information ===');
  console.log('Platform:', getDeploymentPlatform());
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Data Source:', getDataSource());
  console.log('Data Accessible:', isDataAccessible());
  console.log('Working Directory:', process.cwd());
  console.log('===============================');
}

// Fallback sample data for when filesystem is not available
export const fallbackArticles = [
  {
    id: 1,
    title: 'Microgravity Effects on Plant Cell Biology',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC000001/',
    content: 'This study investigates the effects of microgravity on plant cell biology, examining cellular responses and adaptations in space environments...',
    wordCount: 2500,
    contentType: 'HTML' as const,
    abstract: 'Plants show significant cellular adaptations when exposed to microgravity conditions, with notable changes in cell wall structure and metabolism.',
    keywords: ['microgravity', 'plant biology', 'cell biology', 'space', 'adaptation'],
    categories: ['Space Biology', 'Plant Biology', 'Cell Biology'],
    pmcId: 'PMC000001'
  },
  {
    id: 2,
    title: 'Human Physiological Adaptation to Long-Duration Spaceflight',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC000002/',
    content: 'Long-duration spaceflight presents unique challenges to human physiology. This comprehensive study examines cardiovascular, musculoskeletal, and neural adaptations...',
    wordCount: 3200,
    contentType: 'HTML' as const,
    abstract: 'Astronauts undergo significant physiological changes during extended missions, requiring targeted countermeasures for mission success.',
    keywords: ['human physiology', 'spaceflight', 'cardiovascular', 'musculoskeletal', 'adaptation'],
    categories: ['Human Physiology', 'Space Biology'],
    pmcId: 'PMC000002'
  },
  {
    id: 3,
    title: 'Molecular Biology of Radiation Exposure in Space',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC000003/',
    content: 'Space radiation poses significant risks to biological systems. This study examines DNA damage, repair mechanisms, and cellular responses to cosmic radiation...',
    wordCount: 2800,
    contentType: 'HTML' as const,
    abstract: 'Cosmic radiation induces complex DNA damage patterns that require sophisticated cellular repair mechanisms for organism survival.',
    keywords: ['radiation', 'DNA damage', 'molecular biology', 'cosmic rays', 'repair mechanisms'],
    categories: ['Radiation Biology', 'Molecular Biology', 'Space Biology'],
    pmcId: 'PMC000003'
  },
  {
    id: 4,
    title: 'Neural Plasticity and Spatial Orientation in Microgravity',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC000004/',
    content: 'The absence of gravity fundamentally alters how the nervous system processes spatial information. This neurobiological study examines adaptation mechanisms...',
    wordCount: 2600,
    contentType: 'HTML' as const,
    abstract: 'The brain demonstrates remarkable plasticity in adapting to microgravity environments, rewiring neural networks for spatial processing.',
    keywords: ['neuroscience', 'spatial orientation', 'neural plasticity', 'microgravity', 'brain adaptation'],
    categories: ['Neuroscience', 'Space Biology', 'Human Physiology'],
    pmcId: 'PMC000004'
  },
  {
    id: 5,
    title: 'Immune System Function During Space Missions',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC000005/',
    content: 'Space environments present unique challenges to immune system function. This immunological study examines changes in immune response and susceptibility...',
    wordCount: 2400,
    contentType: 'HTML' as const,
    abstract: 'Spaceflight conditions lead to immune system suppression, increasing astronaut susceptibility to infections and requiring preventive measures.',
    keywords: ['immunology', 'immune system', 'infection', 'spaceflight', 'immune suppression'],
    categories: ['Immunology', 'Space Biology', 'Human Physiology'],
    pmcId: 'PMC000005'
  }
];

export const fallbackStats = {
  totalArticles: fallbackArticles.length,
  totalWords: fallbackArticles.reduce((sum, article) => sum + article.wordCount, 0),
  averageWords: fallbackArticles.reduce((sum, article) => sum + article.wordCount, 0) / fallbackArticles.length,
  contentTypes: { HTML: fallbackArticles.length, PDF: 0 },
  topKeywords: [
    { keyword: 'microgravity', count: 3 },
    { keyword: 'space', count: 4 },
    { keyword: 'biology', count: 5 },
    { keyword: 'adaptation', count: 3 },
    { keyword: 'human', count: 2 }
  ],
  categoriesCount: {
    'Space Biology': 5,
    'Human Physiology': 3,
    'Cell Biology': 2,
    'Molecular Biology': 2,
    'Neuroscience': 1,
    'Immunology': 1,
    'Radiation Biology': 1,
    'Plant Biology': 1
  },
  monthlyPublications: [
    { month: '2024-01', count: 1 },
    { month: '2024-02', count: 1 },
    { month: '2024-03', count: 1 },
    { month: '2024-04', count: 1 },
    { month: '2024-05', count: 1 }
  ],
  dailyActivity: [
    { date: '2024-01-15', articles: 1, words: 2500 },
    { date: '2024-02-20', articles: 1, words: 3200 },
    { date: '2024-03-10', articles: 1, words: 2800 },
    { date: '2024-04-05', articles: 1, words: 2600 },
    { date: '2024-05-12', articles: 1, words: 2400 }
  ],
  researchTrends: [
    { topic: 'Space Biology', articles: 5, growth: 15 },
    { topic: 'Human Physiology', articles: 3, growth: 12 },
    { topic: 'Radiation Biology', articles: 1, growth: 8 }
  ]
};