'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CpuChipIcon, 
  ChartBarIcon, 
  BeakerIcon,
  DocumentIcon,
  PlayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

import MLFileUploader from './MLFileUploader';
import ConfusionMatrixAnalysis from './ConfusionMatrixAnalysis';
import MLModelTraining from './MLModelTraining';

interface MLDashboardProps {
  onBack: () => void;
}

export default function MLDashboard({ onBack }: MLDashboardProps) {
  const [currentStep, setCurrentStep] = useState<'upload' | 'analysis' | 'training'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [confusionMatrixData, setConfusionMatrixData] = useState<any>(null);
  const [featureImportance, setFeatureImportance] = useState<any[]>([]);

  const steps = [
    { id: 'upload', label: 'Data Upload', icon: DocumentIcon, description: 'Upload multiple datasets' },
    { id: 'analysis', label: 'Feature Analysis', icon: ChartBarIcon, description: 'Confusion matrix analysis' },
    { id: 'training', label: 'Model Training', icon: PlayIcon, description: 'Train and test model' }
  ];

  const handleFilesAnalyzed = (files: any[]) => {
    setUploadedFiles(files);
    if (files.length > 0) {
      setCurrentStep('analysis');
    }
  };

  const handleFeatureSelection = (features: string[]) => {
    setSelectedFeatures(features);
    setCurrentStep('training');
  };

  const handleAnalysisComplete = (confusionData: any, importance: any[]) => {
    setConfusionMatrixData(confusionData);
    setFeatureImportance(importance);
  };

  const getStepStatus = (stepId: string) => {
    switch (stepId) {
      case 'upload':
        return uploadedFiles.length > 0 ? 'completed' : currentStep === 'upload' ? 'active' : 'pending';
      case 'analysis':
        return selectedFeatures.length > 0 ? 'completed' : currentStep === 'analysis' ? 'active' : uploadedFiles.length > 0 ? 'pending' : 'disabled';
      case 'training':
        return currentStep === 'training' ? 'active' : selectedFeatures.length > 0 ? 'pending' : 'disabled';
      default:
        return 'pending';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/20';
      case 'active': return 'text-nasa-blue bg-nasa-blue/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      case 'disabled': return 'text-space-500 bg-space-500/20';
      default: return 'text-space-400 bg-space-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-space-gradient">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-effect border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-space-400 hover:text-white transition-colors"
              >
                ← Back to Dashboard
              </button>
              <div>
                <h1 className="text-2xl font-bold gradient-text">ML Model Builder</h1>
                <p className="text-sm text-space-400">Advanced machine learning pipeline</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <CpuChipIcon className="w-6 h-6 text-nasa-blue" />
              <span className="text-sm font-medium text-space-200">NASA ML Pipeline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-card">
          <h3 className="text-lg font-semibold mb-6">ML Pipeline Progress</h3>
          
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const status = getStepStatus(step.id);
              const isClickable = status !== 'disabled';
              
              return (
                <div key={step.id} className="flex flex-col items-center space-y-3">
                  <button
                    onClick={() => isClickable && setCurrentStep(step.id as any)}
                    disabled={!isClickable}
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                      isClickable ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed'
                    } ${getStatusColor(status)}`}
                  >
                    {status === 'completed' ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </button>
                  
                  <div className="text-center">
                    <div className={`text-sm font-medium ${
                      status === 'active' ? 'text-white' : 'text-space-300'
                    }`}>
                      {step.label}
                    </div>
                    <div className="text-xs text-space-500">{step.description}</div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 ${
                      getStepStatus(steps[index + 1].id) === 'disabled' 
                        ? 'bg-space-700' 
                        : 'bg-gradient-to-r from-nasa-blue to-blue-400'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <AnimatePresence mode="wait">
          {currentStep === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MLFileUploader 
                onFilesAnalyzed={handleFilesAnalyzed}
                onFeatureSelection={handleFeatureSelection}
              />
            </motion.div>
          )}

          {currentStep === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ConfusionMatrixAnalysis 
                selectedFeatures={selectedFeatures}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </motion.div>
          )}

          {currentStep === 'training' && (
            <motion.div
              key="training"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MLModelTraining 
                selectedFeatures={selectedFeatures}
                confusionMatrixData={confusionMatrixData}
                featureImportance={featureImportance}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Pipeline Summary */}
      {(uploadedFiles.length > 0 || selectedFeatures.length > 0) && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="space-card max-w-sm">
            <h4 className="font-semibold text-space-100 mb-3 flex items-center">
              <BeakerIcon className="w-5 h-5 mr-2 text-nasa-blue" />
              Pipeline Summary
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-space-400">Files Uploaded:</span>
                <span className="text-space-200">{uploadedFiles.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-space-400">Features Selected:</span>
                <span className="text-space-200">{selectedFeatures.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-space-400">Current Step:</span>
                <span className="text-space-200 capitalize">{currentStep}</span>
              </div>
            </div>
            
            {selectedFeatures.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-space-400 mb-1">Top Features:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedFeatures.slice(0, 3).map((feature, index) => (
                    <span key={index} className="px-2 py-1 bg-nasa-blue/20 text-nasa-blue text-xs rounded">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
