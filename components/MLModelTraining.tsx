'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayIcon, 
  ChartBarIcon, 
  CpuChipIcon,
  BeakerIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';

interface TrainingProgress {
  epoch: number;
  loss: number;
  accuracy: number;
  validationLoss: number;
  validationAccuracy: number;
}

interface TestResult {
  testAccuracy: number;
  testLoss: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
  classificationReport: Record<string, any>;
}

interface MLModelTrainingProps {
  selectedFeatures: string[];
  confusionMatrixData: any;
  featureImportance: any[];
}

export default function MLModelTraining({ selectedFeatures, confusionMatrixData, featureImportance }: MLModelTrainingProps) {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress[]>([]);
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [trainingStep, setTrainingStep] = useState(0);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'random_forest' | 'neural_network' | 'svm' | 'gradient_boosting'>('random_forest');

  const trainingSteps = [
    'Initializing model parameters...',
    'Splitting data into train/test sets...',
    'Feature scaling and normalization...',
    'Training model on training data...',
    'Validating model performance...',
    'Running final tests...',
    'Generating predictions...'
  ];

  const startTraining = async () => {
    setIsTraining(true);
    setTrainingProgress([]);
    setTestResults(null);

    // Simulate training progress
    for (let epoch = 1; epoch <= 20; epoch++) {
      const progress: TrainingProgress = {
        epoch,
        loss: Math.max(0.1, 2.0 - (epoch * 0.08) + Math.random() * 0.1),
        accuracy: Math.min(0.95, 0.5 + (epoch * 0.02) + Math.random() * 0.05),
        validationLoss: Math.max(0.15, 2.2 - (epoch * 0.09) + Math.random() * 0.15),
        validationAccuracy: Math.min(0.92, 0.45 + (epoch * 0.022) + Math.random() * 0.04)
      };
      
      setTrainingProgress(prev => [...prev, progress]);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Simulate test results
    const mockTestResults: TestResult = {
      testAccuracy: 0.89 + Math.random() * 0.08,
      testLoss: 0.15 + Math.random() * 0.1,
      precision: 0.87 + Math.random() * 0.1,
      recall: 0.85 + Math.random() * 0.12,
      f1Score: 0.86 + Math.random() * 0.09,
      confusionMatrix: [
        [120, 8],
        [12, 95]
      ],
      classificationReport: {
        'Class 0': { precision: 0.91, recall: 0.94, f1Score: 0.92, support: 128 },
        'Class 1': { precision: 0.92, recall: 0.89, f1Score: 0.90, support: 107 }
      }
    };

    setTestResults(mockTestResults);
    setIsTraining(false);
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
        <h2 className="text-3xl font-bold gradient-text mb-4">ML Model Training & Testing</h2>
        <p className="text-space-300 max-w-2xl mx-auto">
          Train and test your optimized model with the selected features
        </p>
      </div>

      {/* Algorithm Selection */}
      <div className="space-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CpuChipIcon className="w-5 h-5 mr-2 text-blue-400" />
          Algorithm Selection
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'random_forest', name: 'Random Forest', icon: '🌲', description: 'Ensemble method' },
            { id: 'neural_network', name: 'Neural Network', icon: '🧠', description: 'Deep learning' },
            { id: 'svm', name: 'SVM', icon: '⚡', description: 'Support vector' },
            { id: 'gradient_boosting', name: 'Gradient Boosting', icon: '📈', description: 'Boosting method' }
          ].map((algorithm) => (
            <button
              key={algorithm.id}
              onClick={() => setSelectedAlgorithm(algorithm.id as any)}
              className={`p-4 rounded-lg transition-all duration-200 ${
                selectedAlgorithm === algorithm.id
                  ? 'bg-nasa-blue text-white'
                  : 'glass-effect hover:bg-white/10'
              }`}
            >
              <div className="text-2xl mb-2">{algorithm.icon}</div>
              <div className="text-sm font-medium">{algorithm.name}</div>
              <div className="text-xs opacity-75">{algorithm.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Training Controls */}
      <div className="space-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <PlayIcon className="w-5 h-5 mr-2 text-green-400" />
          Training Controls
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-space-400">
            Selected Features: {selectedFeatures.length} | 
            Algorithm: {selectedAlgorithm.replace('_', ' ')} |
            Data Points: {Math.floor(Math.random() * 5000) + 1000}
          </div>
          
          <button
            onClick={startTraining}
            disabled={isTraining}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isTraining ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Training...</span>
              </>
            ) : (
              <>
                <PlayIcon className="w-5 h-5" />
                <span>Start Training</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Training Progress */}
      {isTraining && (
        <div className="space-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BeakerIcon className="w-5 h-5 mr-2 text-yellow-400 animate-pulse" />
            Training Progress
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-nasa-blue border-t-transparent rounded-full animate-spin" />
              <span className="text-space-200">{trainingSteps[Math.floor(trainingStep / 3)]}</span>
            </div>
            
            <div className="w-full bg-space-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-nasa-blue to-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(trainingProgress.length / 20) * 100}%` }}
              />
            </div>
            
            <div className="text-sm text-space-400">
              Epoch {trainingProgress.length} of 20
            </div>
          </div>
        </div>
      )}

      {/* Training Metrics */}
      {trainingProgress.length > 0 && (
        <div className="space-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-purple-400" />
            Training Metrics
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Loss Chart */}
            <div>
              <h4 className="font-medium text-space-200 mb-3">Loss Over Time</h4>
              <div className="h-48 bg-space-800 rounded-lg p-4">
                <div className="h-full flex items-end space-x-1">
                  {trainingProgress.slice(-20).map((progress, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-gradient-to-t from-red-400 to-red-300 rounded-sm opacity-80"
                      style={{ height: `${(progress.loss / 2) * 100}%` }}
                      title={`Epoch ${progress.epoch}: ${progress.loss.toFixed(3)}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Accuracy Chart */}
            <div>
              <h4 className="font-medium text-space-200 mb-3">Accuracy Over Time</h4>
              <div className="h-48 bg-space-800 rounded-lg p-4">
                <div className="h-full flex items-end space-x-1">
                  {trainingProgress.slice(-20).map((progress, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-gradient-to-t from-green-400 to-green-300 rounded-sm opacity-80"
                      style={{ height: `${progress.accuracy * 100}%` }}
                      title={`Epoch ${progress.epoch}: ${(progress.accuracy * 100).toFixed(1)}%`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Current Metrics */}
          {trainingProgress.length > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Current Loss', value: trainingProgress[trainingProgress.length - 1].loss.toFixed(3), color: 'text-red-400' },
                { label: 'Training Accuracy', value: `${(trainingProgress[trainingProgress.length - 1].accuracy * 100).toFixed(1)}%`, color: 'text-green-400' },
                { label: 'Validation Loss', value: trainingProgress[trainingProgress.length - 1].validationLoss.toFixed(3), color: 'text-orange-400' },
                { label: 'Validation Accuracy', value: `${(trainingProgress[trainingProgress.length - 1].validationAccuracy * 100).toFixed(1)}%`, color: 'text-blue-400' }
              ].map((metric, index) => (
                <div key={index} className="text-center p-3 glass-effect rounded-lg">
                  <div className={`text-lg font-bold ${metric.color}`}>{metric.value}</div>
                  <div className="text-sm text-space-400">{metric.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Test Results */}
      {testResults && !isTraining && (
        <div className="space-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CheckCircleIcon className="w-5 h-5 mr-2 text-green-400" />
            Test Results
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <div>
              <h4 className="font-medium text-space-200 mb-3">Performance Metrics</h4>
              <div className="space-y-3">
                {[
                  { label: 'Test Accuracy', value: testResults.testAccuracy, icon: CheckCircleIcon },
                  { label: 'Precision', value: testResults.precision, icon: ArrowTrendingUpIcon },
                  { label: 'Recall', value: testResults.recall, icon: ArrowTrendingDownIcon },
                  { label: 'F1 Score', value: testResults.f1Score, icon: ChartBarIcon }
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

            {/* Confusion Matrix */}
            <div>
              <h4 className="font-medium text-space-200 mb-3">Confusion Matrix</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div></div>
                <div className="text-sm text-space-400">Predicted</div>
                <div></div>
                
                <div className="text-sm text-space-400">Actual</div>
                <div className="p-3 bg-green-400/20 rounded-lg">
                  <div className="text-lg font-bold text-green-400">{testResults.confusionMatrix[0][0]}</div>
                  <div className="text-xs text-space-400">True Positive</div>
                </div>
                <div className="p-3 bg-red-400/20 rounded-lg">
                  <div className="text-lg font-bold text-red-400">{testResults.confusionMatrix[0][1]}</div>
                  <div className="text-xs text-space-400">False Positive</div>
                </div>
                
                <div></div>
                <div className="p-3 bg-red-400/20 rounded-lg">
                  <div className="text-lg font-bold text-red-400">{testResults.confusionMatrix[1][0]}</div>
                  <div className="text-xs text-space-400">False Negative</div>
                </div>
                <div className="p-3 bg-green-400/20 rounded-lg">
                  <div className="text-lg font-bold text-green-400">{testResults.confusionMatrix[1][1]}</div>
                  <div className="text-xs text-space-400">True Negative</div>
                </div>
              </div>
            </div>
          </div>

          {/* Classification Report */}
          <div className="mt-6">
            <h4 className="font-medium text-space-200 mb-3">Classification Report</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-space-700">
                    <th className="text-left p-2 text-space-400">Class</th>
                    <th className="text-center p-2 text-space-400">Precision</th>
                    <th className="text-center p-2 text-space-400">Recall</th>
                    <th className="text-center p-2 text-space-400">F1-Score</th>
                    <th className="text-center p-2 text-space-400">Support</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(testResults.classificationReport).map(([className, metrics]) => (
                    <tr key={className} className="border-b border-space-800">
                      <td className="p-2 text-space-200">{className}</td>
                      <td className="p-2 text-center text-space-200">{(metrics.precision * 100).toFixed(1)}%</td>
                      <td className="p-2 text-center text-space-200">{(metrics.recall * 100).toFixed(1)}%</td>
                      <td className="p-2 text-center text-space-200">{(metrics.f1Score * 100).toFixed(1)}%</td>
                      <td className="p-2 text-center text-space-200">{metrics.support}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Model Summary */}
      {testResults && !isTraining && (
        <div className="space-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <DocumentChartBarIcon className="w-5 h-5 mr-2 text-blue-400" />
            Model Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-space-200 mb-3">Training Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-space-400">Algorithm:</span>
                  <span className="text-space-200 capitalize">{selectedAlgorithm.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-space-400">Features Used:</span>
                  <span className="text-space-200">{selectedFeatures.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-space-400">Training Epochs:</span>
                  <span className="text-space-200">{trainingProgress.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-space-400">Final Accuracy:</span>
                  <span className={`font-medium ${getPerformanceColor(testResults.testAccuracy)}`}>
                    {(testResults.testAccuracy * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-space-200 mb-3">Recommendations</h4>
              <div className="space-y-2 text-sm text-space-300">
                <div className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Model performance is excellent for production use</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Consider retraining with more data for even better results</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Model is ready for deployment and real-world testing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
