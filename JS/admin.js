// @collapse
("use strict");

let targetedDepratmentContainer;
let getForum;
let editedForum;

let forum_startPoint;
let post_startPoint;
let user_startPoint;
let forum_search_startPoint;
let forum_filter_startPoint;
let recent_posts_startPoint;
let recent_forums_startPoint;
let department_search_startPoint;
let search_members_startPoint;
let forum_review_startPoint;
let complaint_startPoint;
let post_likes_startPoint;
let notification_search_startPoint;
let recent_joinee_startPoint;
let search_joinee_startPoint;
let admin_notification_startPoint;
let recentAllowedUser_startPoint;

let department_search;
let forum_member_search;
let notification_search;

let filter;
let userFilter;
let userSearchedByFilter;
let forumSearchedByFilter;
let searchJoineeFilter;

let notificationTimeout;
let progressBarInterval;

let forumMembers;
let is_search_member;
let post_like_postid;
let prevNotification_value;
let id;
let is_search_joinee;
let reg_number;

const blurElement = document.querySelector(".blur2");
const loaderElement = document.querySelector(".loading");

let post_links = [];

//!  FUCNTIONS

// GENERAL PURPOSE

async function getDetail1() {
  try {
    loader(1);
    let response1 = fetch("https://opentalks.cyclic.app/api/detail", {
      method: "POST",
      body: JSON.stringify({
        _id: sessionStorage.getItem("user"),
        isAdmin: true,
      }),
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    let response2 = fetch("https://opentalks.cyclic.app/admin/stats", {
      method: "POST",
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });

    let response3 = fetch("https://opentalks.cyclic.app/admin/recent/posts", {
      method: "POST",
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    let response4 = fetch("https://opentalks.cyclic.app/admin/recent/forums", {
      method: "POST",
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    let preFetchData = await Promise.all([
      response1,
      response2,
      response3,
      response4,
    ]);

    let userData = await preFetchData[0].json();
    let recentPosts = await preFetchData[2].json();
    let recentForums = await preFetchData[3].json();
    let statsData = await preFetchData[1].json();

    setUserDetails_Dashboard(userData.user);
    setStats_Dashboard(statsData.stats);
    fetchRecentPosts(recentPosts);
    fetchRecentForums(recentForums);
    loader(0);
  } catch (error) {
    console.log(`Error: ${error.toString()} in getDetail1`);
  }
}

function setUserDetails_Dashboard(data) {
  try {
    let user_time = document.querySelector(".admin-salute .time");
    let user_name = document.querySelector(".admin-salute .admin-name");
    let date_joined = document.querySelector(
      ".bottom-fields .date-joined span"
    );
    let user_email = document.querySelector(".bottom-fields .admin-email span");
    let user_pic = document.querySelector(".admin-profile-pic");
    let currentHour = new Date().getHours();

    if (currentHour >= 0 && currentHour < 12) {
      user_time.textContent = "Good morning,";
    } else if (currentHour >= 12 && currentHour < 17) {
      user_time.textContent = "Good afternoon,";
    } else if (currentHour >= 17 || currentHour < 24) {
      user_time.textContent = "Good evening,";
    }
    user_name.textContent = data.name;
    date_joined.textContent = formatDate(data.createdAt);
    user_email.textContent = data.email;
    user_pic.src = `https://opentalks.cyclic.app${data.image}`;
  } catch (error) {
    console.log(`Error: ${error.toString()} in setUserDetails_Dashboard`);
  }
}

function setStats_Dashboard(data) {
  try {
    const statsToAnimate = {
      activeUsers: ".stat-card-user-a span",
      usersTotal: ".stat-card-user-ia span",
      activePosts: ".stat-card-post-a span",
      postsTotal: ".stat-card-post-ia span",
      activeForums: ".stat-card-forum-a span",
      forumsTotal: ".stat-card-forum-ia span",
      activeComplaints: ".stat-card-complaint-a span",
      complaintsTotal: ".stat-card-complaint-ia span",
    };

    const animationDuration = 2000;

    const animateStat = (element, targetValue, increment, duration) => {
      let currentValue = 0;

      const updateValue = () => {
        currentValue += increment;
        if (currentValue >= targetValue) {
          element.textContent = targetValue;
        } else {
          element.textContent = currentValue;
          requestAnimationFrame(updateValue);
        }
      };

      updateValue();
    };

    for (const statName in statsToAnimate) {
      if (data.hasOwnProperty(statName)) {
        const targetValue = data[statName];
        const statSelector = statsToAnimate[statName];
        const statElement = document.querySelector(statSelector);
        const increment = Math.ceil(targetValue / (animationDuration / 100));
        animateStat(statElement, targetValue, increment, animationDuration);
      }
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in setStats_DashboardC`);
  }
}

function fetchRecentPosts(data) {
  try {
    let result = "";
    let container = document.querySelector(".recent-posts-list");
    if (!!data && data.success == true) {
      data.posts.forEach((el) => {
        result += `
      <div class="recent-post-card">
                  <div class="recent-post-header">
                    <div class="recent-post-header-main">
                      <h3 class="recent-post-title">${el.title}</h3>
                      <div class="recent-post-forum">
                        <p>
                          <i class="fa-solid fa-comments"></i>
                          <span>${el.forumId.name}</span>
                        </p>
                      </div>
                    </div>
                    <p class="recent-post-description">${el.description}</p>
                  </div>
                  <div class="recent-post-footer">
                    <div class="created-on-recent-post">
                      ${formatDate(el.createdAt)}
                    </div>
                    <div class="user-info">
                      <img
                        src="https://opentalks.cyclic.app${el.userId.image}"
                        alt="User Avatar"
                        class="avatar-image-small recent-post-user-image"
                      />
                      <p class="recent-created-by">
                        <span class="recent-post-createdby"
                          >By ${el.userId.name}</span
                        >
                      </p>
                    </div>
                  </div>
                </div>
      `;
      });
      container.innerHTML = result;
      recent_posts_startPoint = data.nextStartPoint;
    } else {
      container.innerHTML = "No post has been created.";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchRecentPostsC`);
  }
}

function fetchRecentForums(data) {
  try {
    let result = "";
    let container = document.querySelector(".recent-forums-list");
    if (!!data && data.success == true) {
      data.forums.forEach((el) => {
        result += `
      <div class="recent-forum-card">
      <div class="recent-forum-header">
        <h3 class="recent-forum-title">${el.name}</h3>
        <p class="recent-forum-description">${el.description}</p>
      </div>
      <div class="recent-forum-footer">
        <div class="created-on-recent-forum">
          ${formatDate(el.createdAt)}
        </div>
        <div class="user-info">
          <img
            src="https://opentalks.cyclic.app${el.userId.image}"
            alt="User Avatar"
            class="avatar-image-small recent-post-user-image"
          />
          <p class="recent-created-by">
            <span class="recent-forum-createdby"
              >By ${el.userId.name}</span
            >
          </p>
        </div>
      </div>
    </div>
      `;
      });
      container.innerHTML = result;
      recent_forums_startPoint = data.nextStartPoint;
    } else {
      container.innerHTML = "No forum has been created yet.";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchRecentForumsC`);
  }
}

function logoutAdmin() {
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("lastLogin");
  sessionStorage.removeItem("token");
}

function formatDate(dateData) {
  const dateString = dateData;
  const date = new Date(dateString);
  const formattedDate = date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });

  return formattedDate;
}

function formatDate2(dateData) {
  try {
    const dateString = dateData;
    const date = new Date(dateString);
    const currentDate = new Date();
    const timeDifference = currentDate - date;
    const oneMinute = 60 * 1000;
    const oneHour = 60 * oneMinute;
    const oneDay = 24 * oneHour;
    const oneWeek = 7 * oneDay;

    if (timeDifference < oneMinute) {
      return "Just now";
    } else if (timeDifference < oneHour) {
      const minutesAgo = Math.floor(timeDifference / oneMinute);
      return `${minutesAgo} mins ago`;
    } else if (timeDifference < oneDay) {
      const hoursAgo = Math.floor(timeDifference / oneHour);
      return `${hoursAgo} hours ago`;
    } else if (timeDifference < oneWeek) {
      const daysAgo = Math.floor(timeDifference / oneDay);
      return `${daysAgo} days ago`;
    } else {
      const formattedDate = date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
      return formattedDate;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in formatDate`);
    return "Invalid Date";
  }
}

function showConfirmation(message) {
  try {
    return new Promise((resolve) => {
      document.querySelector(".blur").classList.remove("hide");
      document.querySelector(".confirm-box").classList.remove("hide");
      document.querySelector(".confirm-box p").textContent = message;

      let confirmButtons = document.querySelectorAll(".confirm-box button");

      let handleConfirmationClick = (event) => {
        event.preventDefault();
        const value = event.target.value;
        document.querySelector(".blur").classList.add("hide");
        document.querySelector(".confirm-box").classList.add("hide");
        resolve(value === "true");
      };

      confirmButtons.forEach((button) => {
        button.addEventListener("click", handleConfirmationClick);
      });
    });
  } catch (error) {
    console.log(`Error: ${error.toString()} in showConfirmationC`);
  }
}

function hideAllMainSectionContainers() {
  document.querySelectorAll(".hideMe").forEach((el) => {
    el.classList.add("hide");
  });
}

function isEmptyObject(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
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

function isInputLengthValid(paragraph, maxLength) {
  let words = paragraph.split(" ");
  let wordCount = words.length;
  return { valid: wordCount <= maxLength, length: wordCount };
}

function loader(state) {
  if (state === 1) {
    blurElement.classList.remove("hide");
    loaderElement.classList.remove("hide");
  } else if (state === 0) {
    blurElement.classList.add("hide");
    loaderElement.classList.add("hide");
  }
}

// DEPARTMENTS

async function deleteDepartment(target) {
  try {
    let confirm = await showConfirmation(
      "Do you want to delete this department?"
    );
    if (confirm == true) {
      document.querySelector(".admin-confirm-pass-input").value = "";
      targetedDepratmentContainer = target.closest(".main-department-template");
      document.querySelector(".admin-confirm-pass-button").value =
        target.dataset.depid;
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.add("deleteDep");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in deleteDepartment`);
  }
}

async function deleteDepartmentmain(password, _id) {
  try {
    let message = document.querySelector(".message-admin-pass-confirm");
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/department/delete",
      {
        method: "POST",
        body: JSON.stringify({
          userIdA: sessionStorage.getItem("user"),
          password,
          _id,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      targetedDepratmentContainer.remove();
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.remove("deleteDep");
    }
    message.textContent = data.message;
    message.classList.remove("hide");
    setTimeout(() => {
      message.classList.add("hide");
    }, 2500);
  } catch (error) {
    console.log(`Error: ${error.toString()} in deleteDepartmentmainC`);
  }
}

async function editDepartment(target) {
  try {
    let depname = target
      .closest(".main-department-template")
      .querySelector(".department-name").textContent;
    document.querySelector(".update-edit-department-btn").dataset.depid =
      target.dataset.depid;
    let depValue = document.querySelector(".edit-department-name-input");
    depValue.value = depname;
    targetedDepratmentContainer = target.closest(".main-department-template");
    document.querySelector(".edit-department-form").classList.remove("hide");
    document.querySelector(".admin-password-edit-department").value = "";
    document.querySelector(".blur").classList.remove("hide");
    sessionStorage.setItem("depName", depname);
  } catch (error) {
    console.log(`Error: ${error.toString()} in editDepartment`);
  }
}

async function editDetailsOfDepartment(password) {
  try {
    let message = document.querySelector(".message-edit-department");
    let oldDepName = sessionStorage.getItem("depName");
    let newDepName = document.querySelector(
      ".edit-department-name-input"
    ).value;
    let _id = document.querySelector(".update-edit-department-btn").dataset
      .depid;
    if (oldDepName == newDepName) {
      message.textContent = "Department name is not changed";
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    } else {
      loader(1);

      let response = await fetch(
        "https://opentalks.cyclic.app/admin/department/update",
        {
          method: "POST",
          body: JSON.stringify({
            name: newDepName,
            _id,
            userIdA: sessionStorage.getItem("user"),
            password,
          }),
          headers: {
            "Content-type": "application/json;charset=utf-8",
            Authorization: sessionStorage.getItem("token"),
          },
        }
      );
      let data = await response.json();
      loader(0);

      if (data.success == true) {
        sessionStorage.setItem("depName", newDepName);
        targetedDepratmentContainer.querySelector(
          ".department-name"
        ).textContent = newDepName;
      }
      message.classList.remove("hide");
      message.textContent = data.message;
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in editDetailsOfDepartmentC`);
  }
}

async function addNewDepartment(newDepName, password) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/department/create",
      {
        method: "POST",
        body: JSON.stringify({
          name: newDepName,
          userIdA: sessionStorage.getItem("user"),
          password,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      let container = document.querySelector(".main-department-list");
      let newDepartment = `
      <div class="main-department-template">
  <div class="main-dep-template-links">
    <i class="fa-solid fa-pen edit-main-department" data-depid="${
      data.created_department._id
    }"></i>
    <i class="fa-solid fa-trash-can delete-department" data-depid="${
      data.created_department._id
    }"></i>
  </div>
  <div class="department-name">${data.created_department.name}</div>
  <div class="department-dates">
  <div class="department-createdAt">Created On: ${formatDate(
    data.created_department.createdAt
  )}</div>
  <div class="department-updatedAt">Not updated yet</div>
  </div>
</div>
      `;
      container.insertAdjacentHTML("beforeend", newDepartment);
    }
    document.querySelector(".message-add-department").textContent =
      data.message;
    document.querySelector(".message-add-department").classList.remove("hide");
    setTimeout(() => {
      document.querySelector(".message-add-department").classList.add("hide");
    }, 2500);
  } catch (error) {
    console.log(`Error: ${error.toString()} in addNewDepartmentC`);
  }
}

async function fetchAllDepartments() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/department/all",
      {
        method: "POST",
        body: JSON.stringify({ byAdmin: true }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".main-department-list");
    if (!!data && data.success == true) {
      data.departments.forEach((el) => {
        let updatedAt =
          el.updatedAt != null
            ? `Updated On: ${formatDate(el.updatedAt)}`
            : "Not updated yet";
        result += `
  <div class="main-department-template">
  <div class="main-dep-template-links">
    <i class="fa-solid fa-pen edit-main-department" data-depid="${el._id}"></i>
    <i class="fa-solid fa-trash-can delete-department" data-depid="${
      el._id
    }"></i>
  </div>
  <div class="department-name">${el.name}</div>
  <div class="department-dates">
  <div class="department-createdAt">Created On: ${formatDate(
    el.createdAt
  )}</div>
  <div class="department-updatedAt">${updatedAt}</div>
  </div>
</div>
  `;
      });
      container.innerHTML = result;
    } else {
      document
        .querySelector(".main-departmnet-container>h2")
        .classList.add("hide");
      container.innerHTML = "No department is created yet.";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchAllDepartments`);
  }
}

async function searchDepartment(name) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/department/search",
      {
        method: "POST",
        body: JSON.stringify({ name: name }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".main-department-search-list");
    document.querySelector(
      ".main-departmnet-container>h2"
    ).textContent = `Results: ${data.results}`;
    if (!!data && data.success == true) {
      data.departments.forEach((el) => {
        let highlightedName = el.name.replace(
          new RegExp(name, "gi"),
          (match) => `<span class="highlight">${match}</span>`
        );

        let updatedAt =
          el.updatedAt != null
            ? `Updated On: ${formatDate(el.updatedAt)}`
            : "Not updated yet";
        result += `
  <div class="main-department-template">
  <div class="main-dep-template-links">
    <i class="fa-solid fa-pen edit-main-department" data-depid="${el._id}"></i>
    <i class="fa-solid fa-trash-can delete-department" data-depid="${
      el._id
    }"></i>
  </div>
  <div class="department-name">${highlightedName}</div>
  <div class="department-dates">
  <div class="department-createdAt">Created On: ${formatDate(
    el.createdAt
  )}</div>
  <div class="department-updatedAt">${updatedAt}</div>
  </div>
</div>
  `;
      });
      container.scrollTop = 0;
      container.innerHTML = result;
      department_search_startPoint = data.nextStartPoint;
    } else {
      container.innerHTML = "No matching result found.";
      showNotification("No such department found.");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in searchDepartmentC`);
  }
}

async function searchDepartmentScroll() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/department/search",
      {
        method: "POST",
        body: JSON.stringify({
          name: department_search,
          startPoint: department_search_startPoint,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".main-department-search-list");
    if (!!data && data.success == true) {
      data.departments.forEach((el) => {
        let highlightedName = el.name.replace(
          new RegExp(department_search, "gi"),
          (match) => `<span class="highlight">${match}</span>`
        );

        let updatedAt =
          el.updatedAt != null
            ? `Updated On: ${formatDate(el.updatedAt)}`
            : "Not updated yet";
        result += `
  <div class="main-department-template">
  <div class="main-dep-template-links">
    <i class="fa-solid fa-pen edit-main-department" data-depid="${el._id}"></i>
    <i class="fa-solid fa-trash-can delete-department" data-depid="${
      el._id
    }"></i>
  </div>
  <div class="department-name">${highlightedName}</div>
  <div class="department-dates">
  <div class="department-createdAt">Created On: ${formatDate(
    el.createdAt
  )}</div>
  <div class="department-updatedAt">${updatedAt}</div>
  </div>
</div>
  `;
      });
      let prevScrollHeight = container.scrollHeight;
      container.insertAdjacentHTML("beforeend", result);
      container.scrollTop = prevScrollHeight;
      department_search_startPoint = data.nextStartPoint;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in searchDepartmentScrollC`);
  }
}

// FORUMS

async function fetchtop3Forums() {
  try {
    loader(1);

    let response = await fetch("https://opentalks.cyclic.app/admin/forum/top", {
      method: "POST",
      body: JSON.stringify({
        byAdmin: true,
      }),
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".top3-forums-display-list");
    if (!!data && data.success == true) {
      data.forums.forEach((el) => {
        let isDeleted = el.active == true ? "" : "deletedForumFetched";
        result += `
        <div class="forum-card-forum-section ${isDeleted}">
        <h3 class="forum-name-forum-section">${el.name}</h3>
        <p class="forum-description-forum-section">${el.description}</p>
        <div class="forum-section-bottom">
            <p class="created-by-forum-section">
              Created by <span>${
                el.userId.name
              }</span> <span class="forum-card-separator">|</span> Created on <span>${formatDate(
          el.createdAt
        )}</span>
            </p>
          <button
            class="view-detail-btn-forum-section"
            value="${el._id}"
          >
            Visit forum
          </button>
        </div>
        <div class="forum-section-info-links">
          <p class="likes-forum-section">
            <i class="fa-solid fa-heart" title="Likes"></i>
            <span>${el.likes}</span>
          </p>
          <p class="members-forum-section">
            <i class="fa-solid fa-user" title="Members"></i>
            <span>${el.members}</span>
          </p>
          <i class="fa-solid fa-clipboard copy-forumId-to-clipboard" title="Copy Forum-id" data-forumid="${
            el._id
          }"></i>
        </div>
      </div>
`;
      });
      container.innerHTML = result;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchtop3ForumsC`);
  }
}

async function getForumBySearch(searchQuery) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/search",
      {
        method: "POST",
        body: JSON.stringify({ searchQuery, byAdmin: true }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".forum-main-search-list");
    let resultNumber = document.querySelector(".forum-main-results span");
    if (!!data && data.success == true) {
      forum_search_startPoint = data.nextStartPoint;
      data.forums.forEach((el) => {
        let isDeleted = el.active == true ? "" : "deletedForumMember";
        let highlightedName = el.name.replace(
          new RegExp(searchQuery, "gi"),
          (match) => `<span class="highlight">${match}</span>`
        );
        let highlightedDescription = el.description.replace(
          new RegExp(searchQuery, "gi"),
          (match) => `<span class="highlight">${match}</span>`
        );
        result += `
<div class="forum-card-forum-section ${isDeleted}">
                <h3 class="forum-name-forum-section">${highlightedName}</h3>
                <p class="forum-description-forum-section">${highlightedDescription}</p>
                <div class="forum-section-bottom">
                  <p class="created-by-forum-section">
                    Created by <span>${el.userId.name}</span>
                    <span class="forum-card-separator">|</span> Created on
                    <span>${formatDate(el.createdAt)}</span>
                  </p>
                  <button
                    class="view-detail-btn-forum-section"
                    value="${el._id}"
                  >
                  Visit forum
                  </button>
                </div>
                <div class="forum-section-info-links">
                  <p class="likes-forum-section">
                    <i class="fa-solid fa-heart" title="Likes"></i>
                    <span>${el.likes}</span> likes
                  </p>
                  <i class="fa-solid fa-clipboard copy-forumId-to-clipboard" title="Copy Forum-id" data-forumid="${
                    el._id
                  }"></i>
                </div>
              </div>
`;
      });
      container.innerHTML = result;
      container.scrollTop = 0;
      resultNumber.textContent = data.results;
    } else {
      resultNumber.textContent = 0;
      container.innerHTML = "No result found";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in getForumBySearchC`);
  }
}

async function viewForumDetails(target) {
  try {
    let _id = target.value;
    sessionStorage.setItem("currentForum", _id);
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/detail",
      {
        method: "POST",
        body: JSON.stringify({ _id, byAdmin: true }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      getForum = { ...data.forum };
      document.querySelector(".forum-m2-name").textContent = getForum.name;
      document.querySelector(".forum-m2-Description").textContent =
        getForum.description;
      forumMembers = data.members;
      fetchForumDetails(getForum);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in viewForumDetailsC`);
  }
}

async function deleteForum(password, forumId) {
  try {
    let message = document.querySelector(".message-admin-pass-confirm");
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/delete",
      {
        method: "POST",
        body: JSON.stringify({
          _id: forumId,
          password,
          userIdA: sessionStorage.getItem("user"),
          byAdmin: true,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      document.querySelector(".forum-main-panel-1").classList.remove("hide");
      document.querySelector(".forum-main-panel-2").classList.add("hide");
      document.querySelector(".top3-forums-display").classList.remove("hide");
      document
        .querySelector(".forum-main-search-container")
        .classList.add("hide");
      document.querySelector(".search-forum-main").value = "";
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.remove("deleteforum");
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      document.querySelector(".admin-confirm-pass-input").value = "";
    }
    message.textContent = data.message;
    message.classList.remove("hide");
    setTimeout(() => {
      message.classList.add("hide");
    }, 2500);
  } catch (error) {
    console.log(`Error: ${error.toString()} in deleteForumMainC`);
  }
}

async function editForum() {
  try {
    let data = {};
    let count = 0;
    let message = document.querySelector(".edit-forum-message");
    let editedName = document.querySelector(".edit-forum-name").value.trim();
    let editedDescription = document
      .querySelector(".edit-forum-description")
      .value.trim();
    let editedDepartment = document.querySelector(".edit-forum-dropdown").value;
    if (editedName != getForum.name) {
      count++;
      data.name = editedName;
    }
    if (editedDescription != getForum.description) {
      count++;
      data.description = editedDescription;
    }
    if (editedDepartment != getForum.departmentId._id) {
      count++;
      data.departmentId = editedDepartment;
    }
    if (count != 0) {
      editedForum = { ...data };
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.add("editforum");
      document.querySelector(".admin-confirm-pass-input").value = "";
      document.querySelector(".edit-forum").classList.add("hide");
    } else {
      message.classList.remove("hide");
      message.textContent = "Nothing changed";
      setTimeout(() => {
        message.classList.add("hide");
        document.querySelector(".edit-forum").classList.add("hide");
        document.querySelector(".blur").classList.add("hide");
      }, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in editForumC`);
  }
}

async function editForumMain(password) {
  try {
    let message = document.querySelector(".message-admin-pass-confirm");
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/update",
      {
        method: "POST",
        body: JSON.stringify({
          password,
          userIdA: sessionStorage.getItem("user"),
          byAdmin: true,
          _id: sessionStorage.getItem("currentForum"),
          ...editedForum,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      getForum = { ...data.updated_forum };
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.remove("editforum");
      document.querySelector(".forum-m2-name").textContent = getForum.name;
      document.querySelector(".forum-m2-Description").textContent =
        getForum.description;
      fetchForumDetails(getForum);
    }
    message.textContent = data.message;
    message.classList.remove("hide");
    setTimeout(() => {
      message.classList.add("hide");
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
    }, 2500);
  } catch (error) {
    console.log(`Error: ${error.toString()} in editForumMain`);
  }
}

function fetchForumDetails(forum) {
  try {
    let updatedAt =
      forum.updatedAt == null ? "Not updated yet" : formatDate(forum.updatedAt);
    document.querySelector(".details-of-forum-name").textContent = forum.name;
    document.querySelector(".details-of-forum-description").textContent =
      forum.description;
    document.querySelector(".details-of-forum-createdBy").textContent =
      forum.userId.name;
    document.querySelector(".details-of-forum-department").textContent =
      forum.departmentId.name;
    document.querySelector(".details-of-forum-createdOn").textContent =
      formatDate(forum.createdAt);
    document.querySelector(".details-of-forum-updatedOn").textContent =
      updatedAt;
    document.querySelector(".details-of-forum-members").textContent =
      forumMembers;
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchForumDetailsC`);
  }
}

function copyForumIdToClipboard(target) {
  try {
    const forumId = target.dataset.forumid;
    const tempInput = document.createElement("input");
    tempInput.value = forumId;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    showNotification("ForumID copied to clipboard.");
  } catch (error) {
    console.log(`Error: ${error.toString()} in copyForumIdToClipboardC`);
  }
}

// POSTS

async function deleteUserPost(target) {
  try {
    let postId = target.dataset.postid;
    let confirm = await showConfirmation("Do you want to delete this post?");
    if (confirm == true) {
      document.querySelector(".admin-confirm-pass-input").value = "";
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.add("deleteuserPost");
      document.querySelector(".admin-confirm-pass-button").value = postId;
      targetedDepratmentContainer = target.closest(".forum-post-template");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in deleteUserPostC`);
  }
}

async function deleteUserPostMain(password, postId) {
  try {
    let message = document.querySelector(".message-admin-pass-confirm");
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/post/delete",
      {
        method: "POST",
        body: JSON.stringify({
          postId,
          password,
          byAdmin: true,
          userIdA: sessionStorage.getItem("user"),
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.remove("deleteuserPost");
      targetedDepratmentContainer.remove();
      message.textContent = data.message;
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
        document
          .querySelector(".admin-confirm-pass-container")
          .classList.add("hide");
        document.querySelector(".blur").classList.add("hide");
      }, 2500);
    }
    message.textContent = data.message;
    message.classList.remove("hide");
    setTimeout(() => {
      message.classList.add("hide");
    }, 2500);
  } catch (error) {
    console.log(`Error: ${error.toString()} in deleteUserPostMainC`);
  }
}

async function fetchUserPosts() {
  try {
    let forumId = sessionStorage.getItem("currentForum");
    loader(1);

    let response = await fetch("https://opentalks.cyclic.app/admin/post/all", {
      method: "POST",
      body: JSON.stringify({ forumId }),
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".forum-m2-posts-container");
    if (!!data && data.success == true) {
      let posts = data.posts.reverse();
      posts.forEach((el) => {
        let isPostLiked = el.likes > 0 ? "fa-solid" : "fa-regular";
        if (el.active == true) {
          result += `
          <div class="forum-post-template">
          <h3 class="forum-post-title">${el.title}</h3>
          <p class="forum-post-description">${el.description}</p>
          <div class="forum-post-user-info-container">
            <div class="forum-post-date-time">
              <span class="forum-post-date"
                >${formatDate(el.createdAt)}</span
              >
            </div>
            <div class="forum-post-user-info">
              <img
                src="https://opentalks.cyclic.app${el.userId.image}"
                class="forum-post-main-user-profile"
              />
              <span class="forum-post-user-name">By ${el.userId.name}</span>
            </div>
          </div>
          <div class="forum-post-links-template-main">
            <i class="${isPostLiked} fa-heart forum-post-like" data-postid="${
            el._id
          }"></i>
            <i class="fa-solid fa-comment forum-post-user-comment" data-postid="${
              el._id
            }"></i>
            <i class="fa-solid fa-trash-can forum-post-delete" data-postid="${
              el._id
            }"></i>
            <i class="fa-solid fa-pen forum-post-edit" data-postid="${
              el._id
            }"></i>
          </div>
          </div>
          `;
        } else {
          result += `
          <div class="forum-post-template forum-post-deleted">
          <h3 class="forum-post-title">${el.title}</h3>
          <p class="forum-post-description">${el.description}</p>
          <div class="forum-post-user-info-container">
            <div class="forum-post-date-time">
              <span class="forum-post-date"
                >${formatDate(el.createdAt)}</span
              >
            </div>
            <div class="forum-post-user-info">
              <img
              src="https://opentalks.cyclic.app${el.userId.image}"
                class="forum-post-main-user-profile"
              />
              <span class="forum-post-user-name">By ${el.userId.name}</span>
            </div>
          </div>
          <div class="forum-post-links-template-main">
            <i class="${isPostLiked} fa-heart forum-post-like" data-postid="${
            el._id
          }"></i>
            <i class="fa-solid fa-comment forum-post-user-comment" data-postid="${
              el._id
            }"></i>
          </div>
          </div>
          `;
        }
      });
      forum_startPoint = data.nextStartPoint;
      container.innerHTML = result;
      container.scrollTop = container.scrollHeight;
    } else {
      container.innerHTML = "No post has been created yet.";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchUserPostsC`);
  }
}

