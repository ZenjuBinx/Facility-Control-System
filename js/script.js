// ================================
// Password Show / Hide
// ================================

function togglePassword() {
  const password = document.getElementById("password");

  if (!password) {
    return;
  }

  if (password.type === "password") {
    password.type = "text";
  } else {
    password.type = "password";
  }
}

// ================================
// Room States
// ================================

let rooms = {
  registrar: true,

  library: false,

  computer: true,

  guidance: true,
};

// ================================
// Toggle Room
// ================================

function toggleRoom(room) {
  rooms[room] = !rooms[room];

  saveRoomToFirebase(room, rooms[room]);
}

// ================================
// Update Room Display
// ================================

function updateRoom(room) {
  const status = document.getElementById(room + "Status");

  const button = document.getElementById(room + "Button");

  // If this room does not exist
  // on the current page, stop.

  if (!status) {
    return;
  }

  // ================================
  // Determine Room Status
  // ================================

  let roomIsOn = false;

  // New multi-load structure

  if (typeof rooms[room] === "object" && rooms[room] !== null) {
    const lightsOn = rooms[room].lights?.state === true;

    const outletsOn = rooms[room].outlets?.state === true;

    // Room is ON if at least one load is ON

    roomIsOn = lightsOn || outletsOn;
  }

  // Old room-level structure
  else {
    roomIsOn = rooms[room] === true;
  }

  // ================================
  // ON
  // ================================

  if (roomIsOn === true) {
    const switchText = status.querySelector(".switch-text");

    if (switchText) {
      status.classList.remove("off");
      status.classList.add("on");

      switchText.textContent = "ON";
    } else {
      status.classList.remove("bg-danger");
      status.classList.add("bg-success");

      status.textContent = "ON";
    }

    // Button
    // Only exists on pages that have controls.

    if (button) {
      button.classList.remove("btn-success");
      button.classList.add("btn-danger");

      button.innerHTML = '<i class="bi bi-power"></i> Turn OFF';
    }
  }

  // ================================
  // OFF
  // ================================
  else {
    const switchText = status.querySelector(".switch-text");

    if (switchText) {
      status.classList.remove("on");
      status.classList.add("off");

      switchText.textContent = "OFF";
    } else {
      status.classList.remove("bg-success");
      status.classList.add("bg-danger");

      status.textContent = "OFF";
    }

    // Button
    // Only exists on pages that have controls.

    if (button) {
      button.classList.remove("btn-danger");
      button.classList.add("btn-success");

      button.innerHTML = '<i class="bi bi-power"></i> Turn ON';
    }
  }
}

// ================================
// Firebase → Website
// ================================

window.updateRoomFromFirebase = function (room, data) {
  // New multi-load structure

  if (
    typeof data === "object" &&
    data !== null &&
    data.lights &&
    data.outlets
  ) {
    rooms[room] = data;

    updateLoad(room, "lights", data.lights.state, data.lights.label);

    updateLoad(room, "outlets", data.outlets.state, data.outlets.label);

    // Update Dashboard room status

    updateRoom(room);

    updateLightsOnCount();

    return;
  }

  // Old room-level structure

  rooms[room] = data;

  updateRoom(room);
};

console.log("Facility Electrical Control System Loaded");

// ================================
// Individual Load Control
// ================================

function toggleLoad(room, load) {
  const currentState = rooms[room]?.[load]?.state ?? false;

  const newState = !currentState;

  saveLoadToFirebase(room, load, newState);
}

// ================================
// Update Individual Load Display
// ================================

