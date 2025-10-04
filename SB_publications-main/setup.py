#!/usr/bin/env python3
"""
Setup script for the Biology Research Articles Scraper.
Installs dependencies and verifies the setup.
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required packages."""
    print("Installing required packages...")
    
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ All dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

def verify_installation():
    """Verify that all packages are installed correctly."""
    print("\nVerifying installation...")
    
    required_packages = {
        'requests': 'requests',
        'beautifulsoup4': 'bs4',
        'PyMuPDF': 'fitz',
        'lxml': 'lxml'
    }
    
    all_good = True
    
    for package_name, import_name in required_packages.items():
        try:
            __import__(import_name)
            print(f"✅ {package_name} - OK")
        except ImportError:
            print(f"❌ {package_name} - FAILED")
            all_good = False
    
    return all_good

def check_input_file():
    """Check if the input CSV file exists."""
    print("\nChecking input file...")
    
    if os.path.exists("SB_publication_PMC.csv"):
        print("✅ SB_publication_PMC.csv found")
        
        # Count lines to estimate articles
        try:
            with open("SB_publication_PMC.csv", 'r', encoding='utf-8') as f:
                lines = sum(1 for line in f)
            print(f"✅ Found approximately {lines-1} articles to process")
        except Exception as e:
            print(f"⚠️  Could not count articles: {e}")
        
        return True
    else:
        print("⚠️  SB_publication_PMC.csv not found")
        print("   Make sure your CSV file is in this directory")
        return False

def create_directories():
    """Create necessary directories."""
    print("\nCreating directories...")
    
    directories = ["scraped_articles"]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✅ Created directory: {directory}")

def main():
    """Main setup function."""
    print("="*60)
    print("BIOLOGY RESEARCH ARTICLES SCRAPER - SETUP")
    print("="*60)
    
    # Install requirements
    if not install_requirements():
        print("\n❌ Setup failed during dependency installation")
        return 1
    
    # Verify installation
    if not verify_installation():
        print("\n❌ Setup failed during verification")
        return 1
    
    # Check input file
    input_file_exists = check_input_file()
    
    # Create directories
    create_directories()
    
    # Final status
    print("\n" + "="*60)
    print("SETUP COMPLETE")
    print("="*60)
    
    if input_file_exists:
        print("🚀 Ready to scrape! Run:")
        print("   python scrape_articles.py")
        print("\n📊 Or test with a few articles first:")
        print("   python test_scraper.py")
    else:
        print("📝 Next steps:")
        print("1. Place your CSV file as 'SB_publication_PMC.csv'")
        print("2. Run: python scrape_articles.py")
        print("\n📊 Or test the setup:")
        print("   python test_scraper.py")
    
    print("\n📖 For more information, see README_SCRAPER.md")
    
    return 0

if __name__ == "__main__":
    exit(main())