async function fetchPostLikes(target) {
  try {
    let postId = target.dataset.postid;
    post_like_postid = postId;
    let container = document.querySelector(".post-like-list");
    document.querySelector(".post-likes-container").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    let result = "";
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/post/likes",
      {
        method: "POST",
        body: JSON.stringify({ postId, byAdmin: true }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      data.person.forEach((el) => {
        let isActive = el.active == true ? "" : "deletedLike";
        let isButton =
          el.active == true
            ? `<button class="post-like-unlike" value='{
          "userId": "${el.userId._id}",
          "forumId": "${el.forumId}",
          "postId": "${el.postId}"
        }'>Unlike</button>`
            : "";
        result += `
        <div class="post-like-template ${isActive}">
          <div class="post-like-profile">
            <img src="https://opentalks.cyclic.app${
              el.userId.image
            }" alt="User Profile" />
          </div>
          <div class="post-like-info">
            <span class="post-like-user">${el.userId.name}</span><br />
            <span class="post-like-date">Liked on ${formatDate(
              el.createdAt
            )}</span>
          </div>
          ${isButton}
        </div>
        `;
      });
      container.innerHTML = result;
      container.scrollTop = 0;
      post_likes_startPoint = data.nextStartPoint;
    } else {
      container.innerHTML = "No likes for this post";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchPostLikesC`);
  }
}

async function fetchPostLikesScroll() {
  try {
    let result = "";
    let container = document.querySelector(".post-like-list");
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/post/likes",
      {
        method: "POST",
        body: JSON.stringify({
          postId: post_like_postid,
          byAdmin: true,
          startPoint: post_likes_startPoint,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      data.person.forEach((el) => {
        let isActive = el.active == true ? "" : "deletedLike";
        let isButton =
          el.active == true
            ? `<button class="post-like-unlike" value='{
          "userId": "${el.userId._id}",
          "forumId": "${el.forumId}",
          "postId": "${el.postId}"
        }'>Unlike</button>`
            : "";
        result += `
        <div class="post-like-template ${isActive}">
          <div class="post-like-profile">
            <img src="https://opentalks.cyclic.app${
              el.userId.image
            }" alt="User Profile" />
          </div>
          <div class="post-like-info">
            <span class="post-like-user">${el.userId.name}</span><br />
            <span class="post-like-date">Liked on ${formatDate(
              el.createdAt
            )}</span>
          </div>
          ${isButton}
        </div>
        `;
      });
      let prevScrollHeight = container.scrollHeight;
      container.insertAdjacentHTML("beforeend", result);
      container.scrollTop = prevScrollHeight;
      post_likes_startPoint = data.nextStartPoint;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchPostLikesScrollC`);
  }
}

async function unlikeUserPost(target) {
  try {
    let containerMain = document.querySelector(".post-likes-container");
    containerMain.classList.add("hide");
    let confirm = await showConfirmation(
      "Do you want remove user from post like list?"
    );
    if (confirm == true) {
      document.querySelector(".admin-confirm-pass-input").value = "";
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.add("unlikeUserPost");
      document.querySelector(".admin-confirm-pass-button").value = target.value;
      targetedDepratmentContainer = target.closest(".post-like-template");
    } else {
      document.querySelector(".blur").classList.remove("hide");
      containerMain.classList.remove("hide");
    }
  } catch (error) {
    console.log(`Erro: ${error.toString()} in unlikeUserPostC`);
  }
}

async function unlikeUserPostMain(password, data1) {
  try {
    let query = JSON.parse(data1);
    let message = document.querySelector(".message-admin-pass-confirm");
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/post/unlike",
      {
        method: "POST",
        body: JSON.stringify({
          ...query,
          byAdmin: true,
          password,
          userIdA: sessionStorage.getItem("user"),
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      targetedDepratmentContainer.remove();
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.remove("unlikeUserPost");
      message.textContent = "User is removed from post like list";
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
        document
          .querySelector(".admin-confirm-pass-container")
          .classList.add("hide");
        document.querySelector(".blur").classList.add("hide");
      }, 2500);
    } else {
      message.textContent = data.message;
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in unlikeUserPostMainC`);
  }
}

function editForumPost(target) {
  try {
    let container = target.closest(".forum-post-template");
    let postTitlePrev = container.querySelector(".forum-post-title");
    let postDescriptionPrev = container.querySelector(
      ".forum-post-description"
    );
    document.querySelector(".post-title-input").value =
      postTitlePrev.textContent;
    document.querySelector(".post-description-input").value =
      postDescriptionPrev.textContent;
    document.querySelector(".post-edit-container").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    document.querySelector(".submit-edit-post").value = target.dataset.postid;
    targetedDepratmentContainer = container;
  } catch (error) {
    console.log(`Error: ${error.toString()} in editForumPostC`);
  }
}

async function editForumPostMain(password, data1) {
  try {
    let message = document.querySelector(".message-admin-pass-confirm");
    let postTitleCurrent = document
      .querySelector(".post-title-input")
      .value.trim();
    let postDescriptioCurrent = document
      .querySelector(".post-description-input")
      .value.trim();
    let query = JSON.parse(data1);
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/post/update",
      {
        method: "POST",
        body: JSON.stringify({
          ...query,
          password,
          userIdA: sessionStorage.getItem("user"),
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      if (
        targetedDepratmentContainer.classList.contains("forum-post-template")
      ) {
        targetedDepratmentContainer.querySelector(
          ".forum-post-title"
        ).textContent = postTitleCurrent;
        targetedDepratmentContainer.querySelector(
          ".forum-post-description"
        ).textContent = postDescriptioCurrent;
      }

      if (
        targetedDepratmentContainer.classList.contains("top10-post-template")
      ) {
        targetedDepratmentContainer.querySelector(
          ".top-10-post-title"
        ).textContent = postTitleCurrent;
        targetedDepratmentContainer.querySelector(
          ".top-10-post-description"
        ).textContent = postDescriptioCurrent;
      }

      document
        .querySelector(".admin-confirm-pass-button")
        .classList.remove("editForumPost");
      message.textContent = "Post has been updated";
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
        document
          .querySelector(".admin-confirm-pass-container")
          .classList.add("hide");
        document.querySelector(".blur").classList.add("hide");
      }, 2500);
    } else {
      message.textContent = data.message;
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in editForumPostMainC`);
  }
}

// POST REPLIES

async function fetchPostComments(target) {
  try {
    let postId = target.dataset.postid;
    document.querySelector(".post-reply-container").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/post/reply/all",
      {
        method: "POST",
        body: JSON.stringify({ postId, byAdmin: true }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let container = document.querySelector(".post-reply-list");
    let result = "";
    if (!!data && data.success == true) {
      data.replies.forEach((el) => {
        let isDeleted = el.active == false ? "deleted-post-reply-template" : "";
        if (el.active == true) {
          result += `
          <div class="post-reply-template">
          <div class="post-reply-info">
            <div class="post-reply-profile-pic">
              <img src="https://opentalks.cyclic.app${
                el.byWhom.image
              }" alt="user-profile-pic" />
              <div class="post-reply-template-inner">
                <p class="post-reply-user-name">${el.byWhom.name}</p>
                <p class="reply-profile-creation-date">${formatDate(
                  el.createdAt
                )}</p>
              </div>
            </div>
<div class="post-reply-links">
<i
class="fa-solid fa-trash-can post-reply-delete"
title="Delete reply"
data-replyid="${el._id}"
></i>
<i class="fa-solid fa-pen post-reply-update" title="Edit reply" data-replyid="${
            el._id
          }"></i>
</div>
          </div>
          <p class="post-reply-message">${el.message}</p>
        </div>
          `;
        } else {
          result += `<div class="post-reply-template ${isDeleted}">
          <div class="post-reply-info">
            <div class="post-reply-profile-pic">
              <img src="https://opentalks.cyclic.app${
                el.byWhom.image
              }" alt="user-profile-pic" />
              <div class="post-reply-template-inner">
                <p class="post-reply-user-name">${el.byWhom.name}</p>
                <p class="reply-profile-creation-date">${formatDate(
                  el.createdAt
                )}</p>
              </div>
            </div>
            <div class="post-reply-links">
            <i class="fa-solid fa-rotate-right post-reply-reactive" title="Reactive reply" data-replyid="${
              el._id
            }"></i>
            </div>
          </div>
          <p class="post-reply-message">${el.message}</p>
        </div>`;
        }
      });
      container.innerHTML = result;
    } else {
      container.innerHTML = "No reply found";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchPostCommentsC`);
  }
}

async function deleteReply(target) {
  try {
    let replyId = target.dataset.replyid;
    document.querySelector(".post-reply-container").classList.add("hide");
    let confirm = await showConfirmation("Do you want to delete this reply?");
    if (confirm == true) {
      document.querySelector(".admin-confirm-pass-input").value = "";
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.add("deletePostReply");
      document.querySelector(".admin-confirm-pass-button").value = replyId;
      targetedDepratmentContainer = target.closest(".post-reply-template");
    } else {
      document.querySelector(".post-reply-container").classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in deleteReplyC`);
  }
}

async function deleteReplyMain(password, replyId) {
  try {
    let message = document.querySelector(".message-admin-pass-confirm");
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/post/reply/delete",
      {
        method: "POST",
        body: JSON.stringify({
          userIdA: sessionStorage.getItem("user"),
          password,
          _id: replyId,

          byAdmin: true,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      message.textContent = "Reply deleted";
      message.classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.remove("deletePostReply");
      setTimeout(() => {
        message.classList.add("hide");
        document
          .querySelector(".admin-confirm-pass-container")
          .classList.add("hide");
        document.querySelector(".blur").classList.add("hide");
      }, 2500);
    } else {
      message.textContent = data.message;
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in deletePostReplyC`);
  }
}

async function reActivateReply(target) {
  try {
    let replyId = target.dataset.replyid;
    document.querySelector(".post-reply-container").classList.add("hide");
    let confirm = await showConfirmation("Do you want to reactive this reply?");
    if (confirm == true) {
      document.querySelector(".admin-confirm-pass-input").value = "";
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.add("reactivateReply");
      document.querySelector(".admin-confirm-pass-button").value = replyId;
    } else {
      document.querySelector(".post-reply-container").classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in reActivateReplyC`);
  }
}

async function reActivateReplyMain(password, replyId) {
  try {
    let message = document.querySelector(".message-admin-pass-confirm");
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/post/reply/activate",
      {
        method: "POST",
        body: JSON.stringify({
          userIdA: sessionStorage.getItem("user"),
          password,
          _id: replyId,
          byAdmin: true,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      message.textContent = "Reply activated";
      message.classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.remove("reactivateReply");
      setTimeout(() => {
        message.classList.add("hide");
        document
          .querySelector(".admin-confirm-pass-container")
          .classList.add("hide");
        document.querySelector(".blur").classList.add("hide");
      }, 2500);
    } else {
      message.textContent = data.message;
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in reActivateReplyMainC`);
  }
}

function editReply(target) {
  try {
    let container = target.closest(".post-reply-template");
    let prevMessage = container.querySelector(
      ".post-reply-message"
    ).textContent;
    document.querySelector(".post-reply-container").classList.add("hide");
    document.querySelector(".post-reply-edit").classList.remove("hide");
    document.querySelector(".post-reply-edit-btn").value = JSON.stringify({
      _id: target.dataset.replyid,
      prevMessage,
    });
    document.querySelector(".post-reply-edit-input").value = prevMessage;
  } catch (error) {
    console.log(`Error: ${error.toString()} in editReplyC`);
  }
}

async function editReplyMain(password, data1) {
  try {
    let adminMessage = document.querySelector(".message-admin-pass-confirm");
    let { message, _id } = JSON.parse(data1);
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/post/reply/update",
      {
        method: "POST",
        body: JSON.stringify({
          userIdA: sessionStorage.getItem("user"),
          password,
          _id,
          byAdmin: true,
          message,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      adminMessage.textContent = "Reply updated";
      adminMessage.classList.remove("hide");
      setTimeout(() => {
        adminMessage.classList.add("hide");
        document
          .querySelector(".admin-confirm-pass-container")
          .classList.add("hide");
        document.querySelector(".blur").classList.add("hide");
      }, 2500);
    } else {
      adminMessage.classList.remove("hide");
      adminMessage.textContent = data.message;
      setTimeout(() => {
        adminMessage.classList.add("hide");
      }, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in editReplyMain1C`);
  }
}

// FORUM JOIN REQUESTS
async function fetchMemberJoinRequests() {
  try {
    let query = {
      userId: sessionStorage.getItem("user"),
      forumId: sessionStorage.getItem("currentForum"),
      byAdmin: true,
    };
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/join/list",
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

    let result = "";
    let container = document.querySelector(".forum-member-join-list-main");
    if (!!data && data.results != 0) {
      data.join_request_list.forEach(function (el) {
        let btnData = {
          userId: el.userId._id,
          requestId: el._id,
        };
        result += `
      <div class="forum-member-join-list-template">
          <div class="forum-member-join-info">
            <img
              src="https://opentalks.cyclic.app${el.userId.image}"
              class="forum-member-join-user-pic"
              alt="user-pic"
            />
            <div class="forum-member-join-inner-wrap">
              <p class="forum-member-join-user-name">${el.userId.name}</p>
              <p class="forum-member-join-date">${formatDate(el.createdAt)}</p>
            </div>
          </div>
          <div class="forum-member-join-list-btns">
            <button class="forum-member-join-accept-btn member-join-request" value='${JSON.stringify(
              { ...btnData, status: "accepted" }
            )}'>Accept</button>
            <button class="forum-member-join-reject-btn member-join-request" value='${JSON.stringify(
              { ...btnData, status: "rejected" }
            )}'>Reject</button>
          </div>
        </div>
      `;
      });
      container.innerHTML = result;
    } else {
      container.innerHTML = "No new request";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchMemberJoinRequestsC`);
  }
}

async function respondeMemberRequestForum(data1, target) {
  try {
    document.querySelector(".forum-member-join-list").classList.add("hide");
    document.querySelector(".admin-confirm-pass-input").value = "";
    document
      .querySelector(".admin-confirm-pass-container")
      .classList.remove("hide");
    document
      .querySelector(".admin-confirm-pass-button")
      .classList.add("respondeToMemberRequestForum");
    document.querySelector(".admin-confirm-pass-button").value =
      JSON.stringify(data1);
    targetedDepratmentContainer = target;
  } catch (error) {
    console.log()`Error: ${error.toString()} in acceptMemberRequestForumC`;
  }
}

async function respondeMemberRequestForumMain(password, data1) {
  try {
    let message = document.querySelector(".message-admin-pass-confirm");
    query = {
      password,
      byAdmin: true,
      ...data1,
      userIdA: sessionStorage.getItem("user"),
      forumId: sessionStorage.getItem("currentForum"),
    };
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/join",
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
      message.textContent = data.message;
      message.classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.remove("respondeToMemberRequestForum");
      setTimeout(() => {
        message.classList.add("hide");
        document
          .querySelector(".admin-confirm-pass-container")
          .classList.add("hide");
        document.querySelector(".blur").classList.add("hide");
      }, 2500);
    } else {
      message.textContent = data.message;
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    }
  } catch (error) {
    console.log(
      `Error: ${error.toString()} in respondeMemberRequestForumMainC`
    );
  }
}

// FORUM MEMBERS

async function getForumMembers() {
  try {
    let forumId = sessionStorage.getItem("currentForum");
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/members",
      {
        method: "POST",
        body: JSON.stringify({ forumId, byAdmin: true }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let container = document.querySelector(".forum-member-table-container");
    let result = "";
    if (!!data && data.success == true) {
      data.joined_forums.forEach((el, i) => {
        if (el.active == true) {
          result += `<div class="forum-member-template">
        <div class="forum-member-top">
          <img src="https://opentalks.cyclic.app${
            el.userId.image
          }" alt="user-image" />
          <p class="forum-member-user-info">
            ${el.userId.name} <span>(${el.userId.registration_number})</span>
          </p>
        </div>
        <div class="forum-member-bottom">
          <p class="forum-member-joinedOn">${formatDate(el.createdAt)}</p>
          <button class="forum-member-remove-user" value="${
            el.userId._id
          }">Remove user</button>
        </div>
      </div>`;
        } else {
          result += `
<div class="forum-member-template deletedForumMember">
        <div class="forum-member-top">
          <img src="https://opentalks.cyclic.app${
            el.userId.image
          }" alt="user-image" />
          <p class="forum-member-user-info">
            ${el.userId.name} <span>(${el.userId.registration_number})</span>
          </p>
        </div>
        <div class="forum-member-bottom">
          <p class="forum-member-joinedOn">${formatDate(el.createdAt)}</p>
        </div>
      </div>`;
        }
      });
      container.innerHTML = result;
      container.scrollTop = 0;
    } else {
      container.innerHTML = "No user joined this forum yet";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in getForumMembersC`);
  }
}

async function deleteForumMember(target) {
  try {
    let userId = target.value;
    document.querySelector(".forum-members-container").classList.add("hide");
    let confirm = await showConfirmation("Do you want to remove this user?");
    if (confirm == true) {
      document.querySelector(".admin-confirm-pass-input").value = "";
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.add("removeForumUser");
      document.querySelector(".admin-confirm-pass-button").value = userId;
      targetedDepratmentContainer = target.closest(".forum-member-template");
    } else {
      document
        .querySelector(".forum-members-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in deleteForumMemberMainC`);
  }
}

async function deleteForumMemberMain(password, userId) {
  try {
    let message = document.querySelector(".message-admin-pass-confirm");
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/member/delete",
      {
        method: "POST",
        body: JSON.stringify({
          user: userId,
          forumId: sessionStorage.getItem("currentForum"),
          password,
          userIdA: sessionStorage.getItem("user"),
          byAdmin: true,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );

    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      targetedDepratmentContainer.remove();
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.remove("removeForumUser");
      message.textContent = "User removed successfully";
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
        document
          .querySelector(".admin-confirm-pass-container")
          .classList.add("hide");
        document.querySelector(".blur").classList.add("hide");
      }, 2500);
    } else {
      message.textContent = data.message;
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in deleteForumMemberMainC`);
  }
}

async function fetchSearchedForumMembers() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/member/search",
      {
        method: "POST",
        body: JSON.stringify({
          forumId: sessionStorage.getItem("currentForum"),
          searchInput: forum_member_search,
          byAdmin: true,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".forum-member-table-container");
    if (!!data && data.success == true) {
      data.results.forEach((el) => {
        let searchRegex = new RegExp(forum_member_search.trim(), "gi");
        let highlightedName = el.userId.name.replace(
          searchRegex,
          (match) => `<span class="highlight">${match}</span>`
        );

        if (el.active == true) {
          result += `<div class="forum-member-template">
        <div class="forum-member-top">
          <img src="https://opentalks.cyclic.app${
            el.userId.image
          }" alt="user-image" />
          <p class="forum-member-user-info">
            ${highlightedName} <span>(${el.userId.registration_number})</span>
          </p>
        </div>
        <div class="forum-member-bottom">
          <p class="forum-member-joinedOn">${formatDate(el.createdAt)}</p>
          <button class="forum-member-remove-user" value="${
            el.userId._id
          }">Remove user</button>
        </div>
      </div>`;
        } else {
          result += `
<div class="forum-member-template deletedForumMember">
        <div class="forum-member-top">
          <img src="https://opentalks.cyclic.app${
            el.userId.image
          }" alt="user-image" />
          <p class="forum-member-user-info">
            ${highlightedName} <span>(${el.userId.registration_number})</span>
          </p>
        </div>
        <div class="forum-member-bottom">
          <p class="forum-member-joinedOn">${formatDate(el.createdAt)}</p>
        </div>
      </div>`;
        }
      });

      container.innerHTML = result;
      container.scrollTop = 0;
      search_members_startPoint = data.nextStartPoint;
    } else {
      container.innerHTML = "No such user found";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchSearchedForumMembersC`);
  }
}

