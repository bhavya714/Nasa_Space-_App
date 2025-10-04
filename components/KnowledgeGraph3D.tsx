'use client';

import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { Publication } from '@/types';

interface Node3DProps {
  position: [number, number, number];
  label: string;
  type: 'publication' | 'finding' | 'organism' | 'mission';
  importance: number;
  onClick: () => void;
}

function Node3D({ position, label, type, importance, onClick }: Node3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.scale.setScalar(hovered ? 1.2 : 1);
    }
  });

  const getColor = () => {
    switch (type) {
      case 'publication': return '#3B82F6';
      case 'finding': return '#10B981';
      case 'organism': return '#F59E0B';
      case 'mission': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getSize = () => {
    return Math.max(0.5, importance * 2);
  };

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[getSize(), 16, 16]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          transparent
          opacity={0.8}
        />
      </Sphere>
      
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-space-800/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm max-w-xs">
            <div className="font-semibold">{label}</div>
            <div className="text-xs text-space-300 capitalize">{type}</div>
          </div>
        </Html>
      )}
      
      <Text
        position={[0, getSize() + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        {label.length > 20 ? label.substring(0, 20) + '...' : label}
      </Text>
    </group>
  );
}

interface Edge3DProps {
  start: [number, number, number];
  end: [number, number, number];
  strength: number;
}

function Edge3D({ start, end, strength }: Edge3DProps) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  
  return (
    <Line
      points={points}
      color="#64748B"
      opacity={strength}
      transparent
      lineWidth={2}
    />
  );
}

interface KnowledgeGraph3DProps {
  publications: Publication[];
}

