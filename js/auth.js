import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

const firebaseConfig = {
  // USE THE SAME FIREBASE CONFIG
  // FROM YOUR firebase.js FILE

  apiKey: "AIzaSyCuoG74aj_G0BR4Jw2C_AvETI39hTq9Zdg",
  authDomain: "tcc-facility-electrical-system.firebaseapp.com",
  databaseURL:
    "https://tcc-facility-electrical-system-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tcc-facility-electrical-system",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(
  app,
  "https://tcc-facility-electrical-system-default-rtdb.asia-southeast1.firebasedatabase.app",
);

// ==========================================
// REGISTRATION
// ==========================================

const registerButton = document.getElementById("registerButton");

if (registerButton) {
  registerButton.addEventListener("click", async function () {
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const message = document.getElementById("registerMessage");

    // Validate name
    if (name === "") {
      message.innerHTML =
        '<div class="alert alert-warning">Please enter your full name.</div>';
      return;
    }

    // Validate email
    if (email === "") {
      message.innerHTML =
        '<div class="alert alert-warning">Please enter your email address.</div>';
      return;
    }

    // Validate password
    if (password.length < 6) {
      message.innerHTML =
        '<div class="alert alert-warning">Password must be at least 6 characters.</div>';
      return;
    }

    // Confirm password
    if (password !== confirmPassword) {
      message.innerHTML =
        '<div class="alert alert-warning">Passwords do not match.</div>';
      return;
    }

    try {
      registerButton.disabled = true;
      registerButton.textContent = "Creating Account...";

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const user = userCredential.user;

      // Save user's full name
      await updateProfile(user, {
        displayName: name,
      });

      await set(ref(database, "users/" + user.uid), {
        name: name,
        email: email,
        role: "user",
      });

      message.innerHTML =
        '<div class="alert alert-success">' +
        "Account created successfully! Redirecting to login..." +
        "</div>";

      setTimeout(function () {
        window.location.href = "index.html";
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);

      let errorMessage = "Failed to create account.";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email address is already registered.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak.";
      }

      message.innerHTML =
        '<div class="alert alert-danger">' + errorMessage + "</div>";

      registerButton.disabled = false;
      registerButton.textContent = "Create Account";
    }
  });
}

// ==========================================
// SHOW / HIDE REGISTRATION PASSWORD
// ==========================================

const toggleRegisterPassword = document.getElementById(
  "toggleRegisterPassword",
);

if (toggleRegisterPassword) {
  toggleRegisterPassword.addEventListener("click", function () {
    const password = document.getElementById("registerPassword");

    const icon = toggleRegisterPassword.querySelector("i");

    if (password.type === "password") {
      password.type = "text";

      icon.classList.remove("bi-eye-fill");
      icon.classList.add("bi-eye-slash-fill");
    } else {
      password.type = "password";

      icon.classList.remove("bi-eye-slash-fill");
      icon.classList.add("bi-eye-fill");
    }
  });
}

// ==========================================
// LOGIN
// ==========================================

const loginButton = document.getElementById("loginButton");

if (loginButton) {
  loginButton.addEventListener("click", async function () {
    const email = document.getElementById("loginEmail").value.trim();

    const password = document.getElementById("password").value;

    const message = document.getElementById("loginMessage");

    // Validate email
    if (email === "") {
      message.innerHTML =
        '<div class="alert alert-warning">Please enter your email address.</div>';
      return;
    }

    // Validate password
    if (password === "") {
      message.innerHTML =
        '<div class="alert alert-warning">Please enter your password.</div>';
      return;
    }

    try {
      loginButton.disabled = true;
      loginButton.textContent = "Signing In...";

      await signInWithEmailAndPassword(auth, email, password);

      message.innerHTML =
        '<div class="alert alert-success">Login successful! Redirecting...</div>';

      setTimeout(function () {
        window.location.href = "dashboard.html";
      }, 800);
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage =
        "Unable to sign in. Please check your email and password.";

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        errorMessage = "Incorrect email or password.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      }

      message.innerHTML =
        '<div class="alert alert-danger">' + errorMessage + "</div>";

      loginButton.disabled = false;
      loginButton.textContent = "Login";
    }
  });
}

// ==========================================
// FORGOT PASSWORD
// ==========================================

const forgotLink = document.querySelector(".forgot-link");

if (forgotLink) {
  forgotLink.addEventListener("click", async function (event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();

    const message = document.getElementById("loginMessage");

    if (email === "") {
      message.innerHTML =
        '<div class="alert alert-warning">' +
        "Enter your email address first, then click Forgot Password." +
        "</div>";

      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);

      message.innerHTML =
        '<div class="alert alert-success">' +
        "Password reset email sent. Check your inbox." +
        "</div>";
    } catch (error) {
      console.error("Password reset error:", error);

      let errorMessage = "Unable to send password reset email.";

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account was found with that email address.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      }

      message.innerHTML =
        '<div class="alert alert-danger">' + errorMessage + "</div>";
    }
  });
}

// LOGOUT
window.logoutUser = async function () {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout error:", error);
    alert("Unable to log out. Please try again.");
  }
};