async function fetchForumMemberScroll() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/member/search",
      {
        method: "POST",
        body: JSON.stringify({
          forumId: sessionStorage.getItem("currentForum"),
          searchInput: forum_member_search,
          startPoint: search_members_startPoint,
          byAdmin: true,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".forum-member-table-container");
    if (!!data && data.success == true) {
      data.results.forEach((el) => {
        let searchRegex = new RegExp(forum_member_search.trim(), "gi");
        let highlightedName = el.userId.name.replace(
          searchRegex,
          (match) => `<span class="highlight">${match}</span>`
        );

        if (el.active == true) {
          result += `<div class="forum-member-template">
        <div class="forum-member-top">
          <img src="https://opentalks.cyclic.app${
            el.userId.image
          }" alt="user-image" />
          <p class="forum-member-user-info">
            ${highlightedName} <span>(${el.userId.registration_number})</span>
          </p>
        </div>
        <div class="forum-member-bottom">
          <p class="forum-member-joinedOn">${formatDate(el.createdAt)}</p>
          <button class="forum-member-remove-user" value="${
            el.userId._id
          }">Remove user</button>
        </div>
      </div>`;
        } else {
          result += `
<div class="forum-member-template deletedForumMember">
        <div class="forum-member-top">
          <img src="https://opentalks.cyclic.app${
            el.userId.image
          }" alt="user-image" />
          <p class="forum-member-user-info">
            ${highlightedName} <span>(${el.userId.registration_number})</span>
          </p>
        </div>
        <div class="forum-member-bottom">
          <p class="forum-member-joinedOn">${formatDate(el.createdAt)}</p>
        </div>
      </div>`;
        }
      });
      let prevScrollHeight = container.scrollHeight;
      container.insertAdjacentHTML("beforeend", result);
      container.scrollTop = prevScrollHeight;
      search_members_startPoint = data.nextStartPoint;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchForumMemberScrollC`);
  }
}

async function addForumMemberMain(password, data1) {
  try {
    let message = document.querySelector(".message-admin-pass-confirm");
    let { registration_number, forumId } = JSON.parse(data1);
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/member/add",
      {
        method: "POST",
        body: JSON.stringify({
          registration_number: Number(registration_number),
          forumId,
          password,
          userIdA: sessionStorage.getItem("user"),
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );

    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.remove("add-fourm-member");
      message.textContent = "User added successfully";
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
        document
          .querySelector(".admin-confirm-pass-container")
          .classList.add("hide");
        document.querySelector(".blur").classList.add("hide");
      }, 2500);
    } else {
      message.textContent = data.message;
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in addForumMemberMainC`);
  }
}

// FORUM COMPLAINTS
async function fetchForumComplaint() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/complaints",
      {
        method: "POST",
        body: JSON.stringify({
          forumId: sessionStorage.getItem("currentForum"),
          byAdmin: true,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".forum-complaints-main");
    if (!!data && data.success == true && data.complaints.length != 0) {
      data.complaints.forEach((el) => {
        let btnData = JSON.stringify({
          userId: el.userId._id,
          complaintId: el._id,
        });
        let isResponded =
          el.isResponded == true
            ? `<button class="forum-complaint-responses-btn" value='${btnData}'>Responses</button>`
            : "";
        let isActive = el.active == true ? "" : "deletedComplaint";
        result += `
  <div class="forum-complaints-template ${isActive}">
  <div class="forum-complaint-template-top">
    <p class="forum-complaint-id">${el.complaint_number}</p>
    ${isResponded}
  </div>
  <p class="forum-complaint-message highlight">${el.complaint}</p>
  <div class="forum-complaint-info">
    <div>
      By <img src="https://opentalks.cyclic.app${
        el.userId.image
      }" alt="user-image" />${el.userId.name}
    </div>
    <span> /</span>
    <div>On ${formatDate(el.createdAt)}</div>
  </div>
</div>
  `;
      });
      container.innerHTML = result;
      container.scrollTop = 0;
      complaint_startPoint = data.nextStartPoint;
    } else {
      container.innerHTML = "No complaints yet";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchForumComplaintC`);
  }
}

async function fetchForumComplaintScroll() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/complaints",
      {
        method: "POST",
        body: JSON.stringify({
          forumId: sessionStorage.getItem("currentForum"),
          startPoint: complaint_startPoint,
          byAdmin: true,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".forum-complaints-main");
    if (!!data && data.success == true && data.complaints.length != 0) {
      data.complaints.forEach((el) => {
        let btnData = JSON.stringify({
          userId: el.userId._id,
          complaintId: el._id,
        });
        let isResponded =
          el.isResponded == true
            ? `<button class="forum-complaint-responses-btn" value='${btnData}'>Responses</button>`
            : "";
        let isActive = el.active == true ? "" : "deletedComplaint";
        result += `
  <div class="forum-complaints-template ${isActive}">
  <div class="forum-complaint-template-top">
    <p class="forum-complaint-id">${el.complaint_number}</p>
    ${isResponded}
  </div>
  <p class="forum-complaint-message highlight">${el.complaint}</p>
  <div class="forum-complaint-info">
    <div>
      By <img src="https://opentalks.cyclic.app${
        el.userId.image
      }" alt="user-image" />${el.userId.name}
    </div>
    <span> /</span>
    <div>On ${formatDate(el.createdAt)}</div>
  </div>
</div>
  `;
      });
      let prevScrollHeight = container.scrollHeight;
      container.insertAdjacentHTML("beforeend", result);
      container.scrollTop = prevScrollHeight;
      complaint_startPoint = data.nextStartPoint;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchForumComplaintScroll`);
  }
}

async function responsesToForumCompalints(btnData, target) {
  try {
    let userId = btnData.userId;
    let complaintID = btnData.complaintId;
    let forumId = sessionStorage.getItem("currentForum");
    let complaintId = `Responses of ${
      target
        .closest(".forum-complaints-template")
        .querySelector(".forum-complaint-id").textContent
    }`;
    document.querySelector(".forum-response-top h2").textContent = complaintId;
    document.querySelector(".forum-complaints-container").classList.add("hide");
    document
      .querySelector(".forum-response-container")
      .classList.remove("hide");
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/responses",
      {
        method: "POST",
        body: JSON.stringify({
          forumId,
          byAdmin: true,
          userId,
          complaintId: complaintID,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".forum-response-main");
    if (!!data && data.success == true) {
      data.responses.forEach(function (el) {
        let isDeleted = el.active == true ? "" : "forumComplaintDeleted";
        result += `
        <div class="forum-response-template ${isDeleted}">
          <div class="forum-response-message highlight">${el.response}</div>
          <div class="forum-response-date">On ${formatDate(el.createdAt)}</div>
        </div>
        `;
      });
      container.innerHTML = result;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in responsesToForumCompalintsC`);
  }
}

// FORUM CREATE POST

async function createForumMemberPost(data) {
  try {
    document.querySelector(".post-editor-container").classList.add("hide");
    let confirm = await showConfirmation("Do you want to post to this forum?");
    if (confirm == true) {
      document.querySelector(".admin-confirm-pass-input").value = "";
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.add("addForumPost");
      document.querySelector(".admin-confirm-pass-button").value =
        JSON.stringify(data);
    } else {
      document.querySelector(".post-editor-container").classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in createForumMemberPostC`);
  }
}

async function createForumMemberPostMain(password, data1) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin//post/add/main",
      {
        method: "POST",
        body: JSON.stringify({
          ...data1,
          password,
          userIdA: sessionStorage.getItem("user"),
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.remove("addForumPost");
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      await fetchUserPosts();
      showNotification("Post added successfully.", 2500);
    } else {
      showNotification(data.message, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in createForumMemberPostMainC`);
  }
}

// ADD NEW FORUM
async function addNewForum(password, data1) {
  try {
    let message = document.querySelector(".message-admin-pass-confirm");
    let query = {
      ...data1,
      password,
      userIdA: sessionStorage.getItem("user"),
    };
    loader(1);

    let response = await fetch("https://opentalks.cyclic.app/admin/forum/add", {
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
      message.textContent = "Forum created successfuly";
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
        document
          .querySelector(".admin-confirm-pass-button")
          .classList.remove("addNewForum");
        document
          .querySelector(".admin-confirm-pass-container")
          .classList.add("hide");
        document.querySelector(".blur").classList.add("hide");
      }, 2500);
    } else {
      message.textContent = data.message;
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in addNewForumC`);
  }
}

// POST SECTION => POSTS
async function fetchTop10Posts() {
  try {
    loader(1);

    let response = await fetch("https://opentalks.cyclic.app/admin/post/top", {
      method: "POST",
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".top-10-posts-list");
    if (!!data && data.success == true) {
      data.topPosts.forEach((el) => {
        let isUpdated =
          el.updatedAt == null ? "Not updated yet" : formatDate(el.updatedAt);
        let isLiked = el.likes > 0 ? "fa-solid" : "fa-regular";
        result += `
        <div class="top10-post-template">
        <h3 class="top-10-post-title">${el.title}</h3>
        <div class="top-10-post-user-info">
          <div class="top-10-post-info">
            <p class="top-10-post-description">${el.description}</p>
            <div class="top-10-forum-name">
              <span class="top-10-forum-label">Forum: </span
              >${el.forumId.name}
            </div>
          </div>
          <div class="top-10-post-user-info-main">
            <img
              src="https://opentalks.cyclic.app${el.userId.image}"
              alt="user-profile-pic"
              class="top-10-post-user-profile"
            />
            <div class="top-10-post-user-details">
              <p class="top-10-post-user-name">${el.userId.name}</p>
              <p class="top-10-post-date">
                Created at: ${formatDate(el.createdAt)}
              </p>
              <p class="top-10-post-date">
                Updated at: ${isUpdated}
              </p>
            </div>
          </div>
        </div>
        <div class="top-10-post-links">
        <p class="top10-post-likes">${el.likes} <i
            class="${isLiked} fa-heart likes-post-top10"
            title="Post likes"
            data-postid="${el._id}"
          ></i>
        </p>
          <i
            class="fa-solid fa-comment reply-post-top10"
            title="Post Replies"
            data-postid="${el._id}"
          ></i>

          <i
            class="fa-solid fa-pencil edit-post-top10"
            title="Edit post"
            data-postid="${el._id}"
          ></i>
          <i
            class="fa-solid fa-trash-can delete-post-top10"
            title="Delete post"
            data-postid="${el._id}"
          ></i>
        </div>
      </div>
        `;
      });

      container.innerHTML = result;
    } else {
      container.innerHTML = "No post created yet";
    }
  } catch (error) {
    console.log(`Error: ${error.toString} in fetchTop10PostsC`);
  }
}

async function deleteUserPost_postSection(target) {
  try {
    let postId = target.dataset.postid;
    let confirm = await showConfirmation("Do you want to delete this post?");
    if (confirm == true) {
      document.querySelector(".admin-confirm-pass-input").value = "";
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.add("deleteuserPost");
      document.querySelector(".admin-confirm-pass-button").value = postId;
      targetedDepratmentContainer = target.closest(".top10-post-template");
    } else {
      document.querySelector(".blur").classList.add("hide");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in deleteUserPost_postSectionC`);
  }
}

async function editUserPost_postSection(target) {
  try {
    let container = target.closest(".top10-post-template");
    let postTitlePrev = container.querySelector(".top-10-post-title");
    let postDescriptionPrev = container.querySelector(
      ".top-10-post-description"
    );
    document.querySelector(".post-title-input").value =
      postTitlePrev.textContent;
    document.querySelector(".post-description-input").value =
      postDescriptionPrev.textContent;
    document.querySelector(".post-edit-container").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    document.querySelector(".submit-edit-post").value = target.dataset.postid;
    targetedDepratmentContainer = container;
  } catch (error) {
    console.log(`Error: ${error.toString()} in editUserPost_postSectionC`);
  }
}

async function searchPost(search) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/post/search",
      {
        method: "POST",
        body: JSON.stringify({ search: search.trim() }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".post-main-search-list");
    let resultsC = document.querySelector(".post-main-results span");
    if (!!data && data.success == true) {
      post_startPoint = data.nextStartPoint;
      resultsC.textContent = data.results;
      container.scrollTop = 0;
      data.posts.forEach((el) => {
        let isUpdated =
          el.updatedAt == null ? "Not updated yet" : formatDate(el.updatedAt);
        let isLiked = el.likes > 0 ? "fa-solid" : "fa-regular";
        let isDeleted = el.active == true ? "" : "deletedPost";
        let ifDeleted =
          el.active == true
            ? `<i
        class="fa-solid fa-trash-can delete-post-top10"
        title="Delete post"
        data-postid="${el._id}"
      ></i>`
            : "";
        let highlightedTitle = el.title.replace(
          new RegExp(search.trim(), "gi"),
          (match) => `<span class="highlight">${match}</span>`
        );
        // let highlightedDescription = el.description.replace(
        //   new RegExp(search.trim(), "gi"),
        //   (match) => `<span class="highlight">${match}</span>`
        // );
        result += `
  <div class="top10-post-template ${isDeleted}">
  <h3 class="top-10-post-title">${highlightedTitle}</h3>
  <div class="top-10-post-user-info">
    <div class="top-10-post-info">
      <p class="top-10-post-description">${el.description}</p>
      <div class="top-10-forum-name">
        <span class="top-10-forum-label">Forum: </span
        >${el.forumId.name}
      </div>
    </div>
    <div class="top-10-post-user-info-main">
      <img
        src="https://opentalks.cyclic.app${el.userId.image}"
        alt="user-profile-pic"
        class="top-10-post-user-profile"
      />
      <div class="top-10-post-user-details">
        <p class="top-10-post-user-name">${el.userId.name}</p>
        <p class="top-10-post-date">
          Created at: ${formatDate(el.createdAt)}
        </p>
        <p class="top-10-post-date">
          Updated at: ${isUpdated}
        </p>
      </div>
    </div>
  </div>
  <div class="top-10-post-links">
  <p class="top10-post-likes">${el.likes} <i
      class="${isLiked} fa-heart likes-post-top10"
      title="Post likes"
      data-postid="${el._id}"
    ></i>
  </p>
    <i
      class="fa-solid fa-comment reply-post-top10"
      title="Post Replies"
      data-postid="${el._id}"
    ></i>

    <i
      class="fa-solid fa-pencil edit-post-top10"
      title="Edit post"
      data-postid="${el._id}"
    ></i>
    ${ifDeleted}
  </div>
</div>
  
  `;
      });
      container.innerHTML = result;
    } else {
      resultsC.textContent = "0";
      container.innerHTML = "No result found";
    }
  } catch (error) {
    console.log(`Error" ${error.toString()} in searchPostC`);
  }
}

async function postSearchWithFilter(filter) {
  try {
    let message = document.querySelector(".message-post-filter");
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/post/search",
      {
        method: "POST",
        body: JSON.stringify({ filter, isFilter: true }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".post-main-search-list");
    let resultsC = document.querySelector(".post-main-results span");
    if (!!data && data.success == true) {
      document.querySelector(".post-filter-container").classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      document.querySelector(".top10-posts-display").classList.add("hide");
      document
        .querySelector(".post-main-search-container")
        .classList.remove("hide");
      post_startPoint = data.nextStartPoint;
      resultsC.textContent = data.results;
      container.scrollTop = 0;
      data.posts.forEach((el) => {
        let isUpdated =
          el.updatedAt == null ? "Not updated yet" : formatDate(el.updatedAt);
        let isLiked = el.likes > 0 ? "fa-solid" : "fa-regular";
        let isDeleted = el.active == true ? "" : "deletedPost";
        let ifDeleted =
          el.active == true
            ? `<i
        class="fa-solid fa-trash-can delete-post-top10"
        title="Delete post"
        data-postid="${el._id}"
      ></i>`
            : "";
        result += `
  <div class="top10-post-template ${isDeleted}">
  <h3 class="top-10-post-title">${el.title}</h3>
  <div class="top-10-post-user-info">
    <div class="top-10-post-info">
      <p class="top-10-post-description">${el.description}</p>
      <div class="top-10-forum-name">
        <span class="top-10-forum-label">Forum: </span
        >${el.forumId.name}
      </div>
    </div>
    <div class="top-10-post-user-info-main">
      <img
        src="https://opentalks.cyclic.app${el.userId.image}"
        alt="user-profile-pic"
        class="top-10-post-user-profile"
      />
      <div class="top-10-post-user-details">
        <p class="top-10-post-user-name">${el.userId.name}</p>
        <p class="top-10-post-date">
          Created at: ${formatDate(el.createdAt)}
        </p>
        <p class="top-10-post-date">
          Updated at: ${isUpdated}
        </p>
      </div>
    </div>
  </div>
  <div class="top-10-post-links">
  <p class="top10-post-likes">${el.likes} <i
      class="${isLiked} fa-heart likes-post-top10"
      title="Post likes"
      data-postid="${el._id}"
    ></i>
  </p>
    <i
      class="fa-solid fa-comment reply-post-top10"
      title="Post Replies"
      data-postid="${el._id}"
    ></i>

    <i
      class="fa-solid fa-pencil edit-post-top10"
      title="Edit post"
      data-postid="${el._id}"
    ></i>
    ${ifDeleted}
  </div>
</div>
  
  `;
      });
      container.innerHTML = result;
    } else {
      message.textContent = data.message;
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in postSearchWithFilterC`);
  }
}

async function addPost_postSection(data1) {
  try {
    document
      .querySelector(".add-post-postSection-container")
      .classList.add("hide");
    let confirm = await showConfirmation("Do you want to add this post?");
    if (confirm == true) {
      document.querySelector(".admin-confirm-pass-input").value = "";
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.add("addUserPost_postSection");
      document.querySelector(".admin-confirm-pass-button").value =
        JSON.stringify(data1);
    } else {
      document
        .querySelector(".add-post-postSection-container")
        .classList.remove("hide");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in addPost_postSectionC`);
  }
}

async function addPost_postSectionMain(password, data1) {
  try {
    let message = document.querySelector(".message-admin-pass-confirm");
    let query = { password, ...data1, userIdA: sessionStorage.getItem("user") };
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/post/add/main",
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
      message.textContent = "Post added in the forum";
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.remove("addUserPost_postSection");
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
        document
          .querySelector(".admin-confirm-pass-container")
          .classList.add("hide");
        document.querySelector(".blur").classList.add("hide");
      }, 2500);
    } else {
      message.textContent = data.message;
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in addPost_postSectionMainC`);
  }
}

// USER SECTION

async function fetchRecent5Users() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/user/recent",
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
    let container = document.querySelector(".recent-user-list");
    if (!!data && data.success == true) {
      data.users.forEach((el) => {
        let isDeleted = el.active == true ? "" : "deletedUser";
        let updatedAt =
          el.updatedAt != null ? formatDate(el.updatedAt) : "Not updated yet";
        let isAdmin = el.admin == true ? "isAdmin" : "";
        let lastLogin =
          el.lastLogin == null ? "No logined yet" : formatDate(el.lastLogin);
        let ifAdmin =
          el.admin == true
            ? ""
            : `
        <i class="fa-solid fa-pencil edit-user-main-panel1" title="Edit user" data-userid="${el._id}"></i>
        `;
        result += `
        <div class="recent-user-template ${isDeleted} ${isAdmin}">
        <div class="recent-user-profile">
          <img
            src="https://opentalks.cyclic.app${el.image}"
            alt="User Profile Pic"
            class="recent-user-profile-pic"
          />
        </div>
        <div class="recent-user-details">
          <h3 class="recent-user-name">${el.name}</h3>
          <p class="recent-user-registration">
            <span> Registration No: </span
            ><span class="data"> ${el.registration_number}</span>
          </p>
          <p class="recent-user-email">
            <span> Email: </span>
            <span class="data">${el.email}</span>
          </p>
          <p class="recent-user-department">
            <span>Department: </span>
            <span class="data">${el.departmentId.name}</span>
          </p>
          <div class="recent-user-imp-dates">
            <p class="recent-user-created-at">
              <span>Joined Opentalks:</span>
              <span class="data">${formatDate(el.createdAt)}</span>
            </p>
            <p>/</p>
            <p class="recent-user-updated-at">
              <span>Last Updated: </span>
              <span class="data">${updatedAt}</span>
            </p>
            <p>/</p>
            <p class="recent-user-last-login">
            <span>Last Login: </span>
            <span class="data">${lastLogin}</span>
          </p>
          </div>
        </div>
        <div class="recent-user-links-btn">
        ${ifAdmin}
        </div>
      </div>
        `;
      });
      container.innerHTML = result;
    } else {
      container.innerHTML = "No user added yet";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchRecent5UsersC`);
  }
}

async function addUser(password, data1) {
  try {
    let query = { data1, password, userIdA: sessionStorage.getItem("user") };
    let message = document.querySelector(".message-admin-pass-confirm");
    loader(1);

    let response = await fetch("https://opentalks.cyclic.app/admin/user/add", {
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
      message.textContent = "User created";
      message.classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.remove("addNewUser");
      setTimeout(() => {
        document
          .querySelector(".admin-confirm-pass-container")
          .classList.add("hide");
        document.querySelector(".blur").classList.add("hide");
        message.classList.add("hide");
      }, 2500);
    } else {
      message.textContent = data.message;
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in addUserC`);
  }
}

function resetEditUserBox() {
  try {
    document.querySelectorAll(".edit-user-main section").forEach((el) => {
      el.classList.add("hide");
    });
    document.querySelectorAll(".edit-user-sub-containers p").forEach((el) => {
      el.classList.remove("active-edit-user-sub");
      document
        .querySelector(`.${el.classList.value}-main`)
        .classList.add("hide");
    });
    document
      .querySelector(".edit-user-details")
      .classList.add("active-edit-user-sub");
    document.querySelector(".edit-user-details-main").classList.remove("hide");

    // RESET VALUES OF PASSWORD TAB
    document.querySelector(".edit-user-new-password").value = "";
    document.querySelector(".edit-user-confirm-password").value = "";

    document.querySelector(".edit-user-pic-label").textContent =
      "Click to Upload New Profile Pic";
  } catch (error) {
    console.log(`Error: ${error.toString()} in resetEditUserBoxC`);
  }
}

async function editUser(userId) {
  try {
    resetEditUserBox();
    document.querySelector(".edit-user-container").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    let departmentList = document.querySelector(
      ".edit-user-details-department"
    );
    loader(1);

    let response1 = fetch("https://opentalks.cyclic.app/admin/user/detail", {
      method: "POST",
      body: JSON.stringify({ userId }),
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    let response2 = fetch("https://opentalks.cyclic.app/admin/department/all", {
      method: "POST",
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    let data = await Promise.all([response1, response2]);
    let data1 = await data[0].json();
    let data2 = await data[1].json();
    loader(0);

    result2 = "";
    if (!!data1 && data1.success == true) {
      let user = { ...data1.user };
      document.querySelector(".edit-user-details-name").value = user.name;
      document.querySelector(".edit-user-details-regNo").value =
        user.registration_number;
      document.querySelector(".edit-user-details-email").value = user.email;
      document.querySelector(
        ".edit-user-profile-pic-img"
      ).src = `https://opentalks.cyclic.app${user.image}`;
      document.querySelector(".edit-user-details-btn").value =
        JSON.stringify(user);
      document.querySelector(".edit-user-save-password-btn").value =
        JSON.stringify(user);
      document.querySelector(".edit-user-upload-btn").value =
        JSON.stringify(user);
    }
    if (!!data2 && data2.success == true) {
      data2.departments.forEach((el) => {
        result2 += `<option value="${el._id}">${el.name}</option>`;
      });
      departmentList.innerHTML = result2;
      departmentList.value = data1.user.departmentId;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in editUserC`);
  }
}

async function editUserMain(password, data1) {
  try {
    let message = document.querySelector(".message-admin-pass-confirm");
    let query = { data1, password, userIdA: sessionStorage.getItem("user") };
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/user/update/detail",
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
      message.textContent = "User updated";
      message.classList.remove("hide");
      setTimeout(() => {
        document
          .querySelector(".admin-confirm-pass-container")
          .classList.add("hide");
        document.querySelector(".blur").classList.add("hide");
        document
          .querySelector(".admin-confirm-pass-button")
          .classList.remove("editUserDetails");
        message.classList.add("hide");
      }, 2500);
    } else {
      message.textContent = data.message;
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in editUserMainC`);
  }
}

async function editUserPasswordMain(password, data1) {
  try {
    let message = document.querySelector(".message-admin-pass-confirm");
    let query = { data1, password, userIdA: sessionStorage.getItem("user") };
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/user/update/password",
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
      message.textContent = "Password updated";
      message.classList.remove("hide");
      setTimeout(() => {
        document
          .querySelector(".admin-confirm-pass-container")
          .classList.add("hide");
        document.querySelector(".blur").classList.add("hide");
        document
          .querySelector(".admin-confirm-pass-button")
          .classList.remove("editUserPassword");
        message.classList.add("hide");
      }, 2500);
    } else {
      message.textContent = data.message;
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in editUserPasswordMainC`);
  }
}

async function editUserProfile(password, data1) {
  try {
    let selectedFile = document.querySelector(".edit-user-profile-pic-upload")
      .files[0];
    let userIdA = sessionStorage.getItem("user");
    let message = document.querySelector(".message-admin-pass-confirm");
    let formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("_id", data1._id);
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/user/update/image",
      {
        method: "POST",
        body: formData,
        headers: {
          admin: true,
          password,
          userIdA,
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      message.textContent = "Profile pic updated";
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
        document
          .querySelector(".admin-confirm-pass-container")
          .classList.add("hide");
        document.querySelector(".blur").classList.add("hide");
        document
          .querySelector(".admin-confirm-pass-button")
          .classList.remove("editUserProfilePic");
      }, 2500);
    } else {
      message.textContent = data.message;
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in editUserProfileC`);
  }
}

// USER SEARCH

async function getUserBySearch(query) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/user/search",
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

    if (query.byNumber == true) {
      renderSearchedUser_single(data);
    } else {
      renderSearchedUser_multiple(data, query);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in getUserBySearchC`);
  }
}

function renderSearchedUser_single(data) {
  try {
    let result = "";
    let container = document.querySelector(".user-main-search-list");
    let resultsNum = document.querySelector(".user-main-results span");
    if (!!data && data.success == true) {
      resultsNum.textContent = "1";
      let isDeleted = data.user.active == true ? "" : "deletedUser";
      let updatedAt =
        data.user.updatedAt != null
          ? formatDate(data.user.updatedAt)
          : "Not updated yet";
      let isAdmin = data.user.admin == true ? "isAdmin" : "";
      let lastLogin =
        data.user.lastLogin == null
          ? "No logined yet"
          : formatDate(data.user.lastLogin);
      let ifAdmin =
        data.user.admin == true
          ? ""
          : `
        <i class="fa-solid fa-pencil edit-user-main-panel1" title="Edit user" data-userid="${data.user._id}"></i>
        `;
      result = `
        <div class="recent-user-template ${isDeleted} ${isAdmin}">
        <div class="recent-user-profile">
          <img
            src="https://opentalks.cyclic.app${data.user.image}"
            alt="User Profile Pic"
            class="recent-user-profile-pic"
          />
        </div>
        <div class="recent-user-details">
          <h3 class="recent-user-name">${data.user.name}</h3>
          <p class="recent-user-registration">
            <span> Registration No: </span
            ><span class="data"> ${data.user.registration_number}</span>
          </p>
          <p class="recent-user-email">
            <span> Email: </span>
            <span class="data">${data.user.email}</span>
          </p>
          <p class="recent-user-department">
            <span>Department: </span>
            <span class="data">${data.user.departmentId.name}</span>
          </p>
          <div class="recent-user-imp-dates">
            <p class="recent-user-created-at">
              <span>Joined Opentalks:</span>
              <span class="data">${formatDate(data.user.createdAt)}</span>
            </p>
            <p>/</p>
            <p class="recent-user-updated-at">
              <span>Last Updated: </span>
              <span class="data">${updatedAt}</span>
            </p>
            <p>/</p>
            <p class="recent-user-last-login">
            <span>Last Login: </span>
            <span class="data">${lastLogin}</span>
          </p>
          </div>
        </div>
        <div class="recent-user-links-btn">
        ${ifAdmin}
        </div>
      </div>
        `;
      container.innerHTML = result;
    } else {
      resultsNum.textContent = "0";
      container.innerHTML = "No user found";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in renderSearchedUser_singleC`);
  }
}

function renderSearchedUser_multiple(data, query) {
  try {
    let result = "";
    let container = document.querySelector(".user-main-search-list");
    let resultsNum = document.querySelector(".user-main-results span");
    if (!!data && data.success == true) {
      user_startPoint = data.nextStartPoint;
      data.users.forEach((el) => {
        let highlightedName = el.name.replace(
          new RegExp(query.name.trim(), "gi"),
          (match) => `<span class="highlight">${match}</span>`
        );
        let isDeleted = el.active == true ? "" : "deletedUser";
        let lastLogin =
          el.lastLogin == null ? "No logined yet" : formatDate(el.lastLogin);
        let updatedAt =
          el.updatedAt != null ? formatDate(el.updatedAt) : "Not updated yet";
        let isAdmin = el.admin == true ? "isAdmin" : "";
        let ifAdmin =
          el.admin == true
            ? ""
            : `
        <i class="fa-solid fa-pencil edit-user-main-panel1" title="Edit user" data-userid="${el._id}"></i>

        `;
        result += `
        <div class="recent-user-template ${isDeleted} ${isAdmin}">
        <div class="recent-user-profile">
          <img
            src="https://opentalks.cyclic.app${el.image}"
            alt="User Profile Pic"
            class="recent-user-profile-pic"
          />
        </div>
        <div class="recent-user-details">
          <h3 class="recent-user-name">${highlightedName}</h3>
          <p class="recent-user-registration">
            <span> Registration No: </span
            ><span class="data"> ${el.registration_number}</span>
          </p>
          <p class="recent-user-email">
            <span> Email: </span>
            <span class="data">${el.email}</span>
          </p>
          <p class="recent-user-department">
            <span>Department: </span>
            <span class="data">${el.departmentId.name}</span>
          </p>
          <div class="recent-user-imp-dates">
            <p class="recent-user-created-at">
              <span>Joined Opentalks:</span>
              <span class="data">${formatDate(el.createdAt)}</span>
            </p>
            <p>/</p>
            <p class="recent-user-updated-at">
              <span>Last Updated: </span>
              <span class="data">${updatedAt}</span>
            </p>
            <p>/</p>
            <p class="recent-user-last-login">
            <span>Last Login: </span>
            <span class="data">${lastLogin}</span>
          </p>
          </div>
        </div>
        <div class="recent-user-links-btn">
        ${ifAdmin}
        </div>
      </div>
        `;
      });
      container.innerHTML = result;
      resultsNum.textContent = data.total;
    } else {
      container.innerHTML = "No users found";
      resultsNum.textContent = "0";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in renderSearchedUser_multipleC`);
  }
}

async function getUserBySearchWithFilter(filter) {
  try {
    let message = document.querySelector(".message-user-filter");
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/user/search/filter",
      {
        method: "POST",
        body: JSON.stringify({ filter: { ...filter } }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".user-main-search-list");
    let resultsNum = document.querySelector(".user-main-results span");
    if (!!data && data.success == true) {
      user_startPoint = data.nextStartPoint;
      document
        .querySelector(".user-main-search-container")
        .classList.remove("hide");
      document.querySelector(".user-panel1-recent-users").classList.add("hide");
      document.querySelector(".filter-user-container").classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      data.users.forEach((el) => {
        let highlightedEmail;
        let lastLogin =
          el.lastLogin == null ? "No logined yet" : formatDate(el.lastLogin);
        if (!!filter.email) {
          highlightedEmail = el.email.replace(
            new RegExp(filter.email.trim(), "gi"),
            (match) => `<span class="highlight">${match}</span>`
          );
        } else {
          highlightedEmail = el.email;
        }
        let isDeleted = el.active == true ? "" : "deletedUser";
        let updatedAt =
          el.updatedAt != null ? formatDate(el.updatedAt) : "Not updated yet";
        let isAdmin = el.admin == true ? "isAdmin" : "";
        let ifAdmin =
          el.admin == true
            ? ""
            : `
        <i class="fa-solid fa-pencil edit-user-main-panel1" title="Edit user" data-userid="${el._id}"></i>
       
        `;
        result += `
        <div class="recent-user-template ${isDeleted} ${isAdmin}">
        <div class="recent-user-profile">
          <img
            src="https://opentalks.cyclic.app${el.image}"
            alt="User Profile Pic"
            class="recent-user-profile-pic"
          />
        </div>
        <div class="recent-user-details">
          <h3 class="recent-user-name">${el.name}</h3>
          <p class="recent-user-registration">
            <span> Registration No: </span
            ><span class="data"> ${el.registration_number}</span>
          </p>
          <p class="recent-user-email">
            <span> Email: </span>
            <span class="data">${highlightedEmail}</span>
          </p>
          <p class="recent-user-department">
            <span>Department: </span>
            <span class="data">${el.departmentId.name}</span>
          </p>
          <div class="recent-user-imp-dates">
            <p class="recent-user-created-at">
              <span>Joined Opentalks:</span>
              <span class="data">${formatDate(el.createdAt)}</span>
            </p>
            <p>/</p>
            <p class="recent-user-updated-at">
              <span>Last Updated: </span>
              <span class="data">${updatedAt}</span>
            </p>
            <p>/</p>
            <p class="recent-user-last-login">
            <span>Last Login: </span>
            <span class="data">${lastLogin}</span>
          </p>
          </div>
        </div>
        <div class="recent-user-links-btn">
        ${ifAdmin}
        </div>
      </div>
        `;
      });
      container.innerHTML = result;
      resultsNum.textContent = data.total;
    } else {
      message.textContent = data.message;
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in getUserBySearchC`);
  }
}

// FORUM FILTER
async function getForumByFilter(filter) {
  try {
    let message = document.querySelector(".forum-filter-message");
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/search/filter",
      {
        method: "POST",
        body: JSON.stringify({ filter: { ...filter } }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".forum-main-search-list");
    let resultNumber = document.querySelector(".forum-main-results span");
    if (!!data && data.success == true) {
      document.querySelector(".forum-filter-container").classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      forum_filter_startPoint = data.nextStartPoint;
      document.querySelector(".top3-forums-display").classList.add("hide");
      document
        .querySelector(".forum-main-search-container")
        .classList.remove("hide");
      data.forums.forEach((el) => {
        let isDeleted = el.active == true ? "" : "deletedForumMember";

        let highlightedName = !!filter.name
          ? el.userId.name.replace(
              new RegExp(filter.name, "gi"),
              (match) => `<span class="highlight">${match}</span>`
            )
          : el.userId.name;

        result += `
<div class="forum-card-forum-section ${isDeleted}">
                <h3 class="forum-name-forum-section">${el.name}</h3>
                <p class="forum-description-forum-section">${el.description}</p>
                <div class="forum-section-bottom">
                  <p class="created-by-forum-section">
                    Created by <span>${highlightedName}</span>
                    <span class="forum-card-separator">|</span> Created on
                    <span>${formatDate(el.createdAt)}</span>
                  </p>
                  <button
                    class="view-detail-btn-forum-section"
                    value="${el._id}"
                  >
                  Visit forum
                  </button>
                </div>
                <div class="forum-section-info-links">
                  <p class="likes-forum-section">
                    <i class="fa-solid fa-heart" title="Likes"></i>
                    <span>${el.likes}</span> likes
                  </p>
                  <i class="fa-solid fa-clipboard copy-forumId-to-clipboard" title="Copy Forum-id" data-forumid="${
                    el._id
                  }"></i>
                </div>
              </div>
`;
      });
      container.innerHTML = result;
      container.scrollTop = 0;
      resultNumber.textContent = data.results;
    } else {
      message.textContent = data.message;
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in getForumByFilterC`);
  }
}

// FORUM REVIEWS

async function fetchForumReviews() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/rate/all",
      {
        method: "POST",
        body: JSON.stringify({
          forumId: sessionStorage.getItem("currentForum"),
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".review-forum-list");
    if (!!data && data.success == true) {
      data.reviews.forEach((el) => {
        let review = el.rating == 1 ? "up" : "down";
        result += `
  <div class="review-forum-template">
  <div class="review-forum-template-left">
    <div class="review-forum-template-info">
      <img src="https://opentalks.cyclic.app${
        el.userId.image
      }" alt="user-image" />
      <p>By ${el.userId.name}</p>
    </div>
    <div class="review-forum-template-date">
      On ${formatDate(el.createdAt)}
    </div>
  </div>
  <div class="review-forum-template-right">
    <i class="fa-solid fa-thumbs-${review}"></i>
  </div>
</div>`;
      });

      container.innerHTML = result;
      container.scrollTop = 0;
      document.querySelector(".review-forum-mid-likes").textContent =
        data.likes;
      document.querySelector(".review-forum-mid-dislikes").textContent =
        data.total - data.likes;

      forum_review_startPoint = data.nextStartPoint;
    } else {
      container.innerHTML = "No ratings found for this forum.";
      document.querySelector(".review-forum-mid-likes").textContent = 0;
      document.querySelector(".review-forum-mid-dislikes").textContent = 0;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchForumReviewsC`);
  }
}

async function fetchForumReviewsScroll() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/rate/all",
      {
        method: "POST",
        body: JSON.stringify({
          forumId: sessionStorage.getItem("currentForum"),
          startPoint: forum_review_startPoint,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".review-forum-list");
    if (!!data && data.success == true) {
      data.reviews.forEach((el) => {
        let review = el.rating == 1 ? "up" : "down";
        result += `
  <div class="review-forum-template">
  <div class="review-forum-template-left">
    <div class="review-forum-template-info">
      <img src="https://opentalks.cyclic.app${
        el.userId.image
      }" alt="user-image" />
      <p>By ${el.userId.name}</p>
    </div>
    <div class="review-forum-template-date">
      On ${formatDate(el.createdAt)}
    </div>
  </div>
  <div class="review-forum-template-right">
    <i class="fa-solid fa-thumbs-${review}"></i>
  </div>
</div>`;
      });

      let prevScrollHeight = container.scrollHeight;
      container.insertAdjacentHTML("beforeend", result);
      container.scrollTop = prevScrollHeight;
      forum_review_startPoint = data.nextStartPoint;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchForumReviewsC`);
  }
}

// NOTIFICATIONS
async function fetchRecentNotifications() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/notification/recent",
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
    let container = document.querySelector(".main-notification-list");
    if (!!data && data.success == true) {
      data.notifications.forEach((el) => {
        let isDeleted = el.active == true ? "" : "deleted";
        let btns =
          el.active == true
            ? `
      <i
        class="fa-solid fa-pencil edit-notification-bn"
        data-id="${el._id}"
        title="Edit notification"
      ></i>
      <i
        class="fa-solid fa-trash delete-notification-bn"
        data-id="${el._id}"
        title="Delete notification"
      ></i>
      `
            : ``;
        result += `<div class="main-notification-template ${isDeleted}">
  <div class="main-notification-upper">
    <div class="main-notification-user-info">
      <img src="https://opentalks.cyclic.app${
        el.userId.image
      }" alt="user-image" />
      <p>${el.userId.name} <span>(${el.userId.registration_number})</span></p>
    </div>
    <div class="main-notification-links">
      ${btns}
    </div>
  </div>
  <p class="message-notification">${el.message}</p>
  <p class="date-notification">${formatDate2(el.createdAt)}</p>
</div>`;
      });

      container.innerHTML = result;
      container.scrollTop = 0;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchRecentNotificationsC`);
  }
}

