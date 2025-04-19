#!/bin/bash

# This script helps deploy the application to Netlify

echo "Preparing for Netlify deployment..."

# Ensure requirements.txt is available
if [ ! -f "requirements.txt" ]; then
    echo "Error: requirements.txt not found!"
    exit 1
fi

# Ensure netlify.toml is available
if [ ! -f "netlify.toml" ]; then
    echo "Error: netlify.toml not found!"
    exit 1
fi

# Ensure netlify/functions directory exists
if [ ! -d "netlify/functions" ]; then
    echo "Creating netlify/functions directory..."
    mkdir -p netlify/functions
fi

# Ensure netlify/functions/api.py exists
if [ ! -f "netlify/functions/api.py" ]; then
    echo "Error: netlify/functions/api.py not found!"
    exit 1
fi

# Create .gitignore file
if [ ! -f ".gitignore" ]; then
    echo "Creating .gitignore file..."
    cat > .gitignore << EOL
__pycache__/
*.py[cod]
*$py.class
*.so
.env
.venv
env/
venv/
ENV/
.env.local
node_modules/
api_keys.json
*.log
uploads/*
!uploads/.gitkeep
downloads/*
!downloads/.gitkeep
netlify/
EOL
fi

# Create uploads and downloads directories if they don't exist
mkdir -p uploads
mkdir -p downloads
touch uploads/.gitkeep
touch downloads/.gitkeep

echo "Deployment preparation complete."
echo "Deploy to Netlify using Netlify CLI or GitHub integration."