
import os
import zipfile
from datetime import datetime

def zip_project(exclude_dirs=None, exclude_files=None):
    if exclude_dirs is None:
        exclude_dirs = ['.git', '__pycache__', 'venv', 'env']
    
    if exclude_files is None:
        exclude_files = ['.DS_Store', '.gitignore', 'zip_project.py']
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    zip_filename = f'pdf_scraper_project_{timestamp}.zip'
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Skip excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if file not in exclude_files:
                    file_path = os.path.join(root, file)
                    # Add file to zip with relative path
                    zipf.write(file_path, file_path)
    
    print(f"Project zipped successfully to {zip_filename}")
    return zip_filename

if __name__ == "__main__":
    zip_project()