async function fetchNotificationSearch(registration_number) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/notification/search",
      {
        method: "POST",
        body: JSON.stringify({
          registration_number: Number(registration_number),
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".main-notification-search-list");
    if (!!data && data.success == true) {
      document
        .querySelector(".main-notification-search-list")
        .classList.remove("hide");
      document.querySelector(".main-notification-list").classList.add("hide");
      data.notifications.forEach((el) => {
        let isDeleted = el.active == true ? "" : "deleted";
        let btns =
          el.active == true
            ? `
      <i
        class="fa-solid fa-pencil edit-notification-bn"
        data-id="${el._id}"
        title="Edit notification"
      ></i>
      <i
        class="fa-solid fa-trash delete-notification-bn"
        data-id="${el._id}"
        title="Delete notification"
      ></i>
      `
            : ``;
        result += `<div class="main-notification-template ${isDeleted}">
  <div class="main-notification-upper">
    <div class="main-notification-user-info">
      <img src="https://opentalks.cyclic.app${
        el.userId.image
      }" alt="user-image" />
      <p>${el.userId.name} <span>(${el.userId.registration_number})</span></p>
    </div>
    <div class="main-notification-links">
      ${btns}
    </div>
  </div>
  <p class="message-notification">${el.message}</p>
  <p class="date-notification">${formatDate2(el.createdAt)}</p>
</div>`;
      });
      container.innerHTML = result;
      container.scrollTop = 0;
      notification_search_startPoint = data.nextStartPoint;
      document.querySelector(
        ".main-notification-container>h2"
      ).textContent = `Results: ${data.results}`;
    } else {
      showNotification(data.message, 2500);
    }
  } catch (error) {
    console.log(`Error: %{error.toString()} in fetchNotificationSearchC`);
  }
}

async function fetchNotificationSearchScroll() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/notification/search",
      {
        method: "POST",
        body: JSON.stringify({
          registration_number: Number(notification_search),
          startPoint: notification_search_startPoint,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".main-notification-search-list");
    if (!!data && data.success == true) {
      data.notifications.forEach((el) => {
        let isDeleted = el.active == true ? "" : "deleted";
        let btns =
          el.active == true
            ? `
      <i
        class="fa-solid fa-pencil edit-notification-bn"
        data-id="${el._id}"
        title="Edit notification"
      ></i>
      <i
        class="fa-solid fa-trash delete-notification-bn"
        data-id="${el._id}"
        title="Delete notification"
      ></i>
      `
            : ``;
        result += `<div class="main-notification-template ${isDeleted}">
    <div class="main-notification-upper">
      <div class="main-notification-user-info">
        <img src="https://opentalks.cyclic.app${
          el.userId.image
        }" alt="user-image" />
        <p>${el.userId.name} <span>(${el.userId.registration_number})</span></p>
      </div>
      <div class="main-notification-links">
${btns}
      </div>
    </div>
    <p class="message-notification">${el.message}</p>
    <p class="date-notification">${formatDate2(el.createdAt)}</p>
  </div>`;
      });
      let prevScrollHeight = container.scrollHeight;
      container.insertAdjacentHTML("beforeend", result);
      container.scrollTop = prevScrollHeight;
      notification_search_startPoint = data.nextStartPoint;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchNotificationSearchScrollC`);
  }
}

async function createNotification(query) {
  try {
    document.querySelector(".create-notification").classList.add("hide");
    let confirm = await showConfirmation(
      "Do you want to create a notification?"
    );
    if (confirm) {
      document.querySelector(".admin-confirm-pass-input").value = "";
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.add("createNotification");
      document.querySelector(".admin-confirm-pass-button").value =
        JSON.stringify(query);
    } else {
      document.querySelector(".create-notification").classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in createNotificationC`);
  }
}

async function createNotificationMain(password, query) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/notification/create",
      {
        method: "POST",
        body: JSON.stringify({
          ...query,
          userIdA: sessionStorage.getItem("user"),
          password,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.remove("createNotification");
      await fetchRecentNotifications();
    } else {
      showNotification(data.message, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in createNotificationMainC`);
  }
}

async function updateNotification(id, message) {
  try {
    document
      .querySelector(".edit-notification-container")
      .classList.add("hide");
    let confirm = await showConfirmation(
      "Do you want to edit this notification?"
    );
    if (confirm) {
      document.querySelector(".admin-confirm-pass-input").value = "";
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.add("editNotification");
      document.querySelector(".admin-confirm-pass-button").value =
        JSON.stringify({ _id: id, message });
    } else {
      document
        .querySelector(".edit-notification-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in updateNotificationC`);
  }
}

async function editNotificationMain(password, query) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/notification/update",
      {
        method: "POST",
        body: JSON.stringify({
          ...query,
          userIdA: sessionStorage.getItem("user"),
          password,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.remove("editNotification");
      targetedDepratmentContainer.querySelector(
        ".message-notification"
      ).textContent = query.message;
    } else {
      showNotification(data.message, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in editNotificationMainC`);
  }
}

async function deletNotification(id) {
  try {
    let confirm = await showConfirmation(
      "Do you want to delete this notification?"
    );
    if (confirm) {
      document.querySelector(".admin-confirm-pass-input").value = "";
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.add("deleteNotification");
      document.querySelector(".admin-confirm-pass-button").value =
        JSON.stringify({ _id: id });
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in deletNotificationC`);
  }
}

async function deleteNotificationMain(password, query) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/notification/delete",
      {
        method: "POST",
        body: JSON.stringify({
          ...query,
          userIdA: sessionStorage.getItem("user"),
          password,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.remove("deleteNotification");
      targetedDepratmentContainer.remove();
      showNotification("Notification deleted successfully.");
    } else {
      showNotification(data.message, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in deleteNotificationMainC`);
  }
}

async function fetchAdminNotifications() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/notification/contact",
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
    let container = document.querySelector(".admin-notification-list");
    if (!!data && data.success == true) {
      data.notifications.forEach((el) => {
        result += `<div class="admin-notification-template">
          <div class="admin-notification-user">
            <img src="https://opentalks.cyclic.app${
              el.userId.image
            }" alt="user-image" />
            <p>By ${el.userId.name}</p>
          </div>
          <p class="admin-notification-message">${el.message}</p>
          <div class="admin-notification-date">${formatDate2(
            el.createdAt
          )}</div>
        </div>`;
      });
      container.innerHTML = result;
      container.scrollTop = 0;
      admin_notification_startPoint = data.nextStartPoint;
    } else {
      container.innerHTML = "No new notifications.";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchAdminNotificationsC`);
  }
}

// FORUM JOINEE
async function recentJoinees() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/joinee/recent",
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
    let container = document.querySelector(".main-forum-joinee-list");
    if (!!data && data.success == true) {
      data.joinees.forEach((el) => {
        let data = JSON.stringify({
          userId: el.userId._id,
          forumId: el.forumId._id,
        });
        let isDeleted = el.active == true ? "" : "deleted";
        let btns =
          el.active == true
            ? `<button class="forum-joinee-remove" value='${data}'>Remove</button>`
            : "";
        result += `<div class="forum-joinee-template ${isDeleted}">
                <div class="forum-joinee-top">
                  <div class="forum-joinee-forum-name">${el.forumId.name}</div>
                  ${btns}
                </div>
                <div class="forum-joinee-admin-info">
                  <p>Admin Info:</p>
                  <div class="forum-joinee-admin-info-inner">
                    <p class="forum-joinee-admin-name" title="${
                      el.adminId.registration_number
                    }">${el.adminId.name}</p>
                  </div>
                </div>
                <div class="forum-joinee-date">
                  <p>Joined On:</p>
                  <p class="forum-joinee-createdAt">${formatDate2(
                    el.createdAt
                  )}</p>
                </div>
                <div class="forum-joinee-info">
                  <p>
                    <img
                      src="https://opentalks.cyclic.app${el.userId.image}"
                      title="${el.userId.registration_number}"
                      alt="user-image"
                    />
                    <span>Joined by ${el.userId.name}</span>
                  </p>
                </div>
              </div>`;
      });
      container.innerHTML = result;
      container.scrollTop = 0;
      recent_joinee_startPoint = data.nextStartPoint;
    } else {
      container.innerHTML = "No user joined forum yet...";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in recertJoineesC`);
  }
}

async function recentJoineesScroll() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/joinee/recent",
      {
        method: "POST",
        body: JSON.stringify({ startPoint: recent_joinee_startPoint }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".main-forum-joinee-list");
    if (!!data && data.success == true) {
      data.joinees.forEach((el) => {
        let data = JSON.stringify({
          userId: el.userId._id,
          forumId: el.forumId._id,
        });
        let isDeleted = el.active == true ? "" : "deleted";
        let btns =
          el.active == true
            ? `<button class="forum-joinee-remove" value='${data}'>Remove</button>`
            : "";
        result += `<div class="forum-joinee-template ${isDeleted}">
                <div class="forum-joinee-top">
                  <div class="forum-joinee-forum-name">${el.forumId.name}</div>
                  ${btns}
                </div>
                <div class="forum-joinee-admin-info">
                  <p>Admin Info:</p>
                  <div class="forum-joinee-admin-info-inner">
                    <p class="forum-joinee-admin-name" title="${
                      el.adminId.registration_number
                    }">${el.adminId.name}</p>
                  </div>
                </div>
                <div class="forum-joinee-date">
                  <p>Joined On:</p>
                  <p class="forum-joinee-createdAt">${formatDate2(
                    el.createdAt
                  )}</p>
                </div>
                <div class="forum-joinee-info">
                  <p>
                    <img
                      src="https://opentalks.cyclic.app${el.userId.image}"
                      title="${el.userId.registration_number}"
                      alt="user-image"
                    />
                    <span>Joined by ${el.userId.name}</span>
                  </p>
                </div>
              </div>`;
      });
      let prevScrollHeight = container.scrollHeight;
      container.insertAdjacentHTML("beforeend", result);
      container.scrollTop = prevScrollHeight;
      recent_joinee_startPoint = data.nextStartPoint;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in recentJoineesScrollC`);
  }
}

