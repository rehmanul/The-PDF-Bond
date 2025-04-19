
#!/bin/bash

# Netlify deployment script

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Installing Node.js..."
    curl -sL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Ensure the netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Create necessary directories
mkdir -p netlify/functions

# Create requirements.txt if it doesn't exist
if [ ! -f requirements.txt ]; then
    echo "Creating requirements.txt from pyproject.toml..."
    python -c "import toml; deps = toml.load('pyproject.toml')['project']['dependencies']; print('\n'.join(deps))" > requirements.txt
fi

# Ensure uploads and downloads directories exist
mkdir -p uploads
mkdir -p downloads
touch uploads/.gitkeep
touch downloads/.gitkeep

# Create or update netlify/functions/api.py if it doesn't exist
if [ ! -f netlify/functions/api.py ]; then
    echo "Creating netlify/functions/api.py..."
    cp attached_assets/api.py netlify/functions/api.py
fi

# Deploy to Netlify
echo "Deploying to Netlify..."
netlify deploy --prod

echo "Deployment completed!"
