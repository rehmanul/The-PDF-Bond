# The PDF Bond

A production-ready Flask-based web application for extracting, analyzing, and processing information from PDF documents, with specialized features for insurance benefit extraction.

## Features

- **PDF Text Extraction**: Extract text content from PDF files using both PyPDF2 and pdfplumber
- **Table Extraction**: Identify and extract tabular data from PDFs
- **Benefit Extraction**: Specialized extraction of insurance benefit information like deductibles, copays, etc.
- **AI Analysis**: Integration with Perplexity AI for enhanced document analysis
- **Excel Export**: Export extracted data to Excel for further processing
- **Responsive UI**: Clean, Bootstrap-based user interface

## Tech Stack

- **Backend**: Python with Flask
- **PDF Processing**: PyPDF2, pdfplumber
- **Data Processing**: pandas
- **Frontend**: HTML, CSS, JavaScript with Bootstrap
- **AI Integration**: Perplexity API

## Getting Started

1. Clone the repository
2. Install dependencies with `pip install -r requirements.txt`
3. Run the application with `python main.py`
4. Open your browser to `http://localhost:5000`

## API Key Management

For AI-powered analysis, you'll need a Perplexity API key. Add it in the API Keys section of the application.

## Deployment

This application can be deployed on Netlify using the included netlify.toml configuration.
For detailed deployment instructions, see the [NETLIFY.md](NETLIFY.md) file.

## License

MIT