async function searchJoinee(registration_number) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/joinee/search",
      {
        method: "POST",
        body: JSON.stringify({
          registration_number: Number(registration_number),
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".main-forum-joinee-search-list");
    if (!!data && data.success == true) {
      document
        .querySelector(".main-forum-joinee-search-list")
        .classList.remove("hide");
      document.querySelector(".main-forum-joinee-list").classList.add("hide");
      data.joinees.forEach((el) => {
        let data = JSON.stringify({
          userId: el.userId._id,
          forumId: el.forumId._id,
        });
        let isDeleted = el.active == true ? "" : "deleted";
        let btns =
          el.active == true
            ? `<button class="forum-joinee-remove" value='${data}'>Remove</button>`
            : "";
        result += `<div class="forum-joinee-template ${isDeleted}">
                <div class="forum-joinee-top">
                  <div class="forum-joinee-forum-name">${el.forumId.name}</div>
                  ${btns}
                </div>
                <div class="forum-joinee-admin-info">
                  <p>Admin Info:</p>
                  <div class="forum-joinee-admin-info-inner">
                    <p class="forum-joinee-admin-name" title="${
                      el.adminId.registration_number
                    }">${el.adminId.name}</p>
                  </div>
                </div>
                <div class="forum-joinee-date">
                  <p>Joined On:</p>
                  <p class="forum-joinee-createdAt">${formatDate2(
                    el.createdAt
                  )}</p>
                </div>
                <div class="forum-joinee-info">
                  <p>
                    <img
                      src="https://opentalks.cyclic.app${el.userId.image}"
                      title="${el.userId.registration_number}"
                      alt="user-image"
                    />
                    <span>Joined by ${el.userId.name}</span>
                  </p>
                </div>
              </div>`;
      });
      container.innerHTML = result;
      container.scrollTop = 0;
      search_joinee_startPoint = data.nextStartPoint;
      document.querySelector(
        ".main-forum-joinee-container>h2"
      ).textContent = `Result: ${data.results}`;
    } else {
      showNotification(data.message, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in searchJoineeC`);
  }
}

async function searchJoineeScroll() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/joinee/search",
      {
        method: "POST",
        body: JSON.stringify({
          registration_number: Number(reg_number),
          startPoint: search_joinee_startPoint,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".main-forum-joinee-search-list");
    if (!!data && data.success == true) {
      data.joinees.forEach((el) => {
        let data = JSON.stringify({
          userId: el.userId._id,
          forumId: el.forumId._id,
        });
        let isDeleted = el.active == true ? "" : "deleted";
        let btns =
          el.active == true
            ? `<button class="forum-joinee-remove" value='${data}'>Remove</button>`
            : "";
        result += `<div class="forum-joinee-template ${isDeleted}">
                <div class="forum-joinee-top">
                  <div class="forum-joinee-forum-name">${el.forumId.name}</div>
                  ${btns}
                </div>
                <div class="forum-joinee-admin-info">
                  <p>Admin Info:</p>
                  <div class="forum-joinee-admin-info-inner">
                    <p class="forum-joinee-admin-name" title="${
                      el.adminId.registration_number
                    }">${el.adminId.name}</p>
                  </div>
                </div>
                <div class="forum-joinee-date">
                  <p>Joined On:</p>
                  <p class="forum-joinee-createdAt">${formatDate2(
                    el.createdAt
                  )}</p>
                </div>
                <div class="forum-joinee-info">
                  <p>
                    <img
                      src="https://opentalks.cyclic.app${el.userId.image}"
                      title="${el.userId.registration_number}"
                      alt="user-image"
                    />
                    <span>Joined by ${el.userId.name}</span>
                  </p>
                </div>
              </div>`;
      });
      let prevScrollHeight = container.scrollHeight;
      container.insertAdjacentHTML("beforeend", result);
      container.scrollTop = prevScrollHeight;
      search_joinee_startPoint = data.nextStartPoint;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in searchJoineeScrollC`);
  }
}

async function removeJoinee(data) {
  try {
    let confirm = await showConfirmation("Do you want to remove this Joinee?");
    if (confirm) {
      document.querySelector(".admin-confirm-pass-input").value = "";
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.add("removeJoinee");
      document.querySelector(".admin-confirm-pass-button").value =
        JSON.stringify(data);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in removeJoineeC`);
  }
}

async function removeJoineeMain(password, query) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/member/delete",
      {
        method: "POST",
        body: JSON.stringify({
          user: query.userId,
          forumId: query.forumId,
          password,
          userIdA: sessionStorage.getItem("user"),
          byAdmin: true,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.remove("removeJoinee");
      targetedDepratmentContainer.remove();
      showNotification("Joinee removed successfully.", 2500);
    } else {
      showNotification(data.message, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in removeJoineeMainC`);
  }
}

async function filterJoinee(query) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/joinee/search/filter",
      {
        method: "POST",
        body: JSON.stringify({ ...query }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);
    let result = "";
    let container = document.querySelector(".main-forum-joinee-search-list");
    if (!!data && data.success == true) {
      document
        .querySelector(".main-forum-joinee-search-list")
        .classList.remove("hide");
      document.querySelector(".main-forum-joinee-list").classList.add("hide");
      document
        .querySelector(".forum-joinee-filter-container")
        .classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      data.joinees.forEach((el) => {
        let data = JSON.stringify({
          userId: el.userId._id,
          forumId: el.forumId._id,
        });
        let isDeleted = el.active == true ? "" : "deleted";
        let btns =
          el.active == true
            ? `<button class="forum-joinee-remove" value='${data}'>Remove</button>`
            : "";
        result += `<div class="forum-joinee-template ${isDeleted}">
                <div class="forum-joinee-top">
                  <div class="forum-joinee-forum-name">${el.forumId.name}</div>
                  ${btns}
                </div>
                <div class="forum-joinee-admin-info">
                  <p>Admin Info:</p>
                  <div class="forum-joinee-admin-info-inner">
                    <p class="forum-joinee-admin-name" title="${
                      el.adminId.registration_number
                    }">${el.adminId.name}</p>
                  </div>
                </div>
                <div class="forum-joinee-date">
                  <p>Joined On:</p>
                  <p class="forum-joinee-createdAt">${formatDate2(
                    el.createdAt
                  )}</p>
                </div>
                <div class="forum-joinee-info">
                  <p>
                    <img
                      src="https://opentalks.cyclic.app${el.userId.image}"
                      title="${el.userId.registration_number}"
                      alt="user-image"
                    />
                    <span>Joined by ${el.userId.name}</span>
                  </p>
                </div>
              </div>`;
      });
      container.innerHTML = result;
      container.scrollTop = 0;
      search_joinee_startPoint = data.nextStartPoint;
      document.querySelector(
        ".main-forum-joinee-container>h2"
      ).textContent = `Result: ${data.results}`;
    } else {
      showNotification(data.message, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in filterJoineeC`);
  }
}

async function filterJoineeScroll() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/forum/joinee/search/filter",
      {
        method: "POST",
        body: JSON.stringify({
          ...searchJoineeFilter,
          startPoint: search_joinee_startPoint,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".main-forum-joinee-search-list");
    if (!!data && data.success == true) {
      data.joinees.forEach((el) => {
        let data = JSON.stringify({
          userId: el.userId._id,
          forumId: el.forumId._id,
        });
        let isDeleted = el.active == true ? "" : "deleted";
        let btns =
          el.active == true
            ? `<button class="forum-joinee-remove" value='${data}'>Remove</button>`
            : "";
        result += `<div class="forum-joinee-template ${isDeleted}">
                <div class="forum-joinee-top">
                  <div class="forum-joinee-forum-name">${el.forumId.name}</div>
                  ${btns}
                </div>
                <div class="forum-joinee-admin-info">
                  <p>Admin Info:</p>
                  <div class="forum-joinee-admin-info-inner">
                    <p class="forum-joinee-admin-name" title="${
                      el.adminId.registration_number
                    }">${el.adminId.name}</p>
                  </div>
                </div>
                <div class="forum-joinee-date">
                  <p>Joined On:</p>
                  <p class="forum-joinee-createdAt">${formatDate2(
                    el.createdAt
                  )}</p>
                </div>
                <div class="forum-joinee-info">
                  <p>
                    <img
                      src="https://opentalks.cyclic.app${el.userId.image}"
                      title="${el.userId.registration_number}"
                      alt="user-image"
                    />
                    <span>Joined by ${el.userId.name}</span>
                  </p>
                </div>
              </div>`;
      });
      let prevScrollHeight = container.scrollHeight;
      container.insertAdjacentHTML("beforeend", result);
      container.scrollTop = prevScrollHeight;
      search_joinee_startPoint = data.nextStartPoint;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in filterJoineeScrollC`);
  }
}

// ALLOWED USER
async function addNewAllowedUser(registration_number) {
  try {
    document
      .querySelector(".add-new-user-allowed-container")
      .classList.add("hide");
    let confirm = await showConfirmation(
      "Do you want to add this user to Allowed users?"
    );
    if (confirm) {
      document.querySelector(".admin-confirm-pass-input").value = "";
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.add("addUserToAllowedUser");
      document.querySelector(".admin-confirm-pass-button").value =
        JSON.stringify(registration_number);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in addNewAllowedUserC`);
  }
}

async function addNewAllowedUserMain(password, registration_number) {
  try {
    loader(1);
    let response = await fetch(
      "https://opentalks.cyclic.app/admin/user/allowed/create",
      {
        method: "POST",
        body: JSON.stringify({
          registration_number: Number(registration_number),
          userIdA: sessionStorage.getItem("user"),
          password,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);
    if (!!data && data.success == true) {
      showNotification("User is added to allowed users successfully.");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.remove("addUserToAllowedUser");
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
    } else {
      showNotification(data.message);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in addNewAllowedUserMainC`);
  }
}

async function recentAllowedusers() {
  try {
    loader(1);
    let response = await fetch(
      "https://opentalks.cyclic.app/admin/user/allowed/recent",
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
    let container = document.querySelector(".main-user-allowed-list");
    if (!!data && data.success == true) {
      data.users.forEach((el) => {
        result += `<div class="allowed-user-template">
                <div class="allowed-user-template-main">
                  <div class="allowed-user-regisno">
                    Registration Number: <span>${el.registration_number}</span>
                  </div>
                  <div class="allowed-user-createdAt">
                    ${formatDate2(el.createdAt)}
                  </div>
                </div>
                <button class="delete-allowed-user" value="${
                  el.registration_number
                }">Remove</button>
              </div>`;
      });
      container.innerHTML = result;
      container.scrollTop = 0;
      recentAllowedUser_startPoint = data.nextStartPoint;
    } else {
      container.innerHTML = "No new allowed user found.";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in recentAllowedusersC`);
  }
}

async function recentAllowedUsersScroll() {
  try {
    loader(1);
    let response = await fetch(
      "https://opentalks.cyclic.app/admin/user/allowed/recent",
      {
        method: "POST",
        body: JSON.stringify({ startPoint: recentAllowedUser_startPoint }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);
    let result = "";
    let container = document.querySelector(".main-user-allowed-list");
    if (!!data && data.success == true) {
      data.users.forEach((el) => {
        result += `<div class="allowed-user-template">
                <div class="allowed-user-template-main">
                  <div class="allowed-user-regisno">
                    Registration Number: <span>${el.registration_number}</span>
                  </div>
                  <div class="allowed-user-createdAt">
                    ${formatDate2(el.createdAt)}
                  </div>
                </div>
                <button class="delete-allowed-user" value="${
                  el.registration_number
                }">Remove</button>
              </div>`;
      });
      let prevScrollHeight = container.scrollHeight;
      container.insertAdjacentHTML("beforeend", result);
      container.scrollTop = prevScrollHeight;
      recentAllowedUser_startPoint = data.nextStartPoint;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in recentAllowedUsersScrollC`);
  }
}

