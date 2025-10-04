# Biology Research Search Engine

A comprehensive web application for searching and exploring biological science research articles with AI-powered insights and interactive visualizations.

## 🧬 Features

### Real Biological Science Data
- **600+ Research Articles** from PubMed Central
- **Full-Text Search** across article content
- **Smart Categorization** (Space Biology, Cell Biology, Molecular Biology, etc.)
- **Keyword Analysis** and trending topics
- **Content Statistics** and research insights

### Advanced Search Capabilities
- **AI-Powered Search** with relevance scoring
- **Category Filtering** by research domain
- **Real-time Results** with highlighted matches
- **Article Previews** with abstracts and keywords

### Interactive Visualizations
- **Research Statistics Dashboard**
- **Knowledge Graphs** showing topic relationships
- **Timeline View** of research trends
- **Impact Analysis** tools

### Modern Web Interface
- **Responsive Design** for all devices
- **Glass-morphism UI** with smooth animations
- **Real-time Loading States**
- **Progressive Web App** capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- The scraped articles data in `SB_publications-main/` folder

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:3000`

### Data Structure
The application expects the following data structure:
```
SB_publications-main/
├── scraped_summary.csv      # Article metadata
└── scraped_articles/        # Individual article text files
    ├── article_1.txt
    ├── article_2.txt
    └── ...
```

## 📊 Application Sections

### 1. Overview Dashboard
- Real-time statistics from scraped articles
- AI-generated insights based on content analysis
- Research trend visualizations
- Quick access to key metrics

### 2. Biology Search
- Advanced full-text search across all articles
- Smart ranking by relevance
- Filter by categories and keywords
- Export search results

### 3. Research Articles
- Browse all articles with rich previews
- Category-based filtering
- Direct links to original sources
- Word count and citation information

### 4. Knowledge Graph
- Interactive 3D visualization of topic relationships
- Node connections based on shared keywords
- Zoom and explore different research domains

### 5. Timeline & Trends
- Chronological view of research publications
- Trending topics analysis
- Research activity patterns

### 6. Impact Analysis
- Research impact calculations
- Citation network analysis
- Collaboration potential identification

## 🔧 API Endpoints

### Articles API (`/api/articles`)
- `GET /api/articles` - List all articles
- `GET /api/articles?q=query` - Search articles
- `GET /api/articles?category=Biology` - Filter by category

### Statistics API (`/api/stats`)
- `GET /api/stats?type=overview` - Basic statistics
- `GET /api/stats?type=keywords` - Top keywords
- `GET /api/stats?type=categories` - Category breakdown
- `GET /api/stats?type=trends` - Research trends

## 🧪 Data Processing

The application processes biological research articles with:

### Content Analysis
- **Title Extraction** from article content
- **Abstract Identification** and summarization
- **Keyword Recognition** using biological terminology
- **Category Classification** based on content analysis

### Smart Classification
Articles are automatically categorized into:
- **Space Biology** - Microgravity and space-related research
- **Cell Biology** - Cellular processes and mechanisms
- **Molecular Biology** - DNA, RNA, and protein studies
- **Physiology** - Organ systems and functions
- **Neuroscience** - Brain and nervous system research
- **Immunology** - Immune system studies
- **Cancer Research** - Oncology and tumor biology
- **Genetics** - Heredity and genetic variation
- **Biochemistry** - Chemical processes in living organisms

### Search Algorithm
The search functionality uses:
- **Weighted Scoring**: Title matches (10x), Abstract (5x), Keywords (8x)
- **Fuzzy Matching** for partial term matches
- **Relevance Ranking** based on term frequency and position
- **Category Boosting** for domain-specific searches

## 🎯 Usage Examples

### Basic Search
1. Enter search terms like "microgravity cell culture"
2. View ranked results with highlighted matches
3. Click on articles to visit original sources

### Category Exploration
1. Go to "Research Articles" tab
2. Click on category filters (e.g., "Space Biology")
3. Browse filtered results

### Research Insights
1. Visit "Overview" tab for AI-generated insights
2. Explore trending keywords and topics
3. View research collaboration opportunities

## 🛠️ Technical Architecture

### Frontend
- **Next.js 14** with TypeScript
- **React 18** with hooks and context
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization

### Backend
- **Next.js API Routes** for server functions
- **File System API** for data access
- **CSV Parsing** for metadata processing
- **Real-time Search** with caching

### Data Processing
- **Intelligent Text Analysis** for content extraction
- **Biological Keyword Recognition**
- **Automatic Categorization** algorithms
- **Statistics Generation** and caching

## 📈 Performance Optimization

- **Data Caching** (10-minute cache for articles, 5-minute for stats)
- **Lazy Loading** for article content
- **Progressive Loading** with skeleton states
- **Responsive Images** and optimized assets
- **API Response Optimization** with data truncation

## 🔮 Future Enhancements

- **AI Summarization** of articles using LLMs
- **Vector Database Integration** for semantic search
- **Research Collaboration** network analysis
- **Export Capabilities** (PDF, CSV, JSON)
- **Bookmark System** for saving articles
- **Advanced Filtering** with date ranges and authors
- **Citation Network** visualization

## 🐛 Troubleshooting

### Data Loading Issues
- Ensure `SB_publications-main/` folder exists
- Check `scraped_summary.csv` format
- Verify article text files are accessible

### Search Not Working
- Check API endpoints in browser DevTools
- Verify article data is loaded
- Clear browser cache and reload

### Performance Issues
- Reduce article limit in API calls
- Check for memory leaks in React components
- Monitor network requests in DevTools

## 📄 License

This project is built for educational and research purposes. Please respect the original article sources and citations.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with ❤️ for biological science research exploration**