document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dropArea = document.getElementById('dropArea');
    const pdfFile = document.getElementById('pdfFile');
    const browseButton = document.getElementById('browseButton');
    const uploadButton = document.getElementById('uploadButton');
    const usePerplexity = document.getElementById('usePerplexity');
    const processingSpinner = document.getElementById('processingSpinner');
    const resultSection = document.getElementById('resultSection');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const extractedText = document.getElementById('extractedText');
    const tablesContainer = document.getElementById('tablesContainer');
    const noTablesMessage = document.getElementById('noTablesMessage');
    const metadataTable = document.getElementById('metadataTable');
    const resetButton = document.getElementById('resetButton');
    const downloadTextBtn = document.getElementById('downloadTextBtn');
    const downloadTablesBtn = document.getElementById('downloadTablesBtn');
    const downloadSection = document.getElementById('downloadSection');
    const excelCardContainer = document.getElementById('excelCardContainer');
    const analysisTabItem = document.getElementById('analysisTabItem');
    
    // Event listeners for file upload
    if (browseButton) {
        browseButton.addEventListener('click', () => {
            pdfFile.click();
        });
    }
    
    if (pdfFile) {
        pdfFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                uploadButton.disabled = false;
                dropArea.innerHTML = `
                    <i class="fas fa-file-pdf fa-3x text-info mb-3"></i>
                    <h5>${e.target.files[0].name}</h5>
                    <p class="text-muted">${formatBytes(e.target.files[0].size)}</p>
                `;
            }
        });
    }
    
    // Drag and drop functionality
    if (dropArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });
        
        dropArea.addEventListener('drop', handleDrop, false);
    }
    
    // Upload button
    if (uploadButton) {
        uploadButton.addEventListener('click', () => {
            if (pdfFile.files.length > 0) {
                uploadPDF(pdfFile.files[0]);
            }
        });
    }
    
    // Reset button
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            resetForm();
        });
    }
    
    // Functions
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        dropArea.classList.add('drag-over');
    }
    
    function unhighlight() {
        dropArea.classList.remove('drag-over');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            if (files[0].type === 'application/pdf') {
                pdfFile.files = files;
                uploadButton.disabled = false;
                dropArea.innerHTML = `
                    <i class="fas fa-file-pdf fa-3x text-info mb-3"></i>
                    <h5>${files[0].name}</h5>
                    <p class="text-muted">${formatBytes(files[0].size)}</p>
                `;
            } else {
                showError('Please select a PDF file');
            }
        }
    }
    
    function uploadPDF(file) {
        // Hide error message if visible
        errorMessage.style.display = 'none';
        
        // Show processing spinner
        uploadSection.style.display = 'none';
        processingSpinner.style.display = 'block';
        
        // Prepare form data
        const formData = new FormData();
        formData.append('pdf_file', file);
        formData.append('use_perplexity', usePerplexity.checked);
        
        // Send to server
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            processingSpinner.style.display = 'none';
            
            if (data.success) {
                displayResults(data.result);
            } else {
                showError(data.error || 'An error occurred while processing the PDF');
                uploadSection.style.display = 'block';
            }
        })
        .catch(error => {
            processingSpinner.style.display = 'none';
            showError('Error: ' + error.message);
            uploadSection.style.display = 'block';
        });
    }
    
    function displayResults(result) {
        // Show result section
        resultSection.style.display = 'block';
        
        // Display text
        extractedText.textContent = result.text;
        
        // Display tables
        if (result.tables && result.tables.length > 0) {
            noTablesMessage.style.display = 'none';
            excelCardContainer.style.display = 'block';
            
            // Clear previous tables
            tablesContainer.innerHTML = '';
            
            result.tables.forEach((table, index) => {
                const tableCard = document.createElement('div');
                tableCard.className = 'card mb-4';
                
                const tableHeader = document.createElement('div');
                tableHeader.className = 'card-header';
                tableHeader.innerHTML = `<h6 class="mb-0">Table #${table.table_number} (Page ${table.page})</h6>`;
                
                const tableBody = document.createElement('div');
                tableBody.className = 'card-body';
                
                const tableContainer = document.createElement('div');
                tableContainer.className = 'table-responsive';
                
                const htmlTable = document.createElement('table');
                htmlTable.className = 'table table-striped table-sm';
                
                // Create table header
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                
                if (table.data.length > 0) {
                    table.data[0].forEach(cellText => {
                        const th = document.createElement('th');
                        th.textContent = cellText || '';
                        headerRow.appendChild(th);
                    });
                }
                
                thead.appendChild(headerRow);
                htmlTable.appendChild(thead);
                
                // Create table body
                const tbody = document.createElement('tbody');
                
                for (let i = 1; i < table.data.length; i++) {
                    const row = document.createElement('tr');
                    
                    table.data[i].forEach(cellText => {
                        const td = document.createElement('td');
                        td.textContent = cellText || '';
                        row.appendChild(td);
                    });
                    
                    tbody.appendChild(row);
                }
                
                htmlTable.appendChild(tbody);
                tableContainer.appendChild(htmlTable);
                tableBody.appendChild(tableContainer);
                
                tableCard.appendChild(tableHeader);
                tableCard.appendChild(tableBody);
                
                tablesContainer.appendChild(tableCard);
            });
        } else {
            noTablesMessage.style.display = 'block';
            excelCardContainer.style.display = 'none';
        }
        
        // Display metadata
        metadataTable.innerHTML = '';
        for (const [key, value] of Object.entries(result.metadata)) {
            const row = document.createElement('tr');
            
            const th = document.createElement('th');
            th.textContent = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            const td = document.createElement('td');
            td.textContent = value;
            
            row.appendChild(th);
            row.appendChild(td);
            metadataTable.appendChild(row);
        }
        
        // Setup download links
        if (result.text_file) {
            downloadTextBtn.href = `/download/${result.text_file}`;
            downloadSection.style.display = 'block';
        }
        
        if (result.excel_file) {
            downloadTablesBtn.href = `/download/${result.excel_file}`;
        }
        
        // Setup Perplexity analysis tab if available
        if (result.perplexity_analysis) {
            analysisTabItem.style.display = 'block';
            
            const analysisContent = document.getElementById('analysisContent');
            
            if (result.perplexity_analysis.error) {
                analysisContent.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        ${result.perplexity_analysis.error}
                    </div>
                `;
            } else {
                analysisContent.innerHTML = formatAnalysisContent(result.perplexity_analysis);
            }
        }
    }
    
    function formatAnalysisContent(analysis) {
        let html = `<div class="analysis-content">${analysis.content.replace(/\n/g, '<br>')}</div>`;
        
        // Add citations if available
        if (analysis.citations && analysis.citations.length > 0) {
            html += `<hr><h6>Sources:</h6><ul class="citations-list">`;
            analysis.citations.forEach(citation => {
                html += `<li><a href="${citation}" target="_blank">${citation}</a></li>`;
            });
            html += `</ul>`;
        }
        
        return html;
    }
    
    function resetForm() {
        // Reset the form to initial state
        uploadSection.style.display = 'block';
        resultSection.style.display = 'none';
        errorMessage.style.display = 'none';
        
        // Reset the drop area
        dropArea.innerHTML = `
            <i class="fas fa-cloud-upload-alt fa-3x text-info mb-3"></i>
            <h5>Drag & Drop your PDF file here</h5>
            <p class="text-muted">or</p>
            <div class="mb-3">
                <input type="file" class="form-control" id="pdfFile" accept=".pdf" hidden>
                <button class="btn btn-info" id="browseButton">Browse Files</button>
            </div>
            <small class="text-muted">Maximum file size: 16MB</small>
        `;
        
        // Reset the file input
        pdfFile.value = '';
        uploadButton.disabled = true;
        
        // Reset perplexity checkbox
        usePerplexity.checked = false;
        
        // Re-attach event listener to the new browse button
        document.getElementById('browseButton').addEventListener('click', () => {
            document.getElementById('pdfFile').click();
        });
        
        // Re-attach event listener to the new file input
        document.getElementById('pdfFile').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                uploadButton.disabled = false;
                dropArea.innerHTML = `
                    <i class="fas fa-file-pdf fa-3x text-info mb-3"></i>
                    <h5>${e.target.files[0].name}</h5>
                    <p class="text-muted">${formatBytes(e.target.files[0].size)}</p>
                `;
            }
        });
    }
    
    function showError(message) {
        errorText.textContent = message;
        errorMessage.style.display = 'block';
    }
    
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
});
