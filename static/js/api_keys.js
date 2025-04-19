
document.addEventListener('DOMContentLoaded', function() {
    const apiForm = document.getElementById('apiForm');
    const apiNameInput = document.getElementById('apiName');
    const apiKeyInput = document.getElementById('apiKey');
    const submitButton = document.querySelector('#apiForm button[type="submit"]');
    const currentKeysContainer = document.getElementById('currentApiKeys');
    
    // Load saved API keys
    loadApiKeys();
    
    // Handle API key submission
    if (apiForm) {
        apiForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!apiNameInput.value || !apiKeyInput.value) {
                showAlert('Please provide both an API name and key', 'danger');
                return;
            }
            
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
            
            const formData = new FormData();
            formData.append('name', apiNameInput.value);
            formData.append('key', apiKeyInput.value);
            
            fetch('/.netlify/functions/api/save-api-key', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Save API Key';
                
                if (data.success) {
                    showAlert('API key saved successfully', 'success');
                    apiNameInput.value = '';
                    apiKeyInput.value = '';
                    loadApiKeys();
                } else {
                    showAlert(data.error || 'Failed to save API key', 'danger');
                }
            })
            .catch(error => {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Save API Key';
                showAlert('Error: ' + error, 'danger');
            });
        });
    }
    
    // Function to load and display saved API keys
    function loadApiKeys() {
        if (currentKeysContainer) {
            currentKeysContainer.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
            
            fetch('/.netlify/functions/api/get-api-keys')
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.keys && data.keys.length > 0) {
                        let html = '<div class="list-group">';
                        data.keys.forEach(item => {
                            html += `
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-0">${item.name}</h6>
                                        <small class="text-muted">●●●●●●●●●●●●●●●●</small>
                                    </div>
                                    <button class="btn btn-sm btn-danger delete-key" data-key-name="${item.name}">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            `;
                        });
                        html += '</div>';
                        currentKeysContainer.innerHTML = html;
                        
                        // Add event listeners to delete buttons
                        document.querySelectorAll('.delete-key').forEach(button => {
                            button.addEventListener('click', function() {
                                const keyName = this.getAttribute('data-key-name');
                                deleteApiKey(keyName);
                            });
                        });
                    } else {
                        currentKeysContainer.innerHTML = '<div class="alert alert-info">No API keys found</div>';
                    }
                })
                .catch(error => {
                    currentKeysContainer.innerHTML = '<div class="alert alert-danger">Failed to load API keys</div>';
                    console.error('Error loading API keys:', error);
                });
        }
    }
    
    // Function to delete an API key
    function deleteApiKey(keyName) {
        if (confirm(`Are you sure you want to delete the API key for "${keyName}"?`)) {
            const formData = new FormData();
            formData.append('name', keyName);
            
            fetch('/.netlify/functions/api/delete-api-key', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert(`API key for "${keyName}" deleted successfully`, 'success');
                    loadApiKeys();
                } else {
                    showAlert(data.error || 'Failed to delete API key', 'danger');
                }
            })
            .catch(error => {
                showAlert('Error: ' + error, 'danger');
            });
        }
    }
    
    // Function to display alerts
    function showAlert(message, type) {
        const alertContainer = document.createElement('div');
        alertContainer.className = `alert alert-${type} alert-dismissible fade show`;
        alertContainer.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        const container = document.querySelector('.container');
        container.insertBefore(alertContainer, container.firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alertContainer);
            bsAlert.close();
        }, 5000);
    }
});