function updateLoad(room, load, state, label) {
  const status = document.getElementById(room + "-" + load + "-Status");

  const button = document.getElementById(room + "-" + load + "-Button");

  const labelElement = document.getElementById(room + "-" + load + "-Label");

  if (labelElement && label) {
    labelElement.textContent = label;
  }

  if (!status || !button) {
    return;
  }

  if (state === true) {
    status.classList.remove("off");

    status.classList.add("on");

    const text = status.querySelector(".switch-text");

    if (text) {
      text.textContent = "ON";
    }

    button.classList.remove("btn-success");

    button.classList.add("btn-danger");

    button.innerHTML = '<i class="bi bi-power"></i> Turn OFF';
  } else {
    status.classList.remove("on");

    status.classList.add("off");

    const text = status.querySelector(".switch-text");

    if (text) {
      text.textContent = "OFF";
    }

    button.classList.remove("btn-danger");

    button.classList.add("btn-success");

    button.innerHTML = '<i class="bi bi-power"></i> Turn ON';
  }
}

// ================================
// Settings - Load Labels
// ================================

function getBuildingRoomData(path) {
  const parts = path.split("/");

  let data = window.buildingsData;

  if (!data) {
    return null;
  }

  for (const part of parts) {
    if (!data[part]) {
      return null;
    }

    data = data[part];
  }

  return data;
}

// Load available electrical loads
function updateLoadOptions() {
  const roomSelect = document.getElementById("roomSelect");

  const loadSelect = document.getElementById("loadSelect");

  if (!roomSelect || !loadSelect) {
    return;
  }

  const roomData = getBuildingRoomData(roomSelect.value);

  loadSelect.innerHTML = "";

  if (!roomData) {
    return;
  }

  // Add Lights
  if (roomData.lights) {
    const lightsOption = document.createElement("option");

    lightsOption.value = "lights";
    lightsOption.textContent = "Lights";

    loadSelect.appendChild(lightsOption);
  }

  // Add Outlets only if the room has outlets
  if (roomData.outlets) {
    const outletsOption = document.createElement("option");

    outletsOption.value = "outlets";
    outletsOption.textContent = "Outlets";

    loadSelect.appendChild(outletsOption);
  }

  loadCurrentLabel();
}

// Load current label
function loadCurrentLabel() {
  const roomSelect = document.getElementById("roomSelect");

  const loadSelect = document.getElementById("loadSelect");

  const name = document.getElementById("loadName");

  if (!roomSelect || !loadSelect || !name) {
    return;
  }

  const roomData = getBuildingRoomData(roomSelect.value);

  if (roomData && roomData[loadSelect.value]) {
    name.value = roomData[loadSelect.value].label || "";
  } else {
    name.value = "";
  }
}

// Save label
function saveLabel() {
  const room = document.getElementById("roomSelect").value;

  const load = document.getElementById("loadSelect").value;

  const name = document.getElementById("loadName").value.trim();

  const message = document.getElementById("saveMessage");

  if (name === "") {
    message.innerHTML =
      '<div class="alert alert-warning">' +
      "Please enter a load name." +
      "</div>";

    return;
  }

  if (typeof saveBuildingLoadLabel !== "function") {
    message.innerHTML =
      '<div class="alert alert-danger">' +
      "Firebase function is not available." +
      "</div>";

    return;
  }

  saveBuildingLoadLabel(room, load, name);

  message.innerHTML =
    '<div class="alert alert-success">' +
    "Load name saved successfully." +
    "</div>";
}

// Update textbox when selection changes

document.addEventListener("DOMContentLoaded", function () {
  const roomSelect = document.getElementById("roomSelect");

  const loadSelect = document.getElementById("loadSelect");

  if (!roomSelect || !loadSelect) {
    return;
  }

  // Change room
  roomSelect.addEventListener("change", function () {
    updateLoadOptions();
  });

  // Change electrical load
  loadSelect.addEventListener("change", function () {
    loadCurrentLabel();
  });

  // Initial setup
  updateLoadOptions();
});

// ================================
// Dashboard - Lights ON Counter
// ================================

function updateLightsOnCount() {
  const counter = document.getElementById("lightsOnCount");

  if (!counter) {
    return;
  }

  let count = 0;

  for (const room in rooms) {
    const roomData = rooms[room];

    if (typeof roomData === "object" && roomData !== null && roomData.lights) {
      if (roomData.lights.state === true) {
        count++;
      }
    }
  }

  counter.textContent = count;
}

