document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle for mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.remove('active');
        });
    }
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    
    // Check for saved theme preference or respect OS preference
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const currentTheme = localStorage.getItem("theme");
    
    if (currentTheme === "light") {
        body.setAttribute("data-bs-theme", "light");
        if (darkModeToggle) {
            darkModeToggle.innerHTML = '<i class="bi bi-sun"></i> Light Mode';
        }
    } else {
        body.setAttribute("data-bs-theme", "dark");
        if (darkModeToggle) {
            darkModeToggle.innerHTML = '<i class="bi bi-moon"></i> Dark Mode';
        }
    }
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            let theme;
            if (body.getAttribute("data-bs-theme") === "dark") {
                body.setAttribute("data-bs-theme", "light");
                theme = "light";
                darkModeToggle.innerHTML = '<i class="bi bi-sun"></i> Light Mode';
            } else {
                body.setAttribute("data-bs-theme", "dark");
                theme = "dark";
                darkModeToggle.innerHTML = '<i class="bi bi-moon"></i> Dark Mode';
            }
            localStorage.setItem("theme", theme);
        });
    }
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
    
    // Text extraction method toggle
    const textExtractionRadios = document.querySelectorAll('input[name="textExtraction"]');
    const pdfplumberContent = document.getElementById('pdfplumber-content');
    const pypdf2Content = document.getElementById('pypdf2-content');
    
    if (textExtractionRadios.length > 0) {
        textExtractionRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'pdfplumber') {
                    pdfplumberContent.style.display = 'block';
                    pypdf2Content.style.display = 'none';
                } else if (this.value === 'pypdf2') {
                    pdfplumberContent.style.display = 'none';
                    pypdf2Content.style.display = 'block';
                }
            });
        });
    }
    
    // Table selector change handler
    const tableSelector = document.getElementById('tableSelector');
    if (tableSelector) {
        tableSelector.addEventListener('change', function() {
            const selectedIndex = this.value;
            
            // Hide all table containers
            document.querySelectorAll('.table-container').forEach(container => {
                container.style.display = 'none';
            });
            
            // Show the selected table
            const selectedTable = document.getElementById(`table-${selectedIndex}`);
            if (selectedTable) {
                selectedTable.style.display = 'block';
            }
        });
    }
    
    // Function to show alert
    window.showAlert = function(container, message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.role = 'alert';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Clear previous alerts
        container.innerHTML = '';
        container.appendChild(alert);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    };
});
