'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DocumentTextIcon, 
  MagnifyingGlassIcon, 
  ChartBarIcon, 
  BeakerIcon,
  CalendarIcon,
  UserIcon,
  RocketLaunchIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { Publication } from '@/types';

interface PublicationGridProps {
  publications: Publication[];
}

export default function PublicationGrid({ publications }: PublicationGridProps) {
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [sortBy, setSortBy] = useState<'impact' | 'year' | 'citations'>('impact');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const sortedPublications = [...publications].sort((a, b) => {
    switch (sortBy) {
      case 'impact':
        return b.impactScore - a.impactScore;
      case 'year':
        return b.year - a.year;
      case 'citations':
        return b.citations - a.citations;
      default:
        return 0;
    }
  });

  const getExperimentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Plant Biology': 'text-green-400 bg-green-400/20',
      'Human Physiology': 'text-blue-400 bg-blue-400/20',
      'Microbiology': 'text-purple-400 bg-purple-400/20',
      'Cell Biology': 'text-pink-400 bg-pink-400/20',
      'Animal Studies': 'text-orange-400 bg-orange-400/20',
      'Biomolecular': 'text-cyan-400 bg-cyan-400/20',
      'Behavioral': 'text-yellow-400 bg-yellow-400/20',
      'Nutrition': 'text-red-400 bg-red-400/20',
      'Radiation Biology': 'text-indigo-400 bg-indigo-400/20',
      'Other': 'text-space-400 bg-space-400/20'
    };
    return colors[type] || colors['Other'];
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'critical': return 'text-red-400 bg-red-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/20';
      default: return 'text-space-400 bg-space-400/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Publications</h3>
          <div className="text-sm text-space-400">
            {publications.length} results
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-space-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 bg-space-800 border border-space-700 rounded-lg text-white text-sm"
            >
              <option value="impact">Impact Score</option>
              <option value="year">Year</option>
              <option value="citations">Citations</option>
            </select>
          </div>
          
          {/* View Mode */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'grid' ? 'bg-nasa-blue text-white' : 'glass-effect hover:bg-white/10'
              }`}
            >
              <ChartBarIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list' ? 'bg-nasa-blue text-white' : 'glass-effect hover:bg-white/10'
              }`}
            >
              <DocumentTextIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Publications Grid/List */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
        : 'space-y-4'
      }>
        <AnimatePresence>
          {sortedPublications.map((publication, index) => (
            <motion.div
              key={publication.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`space-card hover:scale-105 transition-all duration-200 cursor-pointer ${
                viewMode === 'list' ? 'flex items-start space-x-4' : ''
              }`}
              onClick={() => setSelectedPublication(publication)}
            >
              {viewMode === 'grid' ? (
                // Grid View
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <BeakerIcon className="w-5 h-5 text-nasa-blue" />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExperimentTypeColor(publication.experimentType)}`}>
                        {publication.experimentType}
                      </span>
                    </div>
                    <div className="text-sm text-space-400">{publication.year}</div>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-space-100 mb-3 line-clamp-2">
                    {publication.title}
                  </h4>
                  
                  <p className="text-sm text-space-300 mb-4 line-clamp-3">
                    {publication.abstract}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <ChartBarIcon className="w-4 h-4 text-purple-400" />
                          <span className="text-space-400">{publication.impactScore.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DocumentTextIcon className="w-4 h-4 text-blue-400" />
                          <span className="text-space-400">{publication.citations}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <UserIcon className="w-4 h-4 text-green-400" />
                        <span className="text-space-400">{publication.organism || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-space-400">
                        {publication.findings.length} findings
                      </div>
                      <EyeIcon className="w-4 h-4 text-space-400" />
                    </div>
                  </div>
                </>
              ) : (
                // List View
                <>
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-nasa-blue/20 rounded-lg flex items-center justify-center">
                      <BeakerIcon className="w-8 h-8 text-nasa-blue" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-semibold text-space-100 line-clamp-1">
                        {publication.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExperimentTypeColor(publication.experimentType)}`}>
                          {publication.experimentType}
                        </span>
                        <span className="text-sm text-space-400">{publication.year}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-space-300 mb-3 line-clamp-2">
                      {publication.abstract}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-space-400">
                      <div className="flex items-center space-x-4">
                        <span>Impact: {publication.impactScore.toFixed(1)}</span>
                        <span>Citations: {publication.citations}</span>
                        <span>Findings: {publication.findings.length}</span>
                      </div>
                      <EyeIcon className="w-4 h-4" />
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Publication Detail Modal */}
      <AnimatePresence>
        {selectedPublication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPublication(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="space-card max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-nasa-blue/20 rounded-lg flex items-center justify-center">
                    <BeakerIcon className="w-6 h-6 text-nasa-blue" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-space-100">{selectedPublication.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExperimentTypeColor(selectedPublication.experimentType)}`}>
                        {selectedPublication.experimentType}
                      </span>
                      <span className="text-sm text-space-400">{selectedPublication.year}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedPublication(null)}
                  className="text-space-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Authors and Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-space-200 mb-2">Authors</h4>
                    <p className="text-sm text-space-300">{selectedPublication.authors.join(', ')}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-space-200 mb-2">Journal</h4>
                    <p className="text-sm text-space-300">{selectedPublication.journal || 'N/A'}</p>
                  </div>
                </div>

                {/* Abstract */}
                <div>
                  <h4 className="font-medium text-space-200 mb-2">Abstract</h4>
                  <p className="text-sm text-space-300 leading-relaxed">{selectedPublication.abstract}</p>
                </div>

                {/* Key Findings */}
                <div>
                  <h4 className="font-medium text-space-200 mb-3">Key Findings</h4>
                  <div className="space-y-3">
                    {selectedPublication.findings.map((finding, index) => (
                      <div key={index} className="p-3 glass-effect rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignificanceColor(finding.significance)}`}>
                            {finding.significance.toUpperCase()}
                          </span>
                          <span className="text-xs text-space-400">{finding.category}</span>
                        </div>
                        <p className="text-sm text-space-300 mb-2">{finding.description}</p>
                        {finding.quantitative && (
                          <div className="text-xs text-space-400">
                            <strong>Impact:</strong> {finding.quantitative.change} of {finding.quantitative.value}{finding.quantitative.unit}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 glass-effect rounded-lg">
                    <div className="text-2xl font-bold text-white mb-1">{selectedPublication.impactScore.toFixed(1)}</div>
                    <div className="text-sm text-space-400">Impact Score</div>
                  </div>
                  <div className="text-center p-4 glass-effect rounded-lg">
                    <div className="text-2xl font-bold text-white mb-1">{selectedPublication.citations}</div>
                    <div className="text-sm text-space-400">Citations</div>
                  </div>
                  <div className="text-center p-4 glass-effect rounded-lg">
                    <div className="text-2xl font-bold text-white mb-1">{selectedPublication.findings.length}</div>
                    <div className="text-sm text-space-400">Findings</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-space-700">
                  <div className="flex items-center space-x-4">
                    {selectedPublication.url && (
                      <a
                        href={selectedPublication.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-sm text-nasa-blue hover:text-blue-300"
                      >
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        <span>View Publication</span>
                      </a>
                    )}
                    {selectedPublication.pdfUrl && (
                      <a
                        href={selectedPublication.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-sm text-green-400 hover:text-green-300"
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>Download PDF</span>
                      </a>
                    )}
                  </div>
                  
                  <div className="text-xs text-space-500">
                    Published: {new Date(selectedPublication.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
