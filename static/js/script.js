
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.querySelectorAll('.sidebar-menu .nav-link');
    const sections = document.querySelectorAll('.content-section');
    const fileInput = document.getElementById('fileInput');
    const dropArea = document.getElementById('dropArea');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressBar = uploadProgress.querySelector('.progress-bar');
    const processingStatus = document.getElementById('processingStatus');
    const processingDetails = document.getElementById('processingDetails');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const processDirectoryBtn = document.getElementById('processDirectoryBtn');
    const batchProgress = document.getElementById('batchProgress');
    const batchStatus = document.getElementById('batchStatus');
    const batchResults = document.getElementById('batchResults');
    const batchResultsBody = document.getElementById('batchResultsBody');
    const refreshFilesBtn = document.getElementById('refreshFilesBtn');
    const clearDataBtn = document.getElementById('clearDataBtn');
    const confirmClearBtn = document.getElementById('confirmClearBtn');
    const uploadsTableBody = document.getElementById('uploadsTableBody');
    const outputsTableBody = document.getElementById('outputsTableBody');
    
    // Initialize Bootstrap components
    const clearDataModal = new bootstrap.Modal(document.getElementById('clearDataModal'));
    
    // Mobile sidebar toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.remove('active');
        });
    }
    
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('data-section');
            sections.forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(`${sectionId}-section`).classList.add('active');
            
            // Close mobile sidebar
            if (window.innerWidth < 768) {
                sidebar.classList.remove('active');
            }
        });
    });
    
    // Dark mode toggle
    if (darkModeToggle) {
        // Check for saved dark mode preference
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        }
        
        darkModeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'enabled');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'disabled');
            }
        });
    }
    
    // File Upload Functionality
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                uploadFile(this.files[0]);
            }
        });
    }
    
    // Drag and drop functionality
    if (dropArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            dropArea.classList.add('dragover');
        }
        
        function unhighlight() {
            dropArea.classList.remove('dragover');
        }
        
        dropArea.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                uploadFile(files[0]);
            }
        }
    }
    
    // Upload file function
    function uploadFile(file) {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            alert('Please select a PDF file.');
            return;
        }
        
        const formData = new FormData();
        formData.append('file', file);
        
        // Show upload progress
        uploadProgress.classList.remove('d-none');
        progressBar.style.width = '0%';
        
        // Hide processing status while uploading
        processingStatus.classList.add('d-none');
        
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                const percentComplete = Math.round((e.loaded / e.total) * 100);
                progressBar.style.width = percentComplete + '%';
                progressBar.textContent = percentComplete + '%';
            }
        });
        
        xhr.addEventListener('load', function() {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                
                // Show processing status
                processingStatus.classList.remove('d-none');
                
                let detailsHtml = `
                    <div class="alert alert-success">
                        <h5><i class="bi bi-check-circle"></i> File Processed Successfully</h5>
                        <p><strong>Filename:</strong> ${response.filename}</p>
                        <p><strong>Pages:</strong> ${response.summary.page_count}</p>
                        <p><strong>Tables Found:</strong> ${response.summary.table_count}</p>
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                        <a href="/view-results/${response.results_json}" class="btn btn-primary">
                            <i class="bi bi-eye"></i> View Results
                        </a>
                        <a href="/download/${response.text_file}" class="btn btn-secondary">
                            <i class="bi bi-download"></i> Download Text
                        </a>
                `;
                
                if (response.excel_file) {
                    detailsHtml += `
                        <a href="/download/${response.excel_file}" class="btn btn-success">
                            <i class="bi bi-download"></i> Download Tables
                        </a>
                    `;
                }
                
                detailsHtml += `
                        <a href="/download/${response.results_json}" class="btn btn-info">
                            <i class="bi bi-download"></i> Download JSON
                        </a>
                    </div>
                `;
                
                processingDetails.innerHTML = detailsHtml;
                
                // Refresh the files list
                refreshFiles();
                
            } else {
                let errorMessage = 'An error occurred during processing.';
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.error) {
                        errorMessage = response.error;
                    }
                } catch (e) {}
                
                processingStatus.classList.remove('d-none');
                processingDetails.innerHTML = `
                    <div class="alert alert-danger">
                        <h5><i class="bi bi-x-circle"></i> Processing Failed</h5>
                        <p>${errorMessage}</p>
                    </div>
                `;
            }
            
            // Hide upload progress
            setTimeout(() => {
                uploadProgress.classList.add('d-none');
            }, 1000);
        });
        
        xhr.addEventListener('error', function() {
            processingStatus.classList.remove('d-none');
            processingDetails.innerHTML = `
                <div class="alert alert-danger">
                    <h5><i class="bi bi-x-circle"></i> Upload Failed</h5>
                    <p>A network error occurred. Please try again.</p>
                </div>
            `;
            uploadProgress.classList.add('d-none');
        });
        
        xhr.open('POST', '/upload');
        xhr.send(formData);
    }
    
    // Process directory
    if (processDirectoryBtn) {
        processDirectoryBtn.addEventListener('click', function() {
            // Show batch progress
            batchProgress.classList.remove('d-none');
            batchStatus.innerHTML = '<p>Processing started...</p>';
            batchResults.classList.add('d-none');
            
            // Disable the button
            this.disabled = true;
            
            // Set progress bar animation
            const batchProgressBar = batchProgress.querySelector('.progress-bar');
            batchProgressBar.style.width = '100%';
            
            fetch('/process-directory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ directory: 'attached_assets' })
            })
            .then(response => response.json())
            .then(data => {
                // Enable the button
                processDirectoryBtn.disabled = false;
                
                // Update status
                batchStatus.innerHTML = '<p class="text-success"><i class="bi bi-check-circle"></i> Processing completed</p>';
                
                // Show results
                batchResults.classList.remove('d-none');
                
                // Clear previous results
                batchResultsBody.innerHTML = '';
                
                // Add results to table
                data.results.forEach(result => {
                    const row = document.createElement('tr');
                    
                    if (result.success) {
                        row.innerHTML = `
                            <td>${result.filename}</td>
                            <td><span class="badge bg-success">Success</span></td>
                            <td>${result.page_count}</td>
                            <td>${result.table_count}</td>
                            <td>
                                <div class="btn-group btn-group-sm">
                                    <a href="/view-results/${result.results_json}" class="btn btn-primary">
                                        <i class="bi bi-eye"></i> View
                                    </a>
                                    <button type="button" class="btn btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown">
                                        <span class="visually-hidden">Toggle Dropdown</span>
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li><a class="dropdown-item" href="/download/${result.text_file}"><i class="bi bi-file-text"></i> Download Text</a></li>
                                        ${result.excel_file ? `<li><a class="dropdown-item" href="/download/${result.excel_file}"><i class="bi bi-file-excel"></i> Download Tables</a></li>` : ''}
                                        <li><a class="dropdown-item" href="/download/${result.results_json}"><i class="bi bi-file-code"></i> Download JSON</a></li>
                                    </ul>
                                </div>
                            </td>
                        `;
                    } else {
                        row.innerHTML = `
                            <td>${result.filename}</td>
                            <td><span class="badge bg-danger">Failed</span></td>
                            <td colspan="2">${result.error}</td>
                            <td>-</td>
                        `;
                    }
                    
                    batchResultsBody.appendChild(row);
                });
                
                // Refresh files list
                refreshFiles();
            })
            .catch(error => {
                console.error('Error:', error);
                processDirectoryBtn.disabled = false;
                batchStatus.innerHTML = `<p class="text-danger"><i class="bi bi-x-circle"></i> Error: ${error.message || 'Unknown error'}</p>`;
            });
        });
    }
    
    // File listing
    function refreshFiles() {
        fetch('/list-files')
            .then(response => response.json())
            .then(data => {
                // Update uploads table
                if (data.uploads.length === 0) {
                    uploadsTableBody.innerHTML = '<tr><td colspan="2" class="text-center">No files uploaded</td></tr>';
                } else {
                    uploadsTableBody.innerHTML = '';
                    data.uploads.forEach(filename => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${filename}</td>
                            <td>
                                <button class="btn btn-sm btn-primary file-process-btn" data-filename="${filename}">
                                    <i class="bi bi-gear"></i> Process
                                </button>
                            </td>
                        `;
                        uploadsTableBody.appendChild(row);
                    });
                    
                    // Add event listeners to process buttons
                    document.querySelectorAll('.file-process-btn').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const filename = this.getAttribute('data-filename');
                            // Switch to upload tab
                            document.querySelector('[data-section="upload"]').click();
                            // Implement file processing here
                        });
                    });
                }
                
                // Update outputs table
                if (data.outputs.length === 0) {
                    outputsTableBody.innerHTML = '<tr><td colspan="3" class="text-center">No output files</td></tr>';
                } else {
                    outputsTableBody.innerHTML = '';
                    data.outputs.forEach(filename => {
                        const row = document.createElement('tr');
                        
                        let fileType = 'Unknown';
                        let icon = 'file';
                        
                        if (filename.endsWith('.txt')) {
                            fileType = 'Text';
                            icon = 'file-text';
                        } else if (filename.endsWith('.xlsx')) {
                            fileType = 'Excel';
                            icon = 'file-excel';
                        } else if (filename.endsWith('.json')) {
                            fileType = 'JSON';
                            icon = 'file-code';
                        }
                        
                        let viewButton = '';
                        if (filename.endsWith('_results.json')) {
                            viewButton = `
                                <a href="/view-results/${filename}" class="btn btn-sm btn-primary me-1">
                                    <i class="bi bi-eye"></i> View
                                </a>
                            `;
                        }
                        
                        row.innerHTML = `
                            <td>${filename}</td>
                            <td><i class="bi bi-${icon}"></i> ${fileType}</td>
                            <td>
                                ${viewButton}
                                <a href="/download/${filename}" class="btn btn-sm btn-secondary">
                                    <i class="bi bi-download"></i> Download
                                </a>
                            </td>
                        `;
                        outputsTableBody.appendChild(row);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                uploadsTableBody.innerHTML = '<tr><td colspan="2" class="text-center text-danger">Error loading files</td></tr>';
                outputsTableBody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Error loading files</td></tr>';
            });
    }
    
    // Refresh files button
    if (refreshFilesBtn) {
        refreshFilesBtn.addEventListener('click', function() {
            refreshFiles();
        });
    }
    
    // Clear data functionality
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', function() {
            clearDataModal.show();
        });
    }
    
    if (confirmClearBtn) {
        confirmClearBtn.addEventListener('click', function() {
            fetch('/clear-data', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                clearDataModal.hide();
                if (data.success) {
                    refreshFiles();
                    alert('All data has been cleared successfully.');
                } else {
                    alert('Error: ' + data.error);
                }
            })
            .catch(error => {
                clearDataModal.hide();
                console.error('Error:', error);
                alert('An error occurred while clearing data.');
            });
        });
    }
    
    // Initial page load
    refreshFiles();
});
