// @collapse

// VARIABLES
let notificationTimeout;
let progressBarInterval;

let signUp_data = {};
let departments = [];

//! *****************************************************************************************************************************FUNCTIONS
// ** GENERAL PURPOSE
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

// ** SIGNUP
async function fetchDepartments() {
  try {
    loader(1);
    let response = await fetch(
      "https://opentalks.cyclic.app/api/department/all",
      {
        method: "POST",
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);
    let result = "";
    let container = document.querySelector(".user-departmnet");
    if (!!data & (data.success == true)) {
      departments = [...data.departments];
      data.departments.forEach((el) => {
        result += `<option value="${el._id}">${el.name}</option>`;
      });
      container.innerHTML = result;
      container.insertAdjacentHTML(
        "afterbegin",
        '<option value="" selected>Select your department</option>'
      );
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchDepartmentsC`);
  }
}

async function isUserAllowed(query) {
  try {
    loader(1);
    let response = await fetch(
      "https://opentalks.cyclic.app/api/user/allowed",
      {
        method: "POST",
        body: JSON.stringify(query),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);
    if (!!data && data.success == true) {
      document.querySelector(".user-register-password").value = "";
      document.querySelector(".user-register-password-confirm").value = "";
      document.querySelector(".register-container").classList.remove("hide");
      document.querySelector(".signup-container").classList.add("hide");
    } else {
      showNotification(data.message);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in isUserAllowedC`);
  }
}

async function createUser(password) {
  try {
    loader(1);
    let response = await fetch("https://opentalks.cyclic.app/api/register", {
      method: "POST",
      body: JSON.stringify({ password, ...signUp_data }),
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    let data = await response.json();
    loader(0);
    if (!!data && data.success == true) {
      document.querySelector(".register-container").classList.add("hide");
      document.querySelector(".login-container").classList.remove("hide");
      showNotification("User successfully registered.");
    } else {
      showNotification(data.message);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in createUserC`);
  }
}

// ** LOGIN
async function login(query) {
  try {
    loader(1);
    let response = await fetch("https://opentalks.cyclic.app/api/login", {
      method: "POST",
      body: JSON.stringify(query),
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    let data = await response.json();
    loader(0);
    if (!!data && data.success == true) {
      showNotification("Login successful.");
      sessionStorage.setItem("user", data.data._id);
      sessionStorage.setItem("token", data.data.token);
      sessionStorage.setItem("lastLogin", data.data.lastLogin);
      window.location.href = data.data.url;
    } else {
      showNotification(data.message);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in loginC`);
  }
}

//! *****************************************************************************************************************************EVENT LIESTNERS

// ** NOTIFICATION POPUP
document.querySelector(".popup-msg-close").addEventListener("click", () => {
  hideNotification();
});

// **SIGNUP
document.querySelector(".signup-page").addEventListener("click", async () => {
  document.querySelector(".login-container").classList.add("hide");
  document.querySelector(".signup-container").classList.remove("hide");
  document.querySelector(".user-regisNo-signup").value = "";
  document.querySelector(".user-email").value = "";
  document.querySelector(".user-departmnet").value = "";
  document.querySelector(".user-fullname").value = "";
  if (departments.length == 0) await fetchDepartments();
});

document.querySelector(".signup-btn").addEventListener("click", async () => {
  let registration_number = document
    .querySelector(".user-regisNo-signup")
    .value.trim();
  let email = document.querySelector(".user-email").value.trim();
  let departmentId = document.querySelector(".user-departmnet").value;
  let name = document.querySelector(".user-fullname").value.trim();
  let emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  let invalidFields = [];
  if (registration_number == "") {
    invalidFields.push("Registration number");
  }
  if (email == "") {
    invalidFields.push("Email");
  }
  if (name == "") {
    invalidFields.push("Name");
  }
  if (departmentId == "") {
    invalidFields.push("Department");
  }

  if (invalidFields.length != 0) {
    return showNotification(`${invalidFields.join(", ")} is required.`);
  }

  if (!emailRegex.test(email)) {
    return showNotification("Please enter a valid email address.");
  }

  if (registration_number.toString().length != 8) {
    return showNotification("Please enter a valid registration number.");
  }

  signUp_data.registration_number = Number(registration_number);
  signUp_data.email = email;
  signUp_data.departmentId = departmentId;
  signUp_data.name = name;

  await isUserAllowed(signUp_data);
});

// REGISTER USER
document
  .querySelector(".register-user-btn")
  .addEventListener("click", async () => {
    let password = document
      .querySelector(".user-register-password")
      .value.trim();
    let passwordConfirm = document
      .querySelector(".user-register-password-confirm")
      .value.trim();
    let invalidFields = [];
    if (!password) {
      invalidFields.push("Password");
    }

    if (!passwordConfirm) {
      invalidFields.push("Confirm Password");
    }

    if (invalidFields.length != 0) {
      return showNotification(`${invalidFields.join(", ")} is required.`);
    }

    if (password != passwordConfirm) {
      return showNotification("Password does not match with confirm password.");
    }

    if (password.length < 5 && passwordConfirm.length < 5) {
      return showNotification("Password must be at least 5 characters.");
    }

    await createUser(password);
  });

// **LOGIN
document.querySelector(".login-page").addEventListener("click", () => {
  document.querySelector(".login-container").classList.remove("hide");
  document.querySelector(".signup-container").classList.add("hide");
  document.querySelector(".user-regisNo-login").value = "";
  document.querySelector(".user-password").value = "";
});

document.querySelector(".login-btn").addEventListener("click", async () => {
  let registration_number = document
    .querySelector(".user-regisNo-login")
    .value.trim();
  let password = document.querySelector(".user-password").value.trim();
  let invalidFields = [];
  if (password == "") {
    invalidFields.push("password");
  }
  if (registration_number == "") {
    invalidFields.push("registration_number");
  }
  if (invalidFields.length != 0) {
    return showNotification(`${invalidFields.join(", ")} is required.`);
  }

  let data = { registration_number: Number(registration_number), password };
  await login(data);
});

// ** FORGET PASSWORD
document.querySelector(".forget-password").addEventListener("click", () => {
  showNotification("This feature is not yet implemented.");
});
