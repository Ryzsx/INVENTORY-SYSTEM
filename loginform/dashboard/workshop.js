const STORAGE_KEYS = {
    services: 'workshopServices',
    models: 'workshopModels',
    technicians: 'workshopTechnicians'
  };
  
  function getList(key) {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS[key]) || '[]');
  }
  
  function saveList(key, list) {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(list));
  }
  
  function addItem(type) {
    const inputId = `new${capitalize(type.slice(0, -1))}`;
    const input = document.getElementById(inputId);
    const value = input.value.trim();
    if (value) {
      const list = getList(type);
      if (!list.includes(value)) {
        list.push(value);
        saveList(type, list);
        input.value = '';
        renderList(type);
        updateDropdowns();
      }
    }
  }
  
  function renderList(type) {
    const list = getList(type);
    const ul = document.getElementById(`${type}List`);
    ul.innerHTML = list.map(item => `<li>${item}</li>`).join('');
  }
  
  function updateDropdowns() {
    populateDropdown('model', getList('models'));
    populateDropdown('technician', getList('technicians'));
  
    // For services dropdowns inside the service-entry div
    document.querySelectorAll('.service-name').forEach(dropdown => {
      populateDropdownElement(dropdown, getList('services'));
    });
  }
  
  function populateDropdown(id, values) {
    const dropdown = document.getElementById(id);
    if (!dropdown) return;
    dropdown.innerHTML = values.map(val => `<option value="${val}">${val}</option>`).join('');
  }
  
  function populateDropdownElement(dropdown, values) {
    dropdown.innerHTML = values.map(val => `<option value="${val}">${val}</option>`).join('');
  }
  
  // For dynamically added service entries
  document.getElementById('add-service-btn').addEventListener('click', () => {
    const newServiceDiv = document.createElement('div');
    newServiceDiv.className = 'service-entry';
    newServiceDiv.innerHTML = `
      <select class="service-name"></select>
      <input type="number" placeholder="Amount" class="service-amount">
    `;
    document.getElementById('services-container').appendChild(newServiceDiv);
    updateDropdowns();
  });
  
  // Capitalize utility
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  // On page load
  ['services', 'models', 'technicians'].forEach(renderList);
  updateDropdowns();
  