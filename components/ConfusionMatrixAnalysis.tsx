'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  BeakerIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface ConfusionMatrixData {
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

interface FeatureImportance {
  feature: string;
  importance: number;
  correlation: number;
  variance: number;
  mutualInfo: number;
  rank: number;
}

interface ConfusionMatrixAnalysisProps {
  selectedFeatures: string[];
  onAnalysisComplete: (results: ConfusionMatrixData, featureImportance: FeatureImportance[]) => void;
}

export default function ConfusionMatrixAnalysis({ selectedFeatures, onAnalysisComplete }: ConfusionMatrixAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [confusionMatrix, setConfusionMatrix] = useState<ConfusionMatrixData | null>(null);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance[]>([]);
  const [selectedModel, setSelectedModel] = useState<'random_forest' | 'logistic_regression' | 'svm' | 'neural_network'>('random_forest');

  const analysisSteps = [
    'Preprocessing data...',
    'Calculating feature correlations...',
    'Running confusion matrix analysis...',
    'Computing feature importance...',
    'Optimizing model parameters...',
    'Generating final results...'
  ];

  useEffect(() => {
    if (selectedFeatures.length > 0) {
      runAnalysis();
    }
  }, [selectedFeatures]);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisStep(0);

    // Simulate analysis steps
    for (let i = 0; i < analysisSteps.length; i++) {
      setAnalysisStep(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Generate mock confusion matrix data
    const mockConfusionMatrix: ConfusionMatrixData = {
      truePositives: Math.floor(Math.random() * 200) + 150,
      falsePositives: Math.floor(Math.random() * 50) + 10,
      trueNegatives: Math.floor(Math.random() * 300) + 200,
      falseNegatives: Math.floor(Math.random() * 40) + 15,
      accuracy: Math.random() * 0.2 + 0.8, // 80-100%
      precision: Math.random() * 0.15 + 0.85,
      recall: Math.random() * 0.2 + 0.8,
      f1Score: Math.random() * 0.15 + 0.85
    };

    // Generate mock feature importance data
    const mockFeatureImportance: FeatureImportance[] = selectedFeatures.map((feature, index) => ({
      feature,
      importance: Math.random() * 0.4 + 0.6 - (index * 0.1),
      correlation: Math.random() * 0.8 + 0.1,
      variance: Math.random() * 0.5 + 0.3,
      mutualInfo: Math.random() * 0.6 + 0.2,
      rank: index + 1
    })).sort((a, b) => b.importance - a.importance);

    setConfusionMatrix(mockConfusionMatrix);
    setFeatureImportance(mockFeatureImportance);
    setIsAnalyzing(false);

    onAnalysisComplete(mockConfusionMatrix, mockFeatureImportance);
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-400';
    if (score >= 0.8) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceBgColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-400/20';
    if (score >= 0.8) return 'bg-yellow-400/20';
    return 'bg-red-400/20';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold gradient-text mb-4">Confusion Matrix Analysis</h2>
        <p className="text-space-300 max-w-2xl mx-auto">
          Advanced feature selection using confusion matrix optimization
        </p>
      </div>

      {/* Model Selection */}
      <div className="space-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CpuChipIcon className="w-5 h-5 mr-2 text-blue-400" />
          Model Selection
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'random_forest', name: 'Random Forest', icon: '🌲' },
            { id: 'logistic_regression', name: 'Logistic Regression', icon: '📊' },
            { id: 'svm', name: 'Support Vector Machine', icon: '⚡' },
            { id: 'neural_network', name: 'Neural Network', icon: '🧠' }
          ].map((model) => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model.id as any)}
              className={`p-4 rounded-lg transition-all duration-200 ${
                selectedModel === model.id
                  ? 'bg-nasa-blue text-white'
                  : 'glass-effect hover:bg-white/10'
              }`}
            >
              <div className="text-2xl mb-2">{model.icon}</div>
              <div className="text-sm font-medium">{model.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <div className="space-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BeakerIcon className="w-5 h-5 mr-2 text-yellow-400 animate-pulse" />
            Analysis in Progress
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-nasa-blue border-t-transparent rounded-full animate-spin" />
              <span className="text-space-200">{analysisSteps[analysisStep]}</span>
            </div>
            
            <div className="w-full bg-space-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-nasa-blue to-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((analysisStep + 1) / analysisSteps.length) * 100}%` }}
              />
            </div>
            
            <div className="text-sm text-space-400">
              Step {analysisStep + 1} of {analysisSteps.length}
            </div>
          </div>
        </div>
      )}

      {/* Confusion Matrix Results */}
      {confusionMatrix && !isAnalyzing && (
        <div className="space-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-green-400" />
            Confusion Matrix Results
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Confusion Matrix Visualization */}
            <div>
              <h4 className="font-medium text-space-200 mb-3">Confusion Matrix</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div></div>
                <div className="text-sm text-space-400">Predicted</div>
                <div></div>
                
                <div className="text-sm text-space-400">Actual</div>
                <div className="p-3 bg-green-400/20 rounded-lg">
                  <div className="text-lg font-bold text-green-400">{confusionMatrix.truePositives}</div>
                  <div className="text-xs text-space-400">True Positive</div>
                </div>
                <div className="p-3 bg-red-400/20 rounded-lg">
                  <div className="text-lg font-bold text-red-400">{confusionMatrix.falsePositives}</div>
                  <div className="text-xs text-space-400">False Positive</div>
                </div>
                
                <div></div>
                <div className="p-3 bg-red-400/20 rounded-lg">
                  <div className="text-lg font-bold text-red-400">{confusionMatrix.falseNegatives}</div>
                  <div className="text-xs text-space-400">False Negative</div>
                </div>
                <div className="p-3 bg-green-400/20 rounded-lg">
                  <div className="text-lg font-bold text-green-400">{confusionMatrix.trueNegatives}</div>
                  <div className="text-xs text-space-400">True Negative</div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              <h4 className="font-medium text-space-200 mb-3">Performance Metrics</h4>
              <div className="space-y-3">
                {[
                  { label: 'Accuracy', value: confusionMatrix.accuracy, icon: CheckCircleIcon },
                  { label: 'Precision', value: confusionMatrix.precision, icon: ArrowTrendingUpIcon },
                  { label: 'Recall', value: confusionMatrix.recall, icon: ArrowTrendingDownIcon },
                  { label: 'F1 Score', value: confusionMatrix.f1Score, icon: ChartBarIcon }
                ].map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div key={metric.label} className="flex items-center justify-between p-3 glass-effect rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-space-400" />
                        <span className="text-space-200">{metric.label}</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceBgColor(metric.value)} ${getPerformanceColor(metric.value)}`}>
                        {(metric.value * 100).toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Importance */}
      {featureImportance.length > 0 && !isAnalyzing && (
        <div className="space-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-purple-400" />
            Feature Importance Ranking
          </h3>
          
          <div className="space-y-3">
            {featureImportance.map((feature, index) => (
              <motion.div
                key={feature.feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 glass-effect rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-nasa-blue/20 rounded-full flex items-center justify-center text-sm font-bold text-nasa-blue">
                      {feature.rank}
                    </div>
                    <div>
                      <div className="font-medium text-space-100">{feature.feature}</div>
                      <div className="text-sm text-space-400">Importance Score</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{(feature.importance * 100).toFixed(1)}%</div>
                    <div className="text-xs text-space-400">Score</div>
                  </div>
                </div>
                
                <div className="w-full bg-space-700 rounded-full h-2 mb-3">
                  <div 
                    className="bg-gradient-to-r from-nasa-blue to-blue-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${feature.importance * 100}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-space-400">Correlation</div>
                    <div className="font-medium text-space-200">{(feature.correlation * 100).toFixed(0)}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-space-400">Variance</div>
                    <div className="font-medium text-space-200">{(feature.variance * 100).toFixed(0)}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-space-400">Mutual Info</div>
                    <div className="font-medium text-space-200">{(feature.mutualInfo * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Summary */}
      {confusionMatrix && featureImportance.length > 0 && !isAnalyzing && (
        <div className="space-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CheckCircleIcon className="w-5 h-5 mr-2 text-green-400" />
            Analysis Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-space-200 mb-3">Model Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-space-400">Selected Model:</span>
                  <span className="text-space-200 capitalize">{selectedModel.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-space-400">Overall Accuracy:</span>
                  <span className={`font-medium ${getPerformanceColor(confusionMatrix.accuracy)}`}>
                    {(confusionMatrix.accuracy * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-space-400">Features Analyzed:</span>
                  <span className="text-space-200">{selectedFeatures.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-space-400">Top Features:</span>
                  <span className="text-space-200">{featureImportance.slice(0, 3).map(f => f.feature).join(', ')}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-space-200 mb-3">Recommendations</h4>
              <div className="space-y-2 text-sm text-space-300">
                <div className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Model shows excellent performance with {selectedModel.replace('_', ' ')}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Top 3 features provide {((featureImportance[0].importance + featureImportance[1].importance + featureImportance[2].importance) * 100).toFixed(0)}% of total importance</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Ready for model training and testing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
