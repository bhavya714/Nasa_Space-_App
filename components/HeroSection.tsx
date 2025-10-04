'use client';

import { motion } from 'framer-motion';
import { RocketLaunchIcon, SparklesIcon, ChartBarIcon, BeakerIcon } from '@heroicons/react/24/outline';

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-space-900 via-space-800 to-nasa-blue">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-nebula opacity-30" />
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-float" />
      <div className="absolute top-40 right-32 w-24 h-24 bg-purple-500/20 rounded-full blur-lg animate-pulse-slow" />
      <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-pink-500/20 rounded-full blur-2xl animate-bounce-slow" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex justify-center items-center space-x-4 mb-6">
              <RocketLaunchIcon className="w-12 h-12 text-nasa-red animate-pulse" />
              <SparklesIcon className="w-8 h-8 text-yellow-400 animate-spin-slow" />
              <BeakerIcon className="w-12 h-12 text-green-400 animate-float" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Biology Research</span>
              <br />
              <span className="text-white">Search Engine</span>
            </h1>
            <p className="text-xl md:text-2xl text-space-300 max-w-3xl mx-auto leading-relaxed">
              Explore and search through comprehensive biological science research with AI-powered insights from 
              <span className="text-nasa-red font-semibold"> 600+ peer-reviewed articles</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <div className="glass-effect rounded-lg px-6 py-3">
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium text-space-200">600+ Articles</span>
              </div>
            </div>
            <div className="glass-effect rounded-lg px-6 py-3">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-space-200">Full-Text Search</span>
              </div>
            </div>
            <div className="glass-effect rounded-lg px-6 py-3">
              <div className="flex items-center space-x-2">
                <BeakerIcon className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium text-space-200">Biology Research</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <p className="text-lg text-space-400 max-w-2xl mx-auto">
              Search through comprehensive biological science research including cell biology, genetics, microgravity studies, and space medicine
            </p>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </div>
  );
}
