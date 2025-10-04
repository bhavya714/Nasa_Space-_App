'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LightBulbIcon, 
  ExclamationTriangleIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  SparklesIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { AIInsight } from '@/types';

interface AIInsightsPanelProps {
  insights: AIInsight[];
}

export default function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [filter, setFilter] = useState<'all' | 'trend' | 'gap' | 'recommendation'>('all');

  const filteredInsights = insights.filter(insight => 
    filter === 'all' || insight.type === filter
  );

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return ArrowTrendingUpIcon;
      case 'gap': return ExclamationTriangleIcon;
      case 'recommendation': return LightBulbIcon;
      case 'prediction': return ChartBarIcon;
      default: return SparklesIcon;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend': return 'text-green-400 bg-green-400/20';
      case 'gap': return 'text-orange-400 bg-orange-400/20';
      case 'recommendation': return 'text-blue-400 bg-blue-400/20';
      case 'prediction': return 'text-purple-400 bg-purple-400/20';
      default: return 'text-space-400 bg-space-400/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/20';
      default: return 'text-space-400 bg-space-400/20';
    }
  };

  return (
    <div className="space-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <SparklesIcon className="w-6 h-6 mr-2 text-yellow-400" />
          AI-Generated Insights
        </h3>
        
        {/* Filter Buttons */}
        <div className="flex space-x-2">
          {(['all', 'trend', 'gap', 'recommendation'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === filterType
                  ? 'bg-nasa-blue text-white'
                  : 'glass-effect hover:bg-white/10 text-space-300'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {filteredInsights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type);
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 glass-effect rounded-lg hover:bg-white/10 cursor-pointer transition-all duration-200"
                onClick={() => setSelectedInsight(insight)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-space-100">{insight.title}</h4>
                      <p className="text-sm text-space-400 capitalize">{insight.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                      {insight.priority}
                    </span>
                    <span className="text-xs text-space-400">
                      {(insight.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-space-300 mb-3">{insight.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-space-400">
                    <span>{insight.evidence?.length || 0} sources</span>
                    <span>{insight.implications?.length || 0} implications</span>
                    {insight.actionable && (
                      <span className="text-green-400">Actionable</span>
                    )}
                  </div>
                  
                  <EyeIcon className="w-4 h-4 text-space-400" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Insight Detail Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="space-card max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${getInsightColor(selectedInsight.type)}`}>
                    {(() => {
                      const Icon = getInsightIcon(selectedInsight.type);
                      return <Icon className="w-6 h-6" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-space-100">{selectedInsight.title}</h3>
                    <p className="text-sm text-space-400 capitalize">{selectedInsight.type}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedInsight(null)}
                  className="text-space-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-space-200 mb-2">Description</h4>
                  <p className="text-space-300">{selectedInsight.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-space-200 mb-2">Evidence</h4>
                  <div className="space-y-2">
                    {(selectedInsight.evidence || []).map((source, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-space-300">
                        <span className="w-2 h-2 bg-nasa-blue rounded-full"></span>
                        <span>{source}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-space-200 mb-2">Implications</h4>
                  <div className="space-y-2">
                    {(selectedInsight.implications || []).map((implication, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm text-space-300">
                        <span className="text-green-400 mt-1">•</span>
                        <span>{implication}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-space-700">
                  <div className="flex items-center space-x-4 text-sm text-space-400">
                    <span>Confidence: {(selectedInsight.confidence * 100).toFixed(0)}%</span>
                    <span>Priority: {selectedInsight.priority}</span>
                    {selectedInsight.actionable && (
                      <span className="text-green-400">Actionable</span>
                    )}
                  </div>
                  
                  <div className="text-xs text-space-500">
                    Generated: {new Date(selectedInsight.createdAt).toLocaleDateString()}
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
