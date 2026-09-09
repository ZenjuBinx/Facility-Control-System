// Firebase App

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";


// Firebase Realtime Database

import {
  getDatabase,
  ref,
  set,
  get,
  onValue
} from
"https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


// Firebase configuration

const firebaseConfig = {

  apiKey: "AIzaSyCuoG74aj_G0BR4Jw2C_AvETI39hTq9Zdg",

  authDomain: "tcc-facility-electrical-system.firebaseapp.com",

  projectId: "tcc-facility-electrical-system",

  storageBucket: "tcc-facility-electrical-system.firebasestorage.app",

  messagingSenderId: "323037604948",

  appId: "1:323037604948:web:f477cb9ccf1cd57b5e51c1"

};


// Start Firebase

const app = initializeApp(firebaseConfig);


// Connect to Realtime Database

const database = getDatabase(
  app,
  "https://tcc-facility-electrical-system-default-rtdb.asia-southeast1.firebasedatabase.app"
);


console.log("Firebase connected");

console.log("Realtime Database connected");

window.saveRoomToFirebase = function (room, state) {

  const roomRef = ref(database, "rooms/" + room);

  set(roomRef, state);

};

// ================================
// Save Individual Load to Firebase
// ================================

window.saveLoadToFirebase = function (room, load, state) {

  const loadRef = ref(
    database,
    "rooms/" + room + "/" + load + "/state"
  );

  set(loadRef, state);

};

// ================================
// Save Load Label
// ================================

window.saveLoadLabel = function(room, load, label) {

  const labelRef = ref(
    database,
    "rooms/" + room + "/" + load + "/label"
  );

  set(labelRef, label);

};

// Save Building Load Label
window.saveBuildingLoadLabel = function(
  path,
  load,
  label
) {

  const labelRef =
    ref(
      database,
      "buildings/" +
      path +
      "/" +
      load +
      "/label"
    );


  return set(
    labelRef,
    label
  )
  .then(function() {

    console.log(
      "Building load label saved:",
      path,
      load,
      label
    );

  })
  .catch(function(error) {

    console.error(
      "Failed to save building load label:",
      error
    );

  });

};

onValue(
  ref(database, "rooms"),
  function(snapshot) {

    const data = snapshot.val();

    if (!data) {
      return;
    }

    for (const room in data) {

      if (window.updateRoomFromFirebase) {

        window.updateRoomFromFirebase(
          room,
          data[room]
        );

      }

    }

  }
);

// ================================
// Buildings → Website
// ================================

onValue(
  ref(database, "buildings"),
  function(snapshot) {

    const data = snapshot.val();

    if (!data) {
      return;
    }


    // Make building data available
    // to the Settings page
    window.buildingsData = data;


    // Update Control page
    if (window.updateBuildingsFromFirebase) {

      window.updateBuildingsFromFirebase(
        data
      );

    }


    // Update Settings page
    if (
      document.getElementById(
        "roomSelect"
      )
    ) {

      updateLoadOptions();

    }

  }
);

// ================================
// Save Building Load State
// ================================

window.saveBuildingLoadToFirebase = function(
  path,
  load,
  state
) {

  const loadRef = ref(
    database,
    "buildings/" + path + "/" + load + "/state"
  );

  set(loadRef, state);

};

// ================================
// ONE-TIME IT/BSBA DATA MIGRATION
// ================================

window.migrateITBSBAData = function() {

  const oldRef =
    ref(database, "buildings/it-bsba");

  get(oldRef)
    .then(function(snapshot) {

      if (!snapshot.exists()) {

        console.log(
          "No existing it-bsba data found."
        );

        return;

      }

      const oldData =
        snapshot.val();

      console.log(
        "Existing IT/BSBA data found:",
        oldData
      );

      // ================================
      // BSIT
      // ================================

      if (oldData["building-1"]) {

        set(
          ref(
            database,
            "buildings/bsit/building-1"
          ),
          oldData["building-1"]
        );

      }

      if (oldData["building-2"]) {

        set(
          ref(
            database,
            "buildings/bsit/building-2"
          ),
          oldData["building-2"]
        );

      }

      // ================================
      // BSBA
      // ================================

      if (oldData["building-3"]) {

        set(
          ref(
            database,
            "buildings/bsba/building-1"
          ),
          oldData["building-3"]
        );

      }

      if (oldData["building-4"]) {

        set(
          ref(
            database,
            "buildings/bsba/building-2"
          ),
          oldData["building-4"]
        );

      }

      // ================================
      // Basketball Court
      // ================================

      if (oldData["basketball-court"]) {

        set(
          ref(
            database,
            "buildings/basketball-court"
          ),
          oldData["basketball-court"]
        );

      }

      console.log(
        "IT/BSBA migration completed."
      );

    })

    .catch(function(error) {

      console.error(
        "Migration failed:",
        error
      );

    });

};