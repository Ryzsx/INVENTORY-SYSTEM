import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAiVftlUlmrkxsnpegtyS8uqbjWSMXB3us",
  authDomain: "register-8782f.firebaseapp.com",
  projectId: "register-8782f",
  storageBucket: "register-8782f.appspot.com",
  messagingSenderId: "676187688943",
  appId: "1:676187688943:web:c2fef30b8e074ae733b01a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account'  // forces account picker every time
});

// Email Sign-In
document.getElementById('signin-submit')?.addEventListener('click', async function(event) {
  event.preventDefault();

  const emailInput = document.getElementById('signin-email');
  const passwordInput = document.getElementById('signin-password');
  const signinButton = document.getElementById('signin-submit');

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  function clearField(input, type = 'password') {
    input.value = '';
    input.type = 'password'; // Temporarily switch to text
    setTimeout(() => input.type = type, 10); // Revert to original type
  }

  function showInputError(message) {
    emailInput.value = message;
    emailInput.style.color = "red";
    emailInput.style.border = "2px solid red";
    passwordInput.style.border = "2px solid red";

    // Clear both fields and break auto-fill
    clearField(emailInput, 'email');
    clearField(passwordInput, 'password');

    function clearError() {
      emailInput.value = '';
      passwordInput.value = '';
      emailInput.style.color = '';
      emailInput.style.border = '';
      passwordInput.style.border = '';

      emailInput.removeEventListener('input', clearError);
      passwordInput.removeEventListener('input', clearError);
    }

    emailInput.addEventListener('input', clearError);
    passwordInput.addEventListener('input', clearError);
  }

  if (!email || !password) {
    showInputError("Please enter both email and password.");
    return;
  }

  const originalBtnHTML = signinButton.innerHTML;

  signinButton.innerHTML = `
    <i class="fa fa-spinner fa-spin" style="font-size: 22px;"></i>
    <h3 style="display: inline; margin-left: 10px;">SIGNING IN...</h3>
  `;
  signinButton.disabled = true;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    emailInput.value = '';
    passwordInput.value = '';
    window.location.href = "../dashboard/home.html";
  } catch (error) {
    console.error("Login error:", error);
    const msg = error.code === 'auth/invalid-email'
      ? 'Please enter a valid email address.'
      : 'Invalid email or password';
    showInputError(msg);
  } finally {
    signinButton.innerHTML = originalBtnHTML;
    signinButton.disabled = false;
  }
});


// Password Reset
document.getElementById('reset-submit')?.addEventListener('click', function(event) {
  event.preventDefault();
  const email = document.getElementById('reset-email').value;

  if (email) {
    sendPasswordResetEmail(auth, email)
      .then(() => 
        alert("Reset email sent!"))
      .catch((error) => 
        alert("Error: " + error.message));
  }

  if (!email) {
    return alert("Please enter your email.");
  }
});

// Email Sign-Up
document.getElementById('signup-submit')?.addEventListener('click', async function (event) {
  event.preventDefault();

  const emailInput = document.getElementById('signup-email');
  const passwordInput = document.getElementById('signup-password');
  const confirmPasswordInput = document.getElementById('signup-confirm-password');

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  function clearError(input) {
    input.addEventListener('focus', function handler() {
      input.value = '';
      input.style.color = '';
      input.style.border = '';
      input.readOnly = false;
      input.removeEventListener('focus', handler);
    });
  }

  function showEmailError(message) {
    emailInput.value = message;
    emailInput.style.color = "red";
    emailInput.style.border = "2px solid red";
    emailInput.readOnly = true;

    passwordInput.value = '';
    confirmPasswordInput.value = '';

    clearError(emailInput);
  }

  function showPasswordMismatchError(message) {
    passwordInput.value = message;
    confirmPasswordInput.value = message;

    passwordInput.style.color = "red";
    confirmPasswordInput.style.color = "red";

    passwordInput.style.border = "2px solid red";
    confirmPasswordInput.style.border = "2px solid red";

    passwordInput.readOnly = true;
    confirmPasswordInput.readOnly = true;

    clearError(passwordInput);
    clearError(confirmPasswordInput);
  }

  function showGeneralError(message) {
    emailInput.value = message;
    passwordInput.value = message;
    confirmPasswordInput.value = message;

    emailInput.style.border = "2px solid red";
    passwordInput.style.border = "2px solid red";
    confirmPasswordInput.style.border = "2px solid red";

    emailInput.style.color = "red";
    passwordInput.style.color = "red";
    confirmPasswordInput.style.color = "red";

    emailInput.readOnly = true;
    passwordInput.readOnly = true;
    confirmPasswordInput.readOnly = true;

    clearError(emailInput);
    clearError(passwordInput);
    clearError(confirmPasswordInput);
  }

  if (!email || !password) {
    showGeneralError("Please fill out this field.");
    return;
  }

  if (password !== confirmPassword) {
    showPasswordMismatchError("Password do not match.");
    return;
  }

  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    if (methods.length > 0) {
      showEmailError("This email is already registered.");

      // Clear all fields in this case
      passwordInput.value = '';
      confirmPasswordInput.value = '';
      return;
    }

    await createUserWithEmailAndPassword(auth, email, password);

    // Clear all on success
    emailInput.value = '';
    passwordInput.value = '';
    confirmPasswordInput.value = '';

    alert("Account created successfully! Please sign in to continue.");
  } catch (error) {
    console.error("Sign-up error:", error);
    switch (error.code) {
      case 'auth/email-already-in-use':
        showEmailError("This email is already registered.");
        break;
      case 'auth/invalid-email':
        showEmailError("Please enter a valid email address.");
        break;
      case 'auth/weak-password':
        showGeneralError("Password should be at least 8 characters.");
        break;
      default:
        showGeneralError("Sign-up failed. Please try again.");
    }
  }
});

// Google Sign-In
document.getElementById('google-signin-btn')?.addEventListener('click', function(event) {
  event.preventDefault();

  provider.setCustomParameters({ prompt: 'select_account' }); // force picker

  signInWithPopup(auth, provider)
    .then((result) => {
      window.location.href = "../dashboard/home.html";
    })
    .catch((error) => {
      alert("Google sign-in failed: " + error.message);
    });
});

// Toggle between sign-in and sign-up forms
document.getElementById('signin-tab').addEventListener('click', showSignIn);
document.getElementById('signup-tab').addEventListener('click', showSignUp);
document.getElementById('show-signin')?.addEventListener('click', showSignIn);
document.getElementById('show-signup')?.addEventListener('click', showSignUp);

function showSignIn(e) {
  if (e) e.preventDefault();
  document.getElementById('signin-form').style.display = 'block';
  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('signin-tab').classList.add('active');
  document.getElementById('signup-tab').classList.remove('active');
}

function showSignUp(e) {
  if (e) e.preventDefault();
  document.getElementById('signin-form').style.display = 'none';
  document.getElementById('signup-form').style.display = 'block';
  document.getElementById('signup-tab').classList.add('active');
  document.getElementById('signin-tab').classList.remove('active');
}

// Toggle between show and hide password
document.querySelectorAll('.toggle-password').forEach(icon => {
  icon.addEventListener('click', () => {
    const input = document.querySelector(icon.getAttribute('toggle'));
    const isPassword = input.getAttribute('type') === 'password';

    input.setAttribute('type', isPassword ? 'text' : 'password');
    icon.classList.toggle('fa-eye-slash');
    icon.classList.toggle('fa-eye');
  });
});