// ================================
// Building Control Interface
// ================================

window.updateBuildingsFromFirebase = function (data) {
  const container = document.getElementById("buildingControlContainer");

  if (!container) {
    return;
  }

  // Remember expanded building cards
  const expandedBuildings = {};

  container.querySelectorAll("[data-building-id]").forEach(function (card) {
    const content = card.querySelector(".building-content");

    if (content && content.style.display === "block") {
      expandedBuildings[card.dataset.buildingId] = true;
    }
  });

  // Remember expanded nested sections
  const expandedNested = {};

  container.querySelectorAll(".nested-section").forEach(function (section) {
    const content = section.querySelector(".nested-content");

    if (content && content.style.display === "block") {
      expandedNested[section.dataset.sectionId] = true;
    }
  });

  // Clear current interface
  container.innerHTML = "";

  // ================================
  // Main Building
  // ================================

  if (data.main) {
    container.appendChild(
      createBuildingCard(
        "main",
        "Main Building",
        "bi-building",
        data.main,
        expandedBuildings,
        expandedNested,
      ),
    );
  }

  // ================================
  // Criminology Department
  // ================================

  if (data.criminology) {
    container.appendChild(
      createBuildingCard(
        "criminology",
        "Criminology Department",
        "bi-building",
        data.criminology,
        expandedBuildings,
        expandedNested,
      ),
    );
  }

  // ================================
  // BSIT Department
  // ================================

  if (data.bsit) {
    container.appendChild(
      createBuildingCard(
        "bsit",
        "BSIT Department",
        "bi-building",
        data.bsit,
        expandedBuildings,
        expandedNested,
      ),
    );
  }

  // ================================
  // BSBA Department
  // ================================

  if (data.bsba) {
    container.appendChild(
      createBuildingCard(
        "bsba",
        "BSBA Department",
        "bi-building",
        data.bsba,
        expandedBuildings,
        expandedNested,
      ),
    );
  }

  // ================================
  // Covered Basketball Court
  // ================================

  if (data["basketball-court"]) {
    container.appendChild(
      createBuildingCard(
        "basketball-court",
        "Covered Basketball Court",
        "bi-dribbble",
        {
          court: data["basketball-court"],
        },
        expandedBuildings,
        expandedNested,
      ),
    );
  }
};

// ================================
// Create Building Card
// ================================

