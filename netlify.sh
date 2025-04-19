
#!/bin/bash

# Netlify deployment script

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

# Deploy to Netlify
echo "Deploying to Netlify..."
netlify deploy --prod

echo "Deployment completed!"
