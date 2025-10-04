'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  RocketLaunchIcon, 
  BeakerIcon, 
  ChartBarIcon,
  ClockIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { Publication } from '@/types';

interface InteractiveTimelineProps {
  publications: Publication[];
  expanded?: boolean;
}

export default function InteractiveTimeline({ publications, expanded = false }: InteractiveTimelineProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [hoveredPublication, setHoveredPublication] = useState<Publication | null>(null);

  // Group publications by year
  const publicationsByYear = publications.reduce((acc, pub) => {
    if (!acc[pub.year]) {
      acc[pub.year] = [];
    }
    acc[pub.year].push(pub);
    return acc;
  }, {} as Record<number, Publication[]>);

  const years = Object.keys(publicationsByYear).map(Number).sort((a, b) => a - b);
  const maxPublications = Math.max(...Object.values(publicationsByYear).map(pubs => pubs.length));

  const getYearColor = (year: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-cyan-500',
      'bg-yellow-500',
      'bg-red-500'
    ];
    return colors[year % colors.length];
  };

  const getMissionIcon = (mission?: string) => {
    if (mission?.includes('ISS')) return RocketLaunchIcon;
    if (mission?.includes('Mars')) return GlobeAltIcon;
    if (mission?.includes('Moon')) return GlobeAltIcon;
    return BeakerIcon;
  };

  return (
    <div className="space-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <CalendarIcon className="w-6 h-6 mr-2 text-blue-400" />
          Research Timeline
        </h3>
        {expanded && (
          <div className="text-sm text-space-400">
            {publications.length} publications across {years.length} years
          </div>
        )}
      </div>

      {/* Timeline Visualization */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-space-600"></div>
        
        {/* Year Nodes */}
        <div className="space-y-8">
          {years.map((year, index) => {
            const yearPublications = publicationsByYear[year];
            const height = (yearPublications.length / maxPublications) * 200 + 100;
            
            return (
              <motion.div
                key={year}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative flex items-start"
              >
                {/* Year Node */}
                <div className="relative z-10">
                  <div className={`w-16 h-16 ${getYearColor(year)} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    {year}
                  </div>
                  
                  {/* Connection Line */}
                  <div className="absolute left-8 top-8 w-0.5 bg-space-600 h-8"></div>
                </div>

                {/* Publications Bar */}
                <div className="ml-8 flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-lg font-semibold text-space-100">{year}</div>
                    <div className="text-sm text-space-400">{yearPublications.length} publications</div>
                    <div className="text-sm text-space-400">
                      Avg Impact: {(yearPublications.reduce((sum, pub) => sum + pub.impactScore, 0) / yearPublications.length).toFixed(1)}
                    </div>
                  </div>

                  {/* Publications Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {yearPublications.slice(0, expanded ? yearPublications.length : 6).map((pub) => {
                      const MissionIcon = getMissionIcon(pub.mission);
                      return (
                        <motion.div
                          key={pub.id}
                          whileHover={{ scale: 1.02 }}
                          className="p-4 glass-effect rounded-lg hover:bg-white/10 cursor-pointer transition-all duration-200"
                          onMouseEnter={() => setHoveredPublication(pub)}
                          onMouseLeave={() => setHoveredPublication(null)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <MissionIcon className="w-4 h-4 text-nasa-blue" />
                              <span className="text-xs text-space-400">{pub.experimentType}</span>
                            </div>
                            <div className="text-xs text-space-400">{pub.impactScore.toFixed(1)}</div>
                          </div>
                          
                          <h4 className="text-sm font-medium text-space-100 mb-2 line-clamp-2">
                            {pub.title}
                          </h4>
                          
                          <div className="flex items-center justify-between text-xs text-space-400">
                            <span>{pub.organism || 'N/A'}</span>
                            <span>{pub.citations} citations</span>
                          </div>
                          
                          {/* Impact Score Bar */}
                          <div className="mt-2 w-full bg-space-700 rounded-full h-1">
                            <div 
                              className="bg-gradient-to-r from-nasa-blue to-blue-400 h-1 rounded-full transition-all duration-500"
                              style={{ width: `${(pub.impactScore / 10) * 100}%` }}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {!expanded && yearPublications.length > 6 && (
                    <div className="text-center mt-4">
                      <button className="text-sm text-nasa-blue hover:text-blue-300">
                        View {yearPublications.length - 6} more publications →
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Hovered Publication Details */}
      {hoveredPublication && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 glass-effect rounded-lg border border-nasa-blue/30"
        >
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-semibold text-space-100">{hoveredPublication.title}</h4>
            <div className="text-sm text-space-400">{hoveredPublication.year}</div>
          </div>
          
          <p className="text-sm text-space-300 mb-3 line-clamp-3">
            {hoveredPublication.abstract}
          </p>
          
          <div className="flex items-center justify-between text-xs text-space-400">
            <div className="flex items-center space-x-4">
              <span>Impact: {hoveredPublication.impactScore.toFixed(1)}/10</span>
              <span>Citations: {hoveredPublication.citations}</span>
              <span>Findings: {hoveredPublication.findings.length}</span>
            </div>
            <span>{hoveredPublication.experimentType}</span>
          </div>
        </motion.div>
      )}

      {/* Timeline Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 glass-effect rounded-lg">
          <div className="text-2xl font-bold text-white mb-1">{years.length}</div>
          <div className="text-sm text-space-400">Years Covered</div>
        </div>
        <div className="text-center p-4 glass-effect rounded-lg">
          <div className="text-2xl font-bold text-white mb-1">{publications.length}</div>
          <div className="text-sm text-space-400">Total Publications</div>
        </div>
        <div className="text-center p-4 glass-effect rounded-lg">
          <div className="text-2xl font-bold text-white mb-1">
            {(publications.reduce((sum, pub) => sum + pub.impactScore, 0) / publications.length).toFixed(1)}
          </div>
          <div className="text-sm text-space-400">Average Impact</div>
        </div>
      </div>
    </div>
  );
}
