document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('benefit-upload-form');
    const fileInput = document.getElementById('benefit-files');
    const resultSection = document.getElementById('benefit-result-section');
    const resultsContainer = document.getElementById('benefit-results-container');
    const downloadContainer = document.getElementById('benefit-download-container');
    const downloadLink = document.getElementById('benefit-download-link');
    
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!fileInput.files || fileInput.files.length === 0) {
                alert('Please select at least one PDF file.');
                return;
            }
            
            // Show loading indicator
            resultsContainer.innerHTML = `
                <div class="text-center p-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <h5 class="mt-3">Processing PDFs...</h5>
                    <p>This may take a few moments depending on the number and size of files.</p>
                </div>
            `;
            resultSection.style.display = 'block';
            downloadContainer.style.display = 'none';
            
            // Create form data
            const formData = new FormData();
            for (let i = 0; i < fileInput.files.length; i++) {
                formData.append('files[]', fileInput.files[i]);
            }
            
            // Send request
            fetch('/extract-benefits', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    resultsContainer.innerHTML = `
                        <div class="alert alert-success">
                            <h4>Success!</h4>
                            <p>${data.message}</p>
                        </div>
                    `;
                    
                    // Set download link
                    downloadLink.href = data.download_url;
                    downloadContainer.style.display = 'block';
                } else {
                    resultsContainer.innerHTML = `
                        <div class="alert alert-danger">
                            <h4>Error</h4>
                            <p>${data.error}</p>
                        </div>
                    `;
                }
            })
            .catch(error => {
                resultsContainer.innerHTML = `
                    <div class="alert alert-danger">
                        <h4>Error</h4>
                        <p>An error occurred during processing: ${error.message}</p>
                    </div>
                `;
            });
        });
    }
    
    // File input change handler to show selected files
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const selectedFilesContainer = document.getElementById('selected-files');
            if (!selectedFilesContainer) return;
            
            if (this.files.length > 0) {
                let fileListHTML = '<ul class="list-group mt-2">';
                for (let i = 0; i < this.files.length; i++) {
                    fileListHTML += `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <span><i class="bi bi-file-earmark-pdf"></i> ${this.files[i].name}</span>
                            <span class="badge bg-primary rounded-pill">${formatFileSize(this.files[i].size)}</span>
                        </li>
                    `;
                }
                fileListHTML += '</ul>';
                
                selectedFilesContainer.innerHTML = `
                    <div class="mt-3">
                        <h6>Selected Files (${this.files.length})</h6>
                        ${fileListHTML}
                    </div>
                `;
            } else {
                selectedFilesContainer.innerHTML = '';
            }
        });
    }
    
    // Helper function to format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});
