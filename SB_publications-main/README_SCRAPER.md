# Biology Research Articles Scraper

A comprehensive Python script that scrapes biology research articles from URLs, extracting and cleaning text content for analysis.

## Features

- 🔍 **Smart Content Detection**: Automatically identifies HTML pages vs PDFs
- 📄 **Dual Content Extraction**: Handles both HTML and PDF sources
- 🧹 **Intelligent Text Cleaning**: Removes navigation, ads, references, and cleans formatting
- 💾 **Progress Tracking**: Resume interrupted scraping sessions
- 📊 **Comprehensive Logging**: Detailed logs and progress reporting
- 📈 **Summary Generation**: Creates CSV summary with metadata
- ⚡ **Efficient Processing**: Batch processing with error handling

## Requirements

- Python 3.7 or higher
- Internet connection for downloading articles

## Installation

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

   Or install individually:
   ```bash
   pip install requests beautifulsoup4 PyMuPDF lxml
   ```

## Usage

### Basic Usage

Simply run the script with the default CSV file:

```bash
python scrape_articles.py
```

### Input File Format

The script expects a CSV file named `SB_publication_PMC.csv` with the following format:
```
Title,Link
"Article Title 1",https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1234567/
"Article Title 2",https://www.example.com/article2.pdf
```

### Output

The script creates:

1. **scraped_articles/** folder containing:
   - `article_1.txt`, `article_2.txt`, etc. - Individual text files
   
2. **scraped_summary.csv** with columns:
   - `article_id` - Sequential ID number
   - `url` - Original article URL
   - `word_count` - Number of words extracted
   - `saved_file_path` - Path to saved text file
   - `content_type` - HTML or PDF

3. **scraping.log** - Detailed processing log

4. **scraping_progress.json** - Progress tracking (for resuming)

### Resume Interrupted Sessions

The script automatically saves progress and can resume from where it left off if interrupted.

## Configuration

You can modify the script parameters by editing the `ArticleScraper` class initialization:

```python
# Custom input file and output directory
scraper = ArticleScraper(
    input_file="my_articles.csv", 
    output_dir="my_output_folder"
)
```

## Content Extraction Details

### HTML Pages
- Uses BeautifulSoup for parsing
- Removes navigation, ads, menus, footers
- Extracts main content areas (article, main, .content, etc.)
- Filters out references and related articles

### PDF Files
- Downloads PDFs temporarily using PyMuPDF
- Extracts text from all pages
- Automatically cleans up temporary files

### Text Cleaning
- Removes excessive whitespace and newlines
- Normalizes special characters
- Filters out non-content elements
- Maintains readable formatting

## Progress Monitoring

The script provides real-time progress updates:

```
2024-01-15 10:30:15 - INFO - Processing article 45: https://example.com/article45
2024-01-15 10:30:17 - INFO - Successfully scraped article 45 (2,341 words)
2024-01-15 10:30:17 - INFO - Progress: 45/600 processed (42 successful, 3 errors)
```

## Error Handling

- **Network Issues**: Automatic retries with exponential backoff
- **Malformed Content**: Logs errors and continues processing
- **File I/O Errors**: Detailed error messages with suggestions
- **Memory Management**: Efficient processing of large files

## Performance Notes

- **Processing Speed**: ~1-2 articles per second (depending on content size)
- **Memory Usage**: Minimal memory footprint with streaming processing
- **Network Respectful**: 1-second delay between requests
- **Resume Capability**: Can handle large datasets over multiple sessions

## Troubleshooting

### Common Issues

1. **"No content extracted"**
   - Check if URL is accessible
   - Verify internet connection
   - Some sites may block automated access

2. **"Permission denied"**
   - Ensure write permissions for output directory
   - Check available disk space

3. **"SSL Certificate errors"**
   - Some older sites may have certificate issues
   - Script includes SSL verification handling

### Logs and Debugging

Check `scraping.log` for detailed error information:
```bash
tail -f scraping.log  # Monitor in real-time (Linux/Mac)
Get-Content -Wait scraping.log  # Monitor in real-time (Windows PowerShell)
```

## Next Steps: Building Your Search Engine

After scraping, you'll have 600+ cleaned text files ready for:

1. **Text Summarization**: Use LLMs (GPT, Mistral, etc.) to create summaries
2. **Vector Database**: Store embeddings for semantic search
3. **Search Interface**: Build a web interface for querying

Example pipeline:
```python
# After scraping completes
# 1. Summarize each article
for article_file in glob.glob("scraped_articles/*.txt"):
    summary = summarize_with_llm(article_file)
    
# 2. Create embeddings and store in vector DB
# 3. Build search interface
```

## License

MIT License - Feel free to modify and use for your research needs.

## Contributing

Feel free to submit issues and enhancement requests!