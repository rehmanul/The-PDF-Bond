
#!/bin/bash
set -e

echo "Starting Netlify deployment..."

# Create necessary directories
mkdir -p netlify/functions
mkdir -p static/js
mkdir -p static/css
mkdir -p static/img

# Install dependencies
echo "Installing Python dependencies..."
# Check if requirements.txt exists in the root directory
if [ -f "requirements.txt" ]; then
  pip install -r requirements.txt
# If not, check if it exists in attached_assets directory
elif [ -f "attached_assets/requirements.txt" ]; then
  pip install -r attached_assets/requirements.txt
else
  # Create a minimal requirements.txt file if it doesn't exist
  echo "requirements.txt not found, creating one..."
  cat > requirements.txt << EOF
Flask>=3.1.0
openpyxl>=3.1.5
pandas>=2.2.3
pdfplumber>=0.11.6
PyPDF2>=3.0.1
requests>=2.32.3
Werkzeug>=3.1.3
gunicorn>=23.0.0
email-validator>=2.0.0
flask-sqlalchemy>=3.1.0
psycopg2-binary>=2.9.9
xlsxwriter>=3.2.1
numpy>=1.26.4
Pillow>=10.2.0
jinja2>=3.1.2
EOF
  pip install -r requirements.txt
fi

# Create a simple script to pre-render the templates
echo "Creating template pre-rendering script..."
cat > prerender.py << EOF
from jinja2 import Environment, FileSystemLoader
import os

# Create Jinja environment
env = Environment(loader=FileSystemLoader(['templates', 'static']))

# Ensure output directory exists
os.makedirs('static', exist_ok=True)

# Common context for all templates
context = {
    'title': 'The PDF Bond - PDF Text & Table Extraction'
}

# List of templates to render
templates = ['index.html', 'benefit-extraction.html', 'api-keys.html', 'results.html', 'layout.html']

# Process each template
for template_name in templates:
    try:
        # Check if template exists in templates folder first
        if os.path.exists(f'templates/{template_name}'):
            template = env.get_template(template_name)
        # If not, check if it exists in static folder with dash instead of underscore
        elif os.path.exists(f'templates/{template_name.replace("-", "_")}'):
            template = env.get_template(template_name.replace("-", "_"))
        # If not in templates, try static folder
        elif os.path.exists(f'static/{template_name}'):
            # Skip if already in static folder
            continue
        else:
            print(f"Warning: Template {template_name} not found, skipping")
            continue
            
        # Skip layout.html as it's not meant to be rendered directly
        if template_name == 'layout.html':
            continue
            
        # Render the template
        output = template.render(**context)
        
        # Write to output file
        with open(f'static/{template_name}', 'w') as f:
            f.write(output)
            
        print(f"Rendered {template_name}")
    except Exception as e:
        print(f"Error rendering {template_name}: {e}")
EOF

# Execute the pre-rendering script
echo "Pre-rendering templates..."
python prerender.py

# Copy static files if needed
echo "Setting up static files..."

# Make sure we have JS files
echo "Setting up JavaScript files..."
if [ ! -f static/js/script.js ]; then
  cp -r static/js/script.js static/js/script.js 2>/dev/null || cp -r attached_assets/script.js static/js/script.js 2>/dev/null || echo "Warning: Could not find script.js"
fi

if [ ! -f static/js/api_keys.js ]; then
  cp -r static/js/api_keys.js static/js/api_keys.js 2>/dev/null || cp -r attached_assets/api_keys.js static/js/api_keys.js 2>/dev/null || echo "Warning: Could not find api_keys.js"
fi

if [ ! -f static/js/benefit_extraction.js ]; then
  cp -r static/js/benefit_extraction.js static/js/benefit_extraction.js 2>/dev/null || cp -r attached_assets/benefit_extraction.js static/js/benefit_extraction.js 2>/dev/null || echo "Warning: Could not find benefit_extraction.js"
fi