function createBuildingCard(
  buildingId,
  buildingName,
  icon,
  buildingData,
  expandedBuildings,
  expandedNested,
) {
  const card = document.createElement("div");

  card.className = "card control-card mb-4";

  card.dataset.buildingId = buildingId;

  // Building Header

  const header = document.createElement("div");

  header.className =
    "card-header d-flex justify-content-between align-items-center";

  // Building Title

  const title = document.createElement("div");

  title.className = "d-flex align-items-center";

  title.innerHTML = `
    <i class="bi ${icon} control-icon"></i>

    <strong class="ms-2">
      ${buildingName}
    </strong>
  `;

  // Expand Button

  const expandButton = document.createElement("button");

  expandButton.className = "btn btn-sm btn-outline-secondary";

  expandButton.innerHTML = '<i class="bi bi-chevron-down"></i>';

  // Management (+) Button

  const manageButton = document.createElement("button");

  manageButton.className = "btn btn-sm btn-outline-primary ms-2";

  manageButton.innerHTML = '<i class="bi bi-plus-lg"></i>';

  manageButton.title = "Manage rooms";

  manageButton.onclick = function (event) {
    event.stopPropagation();

    const modalElement = document.getElementById("roomManagementModal");

    if (!modalElement) {
      return;
    }

    // Remember which building was selected
    window.selectedBuilding = buildingId;

    const modalTitle = document.getElementById("roomManagementModalLabel");

    if (modalTitle) {
      modalTitle.textContent = "Manage " + buildingName;
    }

    const modal = new bootstrap.Modal(modalElement);

    modal.show();
  };

  // Content

  const content = document.createElement("div");

  content.className = "card-body building-content";

  content.id = "building-" + buildingId + "-content";

  // Restore previous expanded state

  if (expandedBuildings && expandedBuildings[buildingId]) {
    content.style.display = "block";

    expandButton.innerHTML = '<i class="bi bi-chevron-up"></i>';
  } else {
    content.style.display = "none";
  }

  // Expand / Collapse

  expandButton.onclick = function () {
    if (content.style.display === "none") {
      content.style.display = "block";

      expandButton.innerHTML = '<i class="bi bi-chevron-up"></i>';
    } else {
      content.style.display = "none";

      expandButton.innerHTML = '<i class="bi bi-chevron-down"></i>';
    }
  };

  header.appendChild(title);

  const headerButtons = document.createElement("div");

  headerButtons.className = "d-flex align-items-center gap-2";

  headerButtons.appendChild(manageButton);

  headerButtons.appendChild(expandButton);

  header.appendChild(headerButtons);

  card.appendChild(header);

  // ================================
  // Building Contents
  // ================================

  if (buildingId === "main") {
    createMainBuildingRooms(content, buildingData);
  } else if (buildingId === "criminology") {
    createCriminologyFloors(content, buildingData, expandedNested);
  } else if (buildingId === "bsit") {
    createDepartmentBuildings(content, buildingData, "bsit", expandedNested);
  } else if (buildingId === "bsba") {
    createDepartmentBuildings(content, buildingData, "bsba", expandedNested);
  } else if (buildingId === "basketball-court") {
    content.appendChild(
      createRoomCard(
        "court",
        "Covered Basketball Court",
        buildingData.court,
        "basketball-court/court",
      ),
    );
  }

  card.appendChild(content);

  return card;
}

// ================================
// Main Building Rooms
// ================================

function createMainBuildingRooms(container, buildingData) {
  const roomNames = {
    registrar: "Registrar",

    library: "Library",

    computer: "Computer Laboratory",

    "business-office": "Business Office",
  };

  for (const roomId in buildingData) {
    const roomName = roomNames[roomId] || formatName(roomId);

    container.appendChild(
      createRoomCard(roomId, roomName, buildingData[roomId], "main/" + roomId),
    );
  }
}

// ================================
// Criminology Floors
// ================================

function createCriminologyFloors(container, buildingData, expandedNested) {
  for (const floorId in buildingData) {
    const floorData = buildingData[floorId];

    const floorCard = createNestedSection(
      formatName(floorId),
      "bi-layers",
      "criminology-" + floorId,
      expandedNested,
    );

    const floorContent = floorCard.querySelector(".nested-content");

    for (const roomId in floorData) {
      floorContent.appendChild(
        createRoomCard(
          roomId,
          formatName(roomId),
          floorData[roomId],
          "criminology/" + floorId + "/" + roomId,
        ),
      );
    }

    container.appendChild(floorCard);
  }
}

// ================================
// IT & BSBA Buildings
// ================================

function createDepartmentBuildings(
  container,
  buildingData,
  departmentId,
  expandedNested,
) {
  for (const buildingId in buildingData) {
    const nested = createNestedSection(
      formatName(buildingId),
      "bi-building",
      departmentId + "-" + buildingId,
      expandedNested,
    );

    const nestedContent = nested.querySelector(".nested-content");

    const buildingRooms = buildingData[buildingId];

    for (const roomId in buildingRooms) {
      nestedContent.appendChild(
        createRoomCard(
          roomId,
          formatName(roomId),
          buildingRooms[roomId],
          departmentId + "/" + buildingId + "/" + roomId,
        ),
      );
    }

    container.appendChild(nested);
  }
}

// ================================
// Create Room Card
// ================================

