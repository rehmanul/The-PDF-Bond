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
        document.getElementById('apiKeysTable').innerHTML = 'Loading keys...';

        fetch('/.netlify/functions/api/get-api-keys')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch API keys');
                }
                return response.json();
            })
            .then(data => {
                const keys = data.keys || [];

                if (keys.length === 0) {
                    document.getElementById('apiKeysTable').innerHTML = 'No API keys found.';
                    return;
                }

                let tableHtml = `
                    <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Key</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>`;

                keys.forEach(key => {
                    const keyValue = key.key || '';
                    const maskedKey = keyValue.length > 4 ? 
                        '••••••••' + keyValue.substring(keyValue.length - 4) : 
                        '••••••••';

                    tableHtml += `
                        <tr>
                            <td>${key.name}</td>
                            <td>${maskedKey}</td>
                            <td>
                                <button class="btn btn-sm btn-danger delete-key" data-key-name="${key.name}">
                                    <i class="bi bi-trash"></i> Delete
                                </button>
                            </td>
                        </tr>`;
                });

                tableHtml += `</tbody></table>`;
                document.getElementById('apiKeysTable').innerHTML = tableHtml;

                // Add event listeners for delete buttons
                document.querySelectorAll('.delete-key').forEach(button => {
                    button.addEventListener('click', function() {
                        const keyName = this.getAttribute('data-key-name');
                        deleteAPIKey(keyName);
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching API keys:', error);
                document.getElementById('apiKeysTable').innerHTML = `
                    <div class="alert alert-danger">
                        Failed to load API keys: ${error.message}
                    </div>`;
            });
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