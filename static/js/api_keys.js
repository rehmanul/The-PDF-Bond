document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const statusMessages = document.getElementById('statusMessages');
    const apiKeyInputs = document.querySelectorAll('input[type="password"]');
    const saveButtons = document.querySelectorAll('.save-api-key');
    const toggleButtons = document.querySelectorAll('.toggle-password');

    // Load saved API keys
    loadApiKeys();

    // Toggle password visibility
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const inputField = document.getElementById(targetId);
            const icon = this.querySelector('i');

            if (inputField.type === 'password') {
                inputField.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                inputField.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Save API key button handlers
    saveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const apiName = this.getAttribute('data-name');
            let inputId;

            switch(apiName) {
                case 'perplexity':
                    inputId = 'perplexityApiKey';
                    break;
                default:
                    inputId = '';
            }

            if (inputId) {
                const apiValue = document.getElementById(inputId).value.trim();
                if (apiValue) {
                    saveApiKey(apiName, apiValue);
                } else {
                    showMessage('error', 'API key cannot be empty');
                }
            }
        });
    });

    // Function to load API keys from localStorage (in a real app, this would come from the server)
    function loadApiKeys() {
        // This is a simplified version that works with localStorage for the static demo
        const perplexityKey = localStorage.getItem('perplexity_api_key');

        if (perplexityKey) {
            document.getElementById('perplexityApiKey').value = perplexityKey;
        }
    }

    // Function to save API key to localStorage (in a real app, this would send to the server)
    function saveApiKey(name, value) {
        // This is a simplified version that works with localStorage for the static demo
        localStorage.setItem(`${name}_api_key`, value);
        showMessage('success', `${name.charAt(0).toUpperCase() + name.slice(1)} API key saved successfully`);
    }

    // Function to display status messages
    function showMessage(type, message) {
        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';

        statusMessages.innerHTML = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                <i class="fas ${icon} me-2"></i> ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alert = statusMessages.querySelector('.alert');
            if (alert) {
                alert.classList.remove('show');
                setTimeout(() => {
                    statusMessages.innerHTML = '';
                }, 150);
            }
        }, 5000);
    }
});