export default function KnowledgeGraph3D({ publications }: KnowledgeGraph3DProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [allNodes, setAllNodes] = useState<any[]>([]);
  const [allEdges, setAllEdges] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    publications: true,
    findings: true,
    organisms: true,
    missions: true,
    categories: [] as string[],
    yearRange: [2010, 2025] as [number, number],
    impactRange: [0, 10] as [number, number]
  });

  useEffect(() => {
    // Generate 3D positions for nodes
    const newNodes: any[] = [];
    const newEdges: any[] = [];
    
    publications.forEach((pub, index) => {
      // Publication node
      const pubPosition: [number, number, number] = [
        Math.cos((index / publications.length) * Math.PI * 2) * 5,
        Math.sin((index / publications.length) * Math.PI * 2) * 2,
        Math.sin((index / publications.length) * Math.PI * 2) * 3
      ];
      
      newNodes.push({
        id: pub.id,
        position: pubPosition,
        label: pub.title,
        type: 'publication',
        importance: pub.impactScore / 10,
        data: pub
      });

      // Finding nodes (safely handle missing findings)
      const findings = pub.findings || [];
      findings.forEach((finding, findingIndex) => {
        const findingPosition: [number, number, number] = [
          pubPosition[0] + (Math.random() - 0.5) * 2,
          pubPosition[1] + (Math.random() - 0.5) * 2,
          pubPosition[2] + (Math.random() - 0.5) * 2
        ];
        
        newNodes.push({
          id: finding.id,
          position: findingPosition,
          label: finding.description,
          type: 'finding',
          importance: finding.significance === 'critical' ? 0.9 : finding.significance === 'high' ? 0.7 : 0.5,
          data: finding
        });

        // Edge from publication to finding
        newEdges.push({
          id: `${pub.id}-${finding.id}`,
          start: pubPosition,
          end: findingPosition,
          strength: 0.8
        });
      });

      // Organism node
      if (pub.organism) {
        const organismPosition: [number, number, number] = [
          pubPosition[0] + (Math.random() - 0.5) * 3,
          pubPosition[1] + (Math.random() - 0.5) * 3,
          pubPosition[2] + (Math.random() - 0.5) * 3
        ];
        
        newNodes.push({
          id: `org-${pub.organism}`,
          position: organismPosition,
          label: pub.organism,
          type: 'organism',
          importance: 0.6,
          data: { organism: pub.organism }
        });

        newEdges.push({
          id: `${pub.id}-org-${pub.organism}`,
          start: pubPosition,
          end: organismPosition,
          strength: 0.6
        });
      }
    });

    setAllNodes(newNodes);
    setAllEdges(newEdges);
  }, [publications]);
  
  // Apply filters whenever filters or nodes change
  useEffect(() => {
    let filteredNodes = [...allNodes];
    let filteredEdges = [...allEdges];
    
    // Filter by node type
    filteredNodes = filteredNodes.filter(node => {
      if (node.type === 'publication' && !filters.publications) return false;
      if (node.type === 'finding' && !filters.findings) return false;
      if (node.type === 'organism' && !filters.organisms) return false;
      if (node.type === 'mission' && !filters.missions) return false;
      return true;
    });
    
    // Filter by categories
    if (filters.categories.length > 0) {
      filteredNodes = filteredNodes.filter(node => {
        if (node.type === 'publication') {
          const pub = node.data as Publication;
          return pub.categories.some(cat => filters.categories.includes(cat));
        }
        return true; // Keep non-publication nodes
      });
    }
    
    // Filter by year range
    filteredNodes = filteredNodes.filter(node => {
      if (node.type === 'publication') {
        const pub = node.data as Publication;
        return pub.year >= filters.yearRange[0] && pub.year <= filters.yearRange[1];
      }
      return true; // Keep non-publication nodes
    });
    
    // Filter by impact range
    filteredNodes = filteredNodes.filter(node => {
      if (node.type === 'publication') {
        const pub = node.data as Publication;
        return pub.impactScore >= filters.impactRange[0] && pub.impactScore <= filters.impactRange[1];
      }
      return true; // Keep non-publication nodes
    });
    
    // Get node IDs for edge filtering
    const nodeIds = new Set(filteredNodes.map(node => node.id));
    filteredEdges = filteredEdges.filter(edge => {
      const startNodeExists = nodeIds.has(edge.id.split('-')[0]);
      const endNodeExists = edge.id.includes('-org-') ? 
        filteredNodes.some(n => n.id === edge.id.split('-org-')[1]) :
        nodeIds.has(edge.id.split('-')[1]);
      return startNodeExists && endNodeExists;
    });
    
    setNodes(filteredNodes);
    setEdges(filteredEdges);
  }, [allNodes, allEdges, filters]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold gradient-text mb-4">3D Knowledge Graph</h2>
        <p className="text-space-300 max-w-2xl mx-auto">
          Explore the interconnected web of NASA bioscience research in immersive 3D space. 
          Click and drag to navigate, hover over nodes for details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters and Legend */}
        <div className="space-card">
          <h3 className="text-lg font-semibold mb-4">Filters & Controls</h3>
          
          {/* Node Type Filters */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-3">Node Types</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.publications}
                  onChange={(e) => setFilters(prev => ({ ...prev, publications: e.target.checked }))}
                  className="form-checkbox rounded bg-space-700 border-space-600 text-blue-500"
                />
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Publications ({allNodes.filter(n => n.type === 'publication').length})</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.findings}
                  onChange={(e) => setFilters(prev => ({ ...prev, findings: e.target.checked }))}
                  className="form-checkbox rounded bg-space-700 border-space-600 text-green-500"
                />
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm">Findings ({allNodes.filter(n => n.type === 'finding').length})</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.organisms}
                  onChange={(e) => setFilters(prev => ({ ...prev, organisms: e.target.checked }))}
                  className="form-checkbox rounded bg-space-700 border-space-600 text-yellow-500"
                />
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Organisms ({allNodes.filter(n => n.type === 'organism').length})</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.missions}
                  onChange={(e) => setFilters(prev => ({ ...prev, missions: e.target.checked }))}
                  className="form-checkbox rounded bg-space-700 border-space-600 text-red-500"
                />
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm">Missions ({allNodes.filter(n => n.type === 'mission').length})</span>
              </label>
            </div>
          </div>
          
          {/* Year Range Filter */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-2">Year Range</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-space-400">
                <span>{filters.yearRange[0]}</span>
                <span>{filters.yearRange[1]}</span>
              </div>
              <input
                type="range"
                min="2010"
                max="2025"
                value={filters.yearRange[1]}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  yearRange: [prev.yearRange[0], parseInt(e.target.value)] as [number, number]
                }))}
                className="w-full"
              />
            </div>
          </div>
          
          {/* Impact Score Filter */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-2">Impact Score</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-space-400">
                <span>{filters.impactRange[0]}</span>
                <span>{filters.impactRange[1].toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={filters.impactRange[1]}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  impactRange: [prev.impactRange[0], parseFloat(e.target.value)] as [number, number]
                }))}
                className="w-full"
              />
            </div>
          </div>
          
          {/* Reset Filters */}
          <button
            onClick={() => setFilters({
              publications: true,
              findings: true,
              organisms: true,
              missions: true,
              categories: [],
              yearRange: [2010, 2025],
              impactRange: [0, 10]
            })}
            className="w-full bg-nasa-blue hover:bg-blue-600 text-white text-sm py-2 px-3 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
          
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-2">Controls</h4>
            <ul className="text-xs text-space-400 space-y-1">
              <li>• Left click + drag: Rotate</li>
              <li>• Right click + drag: Pan</li>
              <li>• Scroll: Zoom</li>
              <li>• Click nodes: Select</li>
            </ul>
          </div>
          
          {/* Current Stats */}
          <div className="mt-6 pt-4 border-t border-space-700">
            <h4 className="text-sm font-semibold mb-2">Current View</h4>
            <div className="text-xs text-space-400 space-y-1">
              <div>Nodes: {nodes.length}</div>
              <div>Edges: {edges.length}</div>
              <div>Publications: {nodes.filter(n => n.type === 'publication').length}</div>
            </div>
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="lg:col-span-3">
          <div className="h-96 lg:h-[600px] rounded-xl overflow-hidden glass-effect">
            <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
              <ambientLight intensity={0.4} />
              <pointLight position={[10, 10, 10]} intensity={0.6} />
              <pointLight position={[-10, -10, -10]} intensity={0.4} />
              
              {nodes.map((node) => (
                <Node3D
                  key={node.id}
                  position={node.position}
                  label={node.label}
                  type={node.type}
                  importance={node.importance}
                  onClick={() => setSelectedNode(node.id)}
                />
              ))}
              
              {edges.map((edge) => (
                <Edge3D
                  key={edge.id}
                  start={edge.start}
                  end={edge.end}
                  strength={edge.strength}
                />
              ))}
              
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                autoRotate={true}
                autoRotateSpeed={0.5}
              />
            </Canvas>
          </div>
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-card"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold">Node Details</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-space-400 hover:text-white"
            >
              ×
            </button>
          </div>
          
          {(() => {
            const node = nodes.find(n => n.id === selectedNode);
            if (!node) return null;
            
            return (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-space-200">{node.label}</h4>
                  <p className="text-sm text-space-400 capitalize">{node.type}</p>
                </div>
                
                {node.data && (
                  <div className="text-sm text-space-300">
                    {node.type === 'publication' && (
                      <div>
                        <p><strong>Year:</strong> {node.data.year}</p>
                        <p><strong>Impact Score:</strong> {node.data.impactScore}/10</p>
                        <p><strong>Citations:</strong> {node.data.citations}</p>
                      </div>
                    )}
                    {node.type === 'finding' && (
                      <div>
                        <p><strong>Significance:</strong> {node.data.significance}</p>
                        <p><strong>Category:</strong> {node.data.category}</p>
                        <p><strong>Confidence:</strong> {(node.data.confidence * 100).toFixed(0)}%</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}
