#!/bin/bash

# This script helps deploy the application to Replit

echo "Preparing for Replit deployment..."

# Ensure requirements.txt is available
if [ ! -f "requirements.txt" ]; then
    echo "Error: requirements.txt not found!"
    exit 1
fi

# Create uploads and downloads directories if they don't exist
mkdir -p uploads
mkdir -p downloads
touch uploads/.gitkeep
touch downloads/.gitkeep

echo "Deployment preparation complete."
echo "Deploy to Replit using the Deployments tab in the sidebar."