
document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('benefitUploadForm');
    const fileInput = document.getElementById('insuranceDoc');
    const submitButton = uploadForm ? uploadForm.querySelector('button[type="submit"]') : null;
    const resultsContainer = document.getElementById('extractedBenefits');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                showResults('Please select a PDF file to upload', true);
                return;
            }
            
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            
            // Show loading state
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
            }
            
            if (loadingIndicator) {
                loadingIndicator.style.display = 'block';
            }
            
            if (resultsContainer) {
                resultsContainer.style.display = 'none';
            }
            
            fetch('/.netlify/functions/api/extract-benefits', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        try {
                            // Try to parse as JSON first
                            return JSON.parse(text);
                        } catch (e) {
                            // If it's not valid JSON, throw the text as an error
                            throw new Error(text || `HTTP error! status: ${response.status}`);
                        }
                    });
                }
                return response.json();
            })
            .then(data => {
                // Reset button state
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Extract Benefits';
                }
                
                // Hide loading indicator
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
                
                // Display results
                if (data.success) {
                    displayBenefits(data.benefits);
                } else {
                    showResults(data.error || 'Error processing request', true);
                }
            })
            .catch(error => {
                console.error("Error in benefit extraction:", error);
                
                // Reset button state
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Extract Benefits';
                }
                
                // Hide loading indicator
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
                
                // Display error
                showResults('Error processing request: ' + error, true);
            });
        });
    }
    
    function displayBenefits(benefits) {
        if (!resultsContainer) return;
        
        resultsContainer.style.display = 'block';
        
        if (!benefits || benefits.length === 0) {
            showResults('No benefits found in the document', true);
            return;
        }
        
        let html = '<div class="card mb-4"><div class="card-body">';
        
        // Add comprehensive benefits display
        html += '<h5 class="card-title">Extracted Benefits</h5>';
        html += '<div class="table-responsive"><table class="table table-striped">';
        html += '<thead><tr><th>Benefit Type</th><th>Details</th></tr></thead><tbody>';
        
        benefits.forEach(benefit => {
            html += `<tr>
                <td>${benefit.type || 'Unknown'}</td>
                <td>
                    <ul class="list-unstyled mb-0">`;
            
            for (const [key, value] of Object.entries(benefit)) {
                if (key !== 'type' && value) {
                    html += `<li><strong>${key.replace(/_/g, ' ')}:</strong> ${value}</li>`;
                }
            }
            
            html += `</ul>
                </td>
            </tr>`;
        });
        
        html += '</tbody></table></div>';
        html += '</div></div>';
        
        resultsContainer.innerHTML = html;
    }
    
    function showResults(message, isError = false) {
        if (!resultsContainer) return;
        
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <div class="alert alert-${isError ? 'danger' : 'success'}">
                ${message}
            </div>
        `;
    }
});
