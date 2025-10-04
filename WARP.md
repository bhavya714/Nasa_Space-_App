# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

NASA Bioscience Explorer is an AI-powered dashboard that revolutionizes how we explore NASA's bioscience research for space exploration planning. It features 3D knowledge graph visualization, mission impact calculators, interactive timelines, and a comprehensive machine learning pipeline for analyzing biological research data.

## Essential Commands

### Development
```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking without emitting files
npm run type-check
```

### Testing & Quality
```bash
# Run linting
npm run lint

# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage

# Bundle analyzer (when ANALYZE=true is set)
npm run analyze
```

## Core Architecture

### Technology Stack
- **Framework**: Next.js 14 with App Router and TypeScript
- **Styling**: Tailwind CSS with custom NASA-themed design system
- **3D Graphics**: Three.js with React Three Fiber (@react-three/fiber, @react-three/drei)
- **Animations**: Framer Motion for smooth interactions
- **Data Visualization**: D3.js, Recharts
- **AI Integration**: OpenAI API ready for intelligent search and insights
- **State Management**: Zustand, React Query

### Project Structure
```
├── app/
│   ├── api/           # Next.js API routes for backend functionality
│   │   ├── articles/  # Biology research articles endpoint
│   │   ├── insights/  # AI-generated insights endpoint
│   │   ├── publications/ # NASA publications endpoint
│   │   └── stats/     # Statistics and metrics endpoint
│   ├── layout.tsx     # Root layout with dark theme and toast notifications
│   ├── page.tsx       # Main dashboard with tab-based interface
│   └── globals.css    # Global styles with NASA space theme
├── components/        # React components for major features
│   ├── HeroSection.tsx           # Animated landing section
│   ├── SearchInterface.tsx       # AI-powered search with filters
│   ├── KnowledgeGraph3D.tsx     # Interactive 3D visualization
│   ├── MissionImpactCalculator.tsx # Risk assessment for space missions
│   ├── InteractiveTimeline.tsx   # Research evolution over time
│   ├── PublicationGrid.tsx       # Publication browsing interface
│   ├── AIInsightsPanel.tsx       # AI-generated research insights
│   ├── StatsOverview.tsx         # Dashboard metrics and trends
│   └── ML*.tsx                   # Machine learning pipeline components
├── data/              # Sample and mock data for development
├── types/             # TypeScript type definitions
├── utils/             # Utility functions and helpers
└── SB_publications-main/ # Real scraped biological research articles
```

### Data Models
The application uses strongly typed interfaces defined in `types/index.ts`:

- **Publication**: Core research publication with NASA-specific metadata
- **Finding**: Individual research findings with confidence scoring
- **SpaceEnvironment**: Mission environment data (ISS, Moon, Mars, Deep Space)
- **KnowledgeNode/Edge**: 3D knowledge graph entities and relationships
- **AIInsight**: Machine learning generated insights
- **MissionImpact**: Risk assessment and recommendations

### API Architecture
All API routes follow RESTful patterns with consistent response formats:
- `/api/articles` - Biology research articles from scraped data
- `/api/publications` - NASA bioscience publications 
- `/api/stats` - Dashboard statistics and trends
- `/api/insights` - AI-generated research insights

Each endpoint supports query parameters for filtering, pagination, and search.

## Key Features & Components

### 3D Knowledge Graph (`KnowledgeGraph3D.tsx`)
- Uses Three.js for interactive 3D visualization
- Nodes represent publications, findings, organisms, and missions
- Color-coded by type and importance with orbit controls
- Requires understanding of React Three Fiber patterns

### Machine Learning Pipeline (`ML*.tsx` components)
- Multi-file upload with drag & drop support
- Confusion matrix analysis for feature selection
- Real-time model training with progress visualization
- Supports multiple algorithms (Random Forest, Neural Networks, SVM)
- Complete pipeline from data upload to model deployment

### Search & Filtering (`SearchInterface.tsx`)
- Natural language search across 600+ publications
- Advanced filtering by year, experiment type, organism
- Real-time results with relevance scoring
- Integration with both sample and real article data

