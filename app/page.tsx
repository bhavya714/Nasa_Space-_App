'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  ChartBarIcon, 
  CubeIcon,
  RocketLaunchIcon,
  SparklesIcon,
  GlobeAltIcon,
  BeakerIcon,
  CpuChipIcon,
  DocumentTextIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

import HeroSection from '@/components/HeroSection';
import SearchInterface from '@/components/SearchInterface';
import KnowledgeGraph3D from '@/components/KnowledgeGraph3D';
import PublicationGrid from '@/components/PublicationGrid';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import MissionImpactCalculator from '@/components/MissionImpactCalculator';
import InteractiveTimeline from '@/components/InteractiveTimeline';
import StatsOverview from '@/components/StatsOverview';
import MLDashboard from '@/components/MLDashboard';
import { samplePublications, sampleStats, sampleInsights } from '@/data/sampleData';
import { Publication, AIInsight } from '@/types';

// Real article interface from our scraped data
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

interface RealStats {
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

export default function Dashboard() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [realArticles, setRealArticles] = useState<Article[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>(sampleInsights);
  const [stats, setStats] = useState(sampleStats);
  const [realStats, setRealStats] = useState<RealStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'search' | 'articles' | 'graph' | 'timeline' | 'calculator' | 'ml'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load real article data on component mount
  useEffect(() => {
    loadBiologyData();
  }, []);

  const loadBiologyData = async () => {
    try {
      setIsLoading(true);
      
      // Load articles using the old API for articles list
      const articlesResponse = await fetch('/api/articles?limit=1000');
      const articlesData = await articlesResponse.json();
      
      if (articlesData.success) {
        setRealArticles(articlesData.articles);
      }
      
      // Load publications using the new API
      const publicationsResponse = await fetch('/api/publications?limit=1000');
      const publicationsData = await publicationsResponse.json();
      
      if (publicationsData.success) {
        setPublications(publicationsData.publications);
        setFilteredPublications(publicationsData.publications);
      }
      
      // Load statistics
      const statsResponse = await fetch('/api/stats?type=full');
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setRealStats(statsData.data);
        
        // Update stats for compatibility with existing components
        setStats({
          ...sampleStats,
          totalPublications: statsData.data.totalArticles,
          avgImpactScore: statsData.data.averageWords / 1000 // Normalize
        });
      }
      
      // Load AI insights using the new API
      const insightsResponse = await fetch('/api/insights?limit=10');
      const insightsData = await insightsResponse.json();
      
      if (insightsData.success) {
        setInsights(insightsData.insights);
      }
      
      setDataLoaded(true);
    } catch (error) {
      console.error('Error loading biology data:', error);
      // Fallback to sample data
      setPublications(samplePublications);
      setFilteredPublications(samplePublications);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string, filters: any) => {
    setIsLoading(true);
    
    try {
      if (dataLoaded) {
        // Use publications search API
        const searchResponse = await fetch(`/api/publications?q=${encodeURIComponent(query)}&limit=1000`);
        const searchData = await searchResponse.json();
        
        if (searchData.success) {
          let results: Publication[] = searchData.publications;

          // Apply client-side filters so quick filters like "Plant Biology" work even with empty query
          results = results.filter((pub: Publication) => {
            const withinYear = !filters?.yearRange || (pub.year >= filters.yearRange[0] && pub.year <= filters.yearRange[1]);
            const matchesType = !filters?.experimentTypes || filters.experimentTypes.length === 0 || filters.experimentTypes.includes(pub.experimentType);
            const withinImpact = !filters?.impactScore || (pub.impactScore >= filters.impactScore[0] && pub.impactScore <= filters.impactScore[1]);
            const matchesKeywords = !filters?.keywords || filters.keywords.length === 0 || filters.keywords.some((k: string) => pub.keywords.map(x => x.toLowerCase()).includes(String(k).toLowerCase()));
            return withinYear && matchesType && withinImpact && matchesKeywords;
          });

          setFilteredPublications(results);
        }
      } else {
        // Fallback to local search
        const filtered = publications.filter(pub => {
          const q = query.toLowerCase();
          const matchesQuery = !query || 
            pub.title.toLowerCase().includes(q) ||
            pub.abstract.toLowerCase().includes(q) ||
            pub.keywords.some(k => k.toLowerCase().includes(q)) ||
            pub.categories.some(c => c.toLowerCase().includes(q)) ||
            pub.experimentType.toLowerCase().includes(q);
          
          const withinYear = !filters?.yearRange || (pub.year >= filters.yearRange[0] && pub.year <= filters.yearRange[1]);
          const matchesType = !filters?.experimentTypes || filters.experimentTypes.length === 0 || filters.experimentTypes.includes(pub.experimentType);
          const withinImpact = !filters?.impactScore || (pub.impactScore >= filters.impactScore[0] && pub.impactScore <= filters.impactScore[1]);
          const matchesKeywords = !filters?.keywords || filters.keywords.length === 0 || filters.keywords.some((k: string) => pub.keywords.map(x => x.toLowerCase()).includes(String(k).toLowerCase()));
          
          return matchesQuery && withinYear && matchesType && withinImpact && matchesKeywords;
        });
        
        setFilteredPublications(filtered);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to local search
      const filtered = publications.filter(pub => {
        const matchesQuery = !query || 
          pub.title.toLowerCase().includes(query.toLowerCase()) ||
          pub.abstract.toLowerCase().includes(query.toLowerCase()) ||
          pub.keywords.some(k => k.toLowerCase().includes(query.toLowerCase()));
        return matchesQuery;
      });
      setFilteredPublications(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'search', label: 'Biology Search', icon: MagnifyingGlassIcon },
    { id: 'articles', label: 'Research Articles', icon: DocumentTextIcon },
    { id: 'graph', label: 'Knowledge Graph', icon: CubeIcon },
    { id: 'timeline', label: 'Timeline', icon: GlobeAltIcon },
    { id: 'calculator', label: 'Impact Analysis', icon: RocketLaunchIcon },
    { id: 'ml', label: 'ML Pipeline', icon: CpuChipIcon },
  ];

  // Show loading state while data is being loaded
  if (isLoading && !dataLoaded) {
    return (
      <div className="min-h-screen bg-space-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-nasa-blue mx-auto"></div>
          <h2 className="text-2xl font-bold text-white">Loading Biology Research Data</h2>
          <p className="text-space-300">Processing {realStats?.totalArticles || '600+'} scientific articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-gradient">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Navigation Tabs */}
      <div className="sticky top-0 z-40 glass-effect border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-nasa-blue text-white shadow-lg'
                      : 'text-space-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <StatsOverview stats={stats} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AIInsightsPanel insights={insights} />
                <InteractiveTimeline publications={publications} />
              </div>
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <SearchInterface 
                publications={filteredPublications}
                onSearch={handleSearch}
                isLoading={isLoading}
              />
              
              {/* Search Results Grid */}
              {filteredPublications.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">Search Results</h3>
                    <p className="text-space-300">
                      Found {filteredPublications.length} publications matching your search
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPublications.slice(0, 24).map((article) => (
                      <motion.div
                        key={article.id}
                        className="glass-effect p-6 rounded-xl border border-white/10 hover:border-nasa-blue/50 transition-all duration-200 group"
                        whileHover={{ y: -5 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <AcademicCapIcon className="w-5 h-5 text-nasa-blue" />
                            <span className="bg-nasa-blue/20 text-nasa-blue text-xs px-2 py-1 rounded">
                              {article.categories?.[0] || 'Research'}
                            </span>
                          </div>
                          <div className="text-xs text-space-400">
                            Impact: {article.impactScore.toFixed(1)}
                          </div>
                        </div>
                        
                        <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-nasa-blue transition-colors">
                          {article.title}
                        </h3>
                        
                        <p className="text-space-300 text-sm mb-4 line-clamp-3">
                          {article.abstract}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                          {article.keywords.slice(0, 4).map((keyword) => (
                            <span key={keyword} className="bg-white/10 text-white text-xs px-2 py-1 rounded">
                              {keyword}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-space-300">
                          <div className="flex items-center space-x-4">
                            <span>📅 {article.year}</span>
                            <span>🔗 {article.citations} citations</span>
                          </div>
                          <a 
                            href={article.url || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-nasa-blue hover:text-blue-300 transition-colors"
                          >
                            View →
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Load More Button */}
                  {filteredPublications.length > 24 && (
                    <div className="text-center">
                      <button
                        className="bg-nasa-blue hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                        onClick={() => {
                          // Implement pagination or load more
                          console.log('Load more results');
                        }}
                      >
                        Load More Results ({filteredPublications.length - 24} remaining)
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
              
              {/* No Results State */}
              {!isLoading && filteredPublications.length === 0 && publications.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <SparklesIcon className="w-16 h-16 text-space-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
                  <p className="text-space-300 mb-4">Try adjusting your search terms or filters</p>
                  <button
                    onClick={() => {
                      setFilteredPublications(publications);
                      (document.querySelector('input[type="text"]') as HTMLInputElement | null)?.focus();
                    }}
                    className="text-nasa-blue hover:text-blue-300 transition-colors"
                  >
                    View All Publications
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'articles' && (
            <motion.div
              key="articles"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Articles Header */}
              <div className="glass-effect p-6 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Biology Research Articles</h2>
                    <p className="text-space-300">Explore {realStats?.totalArticles || publications.length} peer-reviewed articles from PubMed Central</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-nasa-blue/20 px-4 py-2 rounded-lg">
                      <span className="text-nasa-blue font-semibold">{realStats?.totalWords.toLocaleString() || '0'}</span>
                      <span className="text-space-300 text-sm ml-1">total words</span>
                    </div>
                    <div className="bg-green-500/20 px-4 py-2 rounded-lg">
                      <span className="text-green-400 font-semibold">{realStats?.averageWords || 0}</span>
                      <span className="text-space-300 text-sm ml-1">avg per article</span>
                    </div>
                  </div>
                </div>
                
                {/* Categories Filter */}
                {realStats?.categoriesCount && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-space-300 text-sm mr-2">Categories:</span>
                    {Object.entries(realStats.categoriesCount).slice(0, 8).map(([category, count]) => (
                      <button
                        key={category}
                        className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-sm text-white transition-colors"
                        onClick={() => handleSearch(category, {})}
                      >
                        {category} ({count})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Articles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(filteredPublications.length > 0 ? filteredPublications : publications).slice(0, 18).map((article) => (
                  <motion.div
                    key={article.id}
                    className="glass-effect p-6 rounded-xl border border-white/10 hover:border-nasa-blue/50 transition-all duration-200 group"
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <AcademicCapIcon className="w-5 h-5 text-nasa-blue" />
                            <span className="bg-nasa-blue/20 text-nasa-blue text-xs px-2 py-1 rounded">
                              {article.categories?.[0] || 'Research'}
                            </span>
                      </div>
                      {(article as any).contentType && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          (article as any).contentType === 'PDF' 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {(article as any).contentType}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-nasa-blue transition-colors">
                      {article.title}
                    </h3>
                    
                    <p className="text-space-300 text-sm mb-4 line-clamp-3">
                      {article.abstract}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {article.keywords.slice(0, 4).map((keyword) => (
                        <span key={keyword} className="bg-white/10 text-white text-xs px-2 py-1 rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-space-300">
                      <div className="flex items-center space-x-4">
                        <span>📄 {(article as any).wordCount?.toLocaleString() || 'N/A'} words</span>
                        <span>🔗 {article.citations} citations</span>
                      </div>
                      <a 
                        href={article.url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-nasa-blue hover:text-blue-300 transition-colors"
                      >
                        View Article →
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Load More Button */}
              {(filteredPublications.length > 18 || publications.length > 18) && (
                <div className="text-center">
                  <button
                    className="bg-nasa-blue hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                    onClick={() => {
                      // Implement load more functionality
                      console.log('Load more articles');
                    }}
                  >
                    Load More Articles
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'graph' && (
            <motion.div
              key="graph"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <KnowledgeGraph3D publications={publications} />
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <InteractiveTimeline publications={publications} expanded={true} />
            </motion.div>
          )}

          {activeTab === 'calculator' && (
            <motion.div
              key="calculator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MissionImpactCalculator publications={publications} />
            </motion.div>
          )}

          {activeTab === 'ml' && (
            <motion.div
              key="ml"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MLDashboard onBack={() => setActiveTab('overview')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-8 right-8 bg-gradient-to-r from-nasa-blue to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setActiveTab('articles')}
        title="View Biology Articles"
      >
        <DocumentTextIcon className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
