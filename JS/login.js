// @collapse

// VARIABLES
let notificationTimeout;
let progressBarInterval;

//! *****************************************************************************************************************************FUNCTIONS
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

    // notification.addEventListener("mouseover", () => {
    //   clearTimeout(notificationTimeout);
    //   clearInterval(progressBarInterval);
    // });

    // notification.addEventListener("mouseout", () => {
    //   const currentWidth = parseFloat(notificationProgress.style.width);
    //   const remainingTime = (currentWidth / 100) * duration;
    //   const newInterval = remainingTime / 100;

    //   progressBarInterval = setInterval(() => {
    //     notificationProgress.style.width =
    //       parseFloat(notificationProgress.style.width) - 1 + "%";
    //   }, newInterval);

    //   notificationTimeout = setTimeout(() => {
    //     hideNotification();
    //   }, remainingTime);
    // });
  } catch (error) {
    console.log(`Error: ${error.toString()} in showNotification`);
  }
}

function hideNotification() {
  try {
    clearInterval(progressBarInterval);
    clearTimeout(notificationTimeout);
    document.querySelector(".popup-msg").style.display = "none";
  } catch (error) {
    console.log(`Error: ${error.toString()} in hideNotification`);
  }
}

//! *****************************************************************************************************************************EVENT LIESTNERS
document.querySelector(".popup-msg-close").addEventListener("click", () => {
  hideNotification();
});

// **SIGNUP
document.querySelector(".signup-page").addEventListener("click", () => {
  document.querySelector(".login-container").classList.remove("active");
  document.querySelector(".signup-container").classList.add("active");
});

// **LOGIN
document.querySelector(".login-page").addEventListener("click", () => {
  document.querySelector(".login-container").classList.add("active");
  document.querySelector(".signup-container").classList.remove("active");
});