### Space-Themed Design System
The application uses a custom NASA-inspired design with:
- Space gradients (`bg-space-gradient`) and nebula effects
- NASA's official color palette (blue #0B3D91, red #FC3D21)
- Glass morphism effects (`glass-effect`)
- Smooth animations and space-like interactions

## Development Guidelines

### Working with Real Data
The application integrates real scraped biological research articles from `SB_publications-main/`:
- Articles are loaded via `/api/articles` endpoint
- Metadata includes title, abstract, keywords, categories
- Full-text search is implemented with weighted scoring
- Auto-categorization into biological research domains

### 3D Graphics Development
When working with Three.js components:
- Use React Three Fiber patterns with `<Canvas>` wrapper
- Implement `OrbitControls` for user interaction
- Handle loading states and error boundaries
- Optimize performance for complex 3D scenes

### State Management Patterns
- Use React hooks and context for local state
- Implement proper loading and error states
- Handle asynchronous data loading with proper fallbacks
- Maintain consistency between sample and real data

### Responsive Design
- Mobile-first approach with touch-friendly interfaces
- Tab-based navigation that collapses on mobile
- Optimized 3D graphics performance across devices
- Accessible design with WCAG compliance

## Environment Configuration

### Required Environment Variables
```bash
# Optional: OpenAI API key for AI features
OPENAI_API_KEY=your_api_key_here

# Next.js environment
NODE_ENV=development|production
```

### Next.js Configuration
The `next.config.js` includes:
- Image domains for external assets
- Webpack configuration for GLSL shaders
- Bundle analyzer integration

## Data Sources

### NASA Publications
- 608+ scientific publications from NASA's bioscience research
- Comprehensive metadata including impact scores and findings
- Real-time integration capabilities with NASA Open Science Data Repository

### Biology Research Articles  
- 600+ research articles from PubMed Central
- Full-text search and content analysis
- Smart categorization by biological domains
- Keyword analysis and trending topics

## Common Development Tasks

### Adding New Components
1. Create component in `components/` with TypeScript
2. Follow existing patterns for props and state management
3. Implement proper loading and error states
4. Add to main dashboard tabs if needed

### Extending the ML Pipeline
1. Add new algorithms to `MLModelTraining.tsx`
2. Update type definitions in `types/index.ts`
3. Implement backend processing if needed
4. Test with various data formats

### Modifying the Knowledge Graph
1. Update node/edge types in `types/index.ts`
2. Modify Three.js rendering logic
3. Implement new interaction patterns
4. Ensure performance optimization

### Working with Search
1. Extend search filters in `SearchInterface.tsx`
2. Update API endpoints for new filter types
3. Implement client-side and server-side filtering
4. Maintain search relevance scoring

The codebase is designed for extensibility and follows modern React/Next.js patterns with strong TypeScript typing throughout.

## Deployment

### Platform Support
The application is configured for deployment on multiple platforms:
- **Vercel** (recommended for Next.js)
- **Render** (uses `render.yaml` config)
- **Replit** (uses `.replit` and `replit.nix` configs)
- **Railway** (auto-detects Next.js)
- **Netlify** (requires Next.js plugin)

### Deployment Issues & Solutions
Common deployment problems have been solved:

1. **File System Dependencies**: The original code relied on direct access to `SB_publications-main` folder, which fails on many platforms
2. **Platform Differences**: Different platforms handle file paths and permissions differently  
3. **Missing Fallback**: No fallback mechanism when data files weren't accessible

**Solutions Implemented**:
- Environment detection and platform-specific handling
- Fallback data system with sample research articles
- Safe file operations with graceful error handling
- Robust API routes that work with or without data files

### Deployment-Ready Features
- **Auto-detection**: Platform detection and data source fallback
- **Environment Configuration**: `.env.example`, `render.yaml`, `.replit` files provided
- **Fallback Data**: 5 sample research articles with full functionality
- **Error Recovery**: APIs gracefully handle missing data files
- **Health Checks**: `/api/stats` endpoint for deployment monitoring

### Quick Deployment Fix
If deployment fails due to data access issues, set environment variable:
```bash
DATA_SOURCE=fallback
```

This enables the application to run with sample data while maintaining full functionality.

See `DEPLOYMENT_GUIDE.md` for detailed platform-specific instructions.
