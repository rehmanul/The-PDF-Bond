
document.addEventListener('DOMContentLoaded', function() {
    const apiKeyForm = document.getElementById('apiKeyForm');
    const apiKeysList = document.getElementById('apiKeysList');

    // Load existing API keys
    loadApiKeys();

    if (apiKeyForm) {
        apiKeyForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const apiName = document.getElementById('apiName').value;
            const apiValue = document.getElementById('apiValue').value;

            fetch('/.netlify/functions/api/api-keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: apiName,
                    value: apiValue
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('apiValue').value = '';
                    showAlert('success', `API key for ${apiName} saved successfully.`);
                    loadApiKeys();
                } else {
                    showAlert('danger', data.error || 'Failed to save API key.');
                }
            })
            .catch(error => {
                showAlert('danger', 'Error: ' + error);
            });
        });
    }

    function loadApiKeys() {
        fetch('/.netlify/functions/api/api-keys')
        .then(response => response.json())
        .then(data => {
            displayApiKeys(data);
        })
        .catch(error => {
            console.error('Error loading API keys:', error);
            apiKeysList.innerHTML = `<div class="alert alert-danger">Failed to load API keys: ${error}</div>`;
        });
    }

    function displayApiKeys(keys) {
        let html = '';

        // Filter out non-API key entries (like timestamps)
        const validKeys = Object.keys(keys).filter(key => 
            key !== 'updated_at'
        );

        if (validKeys.length === 0) {
            html = '<p>No API keys found. Add one using the form above.</p>';
        } else {
            html = '<table class="table">';
            html += '<thead><tr><th>API</th><th>Key</th><th>Actions</th></tr></thead>';
            html += '<tbody>';

            validKeys.forEach(key => {
                const value = keys[key];
                const maskedValue = maskApiKey(value);

                html += `<tr>
                    <td>${key}</td>
                    <td>${maskedValue}</td>
                    <td>
                        <button class="btn btn-sm btn-danger delete-key" onclick="deleteApiKey('${key}')">Delete</button>
                    </td>
                </tr>`;
            });

            html += '</tbody></table>';
        }

        apiKeysList.innerHTML = html;
    }

    function maskApiKey(key) {
        if (!key) return '';
        if (key.length <= 8) return '••••••••';

        return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
    }

    function showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, 5000);
    }
});

// Global function for deleting API keys
function deleteApiKey(keyName) {
    if (confirm(`Are you sure you want to delete the ${keyName} API key?`)) {
        fetch(`/.netlify/functions/api/api-keys/${keyName}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const alertDiv = document.createElement('div');
                alertDiv.className = `alert alert-success alert-dismissible fade show`;
                alertDiv.innerHTML = `
                    API key for ${keyName} deleted successfully.
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                `;
                
                const container = document.querySelector('.container');
                container.insertBefore(alertDiv, container.firstChild);
                
                // Reload the API keys list
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                alert(data.error || 'Failed to delete API key.');
            }
        })
        .catch(error => {
            alert('Error: ' + error);
        });
    }
}
