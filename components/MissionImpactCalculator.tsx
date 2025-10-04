'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RocketLaunchIcon, 
  CalculatorIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { Publication, MissionImpact } from '@/types';

interface MissionImpactCalculatorProps {
  publications: Publication[];
}

export default function MissionImpactCalculator({ publications }: MissionImpactCalculatorProps) {
  const [missionType, setMissionType] = useState<'Moon' | 'Mars' | 'Deep Space'>('Mars');
  const [duration, setDuration] = useState(365);
  const [crewSize, setCrewSize] = useState(4);
  const [calculatedImpact, setCalculatedImpact] = useState<MissionImpact | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateMissionImpact = async () => {
    setIsCalculating(true);
    
    // Simulate AI calculation
    setTimeout(() => {
      const relevantPublications = publications.filter(pub => {
        const spaceEnv = pub.spaceEnvironment;
        return (
          (missionType === 'Moon' && spaceEnv.location === 'Moon') ||
          (missionType === 'Mars' && (spaceEnv.location === 'Mars' || spaceEnv.location === 'Simulated')) ||
          (missionType === 'Deep Space' && spaceEnv.location === 'Deep Space') ||
          spaceEnv.duration >= duration * 0.5 // Similar duration studies
        );
      });

      const criticalFindings = relevantPublications
        .flatMap(pub => pub.findings)
        .filter(finding => finding.significance === 'critical' || finding.significance === 'high');

      const riskFactors = [
        {
          factor: 'Bone Density Loss',
          severity: missionType === 'Mars' ? 'critical' as const : 'high' as const,
          mitigation: 'Daily resistance exercise (2 hours), vitamin D supplementation',
          researchNeeded: ['Long-term effects of Martian gravity', 'Exercise protocol optimization']
        },
        {
          factor: 'Muscle Atrophy',
          severity: 'high' as const,
          mitigation: 'High-intensity interval training, protein-rich diet',
          researchNeeded: ['Muscle protein synthesis in space', 'Nutritional requirements']
        },
        {
          factor: 'Radiation Exposure',
          severity: missionType === 'Deep Space' ? 'critical' as const : 'high' as const,
          mitigation: 'Radiation shielding, monitoring systems',
          researchNeeded: ['Long-term radiation effects', 'Shielding material development']
        },
        {
          factor: 'Psychological Stress',
          severity: 'medium' as const,
          mitigation: 'Regular communication, recreational activities, crew selection',
          researchNeeded: ['Isolation effects on cognition', 'Team dynamics optimization']
        }
      ];

      const recommendations = [
        'Implement comprehensive pre-flight health screening',
        'Develop personalized exercise and nutrition plans',
        'Establish regular medical monitoring protocols',
        'Create emergency medical response procedures',
        'Plan for psychological support and recreation',
        'Design radiation protection strategies'
      ];

      const confidence = Math.min(0.95, 0.6 + (relevantPublications.length / 50));

      setCalculatedImpact({
        missionType,
        duration,
        crewSize,
        criticalFindings,
        riskFactors,
        recommendations,
        confidence
      });
      
      setIsCalculating(false);
    }, 2000);
  };

  useEffect(() => {
    if (missionType || duration || crewSize) {
      calculateMissionImpact();
    }
  }, [missionType, duration, crewSize]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/20';
      default: return 'text-space-400 bg-space-400/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold gradient-text mb-4">Mission Impact Calculator</h2>
        <p className="text-space-300 max-w-2xl mx-auto">
          Calculate the biological risks and requirements for your space mission using NASA research data
        </p>
      </div>

      {/* Mission Parameters */}
      <div className="space-card">
        <h3 className="text-xl font-semibold mb-6">Mission Parameters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mission Type */}
          <div>
            <label className="block text-sm font-medium text-space-200 mb-2">
              Mission Type
            </label>
            <div className="space-y-2">
              {(['Moon', 'Mars', 'Deep Space'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setMissionType(type)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    missionType === type
                      ? 'bg-nasa-blue text-white'
                      : 'glass-effect hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <GlobeAltIcon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{type}</div>
                      <div className="text-xs opacity-75">
                        {type === 'Moon' && '3 days'}
                        {type === 'Mars' && '2+ years'}
                        {type === 'Deep Space' && '3+ years'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-space-200 mb-2">
              Mission Duration: {duration} days
            </label>
            <input
              type="range"
              min="30"
              max="1095"
              step="30"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-space-400 mt-1">
              <span>1 month</span>
              <span>3 years</span>
            </div>
          </div>

          {/* Crew Size */}
          <div>
            <label className="block text-sm font-medium text-space-200 mb-2">
              Crew Size: {crewSize} astronauts
            </label>
            <input
              type="range"
              min="1"
              max="12"
              value={crewSize}
              onChange={(e) => setCrewSize(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-space-400 mt-1">
              <span>1</span>
              <span>12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calculation Status */}
      {isCalculating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-card text-center"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 border-2 border-nasa-blue border-t-transparent rounded-full animate-spin" />
            <span className="text-lg font-medium">Analyzing mission parameters...</span>
          </div>
          <p className="text-space-400 mt-2">Processing {publications.length} publications for relevant insights</p>
        </motion.div>
      )}

      {/* Mission Impact Results */}
      <AnimatePresence>
        {calculatedImpact && !isCalculating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Mission Summary */}
            <div className="space-card">
              <h3 className="text-xl font-semibold mb-4">Mission Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 glass-effect rounded-lg">
                  <RocketLaunchIcon className="w-8 h-8 mx-auto mb-2 text-nasa-blue" />
                  <div className="text-2xl font-bold">{calculatedImpact.missionType}</div>
                  <div className="text-sm text-space-400">Mission Type</div>
                </div>
                <div className="text-center p-4 glass-effect rounded-lg">
                  <ClockIcon className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <div className="text-2xl font-bold">{calculatedImpact.duration}</div>
                  <div className="text-sm text-space-400">Days</div>
                </div>
                <div className="text-center p-4 glass-effect rounded-lg">
                  <UserGroupIcon className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <div className="text-2xl font-bold">{calculatedImpact.crewSize}</div>
                  <div className="text-sm text-space-400">Crew Members</div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/20 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium">
                    Analysis Confidence: {(calculatedImpact.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="space-card">
              <h3 className="text-xl font-semibold mb-4">Risk Assessment</h3>
              <div className="space-y-4">
                {calculatedImpact.riskFactors.map((risk, index) => (
                  <div key={index} className="p-4 glass-effect rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-space-100">{risk.factor}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(risk.severity)}`}>
                        {risk.severity.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium text-space-200 mb-1">Mitigation Strategy:</h5>
                        <p className="text-sm text-space-300">{risk.mitigation}</p>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-space-200 mb-1">Research Needed:</h5>
                        <ul className="text-sm text-space-300 space-y-1">
                          {risk.researchNeeded.map((item, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="text-nasa-blue mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-card">
              <h3 className="text-xl font-semibold mb-4">Mission Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {calculatedImpact.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 glass-effect rounded-lg">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-space-300">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Findings */}
            <div className="space-card">
              <h3 className="text-xl font-semibold mb-4">Relevant Research Findings</h3>
              <div className="space-y-3">
                {calculatedImpact.criticalFindings.slice(0, 5).map((finding, index) => (
                  <div key={index} className="p-3 glass-effect rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(finding.significance)}`}>
                        {finding.significance.toUpperCase()}
                      </span>
                      <span className="text-xs text-space-400">{finding.category}</span>
                    </div>
                    <p className="text-sm text-space-300">{finding.description}</p>
                    {finding.quantitative && (
                      <div className="mt-2 text-xs text-space-400">
                        <strong>Impact:</strong> {finding.quantitative.change} of {finding.quantitative.value}{finding.quantitative.unit}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
