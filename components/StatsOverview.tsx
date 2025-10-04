'use client';

import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  BeakerIcon, 
  RocketLaunchIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { DashboardStats } from '@/types';

interface StatsOverviewProps {
  stats: DashboardStats;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const statCards = [
    {
      title: 'Total Publications',
      value: stats.totalPublications.toLocaleString(),
      icon: DocumentTextIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/20',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Research Findings',
      value: stats.totalFindings.toLocaleString(),
      icon: BeakerIcon,
      color: 'text-green-400',
      bgColor: 'bg-green-400/20',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Average Impact Score',
      value: stats.avgImpactScore.toFixed(1),
      icon: ChartBarIcon,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/20',
      trend: '+0.3',
      trendUp: true
    },
    {
      title: 'Research Gaps',
      value: stats.researchGaps.length,
      icon: ExclamationTriangleIcon,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/20',
      trend: '-2',
      trendUp: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold gradient-text mb-4">Research Overview</h2>
        <p className="text-space-300 max-w-2xl mx-auto">
          Key metrics and trends from NASA bioscience research database
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="space-card hover:scale-105 transition-transform duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  stat.trendUp ? 'text-green-400' : 'text-red-400'
                }`}>
                  <ArrowTrendingUpIcon className={`w-4 h-4 ${!stat.trendUp ? 'rotate-180' : ''}`} />
                  <span>{stat.trend}</span>
                </div>
              </div>
              
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-space-400">{stat.title}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Organisms */}
        <div className="space-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BeakerIcon className="w-5 h-5 mr-2 text-green-400" />
            Most Studied Organisms
          </h3>
          <div className="space-y-3">
            {stats.topOrganisms.map((organism, index) => (
              <div key={organism.organism} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center text-sm font-medium text-green-400">
                    {index + 1}
                  </div>
                  <span className="text-space-200">{organism.organism}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-space-700 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(organism.count / stats.topOrganisms[0].count) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-space-400 w-8 text-right">{organism.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Missions */}
        <div className="space-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <RocketLaunchIcon className="w-5 h-5 mr-2 text-blue-400" />
            Most Active Missions
          </h3>
          <div className="space-y-3">
            {stats.topMissions.map((mission, index) => (
              <div key={mission.mission} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-400/20 rounded-full flex items-center justify-center text-sm font-medium text-blue-400">
                    {index + 1}
                  </div>
                  <span className="text-space-200">{mission.mission}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-space-700 rounded-full h-2">
                    <div 
                      className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(mission.count / stats.topMissions[0].count) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-space-400 w-8 text-right">{mission.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Yearly Trends */}
      <div className="space-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-purple-400" />
          Research Trends Over Time
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.yearlyTrends.map((year, index) => (
            <div key={year.year} className="text-center p-4 glass-effect rounded-lg">
              <div className="text-2xl font-bold text-white mb-1">{year.year}</div>
              <div className="text-sm text-space-400 mb-2">{year.count} publications</div>
              <div className="text-sm text-space-300">Avg Impact: {year.avgImpact.toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
