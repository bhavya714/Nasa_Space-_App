#!/usr/bin/env python3
"""
Biology Research Search Engine - Flask Web Application

A comprehensive web interface for searching and browsing biology research articles.
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for
import sqlite3
import os
import csv
import json
import re
from datetime import datetime
from typing import List, Dict, Tuple
import threading
import time

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'

# Configuration
DB_PATH = 'biology_articles.db'
ARTICLES_DIR = 'scraped_articles'
SUMMARY_CSV = 'scraped_summary.csv'

class DatabaseManager:
    """Manages database operations for articles and search functionality."""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the database with required tables."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create articles table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS articles (
                id INTEGER PRIMARY KEY,
                article_id INTEGER,
                url TEXT,
                title TEXT,
                content TEXT,
                word_count INTEGER,
                content_type TEXT,
                file_path TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(article_id)
            )
        ''')
        
        # Create search index for full-text search
        cursor.execute('''
            CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
                article_id UNINDEXED,
                title,
                content,
                content='articles',
                content_rowid='id'
            )
        ''')
        
        # Create triggers to maintain FTS index
        cursor.execute('''
            CREATE TRIGGER IF NOT EXISTS articles_ai AFTER INSERT ON articles BEGIN
                INSERT INTO articles_fts(article_id, title, content) 
                VALUES (new.article_id, new.title, new.content);
            END
        ''')
        
        cursor.execute('''
            CREATE TRIGGER IF NOT EXISTS articles_ad AFTER DELETE ON articles BEGIN
                DELETE FROM articles_fts WHERE article_id = old.article_id;
            END
        ''')
        
        cursor.execute('''
            CREATE TRIGGER IF NOT EXISTS articles_au AFTER UPDATE ON articles BEGIN
                UPDATE articles_fts SET title = new.title, content = new.content 
                WHERE article_id = old.article_id;
            END
        ''')
        
        conn.commit()
        conn.close()
    
    def insert_article(self, article_id: int, url: str, title: str, content: str, 
                      word_count: int, content_type: str, file_path: str):
        """Insert or update an article in the database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO articles 
            (article_id, url, title, content, word_count, content_type, file_path)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (article_id, url, title, content, word_count, content_type, file_path))
        
        conn.commit()
        conn.close()
    
    def search_articles(self, query: str, limit: int = 50) -> List[Dict]:
        """Search articles using full-text search."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if query:
            # Full-text search
            cursor.execute('''
                SELECT a.article_id, a.url, a.title, a.word_count, a.content_type,
                       snippet(articles_fts, 2, '<mark>', '</mark>', '...', 30) as snippet
                FROM articles_fts fts
                JOIN articles a ON a.article_id = fts.article_id
                WHERE articles_fts MATCH ?
                ORDER BY rank
                LIMIT ?
            ''', (query, limit))
        else:
            # Return all articles if no query
            cursor.execute('''
                SELECT article_id, url, title, word_count, content_type,
                       substr(content, 1, 200) || '...' as snippet
                FROM articles
                ORDER BY article_id
                LIMIT ?
            ''', (limit,))
        
        results = []
        for row in cursor.fetchall():
            results.append({
                'article_id': row[0],
                'url': row[1],
                'title': row[2],
                'word_count': row[3],
                'content_type': row[4],
                'snippet': row[5]
            })
        
        conn.close()
        return results
    
    def get_article(self, article_id: int) -> Dict:
        """Get a specific article by ID."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT article_id, url, title, content, word_count, content_type, file_path
            FROM articles
            WHERE article_id = ?
        ''', (article_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                'article_id': row[0],
                'url': row[1],
                'title': row[2],
                'content': row[3],
                'word_count': row[4],
                'content_type': row[5],
                'file_path': row[6]
            }
        return None
    
    def get_statistics(self) -> Dict:
        """Get database statistics."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM articles')
        total_articles = cursor.fetchone()[0]
        
        cursor.execute('SELECT SUM(word_count) FROM articles')
        total_words = cursor.fetchone()[0] or 0
        
        cursor.execute('SELECT content_type, COUNT(*) FROM articles GROUP BY content_type')
        content_types = dict(cursor.fetchall())
        
        cursor.execute('SELECT AVG(word_count) FROM articles')
        avg_words = cursor.fetchone()[0] or 0
        
        conn.close()
        
        return {
            'total_articles': total_articles,
            'total_words': total_words,
            'average_words': round(avg_words, 0),
            'content_types': content_types
        }

# Initialize database
db = DatabaseManager(DB_PATH)

def load_articles_from_files():
    """Load articles from scraped files into the database."""
    if not os.path.exists(ARTICLES_DIR):
        return 0
    
    loaded = 0
    
    # Load from CSV summary first
    if os.path.exists(SUMMARY_CSV):
        with open(SUMMARY_CSV, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                article_id = int(row['article_id'])
                file_path = row['saved_file_path']
                
                # Read the content from the text file
                if os.path.exists(file_path):
                    with open(file_path, 'r', encoding='utf-8') as content_file:
                        content = content_file.read()
                    
                    # Extract title from the beginning of content or URL
                    title = extract_title_from_content(content, row['url'])
                    
                    db.insert_article(
                        article_id=article_id,
                        url=row['url'],
                        title=title,
                        content=content,
                        word_count=int(row['word_count']),
                        content_type=row['content_type'],
                        file_path=file_path
                    )
                    loaded += 1
    
    return loaded

def extract_title_from_content(content: str, url: str) -> str:
    """Extract a title from the article content or URL."""
    lines = content.split('\n')
    
    # Look for the first substantial line as title
    for line in lines:
        line = line.strip()
        if len(line) > 20 and len(line) < 200:
            # Clean up common artifacts
            line = re.sub(r'^[^\w]*', '', line)  # Remove leading non-word chars
            line = re.sub(r'[^\w]*$', '', line)  # Remove trailing non-word chars
            if line:
                return line
    
    # Fallback: extract from URL
    if 'PMC' in url:
        pmc_match = re.search(r'PMC\d+', url)
        if pmc_match:
            return f"Biology Research Article - {pmc_match.group()}"
    
    return "Biology Research Article"

# Routes
@app.route('/')
def index():
    """Main search interface."""
    stats = db.get_statistics()
    return render_template('index.html', stats=stats)

@app.route('/search')
def search():
    """Search results page."""
    query = request.args.get('q', '').strip()
    page = int(request.args.get('page', 1))
    per_page = 20
    
    if query:
        results = db.search_articles(query, limit=per_page * page)
        # Simple pagination - get results for current page
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        page_results = results[start_idx:end_idx]
    else:
        page_results = db.search_articles('', limit=per_page)
        results = page_results
    
    return render_template('search_results.html', 
                         results=page_results, 
                         query=query,
                         page=page,
                         has_more=len(results) >= per_page * page)

@app.route('/article/<int:article_id>')
def view_article(article_id):
    """View a specific article."""
    article = db.get_article(article_id)
    if not article:
        return "Article not found", 404
    
    return render_template('article.html', article=article)

@app.route('/api/search')
def api_search():
    """API endpoint for search functionality."""
    query = request.args.get('q', '').strip()
    limit = min(int(request.args.get('limit', 20)), 100)
    
    results = db.search_articles(query, limit=limit)
    return jsonify({
        'query': query,
        'results': results,
        'count': len(results)
    })

@app.route('/api/stats')
def api_stats():
    """API endpoint for statistics."""
    return jsonify(db.get_statistics())

@app.route('/dashboard')
def dashboard():
    """Statistics and dashboard page."""
    stats = db.get_statistics()
    return render_template('dashboard.html', stats=stats)

@app.route('/about')
def about():
    """About page."""
    return render_template('about.html')

if __name__ == '__main__':
    # Load articles into database on startup
    print("Loading articles into database...")
    loaded_count = load_articles_from_files()
    print(f"Loaded {loaded_count} articles into database")
    
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)