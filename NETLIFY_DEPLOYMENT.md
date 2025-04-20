# Netlify Deployment for The PDF Bond

This document outlines the steps for deploying The PDF Bond to Netlify.

## Deployment Process

The deployment process involves the following steps:

1. The Netlify deployment reads the `netlify.toml` configuration file.
2. The `netlify.sh` script is executed during the build process.
3. The script sets up the necessary directory structure and copies relevant files.
4. The static files are served from the `static` directory.
5. API functionality is handled by Netlify Functions.

## Files Structure

- `netlify.toml`: Configuration file for Netlify
- `netlify.sh`: Build script that runs during deployment
- `static/`: Contains all static assets (HTML, CSS, JS)
- `netlify/functions/`: Contains serverless functions for backend functionality

## Important Notes

- The application is a static deployment with serverless backend functions
- HTML templates are placed directly in the `static` folder
- API functionality is limited compared to the full Flask application
- File uploads and advanced PDF processing aren't available in the static deployment

## Limitations

The Netlify deployment has the following limitations compared to the full application:

1. No file upload functionality
2. No PDF processing capabilities
3. Limited API functionality
4. No session persistence
5. No database access

## Deployment Steps

1. Make sure all required files are in place:
   - Templates in `static/` directory
   - JS files in `static/js/` directory
   - CSS files in `static/css/` directory
   - API handlers in `netlify/functions/` directory
   
2. Commit and push your changes to GitHub

3. Connect your GitHub repository to Netlify

4. Configure the build settings:
   - Build command: `sh netlify.sh`
   - Publish directory: `static`
   
5. Deploy your site!