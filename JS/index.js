let notificationTimeout;
let progressBarInterval;

//! *********************************************************************************************************************FUNCTIONS
function hideNotification() {
  try {
    clearInterval(progressBarInterval);
    clearTimeout(notificationTimeout);
    document.querySelector(".popup-msg").style.display = "none";
  } catch (error) {
    console.log(`Error: ${error.toString()} in hideNotification`);
  }
}

function showNotification(message, duration = 2500) {
  try {
    clearInterval(progressBarInterval);
    clearTimeout(notificationTimeout);
    const notificationContainer = document.querySelector(
      ".popup-msg-notification"
    );
    const notification = notificationContainer.querySelector(".popup-msg");
    const notificationMessage =
      notification.querySelector(".popup-msg-message");
    const notificationProgress = notification.querySelector(
      ".popup-msg-progress"
    );

    notificationMessage.innerText = message;
    notification.style.display = "block";

    notificationProgress.style.width = "100%";

    const interval = duration / 100;

    progressBarInterval = setInterval(() => {
      notificationProgress.style.width =
        parseFloat(notificationProgress.style.width) - 1 + "%";
    }, interval);

    notificationTimeout = setTimeout(() => {
      hideNotification();
    }, duration);
  } catch (error) {
    console.log(`Error: ${error.toString()} in showNotification`);
  }
}

function loader(state) {
  const blurElement = document.querySelector(".blur");
  const loaderElement = document.querySelector(".loading");

  if (state === 1) {
    blurElement.classList.remove("hide");
    loaderElement.classList.remove("hide");
  } else if (state === 0) {
    blurElement.classList.add("hide");
    loaderElement.classList.add("hide");
  }
}

//  SEND CONTACT
function isWordCountExceed(text, limit) {
  try {
    text = text.trim();
    var words = text.split(/\s+/);
    return words.length <= limit;
  } catch (error) {
    console.log(`Error: ${error.toString()} in isWordCountExceed`);
  }
}

async function sendMessage(query) {
  try {
    loader(1);
    let response = await fetch(
      `https://opentalks-backend.onrender.com/api/v1/contact/add`,
      {
        method: "POST",
        body: JSON.stringify(query),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    let data = await response.json();
    loader(0);
    if (!!data && data.success == true) {
      showNotification("Jaskaran Singh will be in touch with you shortly.");
    } else {
      showNotification(data.message);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in sendMessage`);
  }
}

//! ****************************************************************************************************************EVENT LISTNERS

document.querySelector(".menubar-main-index").addEventListener("click", () => {
  let navLinks = document.querySelector(".links");
  document.querySelector(".blur").classList.remove("hide");
  navLinks.style.display = "flex";
  document.querySelector(".cancel-dashboard-nav-menubar").style.display =
    "block";
});

document
  .querySelector(".cancel-dashboard-nav-menubar")
  .addEventListener("click", () => {
    document.querySelector(".links").style.display = "";
    document.querySelector(".cancel-dashboard-nav-menubar").style.display =
      "none";
    document.querySelector(".blur").classList.add("hide");
  });

window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    document.querySelector(".blur").classList.add("hide");
    document.querySelector(".links").style.display = "";
    document.querySelector(".cancel-dashboard-nav-menubar").style.display =
      "none";
    document.querySelector(".menubar-main-index").style.display = "none";
  } else {
    document.querySelector(".menubar-main-index").style.display = "block";
  }
});

document.querySelectorAll(".links a").forEach((el) => {
  el.addEventListener("click", () => {
    document.querySelector(".links").style.display = "";
    document.querySelector(".cancel-dashboard-nav-menubar").style.display =
      "none";
    document.querySelector(".blur").classList.add("hide");
  });
});

// document.querySelector(".contact-me").addEventListener("click", () => {
//   showNotification(`You can mail me at dhillonjaskaran4486@gmail.com`, 4000);
// });

document.querySelector(".popup-msg-close").addEventListener("click", () => {
  hideNotification();
});

// ** SEND CONTACT
document
  .querySelector(".contact-send-btn")
  .addEventListener("click", async () => {
    let name = document.querySelector(".contact-name").value.trim();
    let email = document.querySelector(".contact-email").value.trim();
    let message = document.querySelector(".contact-message").value.trim();
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let invalidFields = [];
    if (!name) {
      invalidFields.push("Name");
    }
    if (!email) {
      invalidFields.push("Email");
    }
    if (!message) {
      invalidFields.push("Message");
    }
    if (invalidFields.length != 0) {
      return showNotification(`Required: ${invalidFields.join(", ")}`);
    }
    if (!emailRegex.test(email)) {
      return showNotification("Please provide a valid email address.");
    }
    if (!isWordCountExceed(name, 5)) {
      return showNotification("Please enter a name with a maximum of 5 words.");
    }
    if (!isWordCountExceed(message, 30)) {
      return showNotification(
        "Please limit your message to a maximum of 30 words."
      );
    }
    let data = {
      name,
      email,
      message,
      from: "Opentalks",
    };
    await sendMessage(data);
    document.querySelector(".contact-name").value = "";
    document.querySelector(".contact-email").value = "";
    document.querySelector(".contact-message").value = "";
  });