# Make sure we have CSS files
echo "Setting up CSS files..."
if [ ! -f static/css/style.css ]; then
  cp -r static/css/style.css static/css/style.css 2>/dev/null || cp -r attached_assets/style.css static/css/style.css 2>/dev/null || echo "Warning: Could not find style.css"
fi

# Prepare Netlify functions
echo "Setting up Netlify functions..."
mkdir -p netlify/functions
if [ ! -f netlify/functions/api.py ]; then
  cp -r attached_assets/api.py netlify/functions/api.py 2>/dev/null || echo "Warning: Could not find api.py"
fi

# Create Netlify function configuration
cat > netlify/functions/api.js << 'EOL'
const { spawn } = require('child_process');
const path = require('path');

exports.handler = async function(event, context) {
  try {
    const script = spawn('python', ['api.py', event.path, event.httpMethod, event.body]);
    let result = '';
    
    script.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    return new Promise((resolve, reject) => {
      script.on('close', (code) => {
        if (code !== 0) {
          return resolve({
            statusCode: 500,
            body: JSON.stringify({ error: 'An error occurred processing the request' })
          });
        }
        
        try {
          const parsedResult = JSON.parse(result);
          resolve({
            statusCode: 200,
            body: JSON.stringify(parsedResult)
          });
        } catch (e) {
          resolve({
            statusCode: 200,
            body: result
          });
        }
      });
    });
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.toString() })
    };
  }
};
EOL

# Create an empty file to ensure directories exist
touch static/img/.gitkeep

# Create basic static HTML files if pre-rendering failed
echo "Ensuring critical HTML files exist..."
if [ ! -f static/index.html ]; then
  cat > static/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The PDF Bond - PDF Text & Table Extraction</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" href="/">The PDF Bond</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link active" href="/">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/benefit-extraction.html">Insurance Benefits</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/api-keys.html">API Keys</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <main class="container mt-4">
        <h1>PDF Text and Table Extraction</h1>
        <p>Upload a PDF document to extract its text content and tables</p>
        
        <div class="drop-area" id="dropArea">
            <i class="fas fa-cloud-upload-alt fa-3x text-primary mb-3"></i>
            <h5>Drag & Drop your PDF file here</h5>
            <p>or</p>
            <div class="mb-3">
                <input type="file" class="form-control" id="pdfFile" accept=".pdf" hidden>
                <button class="btn btn-primary" id="browseButton">Browse Files</button>
            </div>
            <small class="text-muted">Maximum file size: 16MB</small>
        </div>
        
        <div class="mt-4">
            <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="extractTablesCheck" checked>
                <label class="form-check-label" for="extractTablesCheck">
                    Extract tables (if available)
                </label>
            </div>
            
            <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="useAICheck">
                <label class="form-check-label" for="useAICheck">
                    Use AI-powered analysis
                </label>
                <small class="form-text text-muted d-block mt-1">
                    Uses Perplexity API to provide more detailed insights (API key required)
                </small>
            </div>
            
            <div class="text-center mt-4">
                <button class="btn btn-success" id="extractButton" disabled>
                    <i class="fas fa-search me-2"></i> Extract Content
                </button>
            </div>
        </div>
        
        <div class="processing-spinner text-center py-5" id="processingSpinner" style="display:none;">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">Processing...</span>
            </div>
            <p class="mt-3">Processing your PDF document...</p>
            <p class="text-muted small">This may take a moment depending on the size and complexity of the document.</p>
        </div>
        
        <div class="alert alert-danger mt-3" id="errorMessage" style="display: none;">
            <i class="fas fa-exclamation-triangle me-2"></i>
            <span id="errorText"></span>
        </div>
    </main>

    <footer class="footer mt-5 py-3 bg-light">
        <div class="container text-center">
            <span class="text-muted">&copy; 2025 The PDF Bond | Powered by AI & PDF Analysis Tools</span>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script src="/js/script.js"></script>
</body>
</html>
EOF
fi

echo "Netlify deployment setup complete!"
