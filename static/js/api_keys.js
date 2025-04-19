
document.addEventListener('DOMContentLoaded', function() {
    // Fix for the console errors
    const darkModeToggle = document.getElementById('darkModeToggle');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    // Toggle password visibility
    const togglePerplexityKey = document.getElementById('togglePerplexityKey');
    const perplexityApiKey = document.getElementById('perplexityApiKey');
    
    if (togglePerplexityKey && perplexityApiKey) {
        togglePerplexityKey.addEventListener('click', function() {
            if (perplexityApiKey.type === 'password') {
                perplexityApiKey.type = 'text';
                togglePerplexityKey.innerHTML = '<i class="bi bi-eye-slash"></i>';
            } else {
                perplexityApiKey.type = 'password';
                togglePerplexityKey.innerHTML = '<i class="bi bi-eye"></i>';
            }
        });
    }
    
    // Toggle new API key visibility
    const toggleNewKey = document.getElementById('toggleNewKey');
    const apiKeyValue = document.getElementById('apiKeyValue');
    
    if (toggleNewKey && apiKeyValue) {
        toggleNewKey.addEventListener('click', function() {
            if (apiKeyValue.type === 'password') {
                apiKeyValue.type = 'text';
                toggleNewKey.innerHTML = '<i class="bi bi-eye-slash"></i>';
            } else {
                apiKeyValue.type = 'password';
                toggleNewKey.innerHTML = '<i class="bi bi-eye"></i>';
            }
        });
    }
    
    // Load saved API keys
    loadSavedApiKeys();
    
    // Perplexity API form submission
    const perplexityApiForm = document.getElementById('perplexityApiForm');
    const apiKeySaveResult = document.getElementById('apiKeySaveResult');
    
    if (perplexityApiForm) {
        perplexityApiForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const apiKey = perplexityApiKey.value.trim();
            if (!apiKey) {
                showAlert(apiKeySaveResult, 'Please enter an API key', 'danger');
                return;
            }
            
            saveApiKey('perplexity', apiKey)
                .then(data => {
                    if (data.success) {
                        showAlert(apiKeySaveResult, 'API key saved successfully!', 'success');
                        loadSavedApiKeys();
                    } else {
                        showAlert(apiKeySaveResult, data.error || 'Failed to save API key', 'danger');
                    }
                })
                .catch(error => {
                    showAlert(apiKeySaveResult, 'Error: ' + error, 'danger');
                });
        });
    }
    
    // New API key form submission
    const newApiKeyForm = document.getElementById('newApiKeyForm');
    
    if (newApiKeyForm) {
        newApiKeyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const keyName = document.getElementById('apiKeyName').value.trim();
            const keyValue = document.getElementById('apiKeyValue').value.trim();
            
            if (!keyName) {
                alert('Please enter an API name');
                return;
            }
            
            if (!keyValue) {
                alert('Please enter an API key value');
                return;
            }
            
            saveApiKey(keyName, keyValue)
                .then(data => {
                    if (data.success) {
                        alert('API key saved successfully!');
                        document.getElementById('apiKeyName').value = '';
                        document.getElementById('apiKeyValue').value = '';
                        loadSavedApiKeys();
                    } else {
                        alert(data.error || 'Failed to save API key');
                    }
                })
                .catch(error => {
                    alert('Error: ' + error);
                });
        });
    }
});

// Save API key
function saveApiKey(name, value) {
    return fetch('/api-keys', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            value: value
        })
    })
    .then(response => response.json());
}

// Load saved API keys
function loadSavedApiKeys() {
    const savedApiKeys = document.getElementById('savedApiKeys');
    if (!savedApiKeys) return;
    
    savedApiKeys.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    
    fetch('/api-keys')
        .then(response => response.json())
        .then(data => {
            if (Object.keys(data).length === 0) {
                savedApiKeys.innerHTML = '<p class="text-center">No API keys saved yet.</p>';
                return;
            }
            
            let html = '<div class="table-responsive"><table class="table table-striped">';
            html += '<thead><tr><th>API Name</th><th>Last Updated</th><th>Actions</th></tr></thead><tbody>';
            
            for (const [key, value] of Object.entries(data)) {
                if (key !== 'updated_at') {
                    html += `
                        <tr>
                            <td>${key}</td>
                            <td>${data.updated_at ? new Date(data.updated_at).toLocaleString() : 'N/A'}</td>
                            <td>
                                <button class="btn btn-sm btn-danger delete-key" data-key="${key}">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                }
            }
            
            html += '</tbody></table></div>';
            savedApiKeys.innerHTML = html;
            
            // Add event listeners for delete buttons
            document.querySelectorAll('.delete-key').forEach(button => {
                button.addEventListener('click', function() {
                    const keyName = this.getAttribute('data-key');
                    if (confirm(`Are you sure you want to delete the ${keyName} API key?`)) {
                        deleteApiKey(keyName);
                    }
                });
            });
        })
        .catch(error => {
            savedApiKeys.innerHTML = `<p class="text-center text-danger">Error loading API keys: ${error}</p>`;
        });
}

// Delete API key
function deleteApiKey(keyName) {
    fetch(`/api-keys/${keyName}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('API key deleted successfully!');
            loadSavedApiKeys();
        } else {
            alert(data.error || 'Failed to delete API key');
        }
    })
    .catch(error => {
        alert('Error: ' + error);
    });
}

// Show alert message
function showAlert(element, message, type) {
    element.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        const alert = element.querySelector('.alert');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}
