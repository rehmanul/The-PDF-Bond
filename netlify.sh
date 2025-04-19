
#!/bin/bash

# Netlify deployment script

# Install Node.js and npm (this is necessary for Netlify CLI)
if ! command -v node &> /dev/null; then
    echo "Node.js is required for deployment with Netlify CLI."
    echo "Please install Node.js on your system or use the Netlify web UI for deployment."
    echo "Visit https://nodejs.org/en/download/ for installation instructions."
    exit 1
fi

# Install Netlify CLI
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install netlify-cli -g
fi

# Create necessary directories
mkdir -p netlify/functions
mkdir -p uploads
mkdir -p downloads
touch uploads/.gitkeep
touch downloads/.gitkeep

# Ensure function exists
if [ ! -f netlify/functions/api.py ]; then
    echo "Creating netlify/functions/api.py..."
    cp attached_assets/api.py netlify/functions/api.py
fi

# Deploy to Netlify
echo "Deploying to Netlify..."
netlify deploy --prod

echo "Deployment completed!"
echo "Your site should now be accessible at the Netlify URL."
echo "If you encounter any issues with menu functionality, check the browser console for errors."
