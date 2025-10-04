import { Publication, Finding, SpaceEnvironment, ExperimentType, FindingCategory, DashboardStats, AIInsight } from '@/types';

// Sample NASA bioscience publications data
export const samplePublications: Publication[] = [
  {
    id: 'pub-001',
    title: 'Effects of Microgravity on Arabidopsis thaliana Root Development and Gene Expression',
    authors: ['Dr. Sarah Chen', 'Dr. Michael Rodriguez', 'Dr. Lisa Park'],
    abstract: 'This study investigates the impact of microgravity conditions on Arabidopsis thaliana root development and gene expression patterns during a 30-day experiment aboard the International Space Station. Our findings reveal significant changes in root architecture, with increased lateral root formation and altered expression of gravity-responsive genes.',
    doi: '10.1038/nplants.2023.1234',
    journal: 'Nature Plants',
    year: 2023,
    keywords: ['microgravity', 'Arabidopsis', 'root development', 'gene expression', 'space biology'],
    categories: ['Plant Biology', 'Space Environment'],
    mission: 'ISS Expedition 68',
    experimentType: 'Plant Biology' as ExperimentType,
    organism: 'Arabidopsis thaliana',
    spaceEnvironment: {
      location: 'ISS',
      duration: 30,
      gravity: 'microgravity',
      radiation: {
        level: 'medium',
        type: ['cosmic rays', 'solar particles']
      }
    },
    findings: [
      {
        id: 'finding-001',
        description: 'Lateral root formation increased by 45% in microgravity compared to ground controls',
        significance: 'high',
        category: 'Growth & Development' as FindingCategory,
        quantitative: {
          metric: 'Lateral root count',
          value: 45,
          unit: 'percent increase',
          change: 'increase'
        },
        implications: ['Improved understanding of gravity sensing mechanisms', 'Potential for enhanced crop production in space'],
        confidence: 0.92
      },
      {
        id: 'finding-002',
        description: 'Expression of PIN2 gene decreased by 60% in microgravity conditions',
        significance: 'medium',
        category: 'Metabolism' as FindingCategory,
        quantitative: {
          metric: 'Gene expression',
          value: 60,
          unit: 'percent decrease',
          change: 'decrease'
        },
        implications: ['Altered auxin transport mechanisms', 'Potential impact on plant hormone signaling'],
        confidence: 0.88
      }
    ],
    impactScore: 8.5,
    citations: 23,
    url: 'https://example.com/pub-001',
    pdfUrl: 'https://example.com/pub-001.pdf',
    dataUrl: 'https://osdr.nasa.gov/bio/repo/data/exp/ISS/2023/001',
    relatedPublications: ['pub-002', 'pub-003'],
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2023-01-15T00:00:00Z'
  },
  {
    id: 'pub-002',
    title: 'Human Bone Density Changes During Long-Duration Spaceflight: A 6-Month Study',
    authors: ['Dr. James Wilson', 'Dr. Maria Santos', 'Dr. David Kim'],
    abstract: 'This comprehensive study examines bone density changes in astronauts during 6-month missions aboard the International Space Station. Using DEXA scans and biochemical markers, we documented significant bone loss in weight-bearing bones and identified potential countermeasures.',
    doi: '10.1016/j.bone.2023.5678',
    journal: 'Bone',
    year: 2023,
    keywords: ['bone density', 'spaceflight', 'osteoporosis', 'exercise', 'nutrition'],
    categories: ['Human Physiology', 'Space Medicine'],
    mission: 'ISS Expedition 67-68',
    experimentType: 'Human Physiology' as ExperimentType,
    organism: 'Homo sapiens',
    spaceEnvironment: {
      location: 'ISS',
      duration: 180,
      gravity: 'microgravity',
      radiation: {
        level: 'medium',
        type: ['cosmic rays', 'solar particles']
      }
    },
    findings: [
      {
        id: 'finding-003',
        description: 'Hip bone density decreased by 1.5% per month during spaceflight',
        significance: 'critical',
        category: 'Bone & Muscle' as FindingCategory,
        quantitative: {
          metric: 'Bone mineral density',
          value: 1.5,
          unit: 'percent per month',
          change: 'decrease'
        },
        implications: ['Risk of fractures during long missions', 'Need for enhanced exercise protocols'],
        confidence: 0.95
      },
      {
        id: 'finding-004',
        description: 'Resistance exercise reduced bone loss by 40% compared to control group',
        significance: 'high',
        category: 'Technology' as FindingCategory,
        quantitative: {
          metric: 'Bone loss reduction',
          value: 40,
          unit: 'percent',
          change: 'decrease'
        },
        implications: ['Validation of current exercise protocols', 'Potential for improved countermeasures'],
        confidence: 0.89
      }
    ],
    impactScore: 9.2,
    citations: 45,
    url: 'https://example.com/pub-002',
    pdfUrl: 'https://example.com/pub-002.pdf',
    dataUrl: 'https://osdr.nasa.gov/bio/repo/data/exp/ISS/2023/002',
    relatedPublications: ['pub-001', 'pub-004'],
    createdAt: '2023-02-20T00:00:00Z',
    updatedAt: '2023-02-20T00:00:00Z'
  },
  {
    id: 'pub-003',
    title: 'Microbial Community Dynamics in Closed Life Support Systems',
    authors: ['Dr. Anna Kowalski', 'Dr. Robert Taylor', 'Dr. Yuki Tanaka'],
    abstract: 'This study examines how microbial communities evolve in closed life support systems during simulated Mars missions. We identified key species that maintain system stability and those that pose contamination risks.',
    doi: '10.1128/mBio.2023.9012',
    journal: 'mBio',
    year: 2023,
    keywords: ['microbiology', 'life support', 'Mars simulation', 'bioregenerative', 'contamination'],
    categories: ['Microbiology', 'Life Support Systems'],
    mission: 'Mars Simulation Study',
    experimentType: 'Microbiology' as ExperimentType,
    organism: 'Mixed microbial community',
    spaceEnvironment: {
      location: 'Simulated',
      duration: 365,
      gravity: 'martian',
      radiation: {
        level: 'high',
        type: ['cosmic rays', 'UV radiation']
      },
      atmosphere: {
        pressure: 0.6,
        composition: { 'CO2': 95, 'N2': 3, 'Ar': 2 }
      }
    },
    findings: [
      {
        id: 'finding-005',
        description: 'Nitrosomonas europaea populations increased 300% in closed systems',
        significance: 'high',
        category: 'Metabolism' as FindingCategory,
        quantitative: {
          metric: 'Population increase',
          value: 300,
          unit: 'percent',
          change: 'increase'
        },
        implications: ['Enhanced nitrogen cycling', 'Improved waste processing efficiency'],
        confidence: 0.91
      }
    ],
    impactScore: 7.8,
    citations: 18,
    url: 'https://example.com/pub-003',
    pdfUrl: 'https://example.com/pub-003.pdf',
    dataUrl: 'https://osdr.nasa.gov/bio/repo/data/exp/MARS/2023/003',
    relatedPublications: ['pub-001'],
    createdAt: '2023-03-10T00:00:00Z',
    updatedAt: '2023-03-10T00:00:00Z'
  }
];