async function searchAllowedUser(registration_number) {
  try {
    loader(1);
    let response = await fetch(
      "https://opentalks.cyclic.app/admin/user/allowed/get",
      {
        method: "POST",
        body: JSON.stringify({ registration_number }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);
    let result = "";
    let container = document.querySelector(".main-user-allowed-search-list");
    if (!!data && data.success == true) {
      document.querySelector(".main-user-allowed-container>h2").textContent =
        "Search Result: 1";
      let el = { ...data.user };
      result += `
<div class="allowed-user-template">
                <div class="allowed-user-template-main">
                  <div class="allowed-user-regisno">
                    Registration Number: <span>${el.registration_number}</span>
                  </div>
                  <div class="allowed-user-createdAt">
                    ${formatDate2(el.createdAt)}
                  </div>
                </div>
                <button class="delete-allowed-user" value="${
                  el.registration_number
                }">Remove</button>
              </div>`;
      container.innerHTML = result;
      container.scrollTop = 0;
    } else {
      document.querySelector(".main-user-allowed-container>h2").textContent =
        "Search Result: 0";
      container.innerHTML = data.message;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in searchAllowedUserC`);
  }
}

async function deleteAllowedUser(registration_number) {
  try {
    let confirm = await showConfirmation("Do you want to remove this user?");
    if (confirm) {
      document.querySelector(".admin-confirm-pass-input").value = "";
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.add("deleteAllowedUser");
      document.querySelector(".admin-confirm-pass-button").value =
        JSON.stringify(registration_number);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in deleteAllowedUserC`);
  }
}

async function deleteAllowedUserMain(password, registration_number) {
  try {
    loader(1);
    let response = await fetch(
      "https://opentalks.cyclic.app/admin/user/allowed/delete",
      {
        method: "POST",
        body: JSON.stringify({
          registration_number: Number(registration_number),
          password,
          userIdA: sessionStorage.getItem("user"),
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);
    if (!!data && data.success == true) {
      showNotification("User removed from Allowed user list.");
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.remove("deleteAllowedUser");
      targetedDepratmentContainer.remove();
    } else {
      showNotification(data.message);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in deleteAllowedUserMainC`);
  }
}

//! EVENT LISTNERS

// ** LOGOUT
document
  .querySelector(".admin-logout-btn")
  .addEventListener("click", logoutAdmin);

// ** MAIN SECTION CONTAINER HIDE AND UNHIDE

document.querySelectorAll(".nav-link").forEach((el) => {
  el.addEventListener("click", async () => {
    let targetClass = el.dataset.value;
    document
      .querySelectorAll(".main-section>.main-window > section")
      .forEach((el1) => {
        el1.classList.add("hide");
      });
    if (targetClass == "main-departments-panel") {
      document
        .querySelector(".main-department-search-list")
        .classList.add("hide");
      await fetchAllDepartments();
    } else if (targetClass == "main-forums-panel") {
      document.querySelector(".top3-forums-display").classList.remove("hide");
      document.querySelector(".forum-main-panel-1").classList.remove("hide");
      document.querySelector(".forum-main-panel-2").classList.add("hide");
      document
        .querySelector(".forum-main-search-container")
        .classList.add("hide");
      await fetchtop3Forums();
    } else if (targetClass == "main-posts-panel") {
      document.querySelector(".top10-posts-display").classList.remove("hide");
      document
        .querySelector(".post-main-search-container")
        .classList.add("hide");
      document.querySelector(".post-main-panel1-searchInp").value = "";
      await fetchTop10Posts();
    } else if (targetClass == "main-users-panel") {
      document
        .querySelector(".user-panel1-recent-users")
        .classList.remove("hide");
      document
        .querySelector(".user-main-search-container")
        .classList.add("hide");
      await fetchRecent5Users();
    } else if (targetClass == "main-notification-panel") {
      document
        .querySelector(".main-notification-list")
        .classList.remove("hide");
      document
        .querySelector(".main-notification-search-list")
        .classList.add("hide");
      document.querySelector(".main-notification-container>h2").textContent =
        "Recent Notifications";
      document.querySelector(".notification-search-inp").value = "";
      await fetchRecentNotifications();
    } else if (targetClass == "main-joined-forums-panel") {
      document
        .querySelector(".main-forum-joinee-list")
        .classList.remove("hide");
      document
        .querySelector(".main-forum-joinee-search-list")
        .classList.add("hide");
      document.querySelector(".main-forum-joinee-container>h2").textContent =
        "Recent Joinees";
      document.querySelector(".forum-joinee-search-inp").value = "";
      await recentJoinees();
    } else if (targetClass == "main-allowed-users-panel") {
      document
        .querySelector(".main-user-allowed-list")
        .classList.remove("hide");
      document
        .querySelector(".main-user-allowed-search-list")
        .classList.add("hide");
      document.querySelector(".main-user-allowed-container>h2").textContent =
        "Recent Allowed Users";
      document.querySelector(".user-allowed-search-inp").value = "";
      await recentAllowedusers();
    }
    document.querySelector(`.${targetClass}`).classList.remove("hide");
  });
});

// ** NOTIFICATIONS
document.querySelector(".popup-msg-close").addEventListener("click", () => {
  hideNotification();
});

// ** DEPARTMENTS

document
  .querySelector(".main-department-list")
  .addEventListener("click", async (e) => {
    const target = e.target;
    if (target.classList.contains("delete-department")) {
      await deleteDepartment(target);
    } else if (target.classList.contains("edit-main-department")) {
      await editDepartment(target);
    }
  });

document
  .querySelector(".main-department-search-list")
  .addEventListener("click", async (e) => {
    const target = e.target;
    if (target.classList.contains("delete-department")) {
      await deleteDepartment(target);
    } else if (target.classList.contains("edit-main-department")) {
      await editDepartment(target);
    }
  });

document
  .querySelector(".add-new-department-btn")
  .addEventListener("click", () => {
    document.querySelector(".add-department-form").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    document.querySelector(".add-department-name-input").value = "";
    document.querySelector(".admin-password-add-department").value = "";
  });

document
  .querySelector(".add-department-btn")
  .addEventListener("click", async () => {
    let depName = document.querySelector(".add-department-name-input").value;
    let password = document.querySelector(
      ".admin-password-add-department"
    ).value;
    let message = document.querySelector(".message-add-department");
    if (!depName) {
      message.textContent = "Department name is required";
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    } else if (!password) {
      message.textContent = "Password is required";
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    } else {
      await addNewDepartment(depName, password);
    }
  });

document
  .querySelector(".update-edit-department-btn")
  .addEventListener("click", async () => {
    let password = document.querySelector(
      ".admin-password-edit-department"
    ).value;
    let message = document.querySelector(".message-edit-department");
    if (!password) {
      message.textContent = "Password is required";
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    } else {
      await editDetailsOfDepartment(password);
    }
  });

document
  .querySelector(".close-add-department-form")
  .addEventListener("click", () => {
    document.querySelector(".add-department-form").classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

document
  .querySelector(".close-edit-department-form")
  .addEventListener("click", () => {
    document.querySelector(".edit-department-form").classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

document
  .querySelector(".departmnet-search-inp")
  .addEventListener("keydown", async (e) => {
    let name = document.querySelector(".departmnet-search-inp").value.trim();
    document.querySelector(".main-department-list").classList.remove("hide");
    document
      .querySelector(".main-department-search-list")
      .classList.add("hide");
    document.querySelector(".main-departmnet-container>h2").textContent =
      "Recent Departments";
    if (e.key == "Enter" && name != "") {
      document.querySelector(".main-department-list").classList.add("hide");
      document
        .querySelector(".main-department-search-list")
        .classList.remove("hide");
      department_search = name;
      await searchDepartment(name);
    }
  });

document
  .querySelector(".main-department-search-list")
  .addEventListener("scroll", async (event) => {
    let { scrollHeight, scrollTop, clientHeight } = event.target;
    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      await searchDepartmentScroll();
    }
  });

// ** ADMIN CONFIRMATION

document
  .querySelector(".admin-confirm-pass-button")
  .addEventListener("click", async () => {
    let confirmBtn = document.querySelector(".admin-confirm-pass-button");
    let message = document.querySelector(".message-admin-pass-confirm");
    let password = document.querySelector(".admin-confirm-pass-input").value;
    if (password != "") {
      if (confirmBtn.classList.contains("deleteDep")) {
        await deleteDepartmentmain(password, confirmBtn.value);
      } else if (confirmBtn.classList.contains("deleteforum")) {
        await deleteForum(password, confirmBtn.value);
      } else if (confirmBtn.classList.contains("editforum")) {
        await editForumMain(password);
      } else if (confirmBtn.classList.contains("deleteuserPost")) {
        await deleteUserPostMain(password, confirmBtn.value);
      } else if (confirmBtn.classList.contains("removeForumUser")) {
        await deleteForumMemberMain(password, confirmBtn.value);
      } else if (confirmBtn.classList.contains("unlikeUserPost")) {
        await unlikeUserPostMain(password, confirmBtn.value);
      } else if (confirmBtn.classList.contains("editForumPost")) {
        await editForumPostMain(password, confirmBtn.value);
      } else if (confirmBtn.classList.contains("deletePostReply")) {
        await deleteReplyMain(password, confirmBtn.value);
      } else if (confirmBtn.classList.contains("reactivateReply")) {
        await reActivateReplyMain(password, confirmBtn.value);
      } else if (confirmBtn.classList.contains("updateReply")) {
        await editReplyMain(password, confirmBtn.value);
      } else if (confirmBtn.classList.contains("add-fourm-member")) {
        await addForumMemberMain(password, confirmBtn.value);
      } else if (
        confirmBtn.classList.contains("respondeToMemberRequestForum")
      ) {
        await respondeMemberRequestForumMain(
          password,
          JSON.parse(confirmBtn.value)
        );
      } else if (confirmBtn.classList.contains("addForumPost")) {
        await createForumMemberPostMain(password, JSON.parse(confirmBtn.value));
      } else if (confirmBtn.classList.contains("addNewForum")) {
        await addNewForum(password, JSON.parse(confirmBtn.value));
      } else if (confirmBtn.classList.contains("addUserPost_postSection")) {
        await addPost_postSectionMain(password, JSON.parse(confirmBtn.value));
      } else if (confirmBtn.classList.contains("addNewUser")) {
        await addUser(password, JSON.parse(confirmBtn.value));
      } else if (confirmBtn.classList.contains("editUserDetails")) {
        await editUserMain(password, JSON.parse(confirmBtn.value));
      } else if (confirmBtn.classList.contains("editUserPassword")) {
        await editUserPasswordMain(password, JSON.parse(confirmBtn.value));
      } else if (confirmBtn.classList.contains("editUserProfilePic")) {
        await editUserProfile(password, JSON.parse(confirmBtn.value));
      } else if (confirmBtn.classList.contains("createNotification")) {
        await createNotificationMain(password, JSON.parse(confirmBtn.value));
      } else if (confirmBtn.classList.contains("editNotification")) {
        await editNotificationMain(password, JSON.parse(confirmBtn.value));
      } else if (confirmBtn.classList.contains("deleteNotification")) {
        await deleteNotificationMain(password, JSON.parse(confirmBtn.value));
      } else if (confirmBtn.classList.contains("removeJoinee")) {
        await removeJoineeMain(password, JSON.parse(confirmBtn.value));
      } else if (confirmBtn.classList.contains("addUserToAllowedUser")) {
        await addNewAllowedUserMain(password, JSON.parse(confirmBtn.value));
      } else if (confirmBtn.classList.contains("deleteAllowedUser")) {
        await deleteAllowedUserMain(password, JSON.parse(confirmBtn.value));
      }
    } else {
      message.textContent = "Password is required";
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    }
  });

document
  .querySelector(".close-admin-pass-confirm-form")
  .addEventListener("click", () => {
    document
      .querySelector(".admin-confirm-pass-container")
      .classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
    let classlist = document.querySelector(".admin-confirm-pass-button");
    classlist.classList.forEach((el) => {
      if (el != "admin-confirm-pass-button") {
        classlist.classList.remove(el);
      }
    });
  });

// ** FORUMS

document
  .querySelector(".search-forum-main")
  .addEventListener("keydown", async (e) => {
    let inputValue = document.querySelector(".search-forum-main").value.trim();
    document.querySelector(".top3-forums-display").classList.remove("hide");
    document
      .querySelector(".forum-main-search-container")
      .classList.add("hide");
    if (e.key == "Enter" && inputValue != "") {
      forumSearchedByFilter = false;
      document.querySelector(".top3-forums-display").classList.add("hide");
      document
        .querySelector(".forum-main-search-container")
        .classList.remove("hide");
      filter = {
        searchQuery: inputValue,
        byAdmin: true,
      };
      await getForumBySearch(inputValue);
    }
  });

document
  .querySelector(".forum-main-panel-1")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("view-detail-btn-forum-section")) {
      document.querySelector(".forum-main-panel-1").classList.add("hide");
      document.querySelector(".forum-main-panel-2").classList.remove("hide");
      await Promise.all([viewForumDetails(target), fetchUserPosts()]);
    }

    if (target.classList.contains("copy-forumId-to-clipboard")) {
      copyForumIdToClipboard(target);
    }
  });

document
  .querySelector(".forum-main-panel-2")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("forum-post-delete")) {
      await deleteUserPost(target);
    } else if (target.classList.contains("forum-post-like")) {
      await fetchPostLikes(target);
    } else if (target.classList.contains("forum-post-edit")) {
      editForumPost(target);
    } else if (target.classList.contains("forum-post-user-comment")) {
      await fetchPostComments(target);
    }
  });

document
  .querySelector(".forum-m2-delete-forum")
  .addEventListener("click", async () => {
    let confirm = await showConfirmation("Do you want to delete the forum?");
    if (confirm == true) {
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.add("deleteforum");
      document.querySelector(".admin-confirm-pass-button").value =
        sessionStorage.getItem("currentForum");
    } else {
      document.querySelector(".blur").classList.add("hide");
    }
  });

document.querySelector(".close-forum-m2").addEventListener("click", () => {
  document.querySelector(".forum-main-panel-1").classList.remove("hide");
  document.querySelector(".forum-main-panel-2").classList.add("hide");
  document.querySelector(".top3-forums-display").classList.remove("hide");
  document.querySelector(".forum-main-search-container").classList.add("hide");
  document.querySelector(".search-forum-main").value = "";
});

document
  .querySelector(".forum-m2-posts-container")
  .addEventListener("scroll", async function () {
    let container = this;
    let isTop = container.scrollTop === 0;
    if (isTop) {
      let forumId = sessionStorage.getItem("currentForum");
      loader(1);

      let response = await fetch(
        "https://opentalks.cyclic.app/admin/post/all",
        {
          method: "POST",
          body: JSON.stringify({ forumId, startPoint: forum_startPoint }),
          headers: {
            "Content-type": "application/json;charset=utf-8",
            Authorization: sessionStorage.getItem("token"),
          },
        }
      );
      let data = await response.json();
      loader(0);

      let result = "";
      if (!!data && data.success == true) {
        let posts = data.posts.reverse();
        forum_startPoint = data.nextStartPoint;
        posts.forEach((el) => {
          let isPostLiked = el.likes > 0 ? "fa-solid" : "fa-regular";
          if (el.active == true) {
            result += `
            <div class="forum-post-template">
            <h3 class="forum-post-title">${el.title}</h3>
            <p class="forum-post-description">${el.description}</p>
            <div class="forum-post-user-info-container">
              <div class="forum-post-date-time">
                <span class="forum-post-date"
                  >${formatDate(el.createdAt)}</span
                >
              </div>
              <div class="forum-post-user-info">
                <img
                  src="https://opentalks.cyclic.app${el.userId.image}"
                  class="forum-post-main-user-profile"
                />
                <span class="forum-post-user-name">By ${el.userId.name}</span>
              </div>
            </div>
            <div class="forum-post-links-template-main">
              <i class="${isPostLiked} fa-heart forum-post-like" data-postid="${
              el._id
            }"></i>
              <i class="fa-solid fa-comment forum-post-user-comment" data-postid="${
                el._id
              }"></i>
              <i class="fa-solid fa-trash-can forum-post-delete" data-postid="${
                el._id
              }"></i>
              <i class="fa-solid fa-pen forum-post-edit" data-postid="${
                el._id
              }"></i>
            </div>
            </div>
            `;
          } else {
            result += `
            <div class="forum-post-template forum-post-deleted">
            <h3 class="forum-post-title">${el.title}</h3>
            <p class="forum-post-description">${el.description}</p>
            <div class="forum-post-user-info-container">
              <div class="forum-post-date-time">
                <span class="forum-post-date"
                  >${formatDate(el.createdAt)}</span
                >
              </div>
              <div class="forum-post-user-info">
                <img
                src="https://opentalks.cyclic.app${el.userId.image}"
                  class="forum-post-main-user-profile"
                />
                <span class="forum-post-user-name">By ${el.userId.name}</span>
              </div>
            </div>
            <div class="forum-post-links-template-main">
              <i class="${isPostLiked} fa-heart forum-post-like" data-postid="${
              el._id
            }"></i>
              <i class="fa-solid fa-comment forum-post-user-comment" data-postid="${
                el._id
              }"></i>
            </div>
            </div>
            `;
          }
        });
        let prevScrollHeight = container.scrollHeight;
        container.insertAdjacentHTML("afterbegin", result);
        let newScrollHeight = container.scrollHeight;
        let scrollOffset = newScrollHeight - prevScrollHeight;
        container.scrollTop = scrollOffset;
      }
    }
  });

// ** DETAILS OF FORUM

document
  .querySelector(".forum-m2-details-forum")
  .addEventListener("click", () => {
    document.querySelector(".details-of-forum").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
  });

document
  .querySelector(".close-details-of-forum")
  .addEventListener("click", () => {
    document.querySelector(".details-of-forum").classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

// ** EDIT FORUM

document
  .querySelector(".forum-m2-edit-forum")
  .addEventListener("click", async () => {
    document.querySelector(".edit-forum").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    document.querySelector(".edit-forum-name").value = getForum.name;
    document.querySelector(".edit-forum-description").value =
      getForum.description;
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/department/all",
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
    if (!!data && data.success == true) {
      data.departments.forEach((el) => {
        if (el._id == getForum.departmentId._id) {
          result += `<option selected value="${el._id}">${el.name}</option>`;
        } else {
          result += `<option value="${el._id}">${el.name}</option>`;
        }
      });
      document.querySelector(".edit-forum-dropdown").innerHTML = result;
    }
  });

document.querySelector(".close-edit-forum").addEventListener("click", () => {
  document.querySelector(".edit-forum").classList.add("hide");
  document.querySelector(".blur").classList.add("hide");
});

document
  .querySelector(".edit-forum-submit")
  .addEventListener("click", async () => {
    await editForum();
  });

// ** POSTS

document
  .querySelector(".close-post-like-container")
  .addEventListener("click", () => {
    document.querySelector(".post-likes-container").classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

document
  .querySelector(".post-likes-container")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("post-like-unlike")) {
      await unlikeUserPost(target);
    }
  });

document
  .querySelector(".close-edit-post-container")
  .addEventListener("click", () => {
    document.querySelector(".post-edit-container").classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

document
  .querySelector(".submit-edit-post")
  .addEventListener("click", async () => {
    let container = targetedDepratmentContainer;
    let data = {};
    let postId, postTitlePrev, postDescriptionPrev;
    if (container.classList.contains("forum-post-template")) {
      postId = container.querySelector(".forum-post-edit").dataset.postid;
      postTitlePrev = container.querySelector(".forum-post-title").textContent;
      postDescriptionPrev = container.querySelector(
        ".forum-post-description"
      ).textContent;
    }

    if (container.classList.contains("top10-post-template")) {
      postId = container.querySelector(".edit-post-top10").dataset.postid;
      postTitlePrev = container.querySelector(".top-10-post-title").textContent;
      postDescriptionPrev = container.querySelector(
        ".top-10-post-description"
      ).textContent;
    }

    let postTitleCurrent = document
      .querySelector(".post-title-input")
      .value.trim();
    let postDescriptioCurrent = document
      .querySelector(".post-description-input")
      .value.trim();
    let count = 0;
    if (postTitleCurrent != postTitlePrev) {
      count++;
      data.title = postTitleCurrent;
    }
    if (postDescriptioCurrent != postDescriptionPrev) {
      count++;
      data.description = postDescriptioCurrent;
    }
    if (count != 0) {
      document.querySelector(".post-edit-container").classList.add("hide");
      let confirm = await showConfirmation("Do you want to edit the post?");
      if (confirm == true) {
        document.querySelector(".admin-confirm-pass-input").value = "";
        document
          .querySelector(".admin-confirm-pass-container")
          .classList.remove("hide");
        document.querySelector(".blur").classList.remove("hide");
        document
          .querySelector(".admin-confirm-pass-button")
          .classList.add("editForumPost");
        document.querySelector(".admin-confirm-pass-button").value =
          JSON.stringify({ ...data, postId });
      } else {
        document.querySelector(".post-edit-container").classList.remove("hide");
        document.querySelector(".blur").classList.remove("hide");
      }
    } else {
      document.querySelector(".message-post-edit").classList.add("show");
      document.querySelector(".message-post-edit").textContent =
        "No changes are done!!";
      setTimeout(() => {
        document.querySelector(".message-post-edit").classList.remove("show");
        document.querySelector(".post-edit-container").classList.add("hide");
        document.querySelector(".blur").classList.add("hide");
      }, 2500);
    }
  });

// ** FORUM MEMBERS

document
  .querySelector(".forum-m2-members-forum")
  .addEventListener("click", async () => {
    document.querySelector(".forum-members-container").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    document.querySelector(".forum-member-table-top h4").textContent =
      "Recent Users List";
    document.querySelector(".forum-member-search-bar").value = "";
    is_search_member = false;
    await getForumMembers();
  });

document
  .querySelector(".close-forum-member")
  .addEventListener("click", async () => {
    document.querySelector(".forum-members-container").classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

document
  .querySelector(".forum-members-container")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("forum-member-remove-user")) {
      await deleteForumMember(target);
    }
  });

document
  .querySelector(".forum-member-search-bar")
  .addEventListener("keydown", async function (e) {
    let target = document.querySelector(".forum-member-search-bar");
    if (e.key == "Enter" && target.value.trim() != "") {
      forum_member_search = target.value.trim();
      is_search_member = true;
      document.querySelector(".forum-member-table-top h4").textContent =
        "Searched Forum Members";
      await fetchSearchedForumMembers();
    }
  });

document
  .querySelector(".forum-member-table-container")
  .addEventListener("scroll", async (event) => {
    let { scrollHeight, scrollTop, clientHeight } = event.target;
    if (
      Math.abs(scrollHeight - clientHeight - scrollTop) < 1 &&
      is_search_member == true
    ) {
      await fetchForumMemberScroll();
    }
  });

document
  .querySelector(".forum-member-links")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("add-forum-member")) {
      document.querySelector(".add-member-regis-no-input").value = "";
      document
        .querySelector(".add-forum-member-container")
        .classList.remove("hide");
      document.querySelector(".forum-members-container").classList.add("hide");
    }
  });

document
  .querySelector(".close-add-forum-member-container")
  .addEventListener("click", () => {
    document.querySelector(".add-forum-member-container").classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

document
  .querySelector(".add-forum-member-btn")
  .addEventListener("click", () => {
    let registration_number = document.querySelector(
      ".add-member-regis-no-input"
    ).value;
    let forumId = sessionStorage.getItem("currentForum");
    let message = document.querySelector(".message-add-member");
    let count = 0;
    if (!registration_number) {
      count++;
    }
    if (!forumId) {
      count++;
    }
    if (count != 0) {
      message.textContent = "All fields are necessary";
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    } else {
      document
        .querySelector(".add-forum-member-container")
        .classList.add("hide");
      document.querySelector(".admin-confirm-pass-input").value = "";
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.add("add-fourm-member");
      document.querySelector(".admin-confirm-pass-button").value =
        JSON.stringify({ registration_number, forumId });
    }
  });

document
  .querySelector(".post-like-list")
  .addEventListener("scroll", async (event) => {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      await fetchPostLikesScroll();
    }
  });

// ** JOIN REQUESTS
document
  .querySelector(".forum-m2-requests-forum")
  .addEventListener("click", async () => {
    document.querySelector(".forum-member-join-list").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    await fetchMemberJoinRequests();
  });

// ** POST REPLY
document
  .querySelector(".close-post-reply-container")
  .addEventListener("click", () => {
    document.querySelector(".post-reply-container").classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

document
  .querySelector(".post-reply-container")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("post-reply-delete")) {
      await deleteReply(target);
    } else if (target.classList.contains("post-reply-update")) {
      editReply(target);
    } else if (target.classList.contains("post-reply-reactive")) {
      reActivateReply(target);
    }
  });

document
  .querySelector(".close-post-reply-edit")
  .addEventListener("click", () => {
    document.querySelector(".post-reply-container").classList.remove("hide");
    document.querySelector(".post-reply-edit").classList.add("hide");
  });

document
  .querySelector(".post-reply-edit-btn")
  .addEventListener("click", async () => {
    let { prevMessage, _id } = JSON.parse(
      document.querySelector(".post-reply-edit-btn").value
    );
    let newMessage = document
      .querySelector(".post-reply-edit-input")
      .value.trim();
    let notifyMessage = document.querySelector(".message-post-edit-reply");

    if (newMessage == prevMessage) {
      notifyMessage.classList.remove("hide");
      notifyMessage.textContent = "No change is done";
      setTimeout(() => {
        notifyMessage.classList.add("hide");
        document
          .querySelector(".post-reply-container")
          .classList.remove("hide");
        document.querySelector(".post-reply-edit").classList.add("hide");
      }, 2500);
    } else {
      document.querySelector(".admin-confirm-pass-input").value = "";
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.add("updateReply");
      document.querySelector(".admin-confirm-pass-button").value =
        JSON.stringify({ message: newMessage, _id });
      document.querySelector(".post-reply-edit").classList.add("hide");
    }
  });

// ** FORUM JOIN REQUESTS

document
  .querySelector(".close-forum-member-join-list")
  .addEventListener("click", () => {
    document.querySelector(".forum-member-join-list").classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

document
  .querySelector(".forum-member-join-list")
  .addEventListener("click", (el) => {
    let target = el.target;
    if (target.classList.contains("member-join-request")) {
      let data = JSON.parse(target.value);
      respondeMemberRequestForum(data, target);
    }
  });

// ** FORUM COMPLAINTS

document
  .querySelector(".forum-m2-complaints-forum")
  .addEventListener("click", async () => {
    document
      .querySelector(".forum-complaints-container")
      .classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    await fetchForumComplaint();
  });

document
  .querySelector(".forum-complaints-main")
  .addEventListener("scroll", async (event) => {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      await fetchForumComplaintScroll();
    }
  });

document
  .querySelector(".close-forum-complaints-container")
  .addEventListener("click", () => {
    document.querySelector(".forum-complaints-container").classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

document
  .querySelector(".forum-complaints-container")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("forum-complaint-responses-btn")) {
      await responsesToForumCompalints(JSON.parse(target.value), target);
    }
  });

document
  .querySelector(".close-forum-responses-container")
  .addEventListener("click", () => {
    document
      .querySelector(".forum-complaints-container")
      .classList.remove("hide");
    document.querySelector(".forum-response-container").classList.add("hide");
  });

// ** ADD FORUM

document.querySelector(".add-forum").addEventListener("click", async () => {
  document.querySelector(".add-forum-container").classList.remove("hide");
  document.querySelector(".blur").classList.remove("hide");

  document.querySelector(".add-forum-name").value = "";
  document.querySelector(".add-forum-description").value = "";
  document.querySelector(".add-forum-department").value = "";
  document.querySelector(".add-forum-registration-no").value = "";
  loader(1);

  let response = await fetch(
    "https://opentalks.cyclic.app/admin/department/all",
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
  let container = document.querySelector(".add-forum-department");
  if (!!data && data.success == true) {
    data.departments.forEach((el) => {
      result += `<option value="${el._id}">${el.name}</option>`;
    });
    container.innerHTML = result;
    container.insertAdjacentHTML(
      "afterbegin",
      '<option value="" selected>Select Department</option>'
    );
  }
});

document.querySelector(".close-add-forum").addEventListener("click", () => {
  document.querySelector(".add-forum-container").classList.add("hide");
  document.querySelector(".blur").classList.add("hide");
});

document.querySelector(".add-forum-btn").addEventListener("click", async () => {
  let forumName = document.querySelector(".add-forum-name").value;
  let forumDescription = document.querySelector(".add-forum-description").value;
  let forumDepartment = document.querySelector(".add-forum-department").value;
  let forumAdmin = document.querySelector(".add-forum-registration-no").value;
  let message = document.querySelector(".message-add-forum");
  let count = 0;
  if (!forumName) {
    count++;
  }
  if (!forumDescription) {
    count++;
  }
  if (!forumDepartment) {
    count++;
  }
  if (!forumAdmin) {
    count++;
  }
  if (count != 0) {
    message.textContent = "All fields are required";
    message.classList.remove("hide");
    setTimeout(() => {
      message.classList.add("hide");
    }, 2500);
  } else {
    data = {
      registration_number: Number(forumAdmin),
      name: forumName,
      description: forumDescription,
      departmentId: forumDepartment,
    };
    document.querySelector(".add-forum-container").classList.add("hide");
    document.querySelector(".admin-confirm-pass-input").value = "";
    document
      .querySelector(".admin-confirm-pass-container")
      .classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    document
      .querySelector(".admin-confirm-pass-button")
      .classList.add("addNewForum");
    document.querySelector(".admin-confirm-pass-button").value =
      JSON.stringify(data);
  }
});

// ** POST SECTION

document
  .querySelector(".post-main-panel1")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("delete-post-top10")) {
      await deleteUserPost_postSection(target);
    } else if (target.classList.contains("likes-post-top10")) {
      await fetchPostLikes(target);
    } else if (target.classList.contains("edit-post-top10")) {
      await editUserPost_postSection(target);
    } else if (target.classList.contains("reply-post-top10")) {
      await fetchPostComments(target);
    }
  });

document
  .querySelector(".post-main-panel1-searchInp")
  .addEventListener("keydown", async (e) => {
    let searchInput = document.querySelector(
      ".post-main-panel1-searchInp"
    ).value;
    document.querySelector(".post-main-search-container").classList.add("hide");
    document.querySelector(".top10-posts-display").classList.remove("hide");

    if (e.key == "Enter" && searchInput != "") {
      post_startPoint = 0;
      filter = {};
      document
        .querySelector(".post-main-search-container")
        .classList.remove("hide");
      document.querySelector(".top10-posts-display").classList.add("hide");
      await searchPost(searchInput);
    }
  });

document
  .querySelector(".post-main-search-list")
  .addEventListener("scroll", async function (event) {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      let searchInput = document
        .querySelector(".post-main-panel1-searchInp")
        .value.trim();
      let query =
        isEmptyObject(filter) == true
          ? {
              search: searchInput,
              startPoint: post_startPoint,
            }
          : {
              filter,
              isFilter: true,
              startPoint: post_startPoint,
            };
      loader(1);

      let response = await fetch(
        "https://opentalks.cyclic.app/admin/post/search",
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

      let result = "";
      let container = document.querySelector(".post-main-search-list");
      if (!!data && data.success == true) {
        post_startPoint = data.nextStartPoint;
        data.posts.forEach((el) => {
          let isUpdated =
            el.updatedAt == null ? "Not updated yet" : formatDate(el.updatedAt);
          let isLiked = el.likes > 0 ? "fa-solid" : "fa-regular";
          let isDeleted = el.active == true ? "" : "deletedPost";
          let ifDeleted =
            el.active == true
              ? `<i
        class="fa-solid fa-trash-can delete-post-top10"
        title="Delete post"
        data-postid="${el._id}"
      ></i>`
              : "";
          let highlightedTitle = isEmptyObject(filter)
            ? el.title.replace(
                new RegExp(searchInput.trim(), "gi"),
                (match) => `<span class="highlight">${match}</span>`
              )
            : `${el.title}`;
          // let highlightedDescription = isEmptyObject(filter)
          //   ? el.description.replace(
          //       new RegExp(searchInput.trim(), "gi"),
          //       (match) => `<span class="highlight">${match}</span>`
          //     )
          //   : `${el.description}`;
          result += `
  <div class="top10-post-template ${isDeleted}">
  <h3 class="top-10-post-title">${highlightedTitle}</h3>
  <div class="top-10-post-user-info">
    <div class="top-10-post-info">
      <p class="top-10-post-description">${el.description}</p>
      <div class="top-10-forum-name">
        <span class="top-10-forum-label">Forum: </span
        >${el.forumId.name}
      </div>
    </div>
    <div class="top-10-post-user-info-main">
      <img
        src="https://opentalks.cyclic.app${el.userId.image}"
        alt="user-profile-pic"
        class="top-10-post-user-profile"
      />
      <div class="top-10-post-user-details">
        <p class="top-10-post-user-name">${el.userId.name}</p>
        <p class="top-10-post-date">
          Created at: ${formatDate(el.createdAt)}
        </p>
        <p class="top-10-post-date">
          Updated at: ${isUpdated}
        </p>
      </div>
    </div>
  </div>
  <div class="top-10-post-links">
  <p class="top10-post-likes">${el.likes} <i
      class="${isLiked} fa-heart likes-post-top10"
      title="Post likes"
      data-postid="${el._id}"
    ></i>
  </p>
    <i
      class="fa-solid fa-comment reply-post-top10"
      title="Post Replies"
      data-postid="${el._id}"
    ></i>

    <i
      class="fa-solid fa-pencil edit-post-top10"
      title="Edit post"
      data-postid="${el._id}"
    ></i>
    ${ifDeleted}
  </div>
</div>
  
  `;
        });
        let prevScrollHeight = container.scrollHeight;
        container.insertAdjacentHTML("beforeend", result);
        container.scrollTop = prevScrollHeight;
      }
    }
  });

document
  .querySelector(".post-main-panel1-filter-btn")
  .addEventListener("click", () => {
    document.querySelector(".post-filter-container").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    filter = {};
  });

document
  .querySelector(".close-post-filter-container")
  .addEventListener("click", () => {
    document.querySelector(".post-filter-container").classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

document
  .querySelector(".post-filter-apply")
  .addEventListener("click", async () => {
    filter = {};
    let userFilter = document.querySelector(".post-filter-user").value;
    let forumFilter = document.querySelector(".post-filter-forum").value;
    let createdDateFilter = document.querySelector(
      ".post-filter-created-date"
    ).value;
    let updatedDateFilter = document.querySelector(
      ".post-filter-updated-date"
    ).value;

    if (userFilter.trim() !== "") {
      filter.registration_number = Number(userFilter);
    }

    if (forumFilter.trim() !== "") {
      filter.forum_name = forumFilter;
    }

    if (createdDateFilter.trim() !== "") {
      let [year, month, day] = createdDateFilter.split("-");
      const isoDate = new Date(
        `${year}-${month}-${day}T00:00:00.000Z`
      ).toISOString();
      filter.createdAt = isoDate;
    }

    if (updatedDateFilter.trim() !== "") {
      let [year, month, day] = updatedDateFilter.split("-");
      const isoDate = new Date(
        `${year}-${month}-${day}T00:00:00.000Z`
      ).toISOString();
      filter.updatedAt = isoDate;
    }

    filter.active = document.querySelector(
      ".post-filter-status-toggle"
    ).checked;
    await postSearchWithFilter(filter);
  });

document.querySelector(".post-filter-clear").addEventListener("click", () => {
  document.querySelector(".post-filter-user").value = "";
  document.querySelector(".post-filter-forum").value = "";
  document.querySelector(".post-filter-created-date").value = "";
  document.querySelector(".post-filter-updated-date").value = "";

  document.querySelector(".post-filter-status-toggle").checked = false;
});

document
  .querySelector(".post-main-add-post-btn")
  .addEventListener("click", async () => {
    document
      .querySelector(".add-post-postSection-container")
      .classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    document.querySelector(".add-post-postSection-title").value = "";
    document.querySelector(".add-post-postSection-description").value = "";
    document.querySelector(".add-post-postSection-regNo").value = "";
    document.querySelector(".add-post-postSection-forumname").value = "";
  });

document
  .querySelector(".close-add-post-postSection-container")
  .addEventListener("click", () => {
    document
      .querySelector(".add-post-postSection-container")
      .classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

document
  .querySelector(".add-post-postSection-btn")
  .addEventListener("click", async () => {
    let postTitle = document.querySelector(".add-post-postSection-title").value;
    let postDescription = document.querySelector(
      ".add-post-postSection-description"
    ).value;
    let postUserRegNo = document.querySelector(
      ".add-post-postSection-regNo"
    ).value;
    let postForumName = document.querySelector(
      ".add-post-postSection-forumname"
    ).value;
    let message = document.querySelector(".message-add-post-postSection");
    let count = 0;
    if (!postTitle) {
      count++;
    }
    if (!postDescription) {
      count++;
    }
    if (!postUserRegNo) {
      count++;
    }
    if (!postForumName) {
      count++;
    }

    if (count != 0) {
      message.textContent = "All fields are required";
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
    } else {
      let data = {};
      data.registration_number = Number(postUserRegNo.trim());
      data.forumId = postForumName.trim();
      data.title = postTitle.trim();
      data.description = postDescription.trim();
      await addPost_postSection(data);
    }
  });

// ** USER SECTION

document
  .querySelector(".main-users-panel")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("edit-user-main-panel1")) {
      await editUser(target.dataset.userid);
    } else if (target.classList.contains("delete-user-main-panel1")) {
      console.log("Dlete");
    }
  });

document
  .querySelector(".user-main-panel1-change-searchInp")
  .addEventListener("click", () => {
    let searchInput = document.querySelector(".user-main-panel1-searchInp");
    searchInput.value = "";
    if (searchInput.placeholder == "Search by name") {
      searchInput.placeholder = "Search by registration number";
      searchInput.type = "number";
    } else {
      searchInput.placeholder = "Search by name";
      searchInput.type = "text";
    }
  });

document
  .querySelector(".user-main-add-user-btn")
  .addEventListener("click", async () => {
    document.querySelector(".add-user-container").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    document.querySelector(".add-user-name").value = "";
    document.querySelector(".add-user-regisNo").value = "";
    document.querySelector(".add-user-email").value = "";
    document.querySelector(".add-user-department").value = "";
    document.querySelector(".add-user-password").value = "";
    document.querySelector(".add-user-confirm-password").value = "";
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/department/all",
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
    let container = document.querySelector(".add-user-department");
    if (!!data && data.success == true) {
      data.departments.forEach((el) => {
        result += `<option value="${el._id}">${el.name}</option>`;
      });
      container.innerHTML = result;
      container.insertAdjacentHTML(
        "afterbegin",
        '<option value="" selected>Select Department</option>'
      );
    }
  });

document.querySelector(".close-add-user").addEventListener("click", () => {
  document.querySelector(".add-user-container").classList.add("hide");
  document.querySelector(".blur").classList.add("hide");
});

document.querySelector(".add-user-btn").addEventListener("click", async () => {
  let name = document.querySelector(".add-user-name").value;
  let regisNo = document.querySelector(".add-user-regisNo").value;
  let email = document.querySelector(".add-user-email").value;
  let department = document.querySelector(".add-user-department").value;
  let password = document.querySelector(".add-user-password").value;
  let confirmPassword = document.querySelector(
    ".add-user-confirm-password"
  ).value;
  let message = document.querySelector(".message-add-user");

  if (
    !name ||
    !regisNo ||
    !email ||
    !department ||
    !password ||
    !confirmPassword
  ) {
    message.textContent = "Please fill in all fields.";
    message.classList.remove("hide");
    setTimeout(() => {
      message.classList.add("hide");
    }, 2500);
    return;
  }

  if (password !== confirmPassword) {
    message.textContent = "Passwords do not match.";
    message.classList.remove("hide");
    setTimeout(() => {
      message.classList.add("hide");
    }, 2500);
    return;
  }

  let data = {};
  data.name = name.trim();
  data.registration_number = Number(regisNo.trim());
  data.email = email.trim();
  data.departmentId = department.trim();
  data.password = password.trim();

  document.querySelector(".add-user-container").classList.add("hide");
  let confirm = await showConfirmation("Do you want to add this user?");
  if (confirm == true) {
    document.querySelector(".admin-confirm-pass-input").value = "";
    document
      .querySelector(".admin-confirm-pass-container")
      .classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    document
      .querySelector(".admin-confirm-pass-button")
      .classList.add("addNewUser");
    document.querySelector(".admin-confirm-pass-button").value =
      JSON.stringify(data);
  } else {
    document.querySelector(".blur").classList.add("hide");
  }
});

// ** EDIT USER

document
  .querySelector(".edit-user-sub-containers")
  .addEventListener("click", (e) => {
    let target = e.target;
    document.querySelectorAll(".edit-user-sub-containers p").forEach((el) => {
      el.classList.remove("active-edit-user-sub");
      document
        .querySelector(`.${el.classList.value}-main`)
        .classList.add("hide");
    });

    document
      .querySelector(`.${target.classList.value}-main`)
      .classList.remove("hide");
    target.classList.add("active-edit-user-sub");
  });

document.querySelector(".close-edit-user").addEventListener("click", () => {
  document.querySelector(".edit-user-container").classList.add("hide");
  document.querySelector(".blur").classList.add("hide");
  document.querySelectorAll(".edit-user-sub-containers p").forEach((el) => {
    el.classList.remove("active-edit-user-sub");
    document.querySelector(`.${el.classList.value}-main`).classList.add("hide");
  });
  document
    .querySelector(".edit-user-details")
    .classList.add("active-edit-user-sub");
  document.querySelector(".edit-user-details-main").classList.remove("hide");
});

document
  .querySelector(".edit-user-details-btn")
  .addEventListener("click", async () => {
    let userName = document
      .querySelector(".edit-user-details-name")
      .value.trim();
    let userRegNo = document
      .querySelector(".edit-user-details-regNo")
      .value.trim();
    let userEmail = document
      .querySelector(".edit-user-details-email")
      .value.trim();
    let userDepId = document
      .querySelector(".edit-user-details-department")
      .value.trim();
    let message = document.querySelector(".message-edit-user-details");
    let user = JSON.parse(
      document.querySelector(".edit-user-details-btn").value
    );
    let toUpdate = {};
    let count = 0;
    if (user.name != userName) {
      toUpdate.name = userName;
      count++;
    }
    if (user.registration_number != Number(userRegNo)) {
      toUpdate.registration_number = Number(userRegNo);
      count++;
    }
    if (user.email != userEmail) {
      toUpdate.email = userEmail;
      count++;
    }
    if (user.departmentId != userDepId) {
      toUpdate.departmentId = userDepId;
      count++;
    }
    if (count == 0) {
      message.classList.remove("hide");
      message.textContent = "Nothing changed";
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
      return;
    }

    toUpdate._id = user._id;
    document.querySelector(".edit-user-container").classList.add("hide");
    let confirm = await showConfirmation("Do you want to edit user details?");
    if (confirm == true) {
      document.querySelector(".admin-confirm-pass-input").value = "";
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.add("editUserDetails");
      document.querySelector(".admin-confirm-pass-button").value =
        JSON.stringify(toUpdate);
    } else {
      document.querySelector(".edit-user-container").classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
    }
  });

document
  .querySelector(".edit-user-save-password-btn")
  .addEventListener("click", async () => {
    let pass = document.querySelector(".edit-user-new-password").value.trim();
    let confirmPass = document
      .querySelector(".edit-user-confirm-password")
      .value.trim();
    let message = document.querySelector(".message-edit-user-password");
    if (!pass || !confirmPass) {
      message.textContent = "All fields are required";
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
      return;
    }
    if (pass != confirmPass) {
      message.textContent = "Both Passwords does not match";
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
      return;
    }
    let user = {
      ...JSON.parse(
        document.querySelector(".edit-user-save-password-btn").value
      ),
    };
    let toUpdate = {};
    toUpdate._id = user._id;
    toUpdate.password = pass;

    document.querySelector(".edit-user-container").classList.add("hide");
    let confirm = await showConfirmation(
      "Do you want to change user account password?"
    );
    if (confirm == true) {
      document.querySelector(".admin-confirm-pass-input").value = "";
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.add("editUserPassword");
      document.querySelector(".admin-confirm-pass-button").value =
        JSON.stringify(toUpdate);
    } else {
      document.querySelector(".edit-user-container").classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
    }
  });

document
  .querySelector(".edit-user-profile-pic-upload")
  .addEventListener("change", (event) => {
    let fileName = event.target.files[0]?.name || "No file selected";
    document.querySelector(
      ".edit-user-pic-label"
    ).textContent = `Selected file: ${fileName}`;
  });

document
  .querySelector(".edit-user-upload-btn")
  .addEventListener("click", async () => {
    let selectedFile = document.querySelector(".edit-user-profile-pic-upload")
      .files[0];
    let userData = JSON.parse(
      document.querySelector(".edit-user-upload-btn").value
    );
    let message = document.querySelector(".message-edit-user-profile-pic");
    if (!selectedFile) {
      message.textContent = "Select file to upload";
      message.classList.remove("hide");
      setTimeout(() => {
        message.classList.add("hide");
      }, 2500);
      return;
    }
    document.querySelector(".edit-user-container").classList.add("hide");
    let confirm = await showConfirmation(
      "Do you want to update user profile pic?"
    );
    if (confirm == true) {
      document.querySelector(".admin-confirm-pass-input").value = "";
      document
        .querySelector(".admin-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document
        .querySelector(".admin-confirm-pass-button")
        .classList.add("editUserProfilePic");
      document.querySelector(".admin-confirm-pass-button").value =
        JSON.stringify(userData);
    } else {
      document.querySelector(".edit-user-container").classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
    }
  });

// ** USER SEARCH CONTAINER

document
  .querySelector(".user-main-panel1-searchInp")
  .addEventListener("keydown", async (e) => {
    document
      .querySelector(".user-panel1-recent-users")
      .classList.remove("hide");
    document.querySelector(".user-main-search-list").scrollTop = 0;

    document.querySelector(".user-main-search-container").classList.add("hide");
    let searchInp = document
      .querySelector(".user-main-panel1-searchInp")
      .value.trim();
    let searchInpTarget = document.querySelector(".user-main-panel1-searchInp");
    let query = {};
    if (!!searchInp && e.key == "Enter") {
      userSearchedByFilter = false;
      document.querySelector(".user-panel1-recent-users").classList.add("hide");
      document
        .querySelector(".user-main-search-container")
        .classList.remove("hide");
      if (searchInpTarget.type == "number") {
        query.registration_number = Number(searchInp);
        query.byNumber = true;
      } else {
        query.name = searchInp;
        query.byNumber = false;
      }
      userFilter = { ...query };
      await getUserBySearch(query);
    }
  });

// ** SCROLL FOR POST SEARCH USING FILTER
document
  .querySelector(".user-main-search-list")
  .addEventListener("scroll", async (event) => {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (
      Math.abs(scrollHeight - clientHeight - scrollTop) < 1 &&
      userSearchedByFilter == true
    ) {
      loader(1);

      let response = await fetch(
        "https://opentalks.cyclic.app/admin/user/search/filter",
        {
          method: "POST",
          body: JSON.stringify({
            filter: { ...userFilter },
            startPoint: user_startPoint,
          }),
          headers: {
            "Content-type": "application/json;charset=utf-8",
            Authorization: sessionStorage.getItem("token"),
          },
        }
      );
      let data = await response.json();
      loader(0);

      let result = "";
      let container = document.querySelector(".user-main-search-list");
      if (!!data && data.success == true) {
        user_startPoint = data.nextStartPoint;
        data.users.forEach((el) => {
          let highlightedEmail;
          let lastLogin =
            el.lastLogin == null ? "No logined yet" : formatDate(el.lastLogin);
          if (!!userFilter.email) {
            highlightedEmail = el.email.replace(
              new RegExp(userFilter.email.trim(), "gi"),
              (match) => `<span class="highlight">${match}</span>`
            );
          } else {
            highlightedEmail = el.email;
          }
          let isDeleted = el.active == true ? "" : "deletedUser";
          let updatedAt =
            el.updatedAt != null ? formatDate(el.updatedAt) : "Not updated yet";
          let isAdmin = el.admin == true ? "isAdmin" : "";
          let ifAdmin =
            el.admin == true
              ? ""
              : `
          <i class="fa-solid fa-pencil edit-user-main-panel1" title="Edit user" data-userid="${el._id}"></i>
          <i class="fa-solid fa-trash-can delete-user-main-panel1" title="Delete user" data-userid="${el._id}"></i>
          `;
          result += `
          <div class="recent-user-template ${isDeleted} ${isAdmin}">
          <div class="recent-user-profile">
            <img
              src="https://opentalks.cyclic.app${el.image}"
              alt="User Profile Pic"
              class="recent-user-profile-pic"
            />
          </div>
          <div class="recent-user-details">
            <h3 class="recent-user-name">${el.name}</h3>
            <p class="recent-user-registration">
              <span> Registration No: </span
              ><span class="data"> ${el.registration_number}</span>
            </p>
            <p class="recent-user-email">
              <span> Email: </span>
              <span class="data">${highlightedEmail}</span>
            </p>
            <p class="recent-user-department">
              <span>Department: </span>
              <span class="data">${el.departmentId.name}</span>
            </p>
            <div class="recent-user-imp-dates">
              <p class="recent-user-created-at">
                <span>Joined Opentalks:</span>
                <span class="data">${formatDate(el.createdAt)}</span>
              </p>
              <p>/</p>
              <p class="recent-user-updated-at">
                <span>Last Updated: </span>
                <span class="data">${updatedAt}</span>
              </p>
              <p>/</p>
              <p class="recent-user-last-login">
              <span>Last Login: </span>
              <span class="data">${lastLogin}</span>
            </p>
            </div>
          </div>
          <div class="recent-user-links-btn">
          ${ifAdmin}
          </div>
        </div>
          `;
        });
        let prevScrollHeight = container.scrollHeight;
        container.insertAdjacentHTML("beforeend", result);
        container.scrollTop = prevScrollHeight;
      }
    }
  });

// ** SCROLL FOR POST SEARCH USING SEARCH-INPUT

document
  .querySelector(".user-main-search-list")
  .addEventListener("scroll", async (event) => {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (
      Math.abs(scrollHeight - clientHeight - scrollTop) < 1 &&
      userSearchedByFilter == false
    ) {
      loader(1);

      let response = await fetch(
        "https://opentalks.cyclic.app/admin/user/search",
        {
          method: "POST",
          body: JSON.stringify({ ...userFilter, startPoint: user_startPoint }),
          headers: {
            "Content-type": "application/json;charset=utf-8",
            Authorization: sessionStorage.getItem("token"),
          },
        }
      );
      let data = await response.json();
      loader(0);

      let result = "";
      let container = document.querySelector(".user-main-search-list");
      if (!!data && data.success == true) {
        user_startPoint = data.nextStartPoint;
        data.users.forEach((el) => {
          let highlightedName = el.name.replace(
            new RegExp(userFilter.name.trim(), "gi"),
            (match) => `<span class="highlight">${match}</span>`
          );
          let isDeleted = el.active == true ? "" : "deletedUser";
          let lastLogin =
            el.lastLogin == null ? "No logined yet" : formatDate(el.lastLogin);
          let updatedAt =
            el.updatedAt != null ? formatDate(el.updatedAt) : "Not updated yet";
          let isAdmin = el.admin == true ? "isAdmin" : "";
          let ifAdmin =
            el.admin == true
              ? ""
              : `
        <i class="fa-solid fa-pencil edit-user-main-panel1" title="Edit user" data-userid="${el._id}"></i>
        <i class="fa-solid fa-trash-can delete-user-main-panel1" title="Delete user" data-userid="${el._id}"></i>
        `;
          result += `
        <div class="recent-user-template ${isDeleted} ${isAdmin}">
        <div class="recent-user-profile">
          <img
            src="https://opentalks.cyclic.app${el.image}"
            alt="User Profile Pic"
            class="recent-user-profile-pic"
          />
        </div>
        <div class="recent-user-details">
          <h3 class="recent-user-name">${highlightedName}</h3>
          <p class="recent-user-registration">
            <span> Registration No: </span
            ><span class="data"> ${el.registration_number}</span>
          </p>
          <p class="recent-user-email">
            <span> Email: </span>
            <span class="data">${el.email}</span>
          </p>
          <p class="recent-user-department">
            <span>Department: </span>
            <span class="data">${el.departmentId.name}</span>
          </p>
          <div class="recent-user-imp-dates">
            <p class="recent-user-created-at">
              <span>Joined Opentalks:</span>
              <span class="data">${formatDate(el.createdAt)}</span>
            </p>
            <p>/</p>
            <p class="recent-user-updated-at">
              <span>Last Updated: </span>
              <span class="data">${updatedAt}</span>
            </p>
            <p>/</p>
            <p class="recent-user-last-login">
            <span>Last Login: </span>
            <span class="data">${lastLogin}</span>
          </p>
          </div>
        </div>
        <div class="recent-user-links-btn">
        ${ifAdmin}
        </div>
      </div>
        `;
        });
        let prevScrollHeight = container.scrollHeight;
        container.insertAdjacentHTML("beforeend", result);
        container.scrollTop = prevScrollHeight;
      }
    }
  });

// ** USER FILTER
document
  .querySelector(".user-main-panel1-filter-btn")
  .addEventListener("click", async () => {
    document.querySelector(".filter-user-container").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/admin/department/all",
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
    let container = document.querySelector(".filter-user-department");
    if (!!data && data.success == true) {
      data.departments.forEach((el) => {
        result += `<option value="${el._id}">${el.name}</option>`;
      });
      container.innerHTML = result;
      container.insertAdjacentHTML(
        "afterbegin",
        '<option value="" selected>Select Department</option>'
      );
    }
  });

document.querySelector(".close-filter-user").addEventListener("click", () => {
  document.querySelector(".filter-user-container").classList.add("hide");
  document.querySelector(".blur").classList.add("hide");
});

document.querySelector(".filter-user-clear").addEventListener("click", () => {
  document.querySelector(".filter-user-email").value = "";
  document.querySelector(".filter-user-regNo").value = "";
  document.querySelector(".filter-user-department").value = "";
  document.querySelector(".filter-user-created-at").value = "";
  document.querySelector(".filter-user-updated-at").value = "";
  document.querySelector(".filter-user-last-login").value = "";
  document.querySelector(".filter-user-active-toggle").checked = true;
  document.querySelector(".filter-user-admin-toggle").checked = false;
});

document
  .querySelector(".filter-user-apply")
  .addEventListener("click", async () => {
    document.querySelector(".user-main-search-list").scrollTop = 0;
    userSearchedByFilter = true;
    let userEmail = document.querySelector(".filter-user-email").value.trim();
    let userRegNo = document.querySelector(".filter-user-regNo").value.trim();
    let userDep = document
      .querySelector(".filter-user-department")
      .value.trim();
    let userCreatedAt = document
      .querySelector(".filter-user-created-at")
      .value.trim();
    let userUpdatedAt = document
      .querySelector(".filter-user-updated-at")
      .value.trim();
    let userLastLogin = document
      .querySelector(".filter-user-last-login")
      .value.trim();
    let userActive = document.querySelector(
      ".filter-user-active-toggle"
    ).checked;
    let userAdmin = document.querySelector(".filter-user-admin-toggle").checked;
    let filter = {};
    if (!!userEmail) {
      filter.email = userEmail;
    }
    if (!!userRegNo) {
      filter.registration_number = Number(userRegNo);
    }
    if (!!userDep) {
      filter.departmentId = userDep;
    }
    if (!!userCreatedAt) {
      let [year, month, day] = userCreatedAt.split("-");
      const isoDate = new Date(
        `${year}-${month}-${day}T00:00:00.000Z`
      ).toISOString();
      filter.createdAt = isoDate;
    }
    if (!!userUpdatedAt) {
      let [year, month, day] = userUpdatedAt.split("-");
      const isoDate = new Date(
        `${year}-${month}-${day}T00:00:00.000Z`
      ).toISOString();
      filter.updatedAt = isoDate;
    }
    if (!!userLastLogin) {
      let [year, month, day] = userLastLogin.split("-");
      const isoDate = new Date(
        `${year}-${month}-${day}T00:00:00.000Z`
      ).toISOString();
      filter.lastLogin = isoDate;
    }
    filter.active = userActive == true ? true : false;
    filter.admin = userAdmin == true ? true : false;
    userFilter = { ...filter };
    await getUserBySearchWithFilter(filter);
  });

// ** FORUM FILTER
document.querySelector(".forum-filter").addEventListener("click", async () => {
  document.querySelector(".forum-filter-container").classList.remove("hide");
  document.querySelector(".blur").classList.remove("hide");
  loader(1);

  let response = await fetch(
    "https://opentalks.cyclic.app/admin/department/all",
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
  let container = document.querySelector(".forum-filter-department");
  if (!!data && data.success == true) {
    data.departments.forEach((el) => {
      result += `<option value="${el._id}">${el.name}</option>`;
    });
    container.innerHTML = result;
    container.insertAdjacentHTML(
      "afterbegin",
      '<option value="" selected>Select Department</option>'
    );
  }
});

document.querySelector(".close-forum-filter").addEventListener("click", () => {
  document.querySelector(".forum-filter-container").classList.add("hide");
  document.querySelector(".blur").classList.add("hide");
});

document
  .querySelector(".forum-filter-clear-button")
  .addEventListener("click", () => {
    document.querySelector(".forum-filter-department").value = "";
    document.querySelector(".forum-filter-registration").value = "";
    document.querySelector(".forum-filter-username").value = "";
    document.querySelector(".forum-filter-date-createdAt").value = "";
    document.querySelector(".forum-filter-date-updatedAt").value = "";
    document.querySelector(".filter-forum-active-toggle").checked = true;
    document.querySelector(".forum-filter-sort").value = "";
  });

document
  .querySelector(".forum-filter-apply-button")
  .addEventListener("click", async () => {
    let forumDep = document.querySelector(".forum-filter-department").value;
    let forumAdminReg = document
      .querySelector(".forum-filter-registration")
      .value.trim();
    let forumAdminName = document
      .querySelector(".forum-filter-username")
      .value.trim();
    let forumCreatedAt = document.querySelector(
      ".forum-filter-date-createdAt"
    ).value;
    let forumUpdatedAt = document.querySelector(
      ".forum-filter-date-updatedAt"
    ).value;
    let forumActive = document.querySelector(
      ".filter-forum-active-toggle"
    ).checked;
    let forumSortOrder = document.querySelector(".forum-filter-sort").value;
    let data = {};
    if (!!forumDep) {
      data.departmentId = forumDep;
    }
    if (!!forumAdminReg) {
      data.registration_number = Number(forumAdminReg);
    }
    if (!!forumAdminName) {
      data.name = forumAdminName;
    }
    if (!!forumCreatedAt) {
      let [year, month, day] = forumCreatedAt.split("-");
      const isoDate = new Date(
        `${year}-${month}-${day}T00:00:00.000Z`
      ).toISOString();
      data.createdAt = isoDate;
    }
    if (!!forumUpdatedAt) {
      let [year, month, day] = forumUpdatedAt.split("-");
      const isoDate = new Date(
        `${year}-${month}-${day}T00:00:00.000Z`
      ).toISOString();
      data.updatedAt = isoDate;
    }
    if (!!forumSortOrder) {
      if (forumSortOrder == 1) {
        data.sortBy = { likes: -1 };
      } else {
        data.sortBy = { dislikes: -1 };
      }
    }
    data.active = forumActive;
    filter = { ...data };
    forumSearchedByFilter = true;
    await getForumByFilter(data);
  });

// ** SEARCH FORUM USING FILTER SCROLL
document
  .querySelector(".forum-main-search-list")
  .addEventListener("scroll", async function (event) {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (
      Math.abs(scrollHeight - clientHeight - scrollTop) < 1 &&
      forumSearchedByFilter == true
    ) {
      loader(1);

      let response = await fetch(
        "https://opentalks.cyclic.app/admin/forum/search/filter",
        {
          method: "POST",
          body: JSON.stringify({
            filter: { ...filter },
            startPoint: forum_filter_startPoint,
          }),
          headers: {
            "Content-type": "application/json;charset=utf-8",
            Authorization: sessionStorage.getItem("token"),
          },
        }
      );
      let data = await response.json();
      loader(0);

      let result = "";
      let container = document.querySelector(".forum-main-search-list");
      if (!!data && data.success == true) {
        forum_filter_startPoint = data.nextStartPoint;
        data.forums.forEach((el) => {
          let isDeleted = el.active == true ? "" : "deletedForumMember";

          let highlightedName = !!filter.name
            ? el.userId.name.replace(
                new RegExp(filter.name, "gi"),
                (match) => `<span class="highlight">${match}</span>`
              )
            : el.userId.name;

          result += `
  <div class="forum-card-forum-section ${isDeleted}">
                  <h3 class="forum-name-forum-section">${el.name}</h3>
                  <p class="forum-description-forum-section">${
                    el.description
                  }</p>
                  <div class="forum-section-bottom">
                    <p class="created-by-forum-section">
                      Created by <span>${highlightedName}</span>
                      <span class="forum-card-separator">|</span> Created on
                      <span>${formatDate(el.createdAt)}</span>
                    </p>
                    <button
                      class="view-detail-btn-forum-section"
                      value="${el._id}"
                    >
                    Visit forum
                    </button>
                  </div>
                  <div class="forum-section-info-links">
                    <p class="likes-forum-section">
                      <i class="fa-solid fa-heart" title="Likes"></i>
                      <span>${el.likes}</span> likes
                    </p>
                    <i class="fa-solid fa-clipboard copy-forumId-to-clipboard" title="Copy Forum-id" data-forumid="${
                      el._id
                    }"></i>
                  </div>
                </div>
  `;
        });

        let prevScrollHeight = container.scrollHeight;
        container.insertAdjacentHTML("beforeend", result);
        container.scrollTop = prevScrollHeight;
      }
    }
  });

// ** SEARCH FORUM USING SEARCH INPUT SCROLL
document
  .querySelector(".forum-main-search-list")
  .addEventListener("scroll", async function (event) {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (
      Math.abs(scrollHeight - clientHeight - scrollTop) < 1 &&
      forumSearchedByFilter == false
    ) {
      loader(1);

      let response = await fetch(
        "https://opentalks.cyclic.app/admin/forum/search",
        {
          method: "POST",
          body: JSON.stringify({
            ...filter,
            startPoint: forum_search_startPoint,
          }),
          headers: {
            "Content-type": "application/json;charset=utf-8",
            Authorization: sessionStorage.getItem("token"),
          },
        }
      );
      let data = await response.json();
      loader(0);

      let result = "";
      let container = document.querySelector(".forum-main-search-list");
      if (!!data && data.success == true) {
        forum_search_startPoint = data.nextStartPoint;
        data.forums.forEach((el) => {
          let isDeleted = el.active == true ? "" : "deletedForumMember";
          let highlightedName = el.name.replace(
            new RegExp(filter.searchQuery, "gi"),
            (match) => `<span class="highlight">${match}</span>`
          );
          let highlightedDescription = el.description.replace(
            new RegExp(filter.searchQuery, "gi"),
            (match) => `<span class="highlight">${match}</span>`
          );
          result += `
<div class="forum-card-forum-section ${isDeleted}">
                <h3 class="forum-name-forum-section">${highlightedName}</h3>
                <p class="forum-description-forum-section">${highlightedDescription}</p>
                <div class="forum-section-bottom">
                  <p class="created-by-forum-section">
                    Created by <span>${el.userId.name}</span>
                    <span class="forum-card-separator">|</span> Created on
                    <span>${formatDate(el.createdAt)}</span>
                  </p>
                  <button
                    class="view-detail-btn-forum-section"
                    value="${el._id}"
                  >
                  Visit forum
                  </button>
                </div>
                <div class="forum-section-info-links">
                  <p class="likes-forum-section">
                    <i class="fa-solid fa-heart" title="Likes"></i>
                    <span>${el.likes}</span> likes
                  </p>
                  <i class="fa-solid fa-clipboard copy-forumId-to-clipboard" title="Copy Forum-id" data-forumid="${
                    el._id
                  }"></i>
                </div>
              </div>
