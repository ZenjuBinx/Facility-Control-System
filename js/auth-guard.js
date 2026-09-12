import {
  initializeApp,
  getApp,
  getApps,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

// Use the existing Firebase app if it already exists.
// Otherwise initialize Firebase.
let app;

if (getApps().length > 0) {
  app = getApp();
} else {
  const firebaseConfig = {
    // USE THE SAME FIREBASE CONFIG FROM firebase.js

    apiKey: "YOUR_API_KEY",
    authDomain: "tcc-facility-electrical-system.firebaseapp.com",
    databaseURL:
      "https://tcc-facility-electrical-system-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "tcc-facility-electrical-system",
  };

  app = initializeApp(firebaseConfig);
}

const auth = getAuth(app);

onAuthStateChanged(auth, function (user) {
  if (!user) {
    window.location.href = "index.html";
  }
});

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