export const sampleStats: DashboardStats = {
  totalPublications: 608,
  totalFindings: 1247,
  avgImpactScore: 7.3,
  topOrganisms: [
    { organism: 'Arabidopsis thaliana', count: 45 },
    { organism: 'Homo sapiens', count: 38 },
    { organism: 'Mus musculus', count: 32 },
    { organism: 'Drosophila melanogaster', count: 28 },
    { organism: 'Escherichia coli', count: 25 }
  ],
  topMissions: [
    { mission: 'ISS Expedition 68', count: 23 },
    { mission: 'ISS Expedition 67', count: 21 },
    { mission: 'Mars Simulation Study', count: 18 },
    { mission: 'Lunar Simulation Study', count: 15 },
    { mission: 'Deep Space Study', count: 12 }
  ],
  yearlyTrends: [
    { year: 2020, count: 45, avgImpact: 6.8 },
    { year: 2021, count: 52, avgImpact: 7.1 },
    { year: 2022, count: 58, avgImpact: 7.4 },
    { year: 2023, count: 61, avgImpact: 7.6 }
  ],
  researchGaps: [
    'Long-term effects of Martian gravity on human physiology',
    'Plant growth optimization in reduced gravity environments',
    'Microbial contamination prevention in closed systems',
    'Radiation protection strategies for deep space missions'
  ],
  emergingTrends: [
    'AI-assisted space agriculture',
    'Synthetic biology for life support',
    'Personalized medicine for astronauts',
    'Biomimetic materials for space habitats'
  ]
};

