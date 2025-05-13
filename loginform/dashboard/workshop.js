const serviceContainer = document.getElementById('services-container');
const addServiceBtn = document.getElementById('add-service-btn');

function addServiceRow(serviceName = '') {
  const row = document.createElement('div');
  row.className = 'service-entry';

  const serviceSelect = document.createElement('select');
  serviceSelect.className = 'service-name';
  const services = JSON.parse(localStorage.getItem('services')) || [];
  services.forEach(s => {
    const option = document.createElement('option');
    option.value = s.name;
    option.textContent = s.name; // Only display the service name without price
    if (s.name === serviceName) option.selected = true;
    serviceSelect.appendChild(option);
  });

  const amountInput = document.createElement('input');
  amountInput.type = 'number';
  amountInput.className = 'service-amount';
  amountInput.placeholder = 'Amount';

  row.appendChild(serviceSelect);
  row.appendChild(amountInput);
  serviceContainer.appendChild(row);
}

// Add new service row on button click
addServiceBtn.addEventListener('click', () => addServiceRow());

// Initial service row
addServiceRow();