`;
        });
        let prevScrollHeight = container.scrollHeight;
        container.insertAdjacentHTML("beforeend", result);
        container.scrollTop = prevScrollHeight;
      }
    }
  });

// ** DASHBOARD
document
  .querySelector(".recent-posts-list")
  .addEventListener("scroll", async function (event) {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      loader(1);

      let response = await fetch(
        "https://opentalks.cyclic.app/admin/recent/posts",
        {
          method: "POST",
          body: JSON.stringify({
            startPoint: recent_posts_startPoint,
          }),
          headers: {
            "Content-type": "application/json;charset=utf-8",
            Authorization: sessionStorage.getItem("token"),
          },
        }
      );
      let data = await response.json();
      loader(0);

      let result = "";
      let container = document.querySelector(".recent-posts-list");
      if (!!data && data.success == true) {
        data.posts.forEach((el) => {
          result += `
          <div class="recent-post-card">
          <div class="recent-post-header">
            <div class="recent-post-header-main">
              <h3 class="recent-post-title">${el.title}</h3>
              <div class="recent-post-forum">
                <p>
                  <i class="fa-solid fa-comments"></i>
                  <span>${el.forumId.name}</span>
                </p>
              </div>
            </div>
            <p class="recent-post-description">${el.description}</p>
          </div>
          <div class="recent-post-footer">
            <div class="created-on-recent-post">
              ${formatDate(el.createdAt)}
            </div>
            <div class="user-info">
              <img
                src="https://opentalks.cyclic.app${el.userId.image}"
                alt="User Avatar"
                class="avatar-image-small recent-post-user-image"
              />
              <p class="recent-created-by">
                <span class="recent-post-createdby"
                  >By ${el.userId.name}</span
                >
              </p>
            </div>
          </div>
        </div>
      `;
        });

        recent_posts_startPoint = data.nextStartPoint;
        let prevScrollHeight = container.scrollHeight;
        container.insertAdjacentHTML("beforeend", result);
        container.scrollTop = prevScrollHeight;
      }
    }
  });

document
  .querySelector(".recent-forums-list")
  .addEventListener("scroll", async function (event) {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      loader(1);

      let response = await fetch(
        "https://opentalks.cyclic.app/admin/recent/forums",
        {
          method: "POST",
          body: JSON.stringify({
            startPoint: recent_forums_startPoint,
          }),
          headers: {
            "Content-type": "application/json;charset=utf-8",
            Authorization: sessionStorage.getItem("token"),
          },
        }
      );
      let data = await response.json();
      loader(0);

      let result = "";
      let container = document.querySelector(".recent-forums-list");
      if (!!data && data.success == true) {
        data.forums.forEach((el) => {
          result += `
          
          <div class="recent-forum-card">
          <div class="recent-forum-header">
            <h3 class="recent-forum-title">${el.name}</h3>
            <p class="recent-forum-description">${el.description}</p>
          </div>
          <div class="recent-forum-footer">
            <div class="created-on-recent-forum">
              ${formatDate(el.createdAt)}
            </div>
            <div class="user-info">
              <img
                src="https://opentalks.cyclic.app${el.userId.image}"
                alt="User Avatar"
                class="avatar-image-small recent-post-user-image"
              />
              <p class="recent-created-by">
                <span class="recent-forum-createdby"
                  >By ${el.userId.name}</span
                >
              </p>
            </div>
          </div>
        </div>
          `;
        });

        recent_forums_startPoint = data.nextStartPoint;
        let prevScrollHeight = container.scrollHeight;
        container.insertAdjacentHTML("beforeend", result);
        container.scrollTop = prevScrollHeight;
      }
    }
  });

// ** REFRESH FORUM
document
  .querySelector(".forum-m2-refresh-forum")
  .addEventListener("click", async () => {
    document.querySelector(".forum-main-panel-1").classList.add("hide");
    document.querySelector(".forum-main-panel-2").classList.remove("hide");
    await fetchUserPosts();
  });

// ** FORUM REVIEWS
document
  .querySelector(".forum-m2-reviews-forum")
  .addEventListener("click", async () => {
    document.querySelector(".review-forum").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    await fetchForumReviews();
  });

document
  .querySelector(".review-forum-list")
  .addEventListener("scroll", async (event) => {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      await fetchForumReviewsScroll();
    }
  });

document.querySelector(".close-review-forum").addEventListener("click", () => {
  document.querySelector(".review-forum").classList.add("hide");
  document.querySelector(".blur").classList.add("hide");
});

// ** ADD POST LINK

document
  .querySelector(".add-external-link-btn")
  .addEventListener("click", () => {
    document.querySelector(".post-editor-container").classList.add("hide");
    document
      .querySelector(".editor-add-link-container")
      .classList.remove("hide");
    document.querySelector(".editor-link-title").value = "";
    document.querySelector(".editor-link-main").value = "";
  });

document
  .querySelector(".close-editor-add-link-container")
  .addEventListener("click", () => {
    document.querySelector(".post-editor-container").classList.remove("hide");
    document.querySelector(".editor-add-link-container").classList.add("hide");
  });

document
  .querySelector(".editor-link-main-button")
  .addEventListener("click", () => {
    let title = document.querySelector(".editor-link-title").value.trim();
    let link = document.querySelector(".editor-link-main").value.trim();
    let titleLength = isInputLengthValid(title, 10).valid;
    let urlPattern = /^(https?|https):\/\/[\w.-]+\.\w+[/?].*$/;

    let invalidInputs = [];

    if (title == "") {
      invalidInputs.push("Title");
    }
    if (link == "") {
      invalidInputs.push("Link");
    }
    if (!titleLength) {
      return showNotification("Max allowed length of title is 10 words", 2500);
    }
    if (invalidInputs.length != 0) {
      return showNotification(
        `${invalidInputs.join(", ")} is required!!`,
        2500
      );
    }
    if (!urlPattern.test(link)) {
      return showNotification("Invalid URL", 2500);
    }
    let href_link = `<a href="${link}" target="_blank" class="post_link_temp">${title}</a>`;
    post_links.push(href_link);
    showNotification("Link added to description", 2500);
    document.querySelector(".post-editor-container").classList.remove("hide");
    document.querySelector(".editor-add-link-container").classList.add("hide");
  });

document.querySelector(".preview-add-link").addEventListener("click", () => {
  let link = document.querySelector(".editor-link-main").value.trim();
  let title = document.querySelector(".editor-link-title").value.trim();

  let invalidInputs = [];

  if (title == "") {
    invalidInputs.push("Title");
  }
  if (link == "") {
    invalidInputs.push("Link");
  }
  if (invalidInputs.length != 0) {
    return showNotification(`${invalidInputs.join(", ")} are required!!`, 2500);
  }
  const newTab = window.open(link, "_blank");
  newTab.focus();
});

document.querySelector(".added-links-list").addEventListener("click", () => {
  let links_list_length = post_links.length;
  if (links_list_length == 0) {
    return showNotification("No links are added yet", 2500);
  }
  document.querySelector(".editor-add-link-container").classList.add("hide");
  document.querySelector(".display-added-links").classList.remove("hide");
  let result = "";
  let conatiner = document.querySelector(".display-added-links-main");
  post_links.forEach((el, i) => {
    result += `<div class="display-added-link-template">
