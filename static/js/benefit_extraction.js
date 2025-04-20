document.addEventListener('DOMContentLoaded', function() {
    const dropArea = document.getElementById('dropArea');
    const pdfFileInput = document.getElementById('pdfFile');
    const browseButton = document.getElementById('browseButton');
    const extractButton = document.getElementById('extractButton');
    const processingSpinner = document.getElementById('processingSpinner');
    const resultSection = document.getElementById('resultSection');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const resetButton = document.getElementById('resetButton');
    const downloadExcelBtn = document.getElementById('downloadExcelBtn');

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
            <i class="fas fa-cloud-upload-alt fa-3x text-info mb-3"></i>
            <h5>Drag & Drop your insurance PDF file here</h5>
            <p class="text-muted">or</p>
            <div class="mb-3">
                <input type="file" class="form-control" id="pdfFile" accept=".pdf" hidden>
                <button class="btn btn-info" id="browseButton">Browse Files</button>
            </div>
            <small class="text-muted">Maximum file size: 16MB</small>
        `;
        document.getElementById('browseButton').addEventListener('click', function() {
            document.getElementById('pdfFile').click();
        });
    }

    // Extract button click handler
    extractButton.addEventListener('click', function() {
        document.getElementById('uploadSection').style.display = 'none';
        processingSpinner.style.display = 'block';
        errorMessage.style.display = 'none';

        // In a real implementation, this would send the file to the server
        // Here we're simulating the process with a timeout
        setTimeout(function() {
            processingSpinner.style.display = 'none';

            // For demo purposes, show sample data
            populateSampleData();

            resultSection.style.display = 'block';
        }, 3000);
    });

    // Reset button click handler
    resetButton.addEventListener('click', function() {
        resultSection.style.display = 'none';
        document.getElementById('uploadSection').style.display = 'block';
        resetFileSelection();
    });

    // Download Excel button handler
    downloadExcelBtn.addEventListener('click', function(e) {
        e.preventDefault();

        // In a real implementation, this would trigger a download
        // Here we just show a message
        alert("In the full version, this would download an Excel file with the extracted benefits. This feature is limited in the static demo.");
    });

    // Error display function
    function showError(message) {
        errorText.innerText = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }

    // Function to populate sample data
    function populateSampleData() {
        document.getElementById('carrierName').textContent = 'Aetna';
        document.getElementById('planName').textContent = 'PPO Base Plan';

        document.getElementById('individualDeductible').textContent = '$1,000';
        document.getElementById('familyDeductible').textContent = '$2,000';
        document.getElementById('oonIndividualDeductible').textContent = '$2,000';
        document.getElementById('oonFamilyDeductible').textContent = '$4,000';

        document.getElementById('individualOOP').textContent = '$3,000';
        document.getElementById('familyOOP').textContent = '$6,000';
        document.getElementById('oonIndividualOOP').textContent = '$6,000';
        document.getElementById('oonFamilyOOP').textContent = '$12,000';

        document.getElementById('primaryCare').textContent = '$20 copay';
        document.getElementById('specialist').textContent = '$40 copay';
        document.getElementById('urgentCare').textContent = '$75 copay';

        document.getElementById('coinsurance').textContent = '20% after deductible';
        document.getElementById('emergencyRoom').textContent = '$250 copay, then 20%';
        document.getElementById('hospitalization').textContent = '20% after deductible';
    }

    // Benefit display elements (unchanged)
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

    // Function to colorize values (unchanged)
    function colorizeValues() {
        const benefitElements = [
            individualDeductible, familyDeductible, oonIndividualDeductible, oonFamilyDeductible,
            individualOOP, familyOOP, oonIndividualOOP, oonFamilyOOP,
            coinsurance, primaryCare, specialist, urgentCare, emergencyRoom, hospitalization
        ];

        benefitElements.forEach(element => {
            const value = element.textContent;

            if (value.includes('$')) {
                element.classList.add('text-success');
            } else if (value.includes('%')) {
                element.classList.add('text-info');
            } else if (value.toLowerCase().includes('not covered')) {
                element.classList.add('text-danger');
            } else if (value.toLowerCase().includes('covered 100%')) {
                element.classList.add('text-success');
            } else if (value === 'Not found') {
                element.classList.add('text-muted');
            }
        });
    }

    // Function to format bytes (unchanged)
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // Function to display results (unchanged)
    function displayResults(result, excelFile) {
        resultSection.style.display = 'block';

        carrierName.textContent = result.carrier_name || 'Unknown';
        planName.textContent = result.plan_name || 'Unknown';

        individualDeductible.textContent = result.deductible?.individual_in_network || 'Not found';
        familyDeductible.textContent = result.deductible?.family_in_network || 'Not found';
        oonIndividualDeductible.textContent = result.deductible?.individual_out_network || 'Not found';
        oonFamilyDeductible.textContent = result.deductible?.family_out_network || 'Not found';

        individualOOP.textContent = result.out_of_pocket?.individual_in_network || 'Not found';
        familyOOP.textContent = result.out_of_pocket?.family_in_network || 'Not found';
        oonIndividualOOP.textContent = result.out_of_pocket?.individual_out_network || 'Not found';
        oonFamilyOOP.textContent = result.out_of_pocket?.family_out_network || 'Not found';

        coinsurance.textContent = result.coinsurance?.in_network || 'Not found';
        primaryCare.textContent = result.office_visits?.primary_care || 'Not found';
        specialist.textContent = result.office_visits?.specialist || 'Not found';
        urgentCare.textContent = result.office_visits?.urgent_care || 'Not found';
        emergencyRoom.textContent = result.emergency_room || 'Not found';
        hospitalization.textContent = result.hospitalization || 'Not found';


        if (excelFile) {
            downloadExcelBtn.href = `/download/${excelFile}`;
        }

        colorizeValues();
    }

    // Function to reset the form (unchanged)
    function resetForm() {
        document.getElementById('uploadSection').style.display = 'block';
        resultSection.style.display = 'none';
        errorMessage.style.display = 'none';

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

        pdfFileInput.value = '';
        extractButton.disabled = true;

        document.querySelector('#processingSpinner p').textContent = 'Extracting insurance benefits...';
        document.querySelector('#processingSpinner p.text-muted').textContent =
            'This may take a few moments depending on the complexity of the document.';

        document.getElementById('browseButton').addEventListener('click', () => {
            document.getElementById('pdfFile').click();
        });

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


});