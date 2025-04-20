document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dropArea = document.getElementById('dropArea');
    const pdfFile = document.getElementById('pdfFile');
    const templateFile = document.getElementById('templateFile');
    const useMassFormatCheck = document.getElementById('useMassFormatCheck');
    const useAIFormatCheck = document.getElementById('useAIFormatCheck');
    const browseButton = document.getElementById('browseButton');
    const extractButton = document.getElementById('extractButton');
    const processingSpinner = document.getElementById('processingSpinner');
    const resultSection = document.getElementById('resultSection');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const resetButton = document.getElementById('resetButton');
    const downloadExcelBtn = document.getElementById('downloadExcelBtn');
    
    // Benefit display elements
    const carrierName = document.getElementById('carrierName');
    const planName = document.getElementById('planName');
    const individualDeductible = document.getElementById('individualDeductible');
    const familyDeductible = document.getElementById('familyDeductible');
    const oonIndividualDeductible = document.getElementById('oonIndividualDeductible');
    const oonFamilyDeductible = document.getElementById('oonFamilyDeductible');
    const individualOOP = document.getElementById('individualOOP');
    const familyOOP = document.getElementById('familyOOP');
    const oonIndividualOOP = document.getElementById('oonIndividualOOP');
    const oonFamilyOOP = document.getElementById('oonFamilyOOP');
    const coinsurance = document.getElementById('coinsurance');
    const primaryCare = document.getElementById('primaryCare');
    const specialist = document.getElementById('specialist');
    const urgentCare = document.getElementById('urgentCare');
    const emergencyRoom = document.getElementById('emergencyRoom');
    const hospitalization = document.getElementById('hospitalization');
    
    // Event listeners for file upload
    if (browseButton) {
        browseButton.addEventListener('click', () => {
            pdfFile.click();
        });
    }
    
    if (pdfFile) {
        pdfFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                extractButton.disabled = false;
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
    
    // Extract button
    if (extractButton) {
        extractButton.addEventListener('click', () => {
            if (pdfFile.files.length > 0) {
                extractBenefits(pdfFile.files[0]);
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
                extractButton.disabled = false;
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
    
    function extractBenefits(file) {
        // Hide error message if visible
        errorMessage.style.display = 'none';
        
        // Show processing spinner
        document.getElementById('uploadSection').style.display = 'none';
        processingSpinner.style.display = 'block';
        
        // Prepare form data
        const formData = new FormData();
        formData.append('pdf_file', file);
        
        // Add the template file if provided
        if (templateFile && templateFile.files.length > 0) {
            formData.append('template_file', templateFile.files[0]);
        }
        
        // Add the mass upload format option
        formData.append('use_mass_format', useMassFormatCheck.checked);
        
        // Determine which endpoint to use based on the AI checkbox
        const endpoint = useAIFormatCheck.checked ? '/extract-benefits-ai' : '/extract-benefits';
        
        // Update processing text
        if (useAIFormatCheck.checked) {
            document.querySelector('#processingSpinner p').textContent = 'Performing AI-powered extraction...';
            document.querySelector('#processingSpinner p.text-muted').textContent = 
                'Using advanced AI to extract detailed benefit information. This may take a bit longer.';
        }
        
        // Send to server
        fetch(endpoint, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            processingSpinner.style.display = 'none';
            
            if (data.success) {
                displayResults(data.result, data.excel_file);
                
                // Add information about the extraction method used
                let methodMessage = '';
                if (data.extraction_method === 'perplexity_ai') {
                    methodMessage = 'Benefits were extracted using advanced AI technology with formatting for mass upload templates.';
                } else if (data.format === 'mass_upload_template') {
                    methodMessage = 'Benefits were extracted and formatted for mass upload templates.';
                }
                
                if (methodMessage) {
                    // Create an info alert
                    const infoAlert = document.createElement('div');
                    infoAlert.className = 'alert alert-info mt-3';
                    infoAlert.innerHTML = `<i class="fas fa-info-circle me-2"></i> ${methodMessage}`;
                    
                    // Insert it after the success alert
                    const successAlert = resultSection.querySelector('.alert-success');
                    successAlert.parentNode.insertBefore(infoAlert, successAlert.nextSibling);
                }
                
                // Show warning if there was a fallback to simplified extraction
                if (data.warning) {
                    showWarning(data.warning);
                }
            } else {
                showError(data.error || 'An error occurred while extracting benefits');
                document.getElementById('uploadSection').style.display = 'block';
            }
        })
        .catch(error => {
            processingSpinner.style.display = 'none';
            showError('Error: ' + error.message);
            document.getElementById('uploadSection').style.display = 'block';
        });
    }
    
    function displayResults(result, excelFile) {
        // Show result section
        resultSection.style.display = 'block';
        
        // Display plan information
        carrierName.textContent = result.carrier_name || 'Unknown';
        planName.textContent = result.plan_name || 'Unknown';
        
        // Display deductible information
        individualDeductible.textContent = result.deductible?.individual_in_network || 'Not found';
        familyDeductible.textContent = result.deductible?.family_in_network || 'Not found';
        oonIndividualDeductible.textContent = result.deductible?.individual_out_network || 'Not found';
        oonFamilyDeductible.textContent = result.deductible?.family_out_network || 'Not found';
        
        // Display out-of-pocket information
        individualOOP.textContent = result.out_of_pocket?.individual_in_network || 'Not found';
        familyOOP.textContent = result.out_of_pocket?.family_in_network || 'Not found';
        oonIndividualOOP.textContent = result.out_of_pocket?.individual_out_network || 'Not found';
        oonFamilyOOP.textContent = result.out_of_pocket?.family_out_network || 'Not found';
        
        // Display other benefits
        coinsurance.textContent = result.coinsurance?.in_network || 'Not found';
        primaryCare.textContent = result.office_visits?.primary_care || 'Not found';
        specialist.textContent = result.office_visits?.specialist || 'Not found';
        urgentCare.textContent = result.office_visits?.urgent_care || 'Not found';
        emergencyRoom.textContent = result.emergency_room || 'Not found';
        hospitalization.textContent = result.hospitalization || 'Not found';
        
        // Setup download link
        if (excelFile) {
            downloadExcelBtn.href = `/download/${excelFile}`;
        }
        
        // Add color classes based on the value type
        colorizeValues();
    }
    
    function colorizeValues() {
        // Find all elements that contain benefit values and colorize them
        const benefitElements = [
            individualDeductible, familyDeductible, oonIndividualDeductible, oonFamilyDeductible,
            individualOOP, familyOOP, oonIndividualOOP, oonFamilyOOP,
            coinsurance, primaryCare, specialist, urgentCare, emergencyRoom, hospitalization
        ];
        
        benefitElements.forEach(element => {
            const value = element.textContent;
            
            if (value.includes('$')) {
                // Dollar amounts - use text-success
                element.classList.add('text-success');
            } else if (value.includes('%')) {
                // Percentages - use text-info
                element.classList.add('text-info');
            } else if (value.toLowerCase().includes('not covered')) {
                // Not covered - use text-danger
                element.classList.add('text-danger');
            } else if (value.toLowerCase().includes('covered 100%')) {
                // Fully covered - use text-success
                element.classList.add('text-success');
            } else if (value === 'Not found') {
                // Not found - use text-muted
                element.classList.add('text-muted');
            }
        });
    }
    
    function resetForm() {
        // Reset the form to initial state
        document.getElementById('uploadSection').style.display = 'block';
        resultSection.style.display = 'none';
        errorMessage.style.display = 'none';
        
        // Reset the drop area
        dropArea.innerHTML = `
            <i class="fas fa-cloud-upload-alt fa-3x text-info mb-3"></i>
            <h5>Drag & Drop your insurance PDF file here</h5>
            <p class="text-muted">or</p>
            <div class="mb-3">
                <input type="file" class="form-control" id="pdfFile" accept=".pdf" hidden>
                <button class="btn btn-info" id="browseButton">Browse Files</button>
            </div>
            <small class="text-muted">Maximum file size: 16MB</small>
        `;
        
        // Reset the file inputs
        pdfFile.value = '';
        if (templateFile) templateFile.value = '';
        extractButton.disabled = true;
        
        // Reset checkboxes to default values
        if (useMassFormatCheck) useMassFormatCheck.checked = true;
        if (useAIFormatCheck) useAIFormatCheck.checked = true;
        
        // Reset processing spinner text
        document.querySelector('#processingSpinner p').textContent = 'Extracting insurance benefits...';
        document.querySelector('#processingSpinner p.text-muted').textContent = 
            'This may take a few moments depending on the complexity of the document.';
        
        // Re-attach event listener to the new browse button
        document.getElementById('browseButton').addEventListener('click', () => {
            document.getElementById('pdfFile').click();
        });
        
        // Re-attach event listener to the new file input
        document.getElementById('pdfFile').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                extractButton.disabled = false;
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
    
    function showWarning(message) {
        // Create a warning alert
        const warningAlert = document.createElement('div');
        warningAlert.className = 'alert alert-warning mt-3';
        warningAlert.innerHTML = `<i class="fas fa-exclamation-triangle me-2"></i> ${message}`;
        
        // Insert it after the success alert
        const successAlert = resultSection.querySelector('.alert-success');
        successAlert.parentNode.insertBefore(warningAlert, successAlert.nextSibling);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            warningAlert.style.display = 'none';
        }, 10000);
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
