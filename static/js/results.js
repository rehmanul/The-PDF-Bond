
document.addEventListener('DOMContentLoaded', function() {
    // Copy text button functionality
    const copyTextBtn = document.getElementById('copyTextBtn');
    if (copyTextBtn) {
        copyTextBtn.addEventListener('click', function() {
            const text = document.querySelector('.extracted-text').innerText;
            navigator.clipboard.writeText(text).then(function() {
                this.innerHTML = '<i class="fas fa-check me-1"></i> Copied!';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-copy me-1"></i> Copy';
                }, 2000);
            }.bind(this));
        });
    }

    // Download Excel button
    const downloadExcelBtn = document.getElementById('downloadExcelBtn');
    if (downloadExcelBtn) {
        downloadExcelBtn.addEventListener('click', function() {
            alert('In the full version, this would download the extracted tables as an Excel file. This feature is limited in the static demo.');
        });
    }
});