function createRoomCard(roomId, roomName, roomData, roomPath) {
  const room = document.createElement("div");

  room.className = "border rounded p-3 mb-3";

  // ================================
  // Room Header
  // ================================

  const header = document.createElement("div");

  header.className = "d-flex justify-content-between align-items-center mb-3";

  const title = document.createElement("h6");

  title.className = "mb-0";

  title.innerHTML = '<i class="bi bi-door-open"></i> ' + roomName;

  // ================================
  // Delete Room Button
  // ================================

  const deleteButton = document.createElement("button");

  deleteButton.className = "btn btn-sm btn-outline-danger";

  deleteButton.innerHTML = '<i class="bi bi-trash"></i>';

  deleteButton.title = "Delete room";

  deleteButton.onclick = function () {
    const confirmed = confirm(
      'Are you sure you want to delete "' + roomName + '"?',
    );

    if (!confirmed) {
      return;
    }

    if (typeof deleteBuildingRoomFromFirebase !== "function") {
      alert("Firebase delete function is not available.");

      return;
    }

    deleteBuildingRoomFromFirebase(roomPath)
      .then(function () {
        console.log("Room deleted:", roomPath);
      })

      .catch(function (error) {
        console.error("Failed to delete room:", error);

        alert("Failed to delete the room. Please try again.");
      });
  };

  header.appendChild(title);
  header.appendChild(deleteButton);

  room.appendChild(header);

  // ================================
  // Loads
  // ================================

  for (const loadId in roomData) {
    const load = roomData[loadId];

    if (!load || typeof load !== "object") {
      continue;
    }

    const loadName = load.label || formatName(loadId);

    const state = load.state === true;

    const loadRow = document.createElement("div");

    loadRow.className =
      "d-flex justify-content-between align-items-center border-top pt-3 mt-3";

    // Load information

    const loadInfo = document.createElement("div");

    loadInfo.innerHTML = `

      <strong>
        ${loadName}
      </strong>

      <div class="small text-muted">
        ${formatName(loadId)}
      </div>

    `;

    // Controls

    const controls = document.createElement("div");

    controls.className = "d-flex align-items-center gap-2";

    // Status

    const status = document.createElement("span");

    status.className = "status-switch " + (state ? "on" : "off");

    status.innerHTML = `

      <span class="switch-knob"></span>

      <span class="switch-text">
        ${state ? "ON" : "OFF"}
      </span>

    `;

    // Button

    const button = document.createElement("button");

    button.className = "btn " + (state ? "btn-danger" : "btn-success");

    button.innerHTML =
      '<i class="bi bi-power"></i> ' + (state ? "Turn OFF" : "Turn ON");

    button.onclick = function () {
      const newState = !state;

      saveBuildingLoadToFirebase(roomPath, loadId, newState);
    };

    controls.appendChild(status);
    controls.appendChild(button);

    loadRow.appendChild(loadInfo);
    loadRow.appendChild(controls);

    room.appendChild(loadRow);
  }

  return room;
}

// ================================
// Nested Section
// ================================

function createNestedSection(title, icon, sectionId, expandedNested) {
  const section = document.createElement("div");

  section.className = "border rounded mb-3 nested-section";

  section.dataset.sectionId = sectionId;

  const header = document.createElement("div");

  header.className = "p-3 d-flex justify-content-between align-items-center";

  header.style.cursor = "pointer";

  const isExpanded = expandedNested && expandedNested[sectionId] === true;

  header.innerHTML = `

    <strong>

      <i class="bi ${icon}"></i>

      <span class="ms-2">
        ${title}
      </span>

    </strong>


    <i class="bi ${isExpanded ? "bi-chevron-up" : "bi-chevron-down"}"></i>

  `;

  const content = document.createElement("div");

  content.className = "nested-content p-3";

  content.style.display = isExpanded ? "block" : "none";

  header.onclick = function () {
    if (content.style.display === "none") {
      content.style.display = "block";

      header.querySelector(".bi-chevron-down").className = "bi bi-chevron-up";
    } else {
      content.style.display = "none";

      header.querySelector(".bi-chevron-up").className = "bi bi-chevron-down";
    }
  };

  section.appendChild(header);
  section.appendChild(content);

  return section;
}

