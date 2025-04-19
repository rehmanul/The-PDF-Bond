# Deploying to Netlify

This document provides instructions for deploying The PDF Bond application to Netlify.

## Prerequisites

1. A Netlify account
2. The GitHub repository: https://github.com/rehmanul/The-PDF-Bond.git

## Deployment Steps

### Option 1: Deploy from GitHub

1. Log in to your Netlify account
2. Click "Add new site" > "Import an existing project"
3. Choose "GitHub" as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select the repository "rehmanul/The-PDF-Bond"
6. In the site settings, configure the following:
   - Build command: `pip install -r requirements.txt`
   - Publish directory: `static`
7. Deploy the site

### Option 2: Deploy using Netlify CLI

1. Install the Netlify CLI: `npm install -g netlify-cli`
2. Clone the repository: `git clone https://github.com/rehmanul/The-PDF-Bond.git`
3. Navigate to the project directory: `cd The-PDF-Bond`
4. Run `netlify login` to authenticate with your Netlify account
5. Run `netlify deploy` to deploy the site

## Environment Variables

Make sure to set up the following environment variables in your Netlify site settings:

- `PERPLEXITY_API_KEY`: Your Perplexity API key (optional, for AI-powered analysis)
- `SESSION_SECRET`: A secret key for session management

## Functions

This application uses Netlify Functions for serverless functionality. The functions are located in the `netlify/functions` directory:

- `api.py`: Handles API requests for the application

## Troubleshooting

If you encounter issues during deployment:

1. Check the Netlify deployment logs for errors
2. Ensure all dependencies are listed in `requirements.txt`
3. Verify the `netlify.toml` configuration is correct
4. Make sure environment variables are set properly

For more help, visit the [Netlify documentation](https://docs.netlify.com/).