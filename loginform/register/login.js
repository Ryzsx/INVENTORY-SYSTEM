import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAiVftlUlmrkxsnpegtyS8uqbjWSMXB3us",
  authDomain: "register-8782f.firebaseapp.com",
  projectId: "register-8782f",
  storageBucket: "register-8782f.appspot.com",  // Fixed storageBucket typo
  messagingSenderId: "676187688943",
  appId: "1:676187688943:web:c2fef30b8e074ae733b01a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// SIGN UP Button Click
document.getElementById('signin-submit').addEventListener('click', function(event) {
  event.preventDefault();
  
  // Get input values
  const email = document.getElementById('signin-email').value;
  const password = document.getElementById('signin-password').value;


  // Create user in Firebase Authentication
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Success
      alert("Logging in...");
      window.location.href = "../dashboard/home.html";
    
      
    })
    .catch((error) => {
      // Error
     alert("Error!")
    });
});





