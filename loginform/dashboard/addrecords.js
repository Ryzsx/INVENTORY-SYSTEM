import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

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

  allRecords = snapshot.docs.map(doc => doc.data());
  displayRecords(allRecords, "all"); // updates both view and dashboard
  updateDashboard(allRecords);
}

// ----------------------- DISPLAY RECORDS -----------------------
function displayRecords(records, target = "all") {
  // View Records Table
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
        `;
        tableBody.appendChild(row);
      });
    }
  }

  // Dashboard Table (Recent Records)
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

// ----------------------- ADD RECORDS -----------------------
const addRecordForm = document.getElementById("add-record-form");
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

    serviceNameInputs.forEach((input, index) => {
      const name = input.value.trim();
      const amount = parseFloat(serviceAmountInputs[index].value);
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
      totalAmount,
      timestamp: serverTimestamp()
    };

    try {
      await addDoc(collection(db, `users/${userUID}/records`), record);
      alert("Record added successfully!");
      addRecordForm.reset();
      document.getElementById("services-container").innerHTML = `
        <h4>Services Performed:</h4>
        <div class="service-entry">
          <input type="text" placeholder="Service" class="service-name" required>
          <input type="number" placeholder="Amount" class="service-amount" required>
        </div>
      `;
      await loadRecords(); // refresh view
    } catch (error) {
      alert("Failed to add record.");
      console.error(error);
    }
  });
}

// ----------------------- ADD SERVICE ENTRY BUTTON -----------------------
const addServiceBtn = document.getElementById("add-service-btn");
if (addServiceBtn) {
  addServiceBtn.addEventListener("click", () => {
    const container = document.getElementById("services-container");
    const div = document.createElement("div");
    div.className = "service-entry";
    div.innerHTML = `
      <input type="text" placeholder="Service" class="service-name" required>
      <input type="number" placeholder="Amount" class="service-amount" required>
    `;
    container.appendChild(div);
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

    displayRecords(sorted, "view"); // only updates the view records table
  });
}

