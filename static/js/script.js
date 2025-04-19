document.addEventListener('DOMContentLoaded', function() {
    // Toggle drawer menu if it exists
    const menuToggle = document.querySelector('.menu-toggle');
    const drawer = document.querySelector('.drawer');

    if (menuToggle && drawer) {
        menuToggle.addEventListener('click', function() {
            drawer.classList.toggle('open');
        });

        // Close drawer when clicking outside
        document.addEventListener('click', function(event) {
            if (!drawer.contains(event.target) && !menuToggle.contains(event.target)) {
                drawer.classList.remove('open');
            }
        });
    }

    // File upload previews
    const fileInputs = document.querySelectorAll('input[type="file"]');

    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            const fileList = this.files;
            const container = document.querySelector('#selected-files') || document.createElement('div');

            if (fileList.length > 0) {
                let fileHTML = '<div class="selected-files-list mt-3">';
                for (let i = 0; i < fileList.length; i++) {
                    fileHTML += `<div class="selected-file">
                        <i class="bi bi-file-earmark-pdf"></i> ${fileList[i].name}
                    </div>`;
                }
                fileHTML += '</div>';

                if (container) {
                    container.innerHTML = fileHTML;
                }
            }
        });
    });

    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.querySelectorAll('.sidebar-menu .nav-link');
    const sections = document.querySelectorAll('.content-section');
    const fileInput = document.getElementById('fileInput');
    const dropArea = document.getElementById('dropArea');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressBar = uploadProgress ? uploadProgress.querySelector('.progress-bar') : null;
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
    const usePerplexity = document.getElementById('usePerplexity');
    const perplexityApiSection = document.getElementById('perplexityApiSection');
    const uploadForm = document.getElementById('uploadForm');
    const results = document.getElementById('results');
    const resultContent = document.getElementById('resultContent');

    // Initialize Bootstrap components
    const clearDataModal = document.getElementById('clearDataModal') ? new bootstrap.Modal(document.getElementById('clearDataModal')) : null;

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
    if (navLinks) {
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
    }

    // Dark mode toggle
    if (darkModeToggle) {
        // Check for saved dark mode preference
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        }

        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('darkMode', 'enabled');
                this.innerHTML = '<i class="bi bi-sun"></i> Light Mode';
            } else {
                localStorage.setItem('darkMode', 'disabled');
                this.innerHTML = '<i class="bi bi-moon"></i> Dark Mode';
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
        if (!file || !file.name || !file.name.toLowerCase().endsWith('.pdf')) {
            alert('Please select a PDF file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        // Add Perplexity API info if enabled
        if (usePerplexity && usePerplexity.checked) {
            formData.append('use_perplexity', 'true');

            const perplexityApiKey = document.getElementById('perplexityApiKey');
            const saveApiKey = document.getElementById('saveApiKey');
            const useSavedKey = document.getElementById('useSavedKey');

            if (perplexityApiKey && perplexityApiKey.value) {
                formData.append('perplexity_api_key', perplexityApiKey.value);
            }

            if (saveApiKey && saveApiKey.checked) {
                formData.append('save_key', 'true');
            }

            if (useSavedKey && useSavedKey.checked) {
                formData.append('use_saved_key', 'true');
            }
        }

        // Show upload progress
        if (uploadProgress) {
            uploadProgress.classList.remove('d-none');
            progressBar.style.width = '0%';
        }

        // Hide processing status while uploading
        if (processingStatus) {
            processingStatus.classList.add('d-none');
        }

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable && progressBar) {
                const percentComplete = Math.round((e.loaded / e.total) * 100);
                progressBar.style.width = percentComplete + '%';
                progressBar.textContent = percentComplete + '%';
            }
        });

        xhr.addEventListener('load', function() {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);

                // Show processing status
                if (processingStatus) {
                    processingStatus.classList.remove('d-none');
                }

                if (processingDetails) {
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
                }

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

                if (processingStatus) {
                    processingStatus.classList.remove('d-none');
                }

                if (processingDetails) {
                    processingDetails.innerHTML = `
                        <div class="alert alert-danger">
                            <h5><i class="bi bi-x-circle"></i> Processing Failed</h5>
                            <p>${errorMessage}</p>
                        </div>
                    `;
                }
            }

            // Hide upload progress
            setTimeout(() => {
                if (uploadProgress) {
                    uploadProgress.classList.add('d-none');
                }
            }, 1000);
        });

        xhr.addEventListener('error', function() {
            const processingStatus = document.getElementById('processingStatus');
            const processingDetails = document.getElementById('processingDetails');
            const uploadProgress = document.getElementById('uploadProgress');

            if (processingStatus) {
                processingStatus.classList.remove('d-none');
            }

            if (processingDetails) {
                processingDetails.innerHTML = `
                    <div class="alert alert-danger">
                        <h5><i class="bi bi-x-circle"></i> Upload Failed</h5>
                        <p>A network error occurred. Please try again.</p>
                    </div>
                `;
            }

            if (uploadProgress) {
                uploadProgress.classList.add('d-none');
            }
        });

        xhr.open('POST', '/upload');
        xhr.send(formData);
    }

    // Process directory
    if (processDirectoryBtn) {
        processDirectoryBtn.addEventListener('click', function() {
            // Show batch progress
            if (batchProgress) {
                batchProgress.classList.remove('d-none');
            }

            if (batchStatus) {
                batchStatus.innerHTML = '<p>Processing started...</p>';
            }

            if (batchResults) {
                batchResults.classList.add('d-none');
            }

            // Disable the button
            this.disabled = true;

            // Set progress bar animation
            const batchProgressBar = batchProgress ? batchProgress.querySelector('.progress-bar') : null;
            if (batchProgressBar) {
                batchProgressBar.style.width = '100%';
            }

            // Add Perplexity API info if enabled
            let requestBody = { directory: 'attached_assets' };

            if (usePerplexity && usePerplexity.checked) {
                requestBody.use_perplexity = true;

                const perplexityApiKey = document.getElementById('perplexityApiKey');
                if (perplexityApiKey && perplexityApiKey.value) {
                    requestBody.perplexity_api_key = perplexityApiKey.value;
                }
            }

            fetch('/process-directory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            })
            .then(response => response.json())
            .then(data => {
                // Enable the button
                processDirectoryBtn.disabled = false;

                // Update status
                if (batchStatus) {
                    batchStatus.innerHTML = '<p class="text-success"><i class="bi bi-check-circle"></i> Processing completed</p>';
                }

                // Show results
                if (batchResults) {
                    batchResults.classList.remove('d-none');
                }

                // Clear previous results
                if (batchResultsBody) {
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
                }

                // Refresh files list
                refreshFiles();
            })
            .catch(error => {
                console.error('Error:', error);
                processDirectoryBtn.disabled = false;
                if (batchStatus) {
                    batchStatus.innerHTML = `<p class="text-danger"><i class="bi bi-x-circle"></i> Error: ${error.message || 'Unknown error'}</p>`;
                }
            });
        });
    }

    // File listing
    function refreshFiles() {
        fetch('/.netlify/functions/api/list-files')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Handle missing data object
                if (!data) {
                    console.error("Empty response data from list-files endpoint");
                    data = { uploads: [], outputs: [] };
                }
                
                // Update uploads table
                if (uploadsTableBody) {
                    if (!data.uploads || !Array.isArray(data.uploads) || data.uploads.length === 0) {
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
                                const uploadTab = document.querySelector('[data-section="upload"]');
                                if (uploadTab) {
                                    uploadTab.click();
                                }
                                // Implement file processing here
                            });
                        });
                    }
                }

                // Update outputs table
                if (outputsTableBody) {
                    if (!data.outputs || data.outputs.length === 0) {
                        outputsTableBody.innerHTML = '<tr><td colspan="3" class="text-center">No output files</td></tr>';
                    } else {
                        outputsTableBody.innerHTML = '';
                        if (Array.isArray(data.outputs)) {
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
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                if (uploadsTableBody) {
                    uploadsTableBody.innerHTML = '<tr><td colspan="2" class="text-center text-danger">Error loading files</td></tr>';
                }
                if (outputsTableBody) {
                    outputsTableBody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Error loading files</td></tr>';
                }
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
            if (clearDataModal) {
                clearDataModal.show();
            }
        });
    }

    if (confirmClearBtn) {
        confirmClearBtn.addEventListener('click', function() {
            fetch('/clear-data', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (clearDataModal) {
                    clearDataModal.hide();
                }
                if (data.success) {
                    refreshFiles();
                    alert('All data has been cleared successfully.');
                } else {
                    alert('Error: ' + data.error);
                }
            })
            .catch(error => {
                if (clearDataModal) {
                    clearDataModal.hide();
                }
                console.error('Error:', error);
                alert('An error occurred while clearing data.');
            });
        });
    }

    // ZIP download functionality
    const createZipBtn = document.getElementById('createZipBtn');
    if (createZipBtn) {
        createZipBtn.addEventListener('click', function() {
            // Get selected file types
            const fileTypes = [];
            if (document.getElementById('includeText').checked) fileTypes.push('text');
            if (document.getElementById('includeJson').checked) fileTypes.push('json');
            if (document.getElementById('includeExcel').checked) fileTypes.push('excel');

            if (fileTypes.length === 0) {
                alert('Please select at least one file type to include in the ZIP');
                return;
            }

            // Disable button and show loading state
            createZipBtn.disabled = true;
            createZipBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Creating ZIP...';

            // Create and download the ZIP file
            fetch('/create-zip', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ file_types: fileTypes })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Failed to create ZIP file');
                    });
                }
                return response.blob();
            })
            .then(blob => {
                // Create a link to download the blob
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'pdf_extraction.zip';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);

                // Reset button state
                createZipBtn.disabled = false;
                createZipBtn.innerHTML = '<i class="bi bi-download"></i> Download ZIP';
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error creating ZIP: ' + error.message);

                // Reset button state
                createZipBtn.disabled = false;
                createZipBtn.innerHTML = '<i class="bi bi-download"></i> Download ZIP';
            });
        });
    }

    // Initial page load
    refreshFiles();

    // Perplexity API toggle
    if (usePerplexity && perplexityApiSection) {
        usePerplexity.addEventListener('change', function() {
            if (this.checked) {
                perplexityApiSection.style.display = 'block';
            } else {
                perplexityApiSection.style.display = 'none';
            }
        });
    }

    // API key management
    const loadSavedKeyBtn = document.getElementById('loadSavedKeyBtn');
    const saveApiKey = document.getElementById('saveApiKey');
    const useSavedKey = document.getElementById('useSavedKey');
    const perplexityApiKey = document.getElementById('perplexityApiKey');
    const togglePwdVisibility = document.getElementById('togglePwdVisibility');

    // Toggle password visibility
    if (togglePwdVisibility && perplexityApiKey) {
        togglePwdVisibility.addEventListener('click', function() {
            if (perplexityApiKey.type === 'password') {
                perplexityApiKey.type = 'text';
                togglePwdVisibility.innerHTML = '<i class="bi bi-eye-slash"></i>';
            } else {
                perplexityApiKey.type = 'password';
                togglePwdVisibility.innerHTML = '<i class="bi bi-eye"></i>';
            }
        });
    }

    // Load saved API key
    if (loadSavedKeyBtn) {
        loadSavedKeyBtn.addEventListener('click', function() {
            fetch('/api-keys')
                .then(response => response.json())
                .then(data => {
                    if (data.perplexity) {
                        perplexityApiKey.value = data.perplexity;
                        if (useSavedKey) {
                            useSavedKey.checked = true;
                        }
                    } else {
                        alert('No saved Perplexity API key found');
                    }
                })
                .catch(error => {
                    console.error('Error loading API key:', error);
                    alert('Error loading API key');
                });
        });
    }

    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(uploadForm);
            const submitButton = uploadForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

            fetch('/.netlify/functions/api/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Extract Data';

                if (data.success) {
                    displayResults(data.result);
                } else {
                    showError(data.error);
                }
            })
            .catch(error => {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Extract Data';
                showError('Error processing request: ' + error);
            });
        });
    }

    function displayResults(result) {
        results.style.display = 'block';

        let html = `<div class="card mb-4">
            <div class="card-header">
                <h3 class="card-title">Document Overview</h3>
            </div>
            <div class="card-body">
                <p><strong>Filename:</strong> ${result.filename}</p>
                <p><strong>Pages:</strong> ${result.pages}</p>
                <p><strong>Text Length:</strong> ${result.text_length} characters</p>
            </div>
        </div>`;

        if (result.text_file) {
            html += `<div class="mb-3">
                <a href="/.netlify/functions/api/download/${result.text_file}" class="btn btn-success">
                    <i class="bi bi-download"></i> Download Extracted Text
                </a>
            </div>`;
        }

        if (result.excel_file) {
            html += `<div class="mb-3">
                <a href="/.netlify/functions/api/download/${result.excel_file}" class="btn btn-success">
                    <i class="bi bi-download"></i> Download Tables (Excel)
                </a>
            </div>`;
        }

        if (result.perplexity_analysis) {
            html += `<div class="card mb-4">
                <div class="card-header">
                    <h3 class="card-title">AI Analysis</h3>
                </div>
                <div class="card-body">
                    <pre class="p-3 bg-light">${JSON.stringify(result.perplexity_analysis, null, 2)}</pre>
                </div>
            </div>`;
        }

        resultContent.innerHTML = html;
        window.scrollTo(0, results.offsetTop);
    }

    function showError(message) {
        results.style.display = 'block';
        resultContent.innerHTML = `<div class="alert alert-danger">${message}</div>`;
    }

    // Add Bootstrap tooltips if Bootstrap is loaded
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
});