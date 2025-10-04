#!/usr/bin/env python3
"""
Biology Research Articles Scraper

This script reads a CSV file containing URLs of biology research articles
and scrapes their content, saving cleaned text to individual files.

Usage: python scrape_articles.py
"""

import requests
from bs4 import BeautifulSoup
import fitz  # PyMuPDF
import csv
import os
import re
import logging
import time
from urllib.parse import urlparse, urljoin
import tempfile
from typing import Tuple, Optional, List, Dict
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraping.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ArticleScraper:
    def __init__(self, input_file: str = "SB_publication_PMC.csv", output_dir: str = "scraped_articles"):
        """Initialize the article scraper with input file and output directory."""
        self.input_file = input_file
        self.output_dir = output_dir
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.scraped_data = []
        self.success_count = 0
        self.error_count = 0
        
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Load existing progress if available
        self.progress_file = "scraping_progress.json"
        self.completed_urls = self.load_progress()
        
    def load_progress(self) -> set:
        """Load previously completed URLs from progress file."""
        if os.path.exists(self.progress_file):
            try:
                with open(self.progress_file, 'r') as f:
                    data = json.load(f)
                    return set(data.get('completed_urls', []))
            except Exception as e:
                logger.warning(f"Could not load progress file: {e}")
        return set()
    
    def save_progress(self):
        """Save current progress to file."""
        try:
            progress_data = {
                'completed_urls': list(self.completed_urls),
                'success_count': self.success_count,
                'error_count': self.error_count
            }
            with open(self.progress_file, 'w') as f:
                json.dump(progress_data, f, indent=2)
        except Exception as e:
            logger.error(f"Could not save progress: {e}")

    def is_pdf_url(self, url: str) -> bool:
        """Check if URL leads to a PDF by examining the response headers."""
        try:
            # First check if URL ends with .pdf
            if url.lower().endswith('.pdf'):
                return True
            
            # Make a HEAD request to check content type
            response = self.session.head(url, timeout=10, allow_redirects=True)
            content_type = response.headers.get('content-type', '').lower()
            
            return 'application/pdf' in content_type
            
        except Exception as e:
            logger.warning(f"Could not determine content type for {url}: {e}")
            # Fallback: assume HTML if we can't determine
            return False

    def extract_html_content(self, url: str) -> Optional[str]:
        """Extract main content from HTML page using BeautifulSoup."""
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove unwanted elements
            for element in soup(['script', 'style', 'nav', 'header', 'footer', 
                                'aside', 'menu', 'iframe', 'form']):
                element.decompose()
            
            # Remove elements with common navigation/ad classes and IDs
            unwanted_selectors = [
                '.navigation', '.nav', '.menu', '.sidebar', '.footer', 
                '.header', '.advertisement', '.ad', '.social', '.share',
                '.references', '.ref-list', '.citation', '.related-articles',
                '#navigation', '#nav', '#menu', '#sidebar', '#footer',
                '#header', '#advertisement', '#social', '#references'
            ]
            
            for selector in unwanted_selectors:
                for element in soup.select(selector):
                    element.decompose()
            
            # Try to find main content area
            main_content = None
            
            # Common selectors for main content
            content_selectors = [
                'main', 'article', '.main-content', '.content', '.article-content',
                '.abstract', '.full-text', '.article-body', '.content-area',
                '#main-content', '#content', '#article-content'
            ]
            
            for selector in content_selectors:
                content = soup.select_one(selector)
                if content:
                    main_content = content
                    break
            
            # If no specific content area found, use body
            if not main_content:
                main_content = soup.find('body')
            
            if not main_content:
                main_content = soup
            
            # Extract text
            text = main_content.get_text(separator='\n', strip=True)
            
            return text
            
        except Exception as e:
            logger.error(f"Error extracting HTML content from {url}: {e}")
            return None

    def extract_pdf_content(self, url: str) -> Optional[str]:
        """Download PDF temporarily and extract text using PyMuPDF."""
        try:
            # Download PDF
            response = self.session.get(url, timeout=60)
            response.raise_for_status()
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
                temp_file.write(response.content)
                temp_path = temp_file.name
            
            try:
                # Extract text from PDF
                doc = fitz.open(temp_path)
                text = ""
                
                for page_num in range(doc.page_count):
                    page = doc.load_page(page_num)
                    text += page.get_text()
                
                doc.close()
                return text
                
            finally:
                # Clean up temporary file
                try:
                    os.unlink(temp_path)
                except Exception as e:
                    logger.warning(f"Could not delete temporary file {temp_path}: {e}")
                    
        except Exception as e:
            logger.error(f"Error extracting PDF content from {url}: {e}")
            return None

    def clean_text(self, text: str) -> str:
        """Clean extracted text by removing excessive whitespace and unwanted characters."""
        if not text:
            return ""
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove excessive newlines
        text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
        
        # Remove special characters that might cause issues
        text = re.sub(r'[^\w\s\.\,\;\:\!\?\-\(\)\[\]\{\}\"\'\/\\\n]', ' ', text)
        
        # Remove multiple spaces
        text = re.sub(r' +', ' ', text)
        
        # Strip leading/trailing whitespace
        text = text.strip()
        
        return text

    def save_article_text(self, text: str, article_id: int) -> str:
        """Save cleaned text to a numbered file."""
        filename = f"article_{article_id}.txt"
        filepath = os.path.join(self.output_dir, filename)
        
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(text)
            return filepath
        except Exception as e:
            logger.error(f"Error saving article {article_id}: {e}")
            raise

    def count_words(self, text: str) -> int:
        """Count words in the text."""
        return len(text.split())

    def scrape_article(self, url: str, article_id: int) -> Dict:
        """Scrape a single article and return metadata."""
        
        # Skip if already processed
        if url in self.completed_urls:
            logger.info(f"Skipping already processed URL: {url}")
            return None
        
        logger.info(f"Processing article {article_id}: {url}")
        
        try:
            # Determine content type
            is_pdf = self.is_pdf_url(url)
            
            # Extract content based on type
            if is_pdf:
                logger.info(f"Extracting PDF content from article {article_id}")
                raw_text = self.extract_pdf_content(url)
            else:
                logger.info(f"Extracting HTML content from article {article_id}")
                raw_text = self.extract_html_content(url)
            
            if not raw_text:
                raise Exception("No content extracted")
            
            # Clean the text
            cleaned_text = self.clean_text(raw_text)
            
            if not cleaned_text or len(cleaned_text.strip()) < 100:
                raise Exception("Extracted text is too short or empty")
            
            # Save to file
            filepath = self.save_article_text(cleaned_text, article_id)
            
            # Count words
            word_count = self.count_words(cleaned_text)
            
            # Mark as completed
            self.completed_urls.add(url)
            self.success_count += 1
            
            logger.info(f"Successfully scraped article {article_id} ({word_count} words)")
            
            return {
                'article_id': article_id,
                'url': url,
                'word_count': word_count,
                'saved_file_path': filepath,
                'content_type': 'PDF' if is_pdf else 'HTML'
            }
            
        except Exception as e:
            self.error_count += 1
            logger.error(f"Failed to scrape article {article_id} from {url}: {e}")
            
            return {
                'article_id': article_id,
                'url': url,
                'word_count': 0,
                'saved_file_path': 'ERROR',
                'content_type': 'ERROR',
                'error': str(e)
            }

    def load_urls_from_csv(self) -> List[Tuple[int, str]]:
        """Load URLs from CSV file."""
        urls = []
        
        try:
            with open(self.input_file, 'r', encoding='utf-8') as csvfile:
                # Handle the pipe-separated format from the sample
                reader = csv.reader(csvfile, delimiter='|' if '|' in open(self.input_file, 'r').read()[:1000] else ',')
                
                for row_num, row in enumerate(reader, 1):
                    if row_num == 1:  # Skip header
                        continue
                    
                    if len(row) >= 2:
                        # Extract URL (second column)
                        url = row[1].strip()
                        
                        # Validate URL
                        if url and url.startswith('http'):
                            urls.append((row_num - 1, url))  # article_id, url
                        
        except Exception as e:
            logger.error(f"Error reading CSV file {self.input_file}: {e}")
            raise
        
        logger.info(f"Loaded {len(urls)} URLs from {self.input_file}")
        return urls

    def save_summary_csv(self):
        """Save scraping summary to CSV file."""
        summary_file = 'scraped_summary.csv'
        
        try:
            with open(summary_file, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = ['article_id', 'url', 'word_count', 'saved_file_path', 'content_type']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                writer.writeheader()
                for row in self.scraped_data:
                    # Only write successful scrapes to summary
                    if row.get('saved_file_path') != 'ERROR':
                        writer.writerow({k: v for k, v in row.items() if k in fieldnames})
            
            logger.info(f"Summary saved to {summary_file}")
            
        except Exception as e:
            logger.error(f"Error saving summary CSV: {e}")

    def run(self):
        """Main scraping process."""
        logger.info("Starting article scraping process...")
        
        # Load URLs from CSV
        urls = self.load_urls_from_csv()
        total_urls = len(urls)
        
        if not urls:
            logger.error("No URLs found to process")
            return
        
        logger.info(f"Found {total_urls} URLs to process")
        logger.info(f"Previously completed: {len(self.completed_urls)} URLs")
        
        # Process each URL
        for article_id, url in urls:
            try:
                # Add delay to be respectful to servers
                time.sleep(1)
                
                result = self.scrape_article(url, article_id)
                
                if result:
                    self.scraped_data.append(result)
                
                # Log progress
                total_processed = self.success_count + self.error_count
                logger.info(f"Progress: {total_processed}/{total_urls} processed "
                          f"({self.success_count} successful, {self.error_count} errors)")
                
                # Save progress periodically
                if total_processed % 10 == 0:
                    self.save_progress()
                    self.save_summary_csv()
                
            except KeyboardInterrupt:
                logger.info("Scraping interrupted by user")
                break
            except Exception as e:
                logger.error(f"Unexpected error processing article {article_id}: {e}")
                continue
        
        # Final save
        self.save_progress()
        self.save_summary_csv()
        
        # Final statistics
        logger.info("="*50)
        logger.info("SCRAPING COMPLETE")
        logger.info(f"Total URLs processed: {self.success_count + self.error_count}")
        logger.info(f"Successfully scraped: {self.success_count}")
        logger.info(f"Errors: {self.error_count}")
        logger.info(f"Success rate: {(self.success_count/(self.success_count + self.error_count)*100):.1f}%")
        logger.info(f"Output directory: {self.output_dir}")
        logger.info(f"Summary file: scraped_summary.csv")
        logger.info("="*50)


def main():
    """Main entry point."""
    try:
        scraper = ArticleScraper()
        scraper.run()
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())