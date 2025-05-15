import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  
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

  function showInputError(message) {
    // Show message in email input
    emailInput.value = message;
    emailInput.style.color = "red";
    emailInput.style.border = "2px solid red";
    passwordInput.style.border = "2px solid red";

    // Clear password field
    passwordInput.value = '';
    passwordInput.type = 'text'; // Break autofill
    setTimeout(() => passwordInput.type = 'password', 10);

    // Set email to readOnly to lock message
    emailInput.readOnly = true;

    // Restore inputs on focus
    emailInput.addEventListener('focus', function handler() {
      emailInput.readOnly = false;
      emailInput.value = '';
      emailInput.style.color = '';
      emailInput.style.border = '';
      emailInput.removeEventListener('focus', handler);
    });

    passwordInput.addEventListener('focus', function handler() {
      passwordInput.style.border = '';
      passwordInput.removeEventListener('focus', handler);
    });
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
    window.location.href = "loginform/dashboard/home.html";
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
  const emailInput = document.getElementById('reset-email');
  const email = emailInput.value.trim();

  function clearError(input) {
    input.addEventListener('focus', function handler() {
      input.style.color = '';
      input.style.border = '';
      input.value = '';  // Clear the error message when clicked
      input.removeEventListener('focus', handler);
    });
  }

  function showEmailError(message) {
    emailInput.value = message;
    emailInput.style.color = "red";
    emailInput.style.border = "2px solid red";

    // Add clear error handler
    clearError(emailInput);
  }

  if (!email) {
    showEmailError("Please enter your email.");
    return;
  }

  sendPasswordResetEmail(auth, email)
    .then(() => {
      alert("Reset email sent!");
      emailInput.value = ''; // Clear input after email sent
    })
    .catch((error) => {
      showEmailError("Invalid email");
    });
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
        showGeneralError("Password should be at least 6 characters.");
        break;
      default:
        showGeneralError("Sign-up failed. Please try again.");
    }
  }
});

// Google Sign-In and Sign-Up
let googleAuthMode = ''; // 'signin' or 'signup'

function handleGoogleAuth() {
  const googleSigninButton = document.getElementById('google-signin-btn');
  const googleSignupButton = document.getElementById('google-signup-btn');

  // Disable buttons during authentication
  googleSigninButton.disabled = true;
  googleSignupButton.disabled = true;

  // Always show Google account selector
  provider.setCustomParameters({ prompt: 'select_account' });

  signInWithPopup(auth, provider)
    .then((result) => {
      const isNewUser = result._tokenResponse?.isNewUser;

      // Validate based on mode
      if (googleAuthMode === 'signup' && !isNewUser) {
        alert("This Google account is already registered. Please sign in instead.");
        return auth.signOut(); // Sign out and prevent redirect
      }

      if (googleAuthMode === 'signin' && isNewUser) {
        alert("This Google account is not registered. Please sign up first.");
        return auth.signOut(); // Sign out and prevent redirect
      }

      // Valid sign in or sign up
      window.location.href = "loginform/dashboard/home.html";
    })
    .catch((error) => {
      if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
        alert("Google sign-in failed: " + error.message);
      }
    })
    .finally(() => {
      // Re-enable buttons regardless of outcome
      googleSigninButton.disabled = false;
      googleSignupButton.disabled = false;
    });
}

// Attach event listeners
document.getElementById('google-signin-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  googleAuthMode = 'signin';
  handleGoogleAuth();
});

document.getElementById('google-signup-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  googleAuthMode = 'signup';
  handleGoogleAuth();
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



