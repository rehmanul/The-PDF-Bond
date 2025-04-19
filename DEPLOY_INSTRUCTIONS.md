# Deploy Instructions for The PDF Bond

We've prepared a complete copy of the project for you to download and deploy. Here are the steps:

## 1. Download the Project Archive

In the workspace, you'll find a file called `pdf-bond-export.tar.gz`. Download this file to your local computer.

## 2. Extract the Archive

On Linux/Mac:
```bash
tar -xzf pdf-bond-export.tar.gz
cd pdf-bond-export
```

On Windows (using 7-Zip or similar):
1. Right-click on the file and choose "Extract here" or "Extract to pdf-bond-export\"
2. Navigate to the extracted folder

## 3. Initialize Git and Push to GitHub

```bash
# Initialize a new git repository
git init

# Add all files
git add .

# Commit the changes
git commit -m "Initial commit: PDF Bond application with benefit extraction"

# Add your remote repository
git remote add origin https://github.com/rehmanul/The-PDF-Bond.git

# Force push to your repository (this will overwrite any existing content)
git push -f origin main
```

## 4. Deploy to Netlify

### Option 1: Deploy from GitHub (Recommended)

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
2. Navigate to the extracted project directory
3. Run `netlify login` to authenticate with your Netlify account
4. Run `netlify deploy` to deploy the site

## 5. Set Environment Variables

Make sure to set up the following environment variables in your Netlify site settings:

- `PERPLEXITY_API_KEY`: Your Perplexity API key (optional, for AI-powered analysis)

## Troubleshooting

If you encounter issues during deployment:

1. Check the Netlify deployment logs for errors
2. Ensure all dependencies are listed in `requirements.txt`
3. Verify the `netlify.toml` configuration is correct

For more help, see the [NETLIFY.md](NETLIFY.md) file in the project or visit the [Netlify documentation](https://docs.netlify.com/).