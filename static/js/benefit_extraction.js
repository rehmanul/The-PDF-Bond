
document.addEventListener('DOMContentLoaded', function() {
    const benefitForm = document.getElementById('benefitForm');
    const benefitResults = document.getElementById('benefitResults');
    const benefitContent = document.getElementById('benefitContent');

    if (benefitForm) {
        benefitForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(benefitForm);
            const submitButton = benefitForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
            
            fetch('/.netlify/functions/api/extract-benefits', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Extract Benefits';
                
                if (data.success) {
                    displayBenefits(data.result, data.excel_file);
                } else {
                    showError(data.error);
                }
            })
            .catch(error => {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Extract Benefits';
                showError('Error processing request: ' + error);
            });
        });
    }

    function displayBenefits(benefits, excelFile) {
        benefitResults.style.display = 'block';
        
        let html = `<div class="card mb-4">
            <div class="card-header">
                <h3 class="card-title">Plan Information</h3>
            </div>
            <div class="card-body">
                <p><strong>Carrier:</strong> ${benefits.carrier_name}</p>
                <p><strong>Plan Name:</strong> ${benefits.plan_name}</p>
                <p><strong>Plan Type:</strong> ${benefits.plan_metadata.plan_type}</p>
                <p><strong>HSA Eligible:</strong> ${benefits.plan_metadata.hsa_eligible}</p>
            </div>
        </div>`;
        
        html += `<div class="card mb-4">
            <div class="card-header">
                <h3 class="card-title">Deductible & Out-of-Pocket</h3>
            </div>
            <div class="card-body">
                <h4>Deductible</h4>
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Individual (In-Network):</strong> ${benefits.deductible.individual_in_network}</p>
                        <p><strong>Family (In-Network):</strong> ${benefits.deductible.family_in_network}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Individual (Out-of-Network):</strong> ${benefits.deductible.individual_out_network}</p>
                        <p><strong>Family (Out-of-Network):</strong> ${benefits.deductible.family_out_network}</p>
                    </div>
                </div>
                
                <h4>Out-of-Pocket Maximum</h4>
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Individual (In-Network):</strong> ${benefits.out_of_pocket.individual_in_network}</p>
                        <p><strong>Family (In-Network):</strong> ${benefits.out_of_pocket.family_in_network}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Individual (Out-of-Network):</strong> ${benefits.out_of_pocket.individual_out_network}</p>
                        <p><strong>Family (Out-of-Network):</strong> ${benefits.out_of_pocket.family_out_network}</p>
                    </div>
                </div>
                
                <h4>Coinsurance</h4>
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>In-Network:</strong> ${benefits.coinsurance.in_network}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Out-of-Network:</strong> ${benefits.coinsurance.out_network}</p>
                    </div>
                </div>
            </div>
        </div>`;
        
        if (excelFile) {
            html += `<div class="mb-3">
                <a href="/.netlify/functions/api/download/${excelFile}" class="btn btn-success">
                    <i class="bi bi-download"></i> Download Complete Benefits (Excel)
                </a>
            </div>`;
        }
        
        benefitContent.innerHTML = html;
        window.scrollTo(0, benefitResults.offsetTop);
    }

    function showError(message) {
        benefitResults.style.display = 'block';
        benefitContent.innerHTML = `<div class="alert alert-danger">${message}</div>`;
    }
});