// ================================
// Format Firebase Names
// ================================

function formatName(name) {
  return name.replace(/-/g, " ").replace(/\b\w/g, function (letter) {
    return letter.toUpperCase();
  });
}

// ================================
// Add Room Modal
// ================================

document.addEventListener("DOMContentLoaded", function () {
  const addRoomButton = document.getElementById("addRoomButton");

  if (!addRoomButton) {
    return;
  }

  addRoomButton.onclick = function () {
    const managementModal = document.getElementById("roomManagementModal");

    const addRoomModal = document.getElementById("addRoomModal");

    if (!managementModal || !addRoomModal) {
      return;
    }

    const confirmAddRoomButton = document.getElementById(
      "confirmAddRoomButton",
    );

    if (!confirmAddRoomButton) {
      return;
    }

    confirmAddRoomButton.onclick = function () {
      const roomNameInput = document.getElementById("newRoomName");

      const lights = document.getElementById("newRoomLights");

      const outlets = document.getElementById("newRoomOutlets");

      const message = document.getElementById("addRoomMessage");

      const roomName = roomNameInput.value.trim();

      const roomId = roomName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // ================================
      // Validate Room Name
      // ================================

      if (roomName === "") {
        message.innerHTML =
          '<div class="alert alert-warning">' +
          "Please enter a room name." +
          "</div>";

        return;
      }

      // ================================
      // At least one load required
      // ================================

      if (!lights.checked && !outlets.checked) {
        message.innerHTML =
          '<div class="alert alert-warning">' +
          "Select at least one electrical load." +
          "</div>";

        return;
      }

      // ================================
      // Determine Room Path
      // ================================

      let roomPath = "";

      // Main Building
      if (window.selectedBuilding === "main") {
        roomPath = "main/" + roomId;
      }

      // Criminology
      else if (window.selectedBuilding === "criminology") {
        const floorSelect = document.getElementById("newRoomFloor");

        const floor = floorSelect.value;

        roomPath = "criminology/" + floor + "/" + roomId;
      }

      // Other facilities
      else {
        message.innerHTML =
          '<div class="alert alert-info">' +
          "Room creation for this facility will be added next." +
          "</div>";

        return;
      }

      // ================================
      // Create Firebase Room ID
      // ================================

      if (roomId === "") {
        message.innerHTML =
          '<div class="alert alert-warning">' +
          "Please enter a valid room name." +
          "</div>";

        return;
      }

      // ================================
      // Build Room Data
      // ================================

      const roomData = {};

      if (lights.checked) {
        roomData.lights = {
          label: roomName + " Lights",

          state: false,
        };
      }

      if (outlets.checked) {
        roomData.outlets = {
          label: roomName + " Outlet",

          state: false,
        };
      }

      // ================================
      // Save to Firebase
      // ================================

      if (typeof saveBuildingRoomToFirebase !== "function") {
        message.innerHTML =
          '<div class="alert alert-danger">' +
          "Firebase function is not available." +
          "</div>";

        return;
      }

      saveBuildingRoomToFirebase(roomPath, roomData)
        .then(function () {
          message.innerHTML =
            '<div class="alert alert-success">' +
            "Room added successfully." +
            "</div>";

          roomNameInput.value = "";

          lights.checked = true;
          outlets.checked = false;

          setTimeout(function () {
            const modalElement = document.getElementById("addRoomModal");

            const modal = bootstrap.Modal.getInstance(modalElement);

            if (modal) {
              modal.hide();
            }
          }, 700);
        })

        .catch(function (error) {
          console.error("Failed to add room:", error);

          message.innerHTML =
            '<div class="alert alert-danger">' +
            "Failed to add room. Please try again." +
            "</div>";
        });
    };

    // Close management modal
    const managementInstance = bootstrap.Modal.getInstance(managementModal);

    if (managementInstance) {
      managementInstance.hide();
    }

    // Clear previous form
    const roomName = document.getElementById("newRoomName");

    const lights = document.getElementById("newRoomLights");

    const outlets = document.getElementById("newRoomOutlets");

    const message = document.getElementById("addRoomMessage");

    if (roomName) {
      roomName.value = "";
    }

    if (lights) {
      lights.checked = true;
    }

    if (outlets) {
      outlets.checked = false;
    }

    if (message) {
      message.innerHTML = "";
    }

    const floorOption = document.getElementById("newRoomFloorOption");

    const outletOption = document.getElementById("newRoomOutletOption");

    if (window.selectedBuilding === "criminology") {
      // Show floor selector
      if (floorOption) {
        floorOption.style.display = "block";
      }

      // Criminology has lights only
      if (outletOption) {
        outletOption.style.display = "none";
      }
    } else {
      // Hide floor selector
      if (floorOption) {
        floorOption.style.display = "none";
      }

      // Other facilities may have outlets
      if (outletOption) {
        outletOption.style.display = "block";
      }
    }

    // Show Add Room modal
    const addRoomInstance = new bootstrap.Modal(addRoomModal);

    addRoomInstance.show();
  };
});

