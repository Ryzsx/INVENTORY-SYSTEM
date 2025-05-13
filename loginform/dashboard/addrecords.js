import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAiVftlUlmrkxsnpegtyS8uqbjWSMXB3us",
  authDomain: "register-8782f.firebaseapp.com",
  projectId: "register-8782f",
  storageBucket: "register-8782f.appspot.com",
  messagingSenderId: "676187688943",
  appId: "1:676187688943:web:c2fef30b8e074ae733b01a"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const addRecordForm = document.getElementById("add-record-form");

let allRecords = [];
let userUID = null;

// Handle auth state
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../index.html";
    return;
  }
  userUID = user.uid;
  await loadRecords();
});

// ----------------------- LOAD RECORDS -----------------------
async function loadRecords() {
  const recordsRef = collection(db, `users/${userUID}/records`);
  const q = query(recordsRef, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);

  allRecords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  displayRecords(allRecords, "all");
  updateDashboard(allRecords);
}

// ----------------------- DISPLAY RECORDS -----------------------
function displayRecords(records, target = "all") {
  if (target === "view" || target === "all") {
    const tableBody = document.getElementById("viewRecordsTableBody");
    if (tableBody) {
      tableBody.innerHTML = "";
      records.forEach(r => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${r.serviceDate}</td>
          <td>${r.plateNo}</td>
          <td>${r.model}</td>
          <td>${r.services.map(s => `${s.name} (₱${s.amount})`).join("<br>")}</td>
          <td>₱${r.totalAmount}</td>
          <td>
            <button class="edit-btn" data-id="${r.id}">Edit</button>
            <button class="delete-btn" data-id="${r.id}">Delete</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    }
  }

  if (target === "dashboard" || target === "all") {
    const recentBody = document.getElementById("recentRecordsTableBody");
    if (recentBody) {
      recentBody.innerHTML = "";
      records.slice(0, 5).forEach(r => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${r.serviceDate}</td>
          <td>${r.plateNo}</td>
          <td>${r.model}</td>
          <td>${r.services.map(s => s.name).join(", ")}</td>
          <td>₱${r.totalAmount}</td>
        `;
        recentBody.appendChild(row);
      });
    }
  }
}

// ----------------------- EDIT / DELETE -----------------------
document.addEventListener("click", async (e) => {
  const target = e.target;

  if (target.classList.contains("edit-btn")) {
    const docId = target.dataset.id;
    const record = allRecords.find(r => r.id === docId);
    if (!record) return;

    showSection("addRecords", document.querySelector('.sidebar a[onclick*="addRecords"]'));
    addRecordForm.scrollIntoView({ behavior: "smooth" });

    document.getElementById("plateNo").value = record.plateNo;
    document.getElementById("model").value = record.model;
    document.getElementById("serviceDate").value = record.serviceDate;

    const container = document.getElementById("services-container");
    container.innerHTML = `<h4>Services Performed:</h4>`;
    record.services.forEach(service => {
      const div = document.createElement("div");
      div.className = "service-entry";
      div.innerHTML = `
        <input type="text" value="${service.name}" placeholder="Service" class="service-name">
        <input type="number" value="${service.amount}" placeholder="Amount" class="service-amount">
      `;
      container.appendChild(div);
    });

    addRecordForm.setAttribute("data-edit-id", docId);
    document.querySelector('#add-record-form button[type="submit"]').textContent = "Update Record";
  }

  if (target.classList.contains("delete-btn")) {
    const id = target.dataset.id;
    if (confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteDoc(doc(db, `users/${userUID}/records`, id));
        alert("Record deleted successfully.");
        await loadRecords();
      } catch (error) {
        alert("Failed to delete record.");
        console.error(error);
      }
    }
  }
});

// ----------------------- SUBMIT FORM -----------------------
if (addRecordForm) {
  addRecordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const plateNo = document.getElementById("plateNo").value.trim();
    const model = document.getElementById("model").value.trim();
    const serviceDate = document.getElementById("serviceDate").value;
    const serviceNameInputs = document.querySelectorAll(".service-name");
    const serviceAmountInputs = document.querySelectorAll(".service-amount");

    const services = [];
    let totalAmount = 0;
    serviceNameInputs.forEach((input, i) => {
      const name = input.value.trim();
      const amount = parseFloat(serviceAmountInputs[i].value);
      if (name && !isNaN(amount)) {
        services.push({ name, amount });
        totalAmount += amount;
      }
    });

    const record = {
      plateNo,
      model,
      serviceDate,
      services,
      totalAmount
    };

    const submitBtn = addRecordForm.querySelector('button[type="submit"]');
    const editId = addRecordForm.getAttribute("data-edit-id");

    try {
      if (editId) {
        await updateDoc(doc(db, `users/${userUID}/records`, editId), record);
        alert("Record updated successfully.");
        addRecordForm.removeAttribute("data-edit-id");
      } else {
        await addDoc(collection(db, `users/${userUID}/records`), {
          ...record,
          timestamp: serverTimestamp()
        });
        alert("Record added successfully.");
      }

      addRecordForm.reset();
      submitBtn.textContent = "Add Record";
      document.getElementById("services-container").innerHTML = `
        <h4>Services Performed:</h4>
        <div class="service-entry">
          <input type="text" placeholder="Service" class="service-name">
          <input type="number" placeholder="Amount" class="service-amount">
        </div>
      `;

      await loadRecords();
    } catch (error) {
      alert("Error saving record.");
      console.error(error);
    }
  });
}

// ----------------------- ADD SERVICE ENTRY -----------------------
const addServiceBtn = document.getElementById("add-service-btn");
if (addServiceBtn) {
  addServiceBtn.addEventListener("click", () => {
    const container = document.getElementById("services-container");
    const div = document.createElement("div");
    div.className = "service-entry";
    div.innerHTML = `
      <input type="text" placeholder="Service" class="service-name">
      <input type="number" placeholder="Amount" class="service-amount">
    `;
    container.appendChild(div);
  });
}

// ----------------------- RESET FORM -----------------------
const resetFormBtn = document.getElementById("reset-form-btn");
if (resetFormBtn) {
  resetFormBtn.addEventListener("click", () => {
    if (addRecordForm) addRecordForm.reset();
    addRecordForm.removeAttribute("data-edit-id");
    document.querySelector('#add-record-form button[type="submit"]').textContent = "Add Record";

    const servicesContainer = document.getElementById("services-container");
    if (servicesContainer) {
      servicesContainer.innerHTML = `
        <h4>Services Performed:</h4>
        <div class="service-entry">
          <input type="text" placeholder="Service" class="service-name" required>
          <input type="number" placeholder="Amount" class="service-amount" required>
        </div>
      `;
    }
  });
}

// ----------------------- SEARCH FUNCTION -----------------------
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();
    const filtered = allRecords.filter(r =>
      r.plateNo.toLowerCase().includes(keyword) ||
      r.model.toLowerCase().includes(keyword)
    );
    displayRecords(filtered);
  });
}

// ----------------------- SORT FUNCTION -----------------------
const sortSelect = document.getElementById("sortSelect");
if (sortSelect) {
  sortSelect.addEventListener("change", () => {
    const sortBy = sortSelect.value;
    let sorted = [...allRecords];

    if (sortBy === "plate") {
      sorted.sort((a, b) => a.plateNo.localeCompare(b.plateNo));
    } else if (sortBy === "date") {
      sorted.sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate));
    }

    displayRecords(sorted, "view");
  });
}

// ----------------------- UPDATE DASHBOARD -----------------------
function updateDashboard(records) {
  const totalRecordsEl = document.getElementById("totalServiceRecords");
  const totalRevenueEl = document.getElementById("totalRevenue");

  if (totalRecordsEl) totalRecordsEl.textContent = records.length;
  if (totalRevenueEl) {
    const total = records.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
    totalRevenueEl.textContent = `₱${total}`;
  }
}