export const sampleInsights: AIInsight[] = [
  {
    id: 'insight-001',
    type: 'trend',
    title: 'Increasing Focus on Plant-Based Life Support Systems',
    description: 'Analysis of recent publications shows a 40% increase in plant biology research focused on closed-loop life support systems, indicating a shift toward sustainable space agriculture.',
    confidence: 0.87,
    evidence: ['pub-001', 'pub-003', 'pub-015', 'pub-023'],
    implications: [
      'Potential for reduced reliance on resupply missions',
      'Improved psychological benefits for astronauts',
      'Enhanced food security for long-duration missions'
    ],
    actionable: true,
    priority: 'high',
    createdAt: '2023-12-01T00:00:00Z'
  },
  {
    id: 'insight-002',
    type: 'gap',
    title: 'Limited Research on Martian Gravity Effects',
    description: 'Only 12% of human physiology studies have examined the effects of Martian gravity (0.38g), creating a significant knowledge gap for Mars mission planning.',
    confidence: 0.92,
    evidence: ['pub-002', 'pub-007', 'pub-012'],
    implications: [
      'Uncertainty in mission duration limits',
      'Unknown effectiveness of current countermeasures',
      'Risk of mission failure due to health issues'
    ],
    actionable: true,
    priority: 'high',
    createdAt: '2023-12-01T00:00:00Z'
  }
];

// Data processing utilities
export function filterPublications(publications: Publication[], filters: any): Publication[] {
  return publications.filter(pub => {
    if (filters.yearRange && (pub.year < filters.yearRange[0] || pub.year > filters.yearRange[1])) {
      return false;
    }
    if (filters.experimentTypes && filters.experimentTypes.length > 0 && !filters.experimentTypes.includes(pub.experimentType)) {
      return false;
    }
    if (filters.organisms && filters.organisms.length > 0 && (!pub.organism || !filters.organisms.includes(pub.organism))) {
      return false;
    }
    if (filters.keywords && filters.keywords.length > 0) {
      const hasKeyword = filters.keywords.some((keyword: string) => 
        pub.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase())) ||
        pub.title.toLowerCase().includes(keyword.toLowerCase()) ||
        pub.abstract.toLowerCase().includes(keyword.toLowerCase())
      );
      if (!hasKeyword) return false;
    }
    return true;
  });
}

export function calculateImpactScore(publication: Publication): number {
  let score = 0;
  
  // Base score from citations
  score += Math.log10(publication.citations + 1) * 2;
  
  // Bonus for high-significance findings
  const criticalFindings = publication.findings.filter(f => f.significance === 'critical').length;
  const highFindings = publication.findings.filter(f => f.significance === 'high').length;
  score += criticalFindings * 3 + highFindings * 2;
  
  // Bonus for recent publications
  const currentYear = new Date().getFullYear();
  const yearsSincePublication = currentYear - publication.year;
  score += Math.max(0, 5 - yearsSincePublication) * 0.5;
  
  // Normalize to 0-10 scale
  return Math.min(10, Math.max(0, score));
}

export function generateKnowledgeGraph(publications: Publication[]) {
  const nodes: any[] = [];
  const edges: any[] = [];
  
  publications.forEach(pub => {
    // Add publication node
    nodes.push({
      id: pub.id,
      label: pub.title.substring(0, 50) + '...',
      type: 'publication',
      properties: {
        year: pub.year,
        impactScore: pub.impactScore,
        experimentType: pub.experimentType
      },
      importance: pub.impactScore / 10
    });
    
    // Add organism nodes
    if (pub.organism) {
      const organismId = `org-${pub.organism.replace(/\s+/g, '-').toLowerCase()}`;
      if (!nodes.find(n => n.id === organismId)) {
        nodes.push({
          id: organismId,
          label: pub.organism,
          type: 'organism',
          properties: {},
          importance: 0.5
        });
      }
      edges.push({
        id: `${pub.id}-${organismId}`,
        source: pub.id,
        target: organismId,
        type: 'studies',
        strength: 0.8
      });
    }
    
    // Add finding nodes
    pub.findings.forEach(finding => {
      const findingId = finding.id;
      nodes.push({
        id: findingId,
        label: finding.description.substring(0, 30) + '...',
        type: 'finding',
        properties: {
          significance: finding.significance,
          category: finding.category,
          confidence: finding.confidence
        },
        importance: finding.significance === 'critical' ? 0.9 : finding.significance === 'high' ? 0.7 : 0.5
      });
      
      edges.push({
        id: `${pub.id}-${findingId}`,
        source: pub.id,
        target: findingId,
        type: 'contains',
        strength: 0.9
      });
    });
  });
  
  return { nodes, edges };
}
