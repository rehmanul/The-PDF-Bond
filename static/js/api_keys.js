document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const addApiKeyForm = document.getElementById('addApiKeyForm');
    const keyName = document.getElementById('keyName');
    const keyValue = document.getElementById('keyValue');
    const toggleKeyVisibility = document.getElementById('toggleKeyVisibility');
    const apiKeysTable = document.getElementById('apiKeysTable');
    const apiKeysList = document.getElementById('apiKeysList');
    const noKeysMessage = document.getElementById('noKeysMessage');
    const successAlert = document.getElementById('successAlert');
    const successMessage = document.getElementById('successMessage');
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    
    // Load API keys when the page loads
    loadApiKeys();
    
    // Toggle password visibility
    if (toggleKeyVisibility) {
        toggleKeyVisibility.addEventListener('click', () => {
            if (keyValue.type === 'password') {
                keyValue.type = 'text';
                toggleKeyVisibility.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                keyValue.type = 'password';
                toggleKeyVisibility.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    }
    
    // Form submission
    if (addApiKeyForm) {
        addApiKeyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = keyName.value;
            const value = keyValue.value;
            
            if (!name || !value) {
                showError('API name and value are required');
                return;
            }
            
            addApiKey(name, value);
        });
    }
    
    // Functions
    function loadApiKeys() {
        fetch('/api-keys', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            // Clear previous entries
            apiKeysList.innerHTML = '';
            
            // Filter out non-key entries like updated_at
            const keys = Object.entries(data)
                .filter(([key]) => key !== 'updated_at')
                .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
            
            if (keys.length === 0) {
                apiKeysTable.style.display = 'none';
                noKeysMessage.style.display = 'block';
            } else {
                apiKeysTable.style.display = 'table';
                noKeysMessage.style.display = 'none';
                
                // Add each key to the table
                keys.forEach(([name, value]) => {
                    const row = document.createElement('tr');
                    
                    // API Name
                    const nameCell = document.createElement('td');
                    const displayName = formatApiName(name);
                    nameCell.textContent = displayName;
                    
                    // API Key (masked)
                    const valueCell = document.createElement('td');
                    const maskedValue = maskApiKey(value);
                    valueCell.innerHTML = `<span class="api-key-value">${maskedValue}</span>`;
                    
                    // Updated date
                    const dateCell = document.createElement('td');
                    const updateDate = data.updated_at ? new Date(data.updated_at) : new Date();
                    dateCell.textContent = updateDate.toLocaleDateString();
                    
                    // Actions
                    const actionsCell = document.createElement('td');
                    const deleteButton = document.createElement('button');
                    deleteButton.className = 'btn btn-sm btn-outline-danger';
                    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                    deleteButton.addEventListener('click', () => {
                        deleteApiKey(name);
                    });
                    
                    actionsCell.appendChild(deleteButton);
                    
                    // Add cells to row
                    row.appendChild(nameCell);
                    row.appendChild(valueCell);
                    row.appendChild(dateCell);
                    row.appendChild(actionsCell);
                    
                    // Add row to table
                    apiKeysList.appendChild(row);
                });
            }
        })
        .catch(error => {
            showError('Error loading API keys: ' + error.message);
        });
    }
    
    function addApiKey(name, value) {
        fetch('/api-keys', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                value: value
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccess('API key added successfully');
                addApiKeyForm.reset();
                loadApiKeys();
            } else {
                showError(data.error || 'Failed to add API key');
            }
        })
        .catch(error => {
            showError('Error adding API key: ' + error.message);
        });
    }
    
    function deleteApiKey(name) {
        if (confirm(`Are you sure you want to delete the ${formatApiName(name)} API key?`)) {
            fetch(`/api-keys/${name}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSuccess('API key deleted successfully');
                    loadApiKeys();
                } else {
                    showError(data.error || 'Failed to delete API key');
                }
            })
            .catch(error => {
                showError('Error deleting API key: ' + error.message);
            });
        }
    }
    
    function showSuccess(message) {
        successMessage.textContent = message;
        successAlert.style.display = 'block';
        
        setTimeout(() => {
            successAlert.style.display = 'none';
        }, 3000);
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        errorAlert.style.display = 'block';
        
        setTimeout(() => {
            errorAlert.style.display = 'none';
        }, 5000);
    }
    
    function maskApiKey(key) {
        if (!key) return '';
        
        const firstFour = key.substring(0, 4);
        const lastFour = key.substring(key.length - 4);
        const middle = '*'.repeat(Math.min(key.length - 8, 8));
        
        return `${firstFour}${middle}${lastFour}`;
    }
    
    function formatApiName(name) {
        // Format API name for display (e.g., "perplexity" -> "Perplexity AI")
        switch (name.toLowerCase()) {
            case 'perplexity':
                return 'Perplexity AI';
            default:
                return name.charAt(0).toUpperCase() + name.slice(1);
        }
    }
});
