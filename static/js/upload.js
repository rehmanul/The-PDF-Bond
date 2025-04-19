document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('upload-form');
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('pdf-file');
    const uploadStatus = document.getElementById('upload-status');
    const uploadProgress = document.getElementById('upload-progress');
    const progressBar = document.getElementById('progress-bar');
    const perplexityCheckbox = document.getElementById('use-perplexity');
    
    if (uploadArea && fileInput) {
        // File drag & drop functionality
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            uploadArea.classList.add('dragover');
        }
        
        function unhighlight() {
            uploadArea.classList.remove('dragover');
        }
        
        uploadArea.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                fileInput.files = files;
                updateFileName();
            }
        }
        
        // Update file name display when a file is selected
        fileInput.addEventListener('change', updateFileName);
        
        function updateFileName() {
            const fileName = fileInput.files[0] ? fileInput.files[0].name : 'No file chosen';
            const fileNameDisplay = document.getElementById('file-name');
            
            if (fileNameDisplay) {
                fileNameDisplay.textContent = fileName;
            }
        }
        
        // Handle form submission
        if (uploadForm) {
            uploadForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                if (!fileInput.files[0]) {
                    showAlert(uploadStatus, 'Please select a PDF file to upload.', 'warning');
                    return;
                }
                
                const file = fileInput.files[0];
                if (file.type !== 'application/pdf') {
                    showAlert(uploadStatus, 'Please upload a PDF file.', 'warning');
                    return;
                }
                
                // Show progress bar
                uploadProgress.style.display = 'block';
                progressBar.style.width = '0%';
                progressBar.setAttribute('aria-valuenow', 0);
                progressBar.textContent = '0%';
                
                // Create form data
                const formData = new FormData();
                formData.append('pdf_file', file);
                
                // Add perplexity option if checkbox exists
                if (perplexityCheckbox) {
                    formData.append('use_perplexity', perplexityCheckbox.checked);
                }
                
                // Create and configure AJAX request
                const xhr = new XMLHttpRequest();
                
                xhr.open('POST', '/upload', true);
                
                xhr.upload.onprogress = function(e) {
                    if (e.lengthComputable) {
                        const percentComplete = Math.round((e.loaded / e.total) * 100);
                        progressBar.style.width = percentComplete + '%';
                        progressBar.setAttribute('aria-valuenow', percentComplete);
                        progressBar.textContent = percentComplete + '%';
                    }
                };
                
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            
                            if (response.success) {
                                if (response.redirect) {
                                    window.location.href = response.redirect;
                                } else {
                                    showAlert(uploadStatus, 'PDF processed successfully!', 'success');
                                }
                            } else {
                                showAlert(uploadStatus, 'Error: ' + response.error, 'danger');
                            }
                        } catch (e) {
                            showAlert(uploadStatus, 'Error parsing response.', 'danger');
                        }
                    } else {
                        showAlert(uploadStatus, 'Error uploading file. Status: ' + xhr.status, 'danger');
                    }
                    
                    // Hide progress after completed
                    setTimeout(() => {
                        uploadProgress.style.display = 'none';
                    }, 2000);
                };
                
                xhr.onerror = function() {
                    showAlert(uploadStatus, 'Network error occurred during upload.', 'danger');
                    uploadProgress.style.display = 'none';
                };
                
                // Send the form data
                xhr.send(formData);
                
                // Show processing message
                showAlert(uploadStatus, 'Uploading and processing PDF...', 'info');
            });
        }
    }
    
    // Helper function to show alerts
    function showAlert(container, message, type) {
        container.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        // Scroll to alert
        container.scrollIntoView({ behavior: 'smooth' });
    }
});