${el}
          <i class="fa-solid fa-xmark delete-added-link" data-index="${i}"></i>
        </div>`;
  });
  conatiner.scrollTop = 0;
  conatiner.innerHTML = result;
});

// ** DISPLAY ADDED LINKS
document
  .querySelector(".display-added-links-main")
  .addEventListener("click", (e) => {
    let target = e.target;
    if (target.classList.contains("delete-added-link")) {
      let index = target.dataset.index;
      post_links.splice(index, 1);
      target.closest(".display-added-link-template").remove();
    }
  });

document
  .querySelector(".close-display-added-link")
  .addEventListener("click", () => {
    document.querySelector(".display-added-links").classList.add("hide");
    document
      .querySelector(".editor-add-link-container")
      .classList.remove("hide");
  });

// ** ADD POST

document
  .querySelector(".forum-m2-add-post-forum")
  .addEventListener("click", () => {
    document.querySelector(".post-editor-container").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
  });
document
  .querySelector(".close-post-editor-container")
  .addEventListener("click", () => {
    document.querySelector(".post-editor-title").value = "";
    document.querySelector(".post-editor-description").value = "";
    document.querySelector(".post-editor-container").classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
    post_links.length = 0;
  });

document
  .querySelector(".post-editor-submit-button")
  .addEventListener("click", async () => {
    let title = document.querySelector(".post-editor-title").value.trim();
    let registration_number = document
      .querySelector(".post-editor-regisNo")
      .value.trim();
    let description = document
      .querySelector(".post-editor-description")
      .value.replace(/\n/g, "<br>")
      .trim();
    let titleLength = isInputLengthValid(title, 10).valid;
    let descriptionLength = isInputLengthValid(description, 100).valid;

    let invalidInputs = [];
    if (title == "") {
      invalidInputs.push("Post title");
    }
    if (description == "") {
      invalidInputs.push("Post description");
    }
    if (registration_number == "") {
      invalidInputs.push("User's registration number");
    }
    if (!titleLength) {
      return showNotification("Max words allowed for post title is 10", 2500);
    }
    if (!descriptionLength) {
      return showNotification(
        "Max words allowed for post description is 10",
        2500
      );
    }
    if (invalidInputs.length != 0) {
      return showNotification(`${invalidInputs.join(", ")} is required!!`);
    }
    post_links.forEach((el) => {
      description += el;
    });
    let data = {
      title,
      description,
      registration_number,
      forumId: sessionStorage.getItem("currentForum"),
    };
    createForumMemberPost(data);
    document.querySelector(".post-editor-title").value = "";
    document.querySelector(".post-editor-description").value = "";
    document.querySelector(".post-editor-regisNo").value = "";
    post_links.length = 0;
  });

document
  .querySelector(".close-display-post-preview")
  .addEventListener("click", () => {
    document.querySelector(".display-post-preview").classList.add("hide");
    document.querySelector(".post-editor-container").classList.remove("hide");
  });

document
  .querySelector(".preview-forum-post")
  .addEventListener("click", function () {
    let title = document.querySelector(".post-editor-title").value.trim();
    let registration_number = document
      .querySelector(".post-editor-regisNo")
      .value.trim();
    let description = document
      .querySelector(".post-editor-description")
      .value.replace(/\n/g, "<br>")
      .trim();
    let titleLength = isInputLengthValid(title, 10).valid;
    let descriptionLength = isInputLengthValid(description, 100).valid;

    let invalidInputs = [];
    if (title == "") {
      invalidInputs.push("Post title");
    }
    if (description == "") {
      invalidInputs.push("Post description");
    }
    if (registration_number == "") {
      invalidInputs.push("User's registration number");
    }
    if (!titleLength) {
      return showNotification("Max words allowed for post title is 10", 2500);
    }
    if (!descriptionLength) {
      return showNotification(
        "Max words allowed for post description is 10",
        2500
      );
    }
    if (invalidInputs.length != 0) {
      return showNotification(`${invalidInputs.join(", ")} is required!!`);
    }
    document.querySelector(".post-editor-container").classList.add("hide");
    document.querySelector(".display-post-preview").classList.remove("hide");
    post_links.forEach((el) => {
      description += el;
    });
    let container = document.querySelector(".display-post-preview-main");
    let result = `<div class="preview-post-template">
  <h3 class="forum-post-title">${title}</h3>
  <p class="forum-post-description">${description}</p>
  <div class="forum-post-user-info-container">
    <div class="forum-post-date-time">
      <span class="forum-post-date">${formatDate(Date.now())}</span>
    </div>
    <div class="forum-post-user-info">
      <img
        src=".././CSS/IMAGES/avatar.jpg"
        class="forum-post-main-user-profile"
      />
      <span class="forum-post-user-name">By Adam Eliot</span>
    </div>
  </div>
  <div class="forum-post-links-template-main">
    <i
      class="fa-regular fa-heart forum-post-like"
    ></i>
    <i
      class="fa-solid fa-comment forum-post-user-comment"
    ></i>
    <i
      class="fa-solid fa-trash-can forum-post-delete"
    ></i>
  </div>
  </div>`;
    container.innerHTML = result;
  });

// ** NOTIFICATIONS
document
  .querySelector(".main-notification-container")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("edit-notification-bn")) {
      let container = target.closest(".main-notification-template");
      targetedDepratmentContainer = container;
      let field = container.querySelector(".message-notification");
      document
        .querySelector(".edit-notification-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document.querySelector(".edit-notification-message").value =
        field.textContent;
      prevNotification_value = field.textContent;
      id = target.dataset.id;
    } else if (target.classList.contains("delete-notification-bn")) {
      let id = target.dataset.id;
      let container = target.closest(".main-notification-template");
      targetedDepratmentContainer = container;
      await deletNotification(id);
    }
  });

// EDIT NOTIFICATION

document
  .querySelector(".close-edit-notification")
  .addEventListener("click", () => {
    document
      .querySelector(".edit-notification-container")
      .classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

document
  .querySelector(".edit-notification-btn")
  .addEventListener("click", async () => {
    let message = document
      .querySelector(".edit-notification-message")
      .value.trim();
    if (message == prevNotification_value) {
      document
        .querySelector(".edit-notification-container")
        .classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      return showNotification("Nothing updated");
    }

    await updateNotification(id, message);
  });

// SEARCH NOTIFICATIONS
document
  .querySelector(".notification-search-inp")
  .addEventListener("keydown", async (e) => {
    let search = document
      .querySelector(".notification-search-inp")
      .value.trim();
    if (e.key == "Enter" && search != "") {
      notification_search = Number(search);

      await fetchNotificationSearch(search);
    }
  });

document
  .querySelector(".main-notification-search-list")
  .addEventListener("scroll", async (event) => {
    let { scrollHeight, scrollTop, clientHeight } = event.target;
    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      await fetchNotificationSearchScroll();
    }
  });

// CREATE NOTIFICATIONS
document
  .querySelector(".add-new-notification-btn")
  .addEventListener("click", () => {
    document.querySelector(".create-notification").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    document.querySelector(".create-notification-message").value = "";
    document.querySelector(".create-notification-regisno").value = "";
  });
document
  .querySelector(".close-create-notification")
  .addEventListener("click", () => {
    document.querySelector(".create-notification").classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

document
  .querySelector(".create-notification-btn")
  .addEventListener("click", async () => {
    let message = document
      .querySelector(".create-notification-message")
      .value.trim();
    let registration_number = document
      .querySelector(".create-notification-regisno")
      .value.trim();
    let invalidInputs = [];
    if (message == "") {
      invalidInputs.push("Message");
    }
    if (registration_number == "") {
      invalidInputs.push("registration_number");
    }

    if (invalidInputs.length != 0) {
      return showNotification(`${invalidInputs.join(",")} is required`);
    }

    if (!isInputLengthValid(message, 20).valid) {
      return showNotification("Max words allowed for message are 20", 2500);
    }

    let data = { registration_number: Number(registration_number), message };
    await createNotification(data);
  });

// ADMIN NOTIFICATIOSN
document
  .querySelector(".my-notification-btn")
  .addEventListener("click", async () => {
    document.querySelector(".admin-notification").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    await fetchAdminNotifications();
  });

document
  .querySelector(".close-admin-notification")
  .addEventListener("click", () => {
    document.querySelector(".admin-notification").classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

// ** FORUM JOINEE SECTION
// ADVANCE FILTER
document
  .querySelector(".forum-joinee-filter-btn")
  .addEventListener("click", () => {
    document
      .querySelector(".forum-joinee-filter-container")
      .classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
  });

document
  .querySelector(".close-forum-joinee-filter")
  .addEventListener("click", () => {
    document
      .querySelector(".forum-joinee-filter-container")
      .classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

document
  .querySelector(".forum-joinee-filter-clear-button")
  .addEventListener("click", () => {
    document.querySelector(".forum-joinee-filter-registration").value = "";
    document.querySelector(".forum-joinee-filter-name").value = "";
    document.querySelector(".forum-joinee-filter-date-createdAt").value = "";
    document.querySelector(".filter-forum-joinee-active-toggle").checked = true;
  });

document
  .querySelector(".forum-joinee-filter-apply-button")
  .addEventListener("click", async () => {
    let registration_number = document
      .querySelector(".forum-joinee-filter-registration")
      .value.trim();
    let createdAt = document
      .querySelector(".forum-joinee-filter-date-createdAt")
      .value.trim();
    let forumName = document
      .querySelector(".forum-joinee-filter-name")
      .value.trim();
    let active = document.querySelector(
      ".filter-forum-joinee-active-toggle"
    ).checked;

    let data = {};
    if (registration_number != "") {
      data.registration_number = Number(registration_number);
    }

    if (createdAt != "") {
      let [year, month, day] = createdAt.split("-");
      const isoDate = new Date(
        `${year}-${month}-${day}T00:00:00.000Z`
      ).toISOString();
      data.createdAt = isoDate;
    }

    if (forumName != "") {
      data.forumName = forumName;
    }
    data.active = active;
    is_search_joinee = false;
    searchJoineeFilter = { ...data };
    console.log(searchJoineeFilter);
    await filterJoinee(searchJoineeFilter);
  });

document
  .querySelector(".main-forum-joinee-search-list")
  .addEventListener("scroll", async (event) => {
    let { scrollHeight, scrollTop, clientHeight } = event.target;
    if (
      Math.abs(scrollHeight - clientHeight - scrollTop) < 1 &&
      !is_search_joinee
    ) {
      await filterJoineeScroll();
    }
  });

// RECENT JOINEES
document
  .querySelector(".main-forum-joinee-list")
  .addEventListener("scroll", async (event) => {
    let { scrollHeight, scrollTop, clientHeight } = event.target;
    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      await recentJoineesScroll();
    }
  });

// SEARCH JOINEE BY INPUT
document
  .querySelector(".forum-joinee-search-inp")
  .addEventListener("keydown", async (e) => {
    let registration_number = document
      .querySelector(".forum-joinee-search-inp")
      .value.trim();
    if (e.key == "Enter" && registration_number != "") {
      is_search_joinee = true;
      reg_number = Number(registration_number);
      await searchJoinee(registration_number);
    }
  });

document
  .querySelector(".main-forum-joinee-search-list")
  .addEventListener("scroll", async (event) => {
    let { scrollHeight, scrollTop, clientHeight } = event.target;
    if (
      Math.abs(scrollHeight - clientHeight - scrollTop) < 1 &&
      is_search_joinee
    ) {
      await searchJoineeScroll();
    }
  });

// REMOVE JOINEE
document
  .querySelector(".main-forum-joinee-container")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("forum-joinee-remove")) {
      let data = JSON.parse(target.value);
      targetedDepratmentContainer = target.closest(".forum-joinee-template");
      await removeJoinee(data);
    }
  });

// ** ALLOWED USER SECTION
document
  .querySelector(".add-new-user-allowed-btn")
  .addEventListener("click", () => {
    document
      .querySelector(".add-new-user-allowed-container")
      .classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    document.querySelector(".new-allowed-user-regisno").value = "";
  });

document
  .querySelector(".close-add-new-user-allowed")
  .addEventListener("click", () => {
    document
      .querySelector(".add-new-user-allowed-container")
      .classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

document
  .querySelector(".main-user-allowed-container")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("delete-allowed-user")) {
      await deleteAllowedUser(target.value);
      targetedDepratmentContainer = target.closest(".allowed-user-template");
    }
  });

// ADD USER
document
  .querySelector(".add-new-user-btn")
  .addEventListener("click", async () => {
    let registration_number = document
      .querySelector(".new-allowed-user-regisno")
      .value.trim();
    if (!registration_number) {
      return showNotification("Please enter a registration number.");
    }
    await addNewAllowedUser(Number(registration_number));
  });

// SEARCH ALLOWED USER
document
  .querySelector(".user-allowed-search-inp")
  .addEventListener("keydown", async (e) => {
    let registration_number = document
      .querySelector(".user-allowed-search-inp")
      .value.trim();
    if (e.key == "Enter" && registration_number != "") {
      document
        .querySelector(".main-user-allowed-search-list")
        .classList.remove("hide");
      document.querySelector(".main-user-allowed-list").classList.add("hide");

      await searchAllowedUser(Number(registration_number));
    }
  });

// RECENT ALLOWED USERS SCROLL
document
  .querySelector(".main-user-allowed-list")
  .addEventListener("scroll", async (event) => {
    let { scrollHeight, scrollTop, clientHeight } = event.target;
    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      await recentAllowedUsersScroll();
    }
  });
