
#!/bin/bash

# Netlify deployment script

# Install Node.js and npm
if ! command -v node &> /dev/null; then
    echo "Installing Node.js and npm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
    nvm install node
fi

# Install Netlify CLI
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install netlify-cli -g
fi

# Create necessary directories
mkdir -p netlify/functions

# Ensure uploads and downloads directories exist
mkdir -p uploads
mkdir -p downloads
touch uploads/.gitkeep
touch downloads/.gitkeep

# Copy API function if it doesn't exist
if [ ! -f netlify/functions/api.py ]; then
    echo "Creating netlify/functions/api.py..."
    cp attached_assets/api.py netlify/functions/api.py
fi

# Create netlify.toml if it doesn't exist
if [ ! -f netlify.toml ]; then
    echo "Creating netlify.toml..."
    cp attached_assets/netlify.toml netlify.toml
fi

# Deploy to Netlify
echo "Deploying to Netlify..."
netlify deploy --prod

echo "Deployment completed!"
