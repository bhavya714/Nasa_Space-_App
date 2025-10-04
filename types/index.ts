export interface Publication {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  doi?: string;
  journal?: string;
  year: number;
  keywords: string[];
  categories: string[];
  mission?: string;
  experimentType: ExperimentType;
  organism?: string;
  spaceEnvironment: SpaceEnvironment;
  findings: Finding[];
  impactScore: number;
  citations: number;
  url?: string;
  pdfUrl?: string;
  dataUrl?: string;
  relatedPublications: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Finding {
  id: string;
  description: string;
  significance: 'low' | 'medium' | 'high' | 'critical';
  category: FindingCategory;
  quantitative?: {
    metric: string;
    value: number;
    unit: string;
    change: 'increase' | 'decrease' | 'no_change';
  };
  implications: string[];
  confidence: number; // 0-1
}

export interface SpaceEnvironment {
  location: 'ISS' | 'Moon' | 'Mars' | 'Deep Space' | 'Ground Control' | 'Simulated';
  duration: number; // days
  gravity: 'microgravity' | 'partial' | 'earth' | 'lunar' | 'martian';
  radiation: {
    level: 'low' | 'medium' | 'high' | 'extreme';
    type: string[];
  };
  atmosphere?: {
    pressure: number;
    composition: Record<string, number>;
  };
}

export type ExperimentType = 
  | 'Plant Biology'
  | 'Human Physiology'
  | 'Microbiology'
  | 'Cell Biology'
  | 'Animal Studies'
  | 'Biomolecular'
  | 'Behavioral'
  | 'Nutrition'
  | 'Radiation Biology'
  | 'Other';

export type FindingCategory = 
  | 'Growth & Development'
  | 'Metabolism'
  | 'Immune System'
  | 'Bone & Muscle'
  | 'Cardiovascular'
  | 'Neurological'
  | 'Reproductive'
  | 'Radiation Effects'
  | 'Nutrition'
  | 'Behavior'
  | 'Technology'
  | 'Other';

export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'publication' | 'finding' | 'organism' | 'mission' | 'technology' | 'concept';
  properties: Record<string, any>;
  connections: string[];
  importance: number;
  x?: number;
  y?: number;
  z?: number;
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  type: 'cites' | 'similar' | 'contradicts' | 'builds_on' | 'related_to';
  strength: number;
  properties: Record<string, any>;
}

export interface SearchFilters {
  yearRange: [number, number];
  experimentTypes: ExperimentType[];
  organisms: string[];
  missions: string[];
  findingCategories: FindingCategory[];
  impactScore: [number, number];
  keywords: string[];
}

export interface DashboardStats {
  totalPublications: number;
  totalFindings: number;
  avgImpactScore: number;
  topOrganisms: Array<{ organism: string; count: number }>;
  topMissions: Array<{ mission: string; count: number }>;
  yearlyTrends: Array<{ year: number; count: number; avgImpact: number }>;
  researchGaps: string[];
  emergingTrends: string[];
}

export interface AIInsight {
  id: string;
  type: 'trend' | 'gap' | 'recommendation' | 'prediction' | 'correlation';
  title: string;
  description: string;
  confidence: number;
  evidence: string[];
  implications: string[];
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface MissionImpact {
  missionType: 'Moon' | 'Mars' | 'Deep Space';
  duration: number;
  crewSize: number;
  criticalFindings: Finding[];
  riskFactors: Array<{
    factor: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    mitigation: string;
    researchNeeded: string[];
  }>;
  recommendations: string[];
  confidence: number;
}
