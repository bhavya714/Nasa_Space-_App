'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  SparklesIcon,
  BeakerIcon,
  ChartBarIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { Publication, SearchFilters, ExperimentType } from '@/types';

interface SearchInterfaceProps {
  publications: Publication[];
  onSearch: (query: string, filters: SearchFilters) => void;
  isLoading: boolean;
}

export default function SearchInterface({ publications, onSearch, isLoading }: SearchInterfaceProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    yearRange: [2020, 2023],
    experimentTypes: [],
    organisms: [],
    missions: [],
    findingCategories: [],
    impactScore: [0, 10],
    keywords: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // AI-powered search suggestions
  useEffect(() => {
    if (query.length > 2) {
      const suggestions = [
        'microgravity effects on plant growth',
        'bone density changes in space',
        'microbial communities in closed systems',
        'radiation effects on DNA',
        'exercise countermeasures for astronauts',
        'nutrition requirements for Mars missions'
      ].filter(s => s.toLowerCase().includes(query.toLowerCase()));
      setAiSuggestions(suggestions);
    } else {
      setAiSuggestions([]);
    }
  }, [query]);

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const quickFilters = [
    { label: 'High Impact', value: 'high-impact', icon: ChartBarIcon },
    { label: 'Recent', value: 'recent', icon: SparklesIcon },
    { label: 'Plant Biology', value: 'plant-bio', icon: BeakerIcon },
    { label: 'Human Studies', value: 'human', icon: RocketLaunchIcon },
  ];

  const applyQuickFilter = (filterValue: string) => {
    let newFilters = { ...filters } as SearchFilters;
    switch (filterValue) {
      case 'high-impact':
        newFilters = { ...newFilters, impactScore: [7, 10] };
        break;
      case 'recent':
        newFilters = { ...newFilters, yearRange: [2022, 2023] };
        break;
      case 'plant-bio':
        newFilters = { ...newFilters, experimentTypes: ['Plant Biology' as ExperimentType] };
        break;
      case 'human':
        newFilters = { ...newFilters, experimentTypes: ['Human Physiology' as ExperimentType] };
        break;
    }
    setFilters(newFilters);
    onSearch(query, newFilters);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold gradient-text mb-4">AI-Powered Search</h2>
        <p className="text-space-300 max-w-2xl mx-auto">
          Discover insights from NASA bioscience research using advanced AI search capabilities
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-space-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search publications, findings, organisms, or ask a question..."
            className="w-full pl-10 pr-4 py-4 bg-space-800/50 border border-space-700 rounded-xl text-white placeholder-space-400 focus:outline-none focus:ring-2 focus:ring-nasa-blue focus:border-transparent"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>

        {/* AI Suggestions */}
        <AnimatePresence>
          {aiSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 space-y-1"
            >
              {aiSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(suggestion)}
                  className="w-full text-left px-4 py-2 text-sm text-space-300 hover:text-white hover:bg-space-800/50 rounded-lg transition-colors"
                >
                  <SparklesIcon className="w-4 h-4 inline mr-2 text-yellow-400" />
                  {suggestion}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-3 justify-center">
        {quickFilters.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.value}
              onClick={() => applyQuickFilter(filter.value)}
              className="flex items-center space-x-2 px-4 py-2 glass-effect rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Advanced Filters Toggle */}
      <div className="text-center">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 mx-auto px-4 py-2 glass-effect rounded-lg hover:bg-white/10 transition-all duration-200"
        >
          <FunnelIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Advanced Filters</span>
        </button>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-card"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Year Range */}
              <div>
                <label className="block text-sm font-medium text-space-200 mb-2">
                  Year Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={filters.yearRange[0]}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      yearRange: [parseInt(e.target.value), prev.yearRange[1]] 
                    }))}
                    className="w-full px-3 py-2 bg-space-800 border border-space-700 rounded-lg text-white text-sm"
                    placeholder="From"
                  />
                  <input
                    type="number"
                    value={filters.yearRange[1]}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      yearRange: [prev.yearRange[0], parseInt(e.target.value)] 
                    }))}
                    className="w-full px-3 py-2 bg-space-800 border border-space-700 rounded-lg text-white text-sm"
                    placeholder="To"
                  />
                </div>
              </div>

              {/* Impact Score */}
              <div>
                <label className="block text-sm font-medium text-space-200 mb-2">
                  Impact Score: {filters.impactScore[0]} - {filters.impactScore[1]}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={filters.impactScore[1]}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    impactScore: [prev.impactScore[0], parseFloat(e.target.value)] 
                  }))}
                  className="w-full"
                />
              </div>

              {/* Experiment Types */}
              <div>
                <label className="block text-sm font-medium text-space-200 mb-2">
                  Experiment Types
                </label>
                <select
                  multiple
                  value={filters.experimentTypes}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    experimentTypes: Array.from(e.target.selectedOptions, option => option.value as ExperimentType)
                  }))}
                  className="w-full px-3 py-2 bg-space-800 border border-space-700 rounded-lg text-white text-sm"
                >
                  <option value="Plant Biology">Plant Biology</option>
                  <option value="Human Physiology">Human Physiology</option>
                  <option value="Microbiology">Microbiology</option>
                  <option value="Cell Biology">Cell Biology</option>
                  <option value="Animal Studies">Animal Studies</option>
                </select>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={handleSearch}
                className="btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results Summary */}
      <div className="text-center">
        <p className="text-space-300">
          Found <span className="text-nasa-blue font-semibold">{publications.length}</span> publications
          {query && (
            <span> for "<span className="text-white font-medium">{query}</span>"</span>
          )}
        </p>
      </div>
    </div>
  );
}
