function toggleRoom(room) {

  const status = document.getElementById(room + "Status");

  const button = document.getElementById(room + "Button");

  const text = status.querySelector(".switch-text");


  if (status.classList.contains("on")) {

    // Turn OFF

    status.classList.remove("on");

    status.classList.add("off");

    text.innerHTML = "OFF";

    button.innerHTML = "Turn ON";

  } else {

    // Turn ON

    status.classList.remove("off");

    status.classList.add("on");

    text.innerHTML = "ON";

    button.innerHTML = "Turn OFF";

  }

}