#!/usr/bin/env python3
"""
Test script for the article scraper.
Tests with a few URLs to verify everything is working correctly.
"""

import os
import csv
from scrape_articles import ArticleScraper

def create_test_csv():
    """Create a small test CSV with a few URLs for testing."""
    test_urls = [
        ("Test Article 1", "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4136787/"),
        ("Test Article 2", "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3630201/"),
        ("Test Article 3", "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11988870/"),
    ]
    
    with open('test_articles.csv', 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['Title', 'Link'])
        writer.writerows(test_urls)
    
    print("Created test_articles.csv with 3 test URLs")

def test_scraper():
    """Test the scraper with a few articles."""
    print("="*50)
    print("TESTING ARTICLE SCRAPER")
    print("="*50)
    
    # Create test CSV
    create_test_csv()
    
    # Initialize scraper with test file
    scraper = ArticleScraper(
        input_file="test_articles.csv", 
        output_dir="test_scraped_articles"
    )
    
    # Run scraper
    scraper.run()
    
    # Check results
    print("\n" + "="*50)
    print("TEST RESULTS")
    print("="*50)
    
    if os.path.exists("test_scraped_articles"):
        files = os.listdir("test_scraped_articles")
        print(f"Created {len(files)} article files:")
        for f in sorted(files):
            filepath = os.path.join("test_scraped_articles", f)
            size = os.path.getsize(filepath)
            print(f"  {f} ({size:,} bytes)")
    
    if os.path.exists("scraped_summary.csv"):
        with open("scraped_summary.csv", 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            print(f"\nSummary CSV contains {len(rows)} successful entries")
            for row in rows:
                print(f"  Article {row['article_id']}: {row['word_count']} words ({row['content_type']})")
    
    print("\nTest completed! Check test_scraped_articles/ folder and logs.")

if __name__ == "__main__":
    test_scraper()