// @collapse
const imgBtn = document.querySelector(".img__btn");
const formName = document.querySelector(".form-name");
const formRegisNo = document.querySelector(".form-regis-no");
const formEmail = document.querySelector(".form-email");
const formPass1 = document.querySelector(".form-pass-1");
const formPass2 = document.querySelector(".form-pass-2");
const formDepartment = document.querySelector(".modern-dropdown");
const formLoginRegisNo = document.querySelector(".login_registration_number");
const formLoginPassword = document.querySelector(".login_password");
const signInButton = document.querySelector(".sign-in-btn"); //When Login
const signUpBtn = document.querySelector(".sign-up-btn"); //When create Account
const forgetPassword = document.querySelector(".forgot-pass");
const formMessage = document.querySelector(".sign-up-message");
const formMessageLogin = document.querySelector(".sign-in-message");

// Loader
const loader = document.querySelector(".loading");
const Blur = document.querySelector(".blur");

// FUNCTIONS

function showLoaderAbdBlur() {
  loader.classList.toggle("hide-loader");
  Blur.classList.toggle("hide-loader");
}

const formFieldValidator = (data) => {
  let count = 0;
  if (!data.name) {
    formName.placeholder = "name required";
    count++;
  }
  if (!data.regisNo) {
    formRegisNo.placeholder = "registration number required";
    count++;
  }
  if (!data.email) {
    formEmail.placeholder = "email required";
    count++;
  }
  if (!data.pass1) {
    formPass1.placeholder = "password required";
    count++;
  }
  if (!data.pass2) {
    formPass2.placeholder = "confirm password required";
    count++;
  }
  if (!data.department) {
    formMessage.textContent = "select your Department";
    formMessage.classList.toggle("hide");
    count++;
  }
  if (data.pass1 != data.pass2) {
    formMessage.textContent = "password does not match";
    formMessage.classList.toggle("hide");
    count++;
  }
  if (count == 0) return true;
  else return false;
};

const formData = () => {
  let isValid = formFieldValidator({
    name: formName.value,
    regisNo: formRegisNo.value,
    email: formEmail.value,
    pass1: formPass1.value,
    pass2: formPass2.value,
    department: formDepartment.value,
  });

  if (isValid == true) {
    let formDataObj = {
      name: formName.value,
      registration_number: formRegisNo.value,
      email: formEmail.value,
      password: formPass1.value,
      departmentId: formDepartment.value,
    };
    formMessage.classList.add("hide");
    loader.classList.remove("hide-loader");
    Blur.classList.remove("hide-loader");
    createUser(formDataObj);
  } else {
    console.log("User not created");
  }
};

function formEmpty() {
  formName.value = "";
  formRegisNo.value = "";
  formEmail.value = "";
  formPass1.value = "";
  formPass2.value = "";
  formMessage.textContent = "";
  formDepartment.value = "";
}

function createUser(data) {
  fetch("https://opentalks.cyclic.app/api/register", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json;charset=UTF-8",
    },
  })
    .then((response) => response.json())
    .then((dat) => {
      loader.classList.add("hide-loader");
      Blur.classList.add("hide-loader");
      if (dat.success == true) {
        formMessage.textContent = "User Created Successfuly";
        formMessage.classList.toggle("hide");
        setTimeout(() => {
          imgBtn.click();
          formEmpty();
        }, 1000);
      } else {
        formMessage.textContent = dat.message;
        formMessage.classList.toggle("hide");
      }
    })
    .catch((err) => {
      console.log(`Error in fetching ${err.toString()}`);
    });
}

function login() {
  let count = 0;
  if (!formLoginRegisNo.value) {
    formLoginRegisNo.placeholder = "**Registration number required";
    count++;
  }
  if (!formLoginPassword.value) {
    formMessageLogin.classList.toggle("hide");
    formMessageLogin.textContent = "**Password required";
    count++;
  }
  if (count == 0) {
    formMessageLogin.classList.add("hide");
    const data = {
      registration_number: formLoginRegisNo.value,
      password: formLoginPassword.value,
    };
    fetch("https://opentalks.cyclic.app/api/login", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-type": "application/json;charset=UTF-8",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        showLoaderAbdBlur();
        if (data.success == true) {
          formMessageLogin.textContent = data.message;
          formMessageLogin.classList.toggle("hide");
          sessionStorage.setItem("user", data.data._id);
          sessionStorage.setItem("token", data.data.token);
          sessionStorage.setItem("lastLogin", data.data.lastLogin);
          window.location.href = data.data.url;
        } else {
          formMessageLogin.textContent = data.message;
          formMessageLogin.classList.toggle("hide");
        }
      })
      .catch((err) => console.log(err.toString()));
  }
}

// EVENT LISTENERS
imgBtn.addEventListener("click", function () {
  document.querySelector(".cont").classList.toggle("s--signup");
});

signUpBtn.addEventListener("click", () => {
  formMessage.classList.add("hide");
  formData();
});

signInButton.addEventListener("click", () => {
  showLoaderAbdBlur();
  login();
});
