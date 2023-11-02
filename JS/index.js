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

document.querySelector(".contact-me").addEventListener("click", () => {
  showNotification(`You can mail me at dhillonjaskaran4486@gmail.com`, 4000);
});

document.querySelector(".popup-msg-close").addEventListener("click", () => {
  hideNotification();
});