// ================================
// Manage Loads Modal
// ================================

document.addEventListener("DOMContentLoaded", function () {
  const manageLoadsButton = document.getElementById("manageLoadsButton");

  if (!manageLoadsButton) {
    return;
  }

  manageLoadsButton.onclick = function () {
    const managementModal = document.getElementById("roomManagementModal");

    const manageLoadsModal = document.getElementById("manageLoadsModal");

    if (!managementModal || !manageLoadsModal) {
      return;
    }

    // Close management modal
    const managementInstance = bootstrap.Modal.getInstance(managementModal);

    if (managementInstance) {
      managementInstance.hide();
    }

    // Populate rooms and loads
    populateManageRoomOptions();

    // Open Manage Loads modal
    const loadsInstance = new bootstrap.Modal(manageLoadsModal);

    loadsInstance.show();
  };
});

// ================================
// Manage Loads - Room Selection
// ================================

function populateManageRoomOptions() {
  const roomSelect = document.getElementById("manageRoomSelect");

  if (!roomSelect) {
    return;
  }

  roomSelect.innerHTML = "";

  const buildingId = window.selectedBuilding;

  const buildingData = window.buildingsData?.[buildingId];

  if (!buildingData) {
    return;
  }

  // Find all rooms inside the selected facility
  const roomsFound = [];

  function findRooms(data, currentPath) {
    if (!data || typeof data !== "object") {
      return;
    }

    // Check whether this object is a room
    // by looking for electrical loads.
    let isRoom = false;

    for (const key in data) {
      const item = data[key];

      if (
        item &&
        typeof item === "object" &&
        (Object.prototype.hasOwnProperty.call(item, "state") ||
          Object.prototype.hasOwnProperty.call(item, "label"))
      ) {
        isRoom = true;
        break;
      }
    }

    if (isRoom) {
      roomsFound.push({
        path: currentPath,
        data: data,
      });

      return;
    }

    // Continue searching deeper
    for (const key in data) {
      if (data[key] && typeof data[key] === "object") {
        findRooms(data[key], currentPath ? currentPath + "/" + key : key);
      }
    }
  }

  findRooms(buildingData, buildingId);

  // Create dropdown options
  roomsFound.forEach(function (room) {
    const option = document.createElement("option");

    option.value = room.path;

    const pathParts = room.path.split("/");

    const roomId = pathParts[pathParts.length - 1];

    option.textContent = formatName(roomId);

    roomSelect.appendChild(option);
  });

  // Populate electrical loads
  populateManageLoadOptions();
}

