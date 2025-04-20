
# The PDF Bond

![The PDF Bond](generated-icon.png)

## Overview

The PDF Bond is a powerful web application designed to extract, analyze, and process information from PDF documents. It specializes in extracting text, tables, and insurance benefit information from PDF files, providing a streamlined solution for document analysis.

## Features

- **PDF Text Extraction**: Extract all text content from PDF files using a combination of PyPDF2 and pdfplumber
- **Table Extraction**: Identify and extract tabular data from PDFs with formatting preserved
- **Insurance Benefit Extraction**: Specialized extraction of insurance benefit information including:
  - Deductibles (individual/family, in/out-of-network)
  - Out-of-pocket maximums
  - Coinsurance percentages
  - Office visit copays
  - Prescription coverage
  - And more
- **AI-Powered Analysis**: Integration with Perplexity AI for enhanced document understanding and insights
- **Excel Export**: Export extracted data to Excel for further processing and analysis
- **Mass Upload Formatting**: Special formatting for bulk processing of insurance documents
- **Responsive UI**: Clean, Bootstrap-based user interface that works on all devices

## Tech Stack

- **Backend**: Python with Flask
- **PDF Processing**: PyPDF2, pdfplumber
- **Data Processing**: pandas, openpyxl, xlsxwriter
- **Frontend**: HTML, CSS, JavaScript with Bootstrap 5
- **AI Integration**: Perplexity API

## Getting Started

### Prerequisites

- Python 3.11 or higher
- pip (Python package manager)

### Installation

1. Clone the repository or download the source code
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the application:

```bash
python main.py
```

4. Open your browser to `http://localhost:5000`

## Usage Guide

### Basic PDF Extraction

1. Navigate to the home page
2. Drag and drop your PDF file or click "Browse Files" to select a file
3. Optional: Check "Use AI-powered analysis" to enable Perplexity analysis (requires API key)
4. Click "Extract Content"
5. View the extracted text, tables, and analysis on the results page
6. Download content as text file or Excel spreadsheet

### Insurance Benefit Extraction

1. Navigate to the "Insurance Benefits" page
2. Upload your insurance PDF document
3. Optional: Upload a template file for customized output
4. Optional: Enable mass upload formatting for bulk processing
5. Click "Extract Benefits"
6. View the extracted benefit information
7. Download the data as an Excel file

### API Key Management

1. Navigate to the "API Keys" page
2. Add your Perplexity API key for enhanced AI analysis
3. Manage and delete existing API keys

## Deployment

### Local Development

Run the application locally using:

```bash
python main.py
```

The application will be available at `http://localhost:5000`

### Netlify Deployment

The application is configured for deployment on Netlify:

1. Ensure you have a `netlify.toml` file (included in the repository)
2. Make sure `requirements.txt` is up to date
3. Push your code to GitHub
4. Connect your repository to Netlify
5. Configure the build settings:
   - Build command: `pip install -r requirements.txt`
   - Publish directory: `static`
6. Set required environment variables:
   - `PERPLEXITY_API_KEY` (optional, for AI analysis)
   - `SESSION_SECRET` (for session management)

## Project Structure

```
├── main.py                   # Main application entry point
├── requirements.txt          # Python dependencies
├── netlify.toml              # Netlify configuration
├── netlify.sh                # Netlify deployment script
├── static/                   # Static assets (HTML, CSS, JS)
│   ├── css/                  # CSS stylesheets
│   ├── js/                   # JavaScript files
│   ├── index.html            # Main page
│   ├── benefit-extraction.html # Benefit extraction page
│   ├── api-keys.html         # API keys management page
│   └── results.html          # Results display page
├── templates/                # Flask templates
├── utils/                    # Utility modules
│   ├── api_keys.py           # API key management
│   ├── benefit_extractor.py  # Insurance benefit extraction
│   ├── mass_upload_formatter.py # Mass upload formatting
│   ├── pdf_processor.py      # PDF processing utilities
│   └── perplexity_api.py     # Perplexity API integration
├── uploads/                  # Directory for uploaded files
└── downloads/                # Directory for generated files
```

## API Integration

### Perplexity AI

The PDF Bond integrates with Perplexity AI to provide advanced document analysis:

1. Obtain a Perplexity API key from [their website](https://www.perplexity.ai/)
2. Add the API key in the "API Keys" section of the application
3. Enable AI analysis when processing PDFs

## Troubleshooting

### Common Issues

- **File Upload Errors**: Ensure your PDF file is valid and under 16MB
- **Extraction Errors**: Some complex PDF structures may not extract perfectly; try different extraction options
- **Deployment Issues**: Check Netlify logs for deployment errors

### Support

For support, please open an issue in the GitHub repository.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [PyPDF2](https://github.com/py-pdf/PyPDF2) for PDF processing
- [pdfplumber](https://github.com/jsvine/pdfplumber) for advanced PDF extraction
- [Flask](https://flask.palletsprojects.com/) for the web framework
- [Bootstrap](https://getbootstrap.com/) for the UI components
- [Perplexity AI](https://www.perplexity.ai/) for AI-powered document analysis
