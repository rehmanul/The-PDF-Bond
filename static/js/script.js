document.addEventListener('DOMContentLoaded', function() {
    const dropArea = document.getElementById('dropArea');
    const pdfFileInput = document.getElementById('pdfFile');
    const browseButton = document.getElementById('browseButton');
    const extractButton = document.getElementById('extractButton');
    const processingSpinner = document.getElementById('processingSpinner');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    // Setup file drag & drop
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
        dropArea.classList.add('drag-over');
    }

    function unhighlight() {
        dropArea.classList.remove('drag-over');
    }

    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0 && files[0].type === 'application/pdf') {
            pdfFileInput.files = files;
            extractButton.disabled = false;
            // Update UI to show selected file
            dropArea.innerHTML = `
                <i class="fas fa-file-pdf fa-3x text-danger mb-3"></i>
                <h5>${files[0].name}</h5>
                <p class="text-muted">PDF file selected</p>
                <button class="btn btn-outline-secondary btn-sm mt-2" id="changeFileBtn">
                    <i class="fas fa-exchange-alt me-1"></i> Change File
                </button>
            `;
            document.getElementById('changeFileBtn').addEventListener('click', resetFileSelection);
        } else {
            showError("Please select a valid PDF file.");
        }
    }

    // Handle browse button
    browseButton.addEventListener('click', function() {
        pdfFileInput.click();
    });

    pdfFileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            if (this.files[0].type === 'application/pdf') {
                extractButton.disabled = false;
                // Update UI to show selected file
                dropArea.innerHTML = `
                    <i class="fas fa-file-pdf fa-3x text-danger mb-3"></i>
                    <h5>${this.files[0].name}</h5>
                    <p class="text-muted">PDF file selected</p>
                    <button class="btn btn-outline-secondary btn-sm mt-2" id="changeFileBtn">
                        <i class="fas fa-exchange-alt me-1"></i> Change File
                    </button>
                `;
                document.getElementById('changeFileBtn').addEventListener('click', resetFileSelection);
            } else {
                this.value = '';
                showError("Please select a valid PDF file.");
            }
        }
    });

    function resetFileSelection() {
        pdfFileInput.value = '';
        extractButton.disabled = true;
        // Reset drop area
        dropArea.innerHTML = `
            <i class="fas fa-cloud-upload-alt fa-3x text-primary mb-3"></i>
            <h5>Drag & Drop your PDF file here</h5>
            <p>or</p>
            <div class="mb-3">
                <input type="file" class="form-control" id="pdfFile" accept=".pdf" hidden>
                <button class="btn btn-primary" id="browseButton">Browse Files</button>
            </div>
            <small class="text-muted">Maximum file size: 16MB</small>
        `;
        document.getElementById('browseButton').addEventListener('click', function() {
            document.getElementById('pdfFile').click();
        });
    }

    // Extract button click handler
    extractButton.addEventListener('click', function() {
        document.getElementById('dropArea').style.display = 'none';
        document.getElementById('extractButton').style.display = 'none';
        document.querySelectorAll('.form-check').forEach(el => el.style.display = 'none');
        processingSpinner.style.display = 'block';
        errorMessage.style.display = 'none';

        // In a real implementation, this would send the file to the server
        // Here we're simulating the process with a timeout
        setTimeout(function() {
            processingSpinner.style.display = 'none';

            // Redirect to results page
            window.location.href = '/results.html';
        }, 3000);
    });

    // Error display function
    function showError(message) {
        errorText.innerText = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
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