// ================================
// Manage Loads - Load Selection
// ================================

function populateManageLoadOptions() {
  const roomSelect = document.getElementById("manageRoomSelect");

  const loadSelect = document.getElementById("manageLoadSelect");

  if (!roomSelect || !loadSelect) {
    return;
  }

  loadSelect.innerHTML = "";

  const roomData = getBuildingRoomData(roomSelect.value);

  if (!roomData) {
    return;
  }

  for (const loadId in roomData) {
    const load = roomData[loadId];

    if (!load || typeof load !== "object") {
      continue;
    }

    if (
      !Object.prototype.hasOwnProperty.call(load, "state") &&
      !Object.prototype.hasOwnProperty.call(load, "label")
    ) {
      continue;
    }

    const option = document.createElement("option");

    option.value = loadId;

    option.textContent = formatName(loadId);

    loadSelect.appendChild(option);
  }

  loadManageCurrentLabel();
}

// ================================
// Manage Loads - Current Label
// ================================

function loadManageCurrentLabel() {
  const roomSelect = document.getElementById("manageRoomSelect");

  const loadSelect = document.getElementById("manageLoadSelect");

  const nameInput = document.getElementById("manageLoadName");

  if (!roomSelect || !loadSelect || !nameInput) {
    return;
  }

  const roomData = getBuildingRoomData(roomSelect.value);

  if (roomData && roomData[loadSelect.value]) {
    nameInput.value = roomData[loadSelect.value].label || "";
  } else {
    nameInput.value = "";
  }
}

// ================================
// Manage Loads - Dropdown Events
// ================================

document.addEventListener("DOMContentLoaded", function () {
  const roomSelect = document.getElementById("manageRoomSelect");

  const loadSelect = document.getElementById("manageLoadSelect");

  if (!roomSelect || !loadSelect) {
    return;
  }

  roomSelect.addEventListener("change", function () {
    populateManageLoadOptions();
  });

  loadSelect.addEventListener("change", function () {
    loadManageCurrentLabel();
  });
});

// ================================
// Save Managed Load Name
// ================================

document.addEventListener("DOMContentLoaded", function () {
  const saveButton = document.getElementById("saveManagedLoadButton");

  if (!saveButton) {
    return;
  }

  saveButton.onclick = function () {
    const roomSelect = document.getElementById("manageRoomSelect");

    const loadSelect = document.getElementById("manageLoadSelect");

    const nameInput = document.getElementById("manageLoadName");

    const message = document.getElementById("manageLoadMessage");

    if (!roomSelect || !loadSelect || !nameInput || !message) {
      return;
    }

    const roomPath = roomSelect.value;

    const load = loadSelect.value;

    const newName = nameInput.value.trim();

    // ================================
    // Validate Name
    // ================================

    if (newName === "") {
      message.innerHTML =
        '<div class="alert alert-warning">' +
        "Please enter a load name." +
        "</div>";

      return;
    }

    // ================================
    // Check Firebase Function
    // ================================

    if (typeof saveBuildingLoadLabel !== "function") {
      message.innerHTML =
        '<div class="alert alert-danger">' +
        "Firebase function is not available." +
        "</div>";

      return;
    }

    // ================================
    // Save Label
    // ================================

    saveBuildingLoadLabel(roomPath, load, newName)
      .then(function () {
        message.innerHTML =
          '<div class="alert alert-success">' +
          "Load name updated successfully." +
          "</div>";

        // Update displayed data immediately
        const roomData = getBuildingRoomData(roomPath);

        if (roomData && roomData[load]) {
          roomData[load].label = newName;
        }

        // Clear message after a moment
        setTimeout(function () {
          message.innerHTML = "";
        }, 2000);
      })

      .catch(function (error) {
        console.error("Failed to save load name:", error);

        message.innerHTML =
          '<div class="alert alert-danger">' +
          "Failed to save load name. Please try again." +
          "</div>";
      });
  };
});
