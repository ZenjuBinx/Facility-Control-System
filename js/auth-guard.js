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

import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

// ==========================================
// FIREBASE
// ==========================================

let app;

if (getApps().length > 0) {
  app = getApp();
} else {
  const firebaseConfig = {
    // USE THE SAME FIREBASE CONFIG FROM firebase.js

    apiKey: "AIzaSyCuoG74aj_G0BR4Jw2C_AvETI39hTq9Zdg",
    authDomain: "tcc-facility-electrical-system.firebaseapp.com",
    databaseURL:
      "https://tcc-facility-electrical-system-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "tcc-facility-electrical-system",
  };

  app = initializeApp(firebaseConfig);
}

const auth = getAuth(app);

const database = getDatabase(
  app,
  "https://tcc-facility-electrical-system-default-rtdb.asia-southeast1.firebasedatabase.app",
);

// ==========================================
// CHECK LOGIN + USER ROLE
// ==========================================

onAuthStateChanged(auth, async function (user) {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  try {
    const userRef = ref(database, "users/" + user.uid);

    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const userData = snapshot.val();

      // Make the user information available
      // to the rest of the website.
      window.currentUser = user;
      window.currentUserData = userData;
      window.currentUserRole = userData.role || "user";

      // Settings is for Admins only
      if (
        window.location.pathname.endsWith("settings.html") &&
        window.currentUserRole !== "admin"
      ) {
        window.location.href = "dashboard.html";
        return;
      }

      console.log("Logged in user:", userData);
      console.log("User role:", window.currentUserRole);
    } else {
      console.warn("No user profile found in Realtime Database.");

      // Default to regular user
      window.currentUser = user;
      window.currentUserData = {
        name: user.displayName || "",
        email: user.email || "",
        role: "user",
      };

      window.currentUserRole = "user";
    }
  } catch (error) {
    console.error("Failed to load user role:", error);

    // If the role cannot be loaded,
    // treat the account as a regular user.
    window.currentUser = user;
    window.currentUserRole = "user";
  }

  // Tell the interface that the user's role is ready
  window.dispatchEvent(new Event("userRoleReady"));
});

// ==========================================
// LOGOUT
// ==========================================

window.logoutUser = async function () {
  try {
    await signOut(auth);

    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout error:", error);

    alert("Unable to log out. Please try again.");
  }
};

// ==========================================
// ROLE CHECK
// ==========================================

window.isAdmin = function () {
  return window.currentUserRole === "admin";
};
