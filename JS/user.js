// @collapse
"use strict";

let user_details;
let recent_posts_startPoint;
let top_forums_startPoint;
let recent_created_posts_startPoint;
let liked_posts_startPoint;
let searched_posts_startPoint;
let favourite_posts_startPoint;
let forum_search_startPoint;
let complaint_startPoint;
let complaint_startPoint_joined_forum;
let search_members_startPoint;
let forum_posts_startPoint;
let forum_post_search_startPoint;
let forum_review_startPoint;
let recent_replies_startPoint;
let post_like_startPoint;
let notification_startPoint;

let is_search_member;
let is_forum_post_search_open = false;
let is_forum_filter = false;

let myPost_search;
let forum_search;
let forum_member_search;
let complaint_search;
let forum_post_search;

let createdForumID;
let joinedForumID;
let currentForumID;

let currentForumDetails;

let targetedContainer;

let rating;
let prevRating;

let post_links = [];

let notificationTimeout;
let progressBarInterval;
let departmentList = [];

const blurElement = document.querySelector(".blur2");
const loaderElement = document.querySelector(".loading");

let i = 0;
let posts = 0;
let forums = 0;

// ! **************************************************************************************************************************************************** GENERAL PURPOSE FUNCTION

async function getDetails() {
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

    let response2 = fetch("https://opentalks.cyclic.app/api/stats", {
      method: "POST",
      body: JSON.stringify({ _id: sessionStorage.getItem("user") }),
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });

    let response3 = fetch("https://opentalks.cyclic.app/api/post/recent", {
      method: "POST",
      body: JSON.stringify({
        userId: sessionStorage.getItem("user"),
        lastLogin: sessionStorage.getItem("lastLogin"),
      }),
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });

    let response4 = fetch("https://opentalks.cyclic.app/api/forum/top", {
      method: "POST",
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });

    let response5 = fetch("https://opentalks.cyclic.app/api/department/all", {
      method: "POST",
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });

    let response6 = fetch(
      "https://opentalks.cyclic.app/api/post/reply/recent",
      {
        method: "POST",
        body: JSON.stringify({
          userId: sessionStorage.getItem("user"),
          lastLogin: sessionStorage.getItem("lastLogin"),
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );

    let preFetchData = await Promise.all([
      response1,
      response2,
      response3,
      response4,
      response5,
      response6,
    ]);

    let userData = await preFetchData[0].json();
    let userStats = await preFetchData[1].json();
    let recentPosts = await preFetchData[2].json();
    let topForums = await preFetchData[3].json();
    let departmentLists = await preFetchData[4].json();
    let recentReplies = await preFetchData[5].json();
    user_details = { ...userData };
    departmentList = [...departmentLists.departments];

    setUserDetails_Dashboard(userData.user);
    setStats_Dashboard(userStats.stats);
    fetchRecentPosts(recentPosts);
    fetchtopForums(topForums);
    fetchRecentReplies(recentReplies.recentReplies);
    loader(0);
  } catch (error) {
    console.log(`Error: ${error.toString()} in getDetailsC`);
  }
}

function setUserDetails_Dashboard(data) {
  try {
    let user_time = document.querySelector(".user-salute .time");
    let user_name = document.querySelector(".user-salute .user-name");
    let date_joined = document.querySelector(
      ".bottom-fields .date-joined span"
    );
    let user_regisNo = document.querySelector(".user-regisNo span");
    let user_email = document.querySelector(".bottom-fields .user-email span");
    let user_pic = document.querySelector(".user-profile-pic-change");
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
    user_regisNo.textContent = data.registration_number;
    user_pic.src = `https://opentalks.cyclic.app${data.image}`;
  } catch (error) {
    console.log(`Error: ${error.toString()} in setUserDetails_Dashboard`);
  }
}

function setStats_Dashboard(data) {
  try {
    const statsToAnimate = {
      activeCreatedForums: ".stat-card-created-a span",
      forumsCreatedTotal: ".stat-card-created-ia span",
      activePosts: ".stat-card-post-a span",
      postsTotal: ".stat-card-post-ia span",
      activeJoinedForums: ".stat-card-joined-a span",
      joinedForumsTotal: ".stat-card-joined-ia span",
      activeReplies: ".stat-card-reply-a span",
      repliesTotal: ".stat-card-reply-ia span",
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
    if (!!data && data.recentPosts.length != 0) {
      data.recentPosts.forEach((el) => {
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
      container.innerHTML =
        "Recently no post had been created since your last login in the forums you are associated with.";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchRecentPostsC`);
  }
}

function fetchtopForums(data) {
  try {
    let result = "";
    let container = document.querySelector(".top-forums-list");
    data.forums.forEach((el) => {
      result += `
      <div class="top-forum-card">
                  <div class="top-forum-header">
                    <div class="top-forum-header-main">
                      <h3 class="top-forum-title">${el.name}</h3>
                      <button class="join-top-forum-btn" value="${
                        el._id
                      }">Join Forum</button>
                    </div>
                    <p class="top-forum-description">${el.description}</p>
                  </div>
                  <div class="top-forum-footer">
                    <div class="created-on-top-forum">
                      ${formatDate(el.createdAt)}
                    </div>
                    <div class="user-info">
                      <img
                        src="https://opentalks.cyclic.app${el.userId.image}"
                        alt="User Avatar"
                        class="avatar-image-small top-post-user-image"
                      />
                      <p class="top-created-by">
                        <span class="top-forum-createdby"
                          >By ${el.userId.name}</span
                        >
                      </p>
                    </div>
                  </div>
                </div>
      `;
    });
    container.innerHTML = result;
    top_forums_startPoint = data.nextStartPoint;
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchtopForumsC`);
  }
}

function formatDate(dateData) {
  try {
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
  } catch (error) {
    console.log(`Error: ${error.toString()} in formatDateC`);
  }
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
      return "just now";
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

function showConfirmation(message) {
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

// ! ********************************************************************************************************************************************************DASHBOARD SECTION
// SEND FORUM JOIN REQUEST
async function sentForumJoinRequest(forumId) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/join/request",
      {
        method: "POST",
        body: JSON.stringify({
          forumId,
          userId: `${sessionStorage.getItem("user")}`,
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
      showNotification(data.message, 5000);
    } else {
      showNotification(data.message, 5000);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in sentForumJoinRequestC`);
  }
}

// UPDATE USER PROFILE DETAIL
async function updateUserProfile(updateData) {
  try {
    document.querySelector(".edit-user-container2").classList.add("hide");
    let confirm = await showConfirmation("Do you want to update your profile?");
    if (confirm) {
      document
        .querySelector(".user-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document.querySelector(".user-confirm-pass-button").value =
        JSON.stringify({ ...updateData });
      document.querySelector(".user-confirm-pass-input").value = "";
      document
        .querySelector(".user-confirm-pass-button")
        .classList.add("updateUserDetails");
    } else {
      document.querySelector(".edit-user-container2").classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in updateUserProfile`);
  }
}

async function updateUserProfileMain(updateData, password) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/update/details",
      {
        method: "POST",
        body: JSON.stringify({
          ...updateData,
          user_id: sessionStorage.getItem("user"),
          user_password: password,
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
        .querySelector(".user-confirm-pass-button")
        .classList.remove("updateUserDetails");
      document
        .querySelector(".user-confirm-pass-container")
        .classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      user_details.user = { ...data.updated_user };
      setUserDetails_Dashboard(data.updated_user);
      showNotification(data.message, 3000);
    } else {
      showNotification(data.message, 3000);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in updateUserProfileMainC`);
  }
}

// UPDATE USER PROFILE PIC
async function updateUserPic() {
  try {
    document.querySelector(".edit-user-container").classList.add("hide");
    let confirm = await showConfirmation(
      "Do you want to update your profile pic?"
    );
    if (confirm) {
      document
        .querySelector(".user-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document.querySelector(".user-confirm-pass-input").value = "";
      document
        .querySelector(".user-confirm-pass-button")
        .classList.add("updateUserProfile");
    } else {
      document.querySelector(".edit-user-container").classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in updateUserPicC`);
  }
}

async function updateUserPicMain(password) {
  try {
    let fileInput = document.querySelector(".edit-user-profile-pic-upload");
    const formData = new FormData();
    formData.append("image", fileInput.files[0]);
    formData.append("_id", sessionStorage.getItem("user"));
    formData.append("user_id", sessionStorage.getItem("user"));
    formData.append("user_password", password);
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/update/image",
      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );

    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      document
        .querySelector(".user-confirm-pass-button")
        .classList.remove("updateUserProfile");
      document
        .querySelector(".user-confirm-pass-container")
        .classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      user_details.user.image = data.updated_user.image;
      document.querySelector(
        ".edit-user-profile-pic-img"
      ).src = `https://opentalks.cyclic.app${user_details.user.image}`;
      document.querySelector(
        ".user-profile-pic-change"
      ).src = `https://opentalks.cyclic.app${user_details.user.image}`;
      showNotification("User profile updated", 3000);
    } else {
      showNotification(data.message, 3000);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in updateUserPicMainC`);
  }
}

// FETCH POST AFTER LAST LOGIN
async function fetchPostsAfterLastLogin() {
  try {
    loader(1);

    let response = await fetch("https://opentalks.cyclic.app/api/post/recent", {
      method: "POST",
      body: JSON.stringify({
        userId: sessionStorage.getItem("user"),
        lastLogin: sessionStorage.getItem("lastLogin"),
        startPoint: recent_posts_startPoint,
      }),
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".recent-posts-list");
    if (!!data && data.success == true) {
      data.recentPosts.forEach((el) => {
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
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchPostsAfterLastLoginC`);
  }
}

// FETCH TOP FORUMS ON DASHBOARD BY SCROLLING
async function fetchtopForumsScroll() {
  try {
    loader(1);

    let response = await fetch("https://opentalks.cyclic.app/api/forum/top", {
      method: "POST",
      body: JSON.stringify({
        startPoint: top_forums_startPoint,
      }),
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".top-forums-list");
    if (!!data && data.success == true) {
      data.forums.forEach((el) => {
        result += `
          <div class="top-forum-card">
                      <div class="top-forum-header">
                        <div class="top-forum-header-main">
                          <h3 class="top-forum-title">${el.name}</h3>
                          <button class="join-top-forum-btn" value="${
                            el._id
                          }">Join Forum</button>
                        </div>
                        <p class="top-forum-description">${el.description}</p>
                      </div>
                      <div class="top-forum-footer">
                        <div class="created-on-top-forum">
                          ${formatDate(el.createdAt)}
                        </div>
                        <div class="user-info">
                          <img
                            src="https://opentalks.cyclic.app${el.userId.image}"
                            alt="User Avatar"
                            class="avatar-image-small top-post-user-image"
                          />
                          <p class="top-created-by">
                            <span class="top-forum-createdby"
                              >By ${el.userId.name}</span
                            >
                          </p>
                        </div>
                      </div>
                    </div>
          `;
      });

      top_forums_startPoint = data.nextStartPoint;
      let prevScrollHeight = container.scrollHeight;
      container.insertAdjacentHTML("beforeend", result);
      container.scrollTop = prevScrollHeight;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchtopForumsScrollC`);
  }
}

// FETCH RECENT REPLIES
async function fetchRecentReplies(data) {
  try {
    let result = "";
    let container = document.querySelector(".recent-replies-list");
    if (data.length != 0) {
      data.forEach((el) => {
        result += `<div class="recent-reply-template">
                  <div class="recent-reply-message">${el.message}</div>
                  <div class="recent-reply-post">
                    <span>Regarding Post:</span>${el.postId.title}
                  </div>
                  <div class="recent-reply-bottom">
                    <div class="recent-reply-date">
                      On ${formatDate(el.createdAt)}
                    </div>
                    <div class="recent-reply-user-info">
                      <img src="https://opentalks.cyclic.app${
                        el.byWhom.image
                      }" alt="user-image" />
                      <p>By ${el.byWhom.name}</p>
                    </div>
                  </div>
                </div>`;
      });
      container.innerHTML = result;
      container.scrollTop = 0;
      recent_replies_startPoint = data.nextStartPoint;
    } else {
      container.innerHTML =
        "Recently no reply had been created since your last login.";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchRecentRepliesC`);
  }
}

async function fetchRecentRepliesScroll() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/post/reply/recent",
      {
        method: "POST",
        body: JSON.stringify({
          userId: sessionStorage.getItem("user"),
          lastLogin: sessionStorage.getItem("lastLogin"),
          startPoint: recent_replies_startPoint,
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
    let container = document.querySelector(".recent-replies-list");
    if (!!data && data.success == true && data.recentReplies.length != 0) {
      data.recentReplies.forEach((el) => {
        result += `<div class="recent-reply-template">
                  <div class="recent-reply-message">${el.message}</div>
                  <div class="recent-reply-post">
                    <span>Regarding Post:</span>${el.postId.title}
                  </div>
                  <div class="recent-reply-bottom">
                    <div class="recent-reply-date">
                      On ${formatDate(el.createdAt)}
                    </div>
                    <div class="recent-reply-user-info">
                      <img src="https://opentalks.cyclic.app${
                        el.byWhom.image
                      }" alt="user-image" />
                      <p>By ${el.byWhom.name}</p>
                    </div>
                  </div>
                </div>`;
      });

      let prevScrollHeight = container.scrollHeight;
      container.insertAdjacentHTML("beforeend", result);
      container.scrollTop = prevScrollHeight;
      recent_replies_startPoint = data.nextStartPoint;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchRecentRepliesScroll`);
  }
}

// NOTIFICATIONS
async function fetchNotifications() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/notification/all",
      {
        method: "POST",
        body: JSON.stringify({
          userId: sessionStorage.getItem("user"),
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
    let container = document.querySelector(".notification-list");
    if (!!data && data.success == true && data.notifications.length != 0) {
      data.notifications.forEach((el) => {
        result += `<div class="notification-template">
<p class="notification-msg">${el.message}</p>
<p class="notification-date">${formatDate2(el.createdAt)}</p>
</div>`;
      });
      container.innerHTML = result;
      container.scrollTop = 0;
      notification_startPoint = data.nextStartPoint;
      document.querySelector(".clear-notification").classList.remove("hide");
    } else {
      container.innerHTML = "No new notifications.";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchNotificationsC`);
  }
}

async function fetchNotificationsScroll() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/notification/all",
      {
        method: "POST",
        body: JSON.stringify({
          userId: sessionStorage.getItem("user"),
          startPoint: notification_startPoint,
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
    let container = document.querySelector(".notification-list");
    if (!!data && data.success == true && data.notifications.length != 0) {
      data.notifications.forEach((el) => {
        result += `<div class="notification-template">
<p class="notification-msg">${el.message}</p>
<p class="notification-date">${formatDate2(el.createdAt)}</p>
</div>`;
      });
      let prevScrollHeight = container.scrollHeight;
      container.insertAdjacentHTML("beforeend", result);
      container.scrollTop = prevScrollHeight;
      notification_startPoint = data.nextStartPoint;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchNotificationsScrollC`);
  }
}

// CLEAR NOTIFICATIONS
async function clearNotifications() {
  try {
    loader(1);

    await fetch("https://opentalks.cyclic.app/api/notification/delete/all", {
      method: "POST",
      body: JSON.stringify({
        userId: sessionStorage.getItem("user"),
      }),
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    loader(0);

    const notifications = document.querySelectorAll(".notification-template");
    document.querySelector(".notification-list").style.overflowY = "hidden";
    notifications.forEach(function (notification, index) {
      if (index < 3) {
        setTimeout(() => {
          notification.classList.add("animate-notification");
          setTimeout(() => {
            notification.remove();
          }, 500);
        }, index * 100);
      } else {
        notification.remove();
      }
    });
  } catch (error) {
    console.log(`Error: ${error.toString()} in clearNotificationsC`);
  }
}

// UPDATE PASSWORD
async function updateUserPassword(prevPassword, newPassword) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/update/password",
      {
        method: "POST",
        body: JSON.stringify({
          userId: sessionStorage.getItem("user"),
          newPassword,
          prevPassword,
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
      document.querySelector(".edit-user-container3").classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      showNotification("Password updated successfully.", 2500);
    } else {
      showNotification(data.message, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in updateUserPasswordC`);
  }
}

// !*****************************************************************************************************************************************************MY POSTS SECTION

// FETCH USER RECENT POSTS
async function userRecentPosts() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/post/recent/5",
      {
        method: "POST",
        body: JSON.stringify({ userId: sessionStorage.getItem("user") }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".recent-main-posts-container");
    if (!!data && data.success == true) {
      data.recentPosts.forEach((el) => {
        result += `<div class="recent-main-post-template">
  <div class="recent-main-post-top">
    <div class="recent-main-post-title">${el.title}</div>
    <div class="recent-main-post-forum-name">
      <i class="fa-solid fa-comments"></i>
      <span>${el.forumId.name}</span>
    </div>
  </div>
  <div class="recent-main-post-description">${el.description}</div>
  <div class="recent-main-post-bottom">
    <div class="recent-main-post-createdOn">${formatDate(el.createdAt)}</div>
    <div class="recent-main-post-buttons">
      <i class="fa-solid fa-thumbs-up recent-main-post-likes" data-postid="${
        el._id
      }"></i>
      <i class="fa-solid fa-reply recent-main-post-replies" data-postid="${
        el._id
      }"></i>
      <i
        class="fa-solid fa-trash-can recent-main-post-delete" data-postid="${
          el._id
        }"
      ></i>
    </div>
  </div>
</div>`;
      });
      container.innerHTML = result;
      container.scrollTop = 0;
      recent_created_posts_startPoint = data.nextStartPoint;
    } else {
      container.innerHTML = "No post has been created yet.";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in userRecentPostsC`);
  }
}

// FETCH POSTS OF USER THAT OTHER PEOPLE LIKED
async function userLikedPosts() {
  try {
    loader(1);

    let response = await fetch("https://opentalks.cyclic.app/api/post/top", {
      method: "POST",
      body: JSON.stringify({ userId: sessionStorage.getItem("user") }),
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".liked-main-posts-container");
    if (!!data && data.success == true) {
      data.topPosts.forEach((el) => {
        let iconClass = el.likes == 0 ? "fa-regular" : "fa-solid";
        result += `<div class="liked-main-post-template">
        <div class="liked-main-post-top">
          <div class="liked-main-post-title">${el.title}</div>
          <div class="liked-main-post-forum-name">
            <i class="fa-solid fa-comments"></i>
            <span>${el.forumId.name}</span>
          </div>
        </div>
        <div class="liked-main-post-description">${el.description}</div>
        <div class="liked-main-post-bottom">
          <div class="liked-main-post-createdOn">${formatDate(
            el.createdAt
          )}</div>
          <div class="liked-main-post-buttons">
          <i class="${iconClass} fa-heart liked-main-post-likes" data-postid="${
          el._id
        }"></i>
            <i class="fa-solid fa-reply liked-main-post-replies" data-postid="${
              el._id
            }"></i>
            <i class="fa-solid fa-trash-can liked-main-post-delete" data-postid="${
              el._id
            }"></i>
          </div>
        </div>
      </div>`;
      });
      container.innerHTML = result;
      liked_posts_startPoint = data.nextStartPoint;
      container.scrollTop = 0;
    } else {
      container.innerHTML = "No post has been liked yet.";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in userLikedPostsC`);
  }
}

// FETCH POSTS THAT USER LIKED
async function fetchFavouritePosts() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/post/favourite",
      {
        method: "POST",
        body: JSON.stringify({
          userId: sessionStorage.getItem("user"),
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
    let container = document.querySelector(".favourite-main-posts-container");
    if (!!data && data.success == true) {
      data.posts.forEach((el) => {
        result += `<div class="favourite-main-post-template">
  <div class="favourite-main-post-top">
    <div class="favourite-main-post-title">${el.postId.title}</div>
    <div class="favourite-main-post-forum-name">
      <i class="fa-solid fa-comments"></i>
      <span>${el.forumId.name}</span>
    </div>
  </div>
  <div class="favourite-main-post-description">${el.postId.description}</div>

  <div class="favourite-main-post-bottom">
    <div class="favourite-main-post-createdOn">${formatDate(el.createdAt)}</div>
    <div class="favourite-main-post-info">
      <img
        src="https://opentalks.cyclic.app${el.postId.userId.image}"
        class="favourite-main-post-user-image"
        alt="post-owner-image"
      />
      <p>By ${el.postId.userId.name}</p>
    </div>
  </div>

  <div class="favourite-main-post-buttons">
    <i
      class="fa-solid fa-heart favourite-main-post-likes"
      data-postid="${el.postId._id}" data-forumid="${el.forumId._id}" 
    ></i>
  </div>
</div>`;
      });
      favourite_posts_startPoint = data.nextStartPoint;
      container.innerHTML = result;
      container.scrollTop = 0;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchFavouritePostsC`);
  }
}

// ! ************************************************************************************************************************************************************FORUMS SECTION

// ** FORUMS CREATED & JOINED
// FETCH THE FORUMS THAT USER CREATED
async function fetchCreatedForums() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/created/detail",
      {
        method: "POST",
        body: JSON.stringify({ userId: sessionStorage.getItem("user") }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".main-forums-created-container");
    if (!!data && data.success == true) {
      data.forums.forEach((el) => {
        result += `<div class="created-forum-template">
                <div class="created-forum-name">${el.name}</div>
                <div class="created-forum-description">${el.description}</div>
                <div class="created-forum-bottom">
                  <p>${formatDate(el.createdAt)}</p>
                  <button class="created-forum-vist" value="${
                    el._id
                  }">Visit Forum</button>
                </div>
              </div>`;
      });
      container.innerHTML = result;
      container.scrollTop = 0;
    } else {
      container.innerHTML = "No forum is created by you yet.";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchCreatedForumsC`);
  }
}

// FETCH THE FORUMS THAT USER JOINED
async function fetchJoinedForums() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/join/member",
      {
        method: "POST",
        body: JSON.stringify({
          userId: sessionStorage.getItem("user"),
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
    let container = document.querySelector(".main-forums-joined-container");
    if (!!data && data.success == true) {
      data.forums.forEach((el) => {
        result += `<div class="joined-forum-template">
                <div class="joined-forum-name">${el.forumId.name}</div>
                <div class="joined-forum-description">${
                  el.forumId.description
                }</div>
                <div class="joined-forum-bottom">
                  <p>${formatDate(el.createdAt)}</p>
                  <button class="joined-forum-vist" value="${
                    el.forumId._id
                  }">Visit Forum</button>
                </div>
              </div>`;
      });
      container.innerHTML = result;
      container.scrollTop = 0;
    } else {
      container.innerHTML = "No forum is joined by you yet.";
    }
  } catch (error) {
    console.log(`Errror: ${error.toString()} in fetchJoinedForumsC`);
  }
}

// ** FORUM DETAILS
// FETCH THE FORUM DETAILS
async function fetchForumData_initially(forumId, joined = false) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/detail",
      {
        method: "POST",
        body: JSON.stringify({
          _id: forumId,
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
      currentForumDetails = { ...data.forum };
      currentForumDetails.members = data.members;
      joined == false
        ? fetchForumDetails(currentForumDetails)
        : fetchJoinedForumDetails(currentForumDetails);
    }
  } catch (error) {
    console.log(`Errror: ${error.toString()} in fetchForumData_initallyC`);
  }
}

// FILL THE FETCHED FORUM DETAIL IN THE "FORUM DETAILS" TAB
function fetchForumDetails(data) {
  try {
    let forumName = document.querySelector(".details-of-forum-name");
    let forumDescription = document.querySelector(
      ".details-of-forum-description"
    );
    let forumDepartment = document.querySelector(
      ".details-of-forum-department"
    );
    let forumCreatedBy = document.querySelector(".details-of-forum-createdBy");
    let forumCreatedOn = document.querySelector(".details-of-forum-createdOn");
    let forumUpdatedOn = document.querySelector(".details-of-forum-updatedOn");
    let members = document.querySelector(".details-of-forum-members");

    document.querySelector(".forum-main-layout-top-name").textContent =
      data.name;
    document.querySelector(".forum-main-layout-top-description").textContent =
      data.description;

    forumName.textContent = data.name;
    forumDescription.textContent = data.description;
    forumDepartment.textContent = data.departmentId.name;
    forumCreatedBy.textContent = data.userId.name;
    forumCreatedOn.textContent = formatDate(data.createdAt);
    forumUpdatedOn.textContent =
      data.updatedAt == null ? "Not updated yet" : formatDate(data.updatedAt);
    members.textContent = data.members;
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchForumDetailsC`);
  }
}

// FILL THE FETCHED JOINED FORUM DETAIL IN THE "JOINED FORUM DETAILS" TAB
function fetchJoinedForumDetails(data) {
  try {
    let forumName = document.querySelector(".details-of-joined-forum-name");
    let forumDescription = document.querySelector(
      ".details-of-joined-forum-description"
    );
    let forumDepartment = document.querySelector(
      ".details-of-joined-forum-department"
    );
    let forumCreatedBy = document.querySelector(
      ".details-of-joined-forum-createdBy"
    );
    let forumCreatedOn = document.querySelector(
      ".details-of-joined-forum-createdOn"
    );

    document.querySelector(".forum-joined-layout-top-name").textContent =
      data.name;
    document.querySelector(".forum-joined-layout-top-description").textContent =
      data.description;

    forumName.textContent = data.name;
    forumDescription.textContent = data.description;
    forumDepartment.textContent = data.departmentId.name;
    forumCreatedBy.textContent = data.userId.name;
    forumCreatedOn.textContent = formatDate(data.createdAt);
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchForumDetailsC`);
  }
}

// UPDATE FORUM DETAILS
async function updateForumDetails(data) {
  try {
    document.querySelector(".edit-forum").classList.add("hide");
    let confirm = await showConfirmation(
      "Do you want to update forum details?"
    );
    if (confirm) {
      document
        .querySelector(".user-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document.querySelector(".user-confirm-pass-button").value =
        JSON.stringify({ ...data });
      document.querySelector(".user-confirm-pass-input").value = "";
      document
        .querySelector(".user-confirm-pass-button")
        .classList.add("updateForumDetails");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in updateForumDetailsC`);
  }
}

async function updateForumDetailsMain(password, query) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/update",
      {
        method: "POST",
        body: JSON.stringify({
          _id: createdForumID,
          user_id: sessionStorage.getItem("user"),
          user_password: password,
          ...query,
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
        .querySelector(".user-confirm-pass-button")
        .classList.remove("updateForumDetails");
      document
        .querySelector(".user-confirm-pass-container")
        .classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      currentForumDetails = { ...data.updated_forum };
      fetchForumDetails(currentForumDetails);
      showNotification("Forum details has been updated", 2500);
    } else {
      showNotification(data.message, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in updateForumDetailsMainC`);
  }
}

// ** FORUM MEMEBRS
// FETCH FORUM MEMBERS
async function fetchForumMembers() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/join/member",
      {
        method: "POST",
        body: JSON.stringify({ forumId: createdForumID }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    let result = "";
    let conatiner = document.querySelector(".forum-member-table-container");
    if (!!data && data.success == true) {
      data.members.forEach((el, i) => {
        result += `
        <div class="forum-member-template">
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
      });
      conatiner.innerHTML = result;
      conatiner.scrollTop = 0;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchForumMembersC`);
  }
}

// FETCH FORUM MEMBER SCROLLING AFTER SEARCH
async function fetchForumMemberScroll() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/join/member/search",
      {
        method: "POST",
        body: JSON.stringify({
          forumId: createdForumID,
          searchInput: forum_member_search,
          startPoint: search_members_startPoint,
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
        result += `
<div class="forum-member-template">
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
    </div>
`;
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
// FETCH THE FORUM MEMBERS VIA SEARCH

async function fetchSearchedForumMembers() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/join/member/search",
      {
        method: "POST",
        body: JSON.stringify({
          forumId: createdForumID,
          searchInput: forum_member_search,
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
        result += `
<div class="forum-member-template">
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
    </div>
`;
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

// REMOVE FORUM USER
async function removeForumMember(target) {
  try {
    document.querySelector(".forum-members-container").classList.add("hide");
    let confirm = await showConfirmation("Do you want to remove this user?");
    if (confirm) {
      document
        .querySelector(".user-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document.querySelector(".user-confirm-pass-button").value =
        JSON.stringify({ userId: target.value });
      document.querySelector(".user-confirm-pass-input").value = "";
      document
        .querySelector(".user-confirm-pass-button")
        .classList.add("removeForumMember");
    } else {
      document
        .querySelector(".forum-members-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in removeForumMemberC`);
  }
}

async function removeForumMemberMain(password, query) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/join/left",
      {
        method: "POST",
        body: JSON.stringify({
          forumId: createdForumID,
          userId: query.userId,
          user_id: sessionStorage.getItem("user"),
          user_password: password,
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
        .querySelector(".user-confirm-pass-button")
        .classList.remove("removeForumMember");
      document
        .querySelector(".user-confirm-pass-container")
        .classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      showNotification("Forum member has been removed", 2500);
    } else {
      showNotification(data.message, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in removeForumMemberMainC`);
  }
}

// ** FORUM COMPLAINTS
// FETCH FORUM COMPLAINTS
async function fetchAllComplaints() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/complaint/all",
      {
        method: "POST",
        body: JSON.stringify({ forumId: createdForumID }),
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
    if (!!data && data.success == true) {
      complaint_startPoint = data.nextStartPoint;
      data.complaints.forEach((el) => {
        let replyQuery = JSON.stringify({
          complaintId: el._id,
          userId: el.userId._id,
        });
        let topButton =
          el.isResponded == true
            ? ` <button
        class="forum-complaint-responses-btn"
        value='${replyQuery}'
      >
        Responses
      </button>`
            : `<button
      class="forum-complaint-reply-btn deletedBack"
      value="${replyQuery}"
    >
      Write reply
    </button>`;
        result += `<div class="forum-complaints-template">
        <div class="forum-complaint-template-top">
          <p class="forum-complaint-id">${el.complaint_number}</p>
          <div class="forum-complaint-template-top-btns">${topButton}</div>
        </div>
        <p class="forum-complaint-message highlight-complaint">${
          el.complaint
        }</p>
        <div class="forum-complaint-info">
          <div>On ${formatDate(el.createdAt)}</div>
          <div>
            <img src="https://opentalks.cyclic.app${
              el.userId.image
            }" alt="user-image" />By
            ${el.userId.name}
          </div>
        </div>
        <input
            type="text"
            class="forum-complaint-response-input hide"
            data-complaintid="${el._id}"
            data-userid="${el.userId._id}"
            placeholder="Give response here... (Max 30 words)"
          />
      </div>`;
      });
      container.innerHTML = result;
      container.scrollTop = 0;
    } else {
      container.innerHTML = "No complaints found yet.";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchAllComplaintsC`);
  }
}

// FETCH FORUM COMPLAINTS SCROLL
async function fetchAllComplaintsScroll() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/complaint/all",
      {
        method: "POST",
        body: JSON.stringify({
          forumId: createdForumID,
          startPoint: complaint_startPoint,
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
    if (!!data && data.success == true) {
      complaint_startPoint = data.nextStartPoint;
      data.complaints.forEach((el) => {
        let replyQuery = JSON.stringify({
          complaintId: el._id,
          userId: el.userId._id,
        });
        let topButton =
          el.isResponded == true
            ? ` <button
      class="forum-complaint-responses-btn"
      value='${replyQuery}'
    >
      Responses
    </button>`
            : `<button
    class="forum-complaint-reply-btn deletedBack"
    value="${replyQuery}"
  >
    Write reply
  </button>`;
        result += `<div class="forum-complaints-template">
      <div class="forum-complaint-template-top">
        <p class="forum-complaint-id">${el.complaint_number}</p>
        <div class="forum-complaint-template-top-btns">${topButton}</div>
      </div>
      <p class="forum-complaint-message highlight-complaint">${el.complaint}</p>
      <div class="forum-complaint-info">
        <div>On ${formatDate(el.createdAt)}</div>
        <div>
          <img src="https://opentalks.cyclic.app${
            el.userId.image
          }" alt="user-image" />By
          ${el.userId.name}
        </div>
      </div>
      <input
            type="text"
            class="forum-complaint-response-input hide"
            data-complaintid="${el._id}"
            data-userid="${el.userId._id}"
            placeholder="Give response here... (Max 30 words)"
          />
    </div>`;
      });
      let prevScrollHeight = container.scrollHeight;
      container.insertAdjacentHTML("beforeend", result);
      container.scrollTop = prevScrollHeight;
      complaint_startPoint = data.nextStartPoint;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchAllComplaintsScrollC`);
  }
}

// FETCH JOINED FORUM COMPLAINTS
async function fetchJoinedForumComplaints() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/complaint/user/all",
      {
        method: "POST",
        body: JSON.stringify({
          forumId: joinedForumID,
          userId: sessionStorage.getItem("user"),
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
    let container = document.querySelector(".joined-forum-complaints-main");
    if (!!data && data.success == true) {
      complaint_startPoint_joined_forum = data.nextStartPoint;
      data.complaints.forEach((el) => {
        let replyQuery = JSON.stringify({
          complaintId: el._id,
          userId: el.userId._id,
        });
        let topButton =
          el.isResponded == true
            ? ` <button
        class="forum-complaint-responses-btn"
        value='${replyQuery}'
      >
        Responses
      </button>`
            : "";
        result += `<div class="forum-complaints-template">
        <div class="forum-complaint-template-top">
          <p class="forum-complaint-id">${el.complaint_number}</p>
          <div class="forum-complaint-template-top-btns">${topButton}</div>
        </div>
        <p class="forum-complaint-message highlight-complaint">
          ${el.complaint}
        </p>
        <div class="forum-complaint-info">
          <div>On ${formatDate(el.createdAt)}</div>
        </div>
      </div>`;
      });
      container.innerHTML = result;
      container.scrollTop = 0;
    } else {
      container.innerHTML = "No complaints created yet.";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchAllComplaintsC`);
  }
}

// FETCH FORUM COMPLAINTS SCROLL
async function fetchJoinedForumComplaintsScroll() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/complaint/user/all",
      {
        method: "POST",
        body: JSON.stringify({
          forumId: joinedForumID,
          userId: sessionStorage.getItem("user"),
          startPoint: complaint_startPoint_joined_forum,
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
    let container = document.querySelector(".joined-forum-complaints-main");
    if (!!data && data.success == true) {
      complaint_startPoint = data.nextStartPoint;
      data.complaints.forEach((el) => {
        let replyQuery = JSON.stringify({
          complaintId: el._id,
          userId: el.userId._id,
        });
        let topButton =
          el.isResponded == true
            ? ` <button
        class="forum-complaint-responses-btn"
        value='${replyQuery}'
      >
        Responses
      </button>`
            : "";
        result += `<div class="forum-complaints-template">
        <div class="forum-complaint-template-top">
          <p class="forum-complaint-id">${el.complaint_number}</p>
          <div class="forum-complaint-template-top-btns">${topButton}</div>
        </div>
        <p class="forum-complaint-message highlight-complaint">
          ${el.complaint}
        </p>
        <div class="forum-complaint-info">
          <div>On ${formatDate(el.createdAt)}</div>
        </div>
      </div>`;
      });
      let prevScrollHeight = container.scrollHeight;
      container.insertAdjacentHTML("beforeend", result);
      container.scrollTop = prevScrollHeight;
      complaint_startPoint_joined_forum = data.nextStartPoint;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchAllComplaintsScrollC`);
  }
}

// FETCH SEARCHED COMPLAINT IN JOINED FORUM
async function fetchSearchedComplaintinJoinedForum() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/complaint/search",
      {
        method: "POST",
        body: JSON.stringify({
          complaint_number: complaint_search,
          forumId: joinedForumID,
          userId: sessionStorage.getItem("user"),
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
    let container = document.querySelector(".joined-forum-complaints-main");
    if (!!data && data.success == true) {
      let complaint = { ...data.complaint };
      let replyQuery = JSON.stringify({ complaintId: complaint._id });
      let topButton =
        complaint.isResponded == true
          ? ` <button
      class="forum-complaint-responses-btn"
      value='${replyQuery}'
    >
      Responses
    </button>`
          : "";
      result = `<div class="forum-complaints-template">
      <div class="forum-complaint-template-top">
        <p class="forum-complaint-id">${complaint.complaint_number}</p>
        <div class="forum-complaint-template-top-btns">${topButton}</div>
      </div>
      <p class="forum-complaint-message highlight-complaint">${
        complaint.complaint
      }</p>
      <div class="forum-complaint-info">
        <div>On ${formatDate(complaint.createdAt)}</div>
      </div>
    </div>`;

      container.innerHTML = result;
    } else {
      showNotification("Complaint not found", 3000);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchSearchedComplaintC`);
  }
}

// FETCH SEARCHED COMPLAINT
async function fetchSearchedComplaint() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/complaint/search",
      {
        method: "POST",
        body: JSON.stringify({
          complaint_number: complaint_search,
          forumId: createdForumID,
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
    if (!!data && data.success == true) {
      let complaint = { ...data.complaint };
      let replyQuery = JSON.stringify({
        complaintId: complaint._id,
        userId: complaint.userId._id,
      });
      let topButton =
        complaint.isResponded == true
          ? ` <button
      class="forum-complaint-responses-btn"
      value="${complaint.userId._id}"
    >
      Responses
    </button>`
          : `<button
    class="forum-complaint-reply-btn deletedBack"
    value="${replyQuery}"
  >
  Write reply
  </button>`;
      result = `<div class="forum-complaints-template">
      <div class="forum-complaint-template-top">
        <p class="forum-complaint-id">${complaint.complaint_number}</p>
        <div class="forum-complaint-template-top-btns">${topButton}</div>
      </div>
      <p class="forum-complaint-message highlight-complaint">${
        complaint.complaint
      }</p>
      <div class="forum-complaint-info">
        <div>On ${formatDate(complaint.createdAt)}</div>
        <div>
          <img src="https://opentalks.cyclic.app${
            complaint.userId.image
          }" alt="user-image" />By
          ${complaint.userId.name}
        </div>
      </div>
      <input
            type="text"
            class="forum-complaint-response-input hide"
            data-complaintid="${complaint._id}"
            data-userid="${complaint.userId._id}"
            placeholder="Give response here... (Max 30 words)"
          />
    </div>`;

      container.innerHTML = result;
      // document.querySelector(".forum-complaints-sub-heading").textContent =
      //   "Complaint found";
    } else {
      showNotification("Complaint not found", 3000);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchSearchedComplaintC`);
  }
}

// ADD RESPONSE TO COMAPLINT
async function sendResponseToComplaint(complaintId, userId, response, target) {
  let forumId = createdForumID;
  loader(1);

  try {
    let response1 = await fetch(
      "https://opentalks.cyclic.app/api/forum/response",
      {
        method: "POST",
        body: JSON.stringify({ complaintId, userId, forumId, response }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response1.json();
    loader(0);

    if (!!data && data.success == true) {
      let btnData = JSON.stringify({ complaintId, userId });
      target.querySelector(
        ".forum-complaint-template-top-btns"
      ).innerHTML = ` <button class="forum-complaint-responses-btn"
      value='${btnData}'>Responses</button>`;
      target
        .querySelector(".forum-complaint-response-input")
        .classList.add("hide");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in sendResponseToComplaintC`);
  }
}

// FETCH RESPONSES OF COMPLAINT
async function fetchComplaintResponses(data1, target) {
  try {
    loader(1);

    let forumId = createdForumID;
    let complainth2 = `Responses of ${
      target.querySelector(".forum-complaint-id").textContent
    }`;
    document.querySelector(".forum-response-top h2").textContent = complainth2;
    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/response/all",
      {
        method: "POST",
        body: JSON.stringify({
          forumId,
          userId: data1.userId,
          complaintId: data1.complaintId,
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
    if (!!data && data.success == true && data.responses.length != 0) {
      data.responses.forEach((el) => {
        result += `
        <div class="forum-response-template">
          <div class="forum-response-message highlight-complaint">${
            el.response
          }</div>
          <div class="forum-response-date">On ${formatDate(el.createdAt)}</div>
        </div>
        `;
      });
      container.innerHTML = result;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchComplaintResponsesC`);
  }
}

// FETCHNJOINED FORUM RESPONSES OF COMPLAINT
async function fetchJoinedForumComplaintResponses(data1, target) {
  try {
    let forumId = joinedForumID;
    let complainth2 = `Responses of ${
      target.querySelector(".forum-complaint-id").textContent
    }`;
    document.querySelector(".joined-forum-response-top h2").textContent =
      complainth2;
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/response/all",
      {
        method: "POST",
        body: JSON.stringify({
          forumId,
          userId: sessionStorage.getItem("user"),
          complaintId: data1.complaintId,
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
    let container = document.querySelector(".joined-forum-response-main");
    if (!!data && data.success == true && data.responses.length != 0) {
      data.responses.forEach((el) => {
        result += `
        <div class="forum-response-template">
          <div class="forum-response-message highlight-complaint">${
            el.response
          }</div>
          <div class="forum-response-date">On ${formatDate(el.createdAt)}</div>
        </div>
        `;
      });
      container.innerHTML = result;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchComplaintResponsesC`);
  }
}

// CREATE COMPLAINT
async function createComplaint(complaint) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/complaint",
      {
        method: "POST",
        body: JSON.stringify({
          userId: sessionStorage.getItem("user"),
          forumId: joinedForumID,
          complaint,
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
    let container = document.querySelector(".joined-forum-complaints-main");
    if (!!data && data.success == true) {
      let el = data.complaint;
      result += `<div class="forum-complaints-template">
        <div class="forum-complaint-template-top">
          <p class="forum-complaint-id">${el.complaint_number}</p>
          <div class="forum-complaint-template-top-btns"></div>
        </div>
        <p class="forum-complaint-message highlight-complaint">
          ${el.complaint}
        </p>
        <div class="forum-complaint-info">
          <div>On ${formatDate(el.createdAt)}</div>
        </div>
      </div>`;
      container.innerHTML != "No complaints created yet."
        ? container.insertAdjacentHTML("afterbegin", result)
        : (container.innerHTML = result);
      container.scrollTop = 0;
      document.querySelector(".forum-create-complaint-input").value = "";
    } else {
      showNotification(data.message, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in createComplaintC`);
  }
}

// ** JOIN REQUEST

// FETCH FORUM JOIN REQUESTS
async function fetchMemberJoinRequests() {
  try {
    let query = {
      userId: sessionStorage.getItem("user"),
      forumId: currentForumID,
    };
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/join/request/list",
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

async function respondJoinRequest(target, status) {
  try {
    let { requestId, userId } = JSON.parse(target.value);
    loader(1);

    let response = await fetch("https://opentalks.cyclic.app/api/forum/join", {
      method: "POST",
      body: JSON.stringify({
        userId,
        forumId: createdForumID,
        status,
        requestId,
      }),
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      let container = target.closest(".forum-member-join-list-template");

      container.remove();
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in respondJoinRequestsC`);
  }
}

// ** FORUM POSTS
// FETCH 10 POSTS OF THE FORUMS IN FORUM CONTAINER
async function fetchForumPosts_initially(forumId, joined = false) {
  try {
    loader(1);

    let response = await fetch("https://opentalks.cyclic.app/api/post/all", {
      method: "POST",
      body: JSON.stringify({
        forumId,
        userId: sessionStorage.getItem("user"),
      }),
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    let data = await response.json();
    loader(0);

    let result = "";
    let container =
      joined == false
        ? document.querySelector(".forum-main-layout-container")
        : document.querySelector(".forum-joined-layout-container");
    if (!!data && data.success == true) {
      let posts = data.post.reverse();
      posts.forEach((el) => {
        let likeIconClass = el.isLiked ? "fa-solid" : "fa-regular";
        if (el.userId._id == sessionStorage.getItem("user")) {
          result += `
          <div class="forum-post-template-main">
          <h3 class="forum-post-title">${el.title}</h3>
          <p class="forum-post-description">${el.description}</p>
          <div class="forum-post-user-info-container">
            <div class="forum-post-date-time">
              <span class="forum-post-date">${formatDate(el.createdAt)}</span>
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
            <i
              class="${likeIconClass} fa-heart forum-post-like"
              data-postid="${el._id}"
            ></i>
            <i
              class="fa-solid fa-comment forum-post-user-comment"
              data-postid="${el._id}"
            ></i>
            <i
              class="fa-solid fa-trash-can forum-post-delete"
              data-postid="${el._id}"
            ></i>
          </div>
        </div>
          `;
        } else {
          result += `
          <div class="forum-post-template">
          <h3 class="forum-post-title">${el.title}</h3>
          <p class="forum-post-description">${el.description}</p>
          <div class="forum-post-user-info-container">
            <div class="forum-post-date-time">
              <span class="forum-post-date">${formatDate(el.createdAt)}</span>
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
            <i
              class="${likeIconClass} fa-heart forum-post-like"
              data-postid="${el._id}"
            ></i>
            <i
              class="fa-solid fa-comment forum-post-user-comment"
              data-postid="${el._id}"
            ></i>
          </div>
        </div>
          `;
        }
      });
      container.innerHTML = result;
      container.scrollTop = container.scrollHeight;
      forum_posts_startPoint = data.nextStartPoint;
    }
  } catch (error) {
    console.log(`Errror: ${error.toString()} in fetchForumPosts_initiallyC`);
  }
}

// LIKE USER POST
async function likeUserPost(target) {
  try {
    let postId = target.dataset.postid;
    let forumId = currentForumID;
    loader(1);

    let response = await fetch("https://opentalks.cyclic.app/api/post/like", {
      method: "POST",
      body: JSON.stringify({
        postId,
        userId: sessionStorage.getItem("user"),
        forumId,
      }),
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      target.classList.remove("fa-regular");
      target.classList.add("fa-solid");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in likeUserPostC`);
  }
}

// UNLIKE USER POST
async function unlikeUserPost(target) {
  try {
    let postId = target.dataset.postid;
    let forumId = currentForumID;
    loader(1);

    let response = await fetch("https://opentalks.cyclic.app/api/post/unlike", {
      method: "POST",
      body: JSON.stringify({
        postId,
        userId: sessionStorage.getItem("user"),
        forumId,
      }),
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      target.classList.remove("fa-solid");
      target.classList.add("fa-regular");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in unlikeUserPostC`);
  }
}

// UNLIKE FAVOURITE POST
async function unlikeUserFavouritePost(target) {
  try {
    let postId = target.dataset.postid;
    let forumId = target.dataset.forumid;
    loader(1);

    let response = await fetch("https://opentalks.cyclic.app/api/post/unlike", {
      method: "POST",
      body: JSON.stringify({
        postId,
        userId: sessionStorage.getItem("user"),
        forumId,
      }),
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      target.closest(".favourite-main-post-template").remove();
      showNotification("Post is removed from favorites.", 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in unlikeUserPostC`);
  }
}

// FETCH USER COMMENTS
async function fetchUserComments(target) {
  try {
    let postId = target.dataset.postid;
    let userId = sessionStorage.getItem("user");
    document.querySelector(".post-add-reply-input").value = "";
    document.querySelector(".post-add-reply-input").dataset.postid = postId;
    document.querySelector(".post-reply-container").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/post/reply/all",
      {
        method: "POST",
        body: JSON.stringify({
          postId,
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
    let container = document.querySelector(".post-reply-list");
    if (!!data && data.success == true) {
      data.replies.forEach((el) => {
        let canDelete =
          el.byWhom._id == userId
            ? `
  <i
class="fa-solid fa-trash-can post-reply-delete"
title="Delete reply"
data-replyid="${el._id}"
></i>
  `
            : "";
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
${canDelete}
</div>
      </div>
      <p class="post-reply-message">${el.message}</p>
    </div>
`;
      });
      container.innerHTML = result;
      container.scrollTop = 0;
    } else {
      container.innerHTML = "No reply found for this post";
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchUserCommentsC`);
  }
}

// ADD REPLY TO USER POST
async function addPostReply(reply, target, isJoined = false) {
  try {
    let forumId = isJoined == false ? createdForumID : joinedForumID;
    loader(1);

    const response = await fetch(
      "https://opentalks.cyclic.app/api/post/reply/add",
      {
        method: "POST",
        body: JSON.stringify({
          postId: target.dataset.postid,
          forumId,
          byWhom: sessionStorage.getItem("user"),
          message: reply,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    const data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".post-reply-list");
    if (!!data && data.success == true) {
      await fetchUserComments(target);

      document.querySelector(".post-add-reply-input").value = "";
      container.scrollTop = container.scrollHeight;
    } else {
      showNotification("Reply does not added", 3000);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in addPostReplyC`);
  }
}

// DELETE REPLY
async function deleteReply(target) {
  try {
    document.querySelector(".post-reply-container").classList.add("hide");
    let confirm = await showConfirmation("Do you want to delete this reply?");
    if (confirm) {
      document
        .querySelector(".user-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document.querySelector(".user-confirm-pass-button").value =
        JSON.stringify({ replyId: target.dataset.replyid });
      document.querySelector(".user-confirm-pass-input").value = "";
      document
        .querySelector(".user-confirm-pass-button")
        .classList.add("deleteReply");
      targetedContainer = target.closest(".post-reply-template");
    } else {
      document.querySelector(".post-reply-container").classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in deleteReplyC`);
  }
}

async function deleteReplyMain(password, query) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/post/reply/delete",
      {
        method: "POST",
        body: JSON.stringify({
          _id: query.replyId,
          user_password: password,
          user_id: sessionStorage.getItem("user"),
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
        .querySelector(".user-confirm-pass-button")
        .classList.remove("deleteReply");
      document
        .querySelector(".user-confirm-pass-container")
        .classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      targetedContainer.remove();
      showNotification("Your reply has been deleted", 2500);
    } else {
      showNotification(data.message, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in deleteReplyMainC`);
  }
}

// SEARCH USER POST
async function searchForumPost(query) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/post/search",
      {
        method: "POST",
        body: JSON.stringify({
          forumId: query.forumId,
          byNumber: query.byNumber,
          search: query.search,
          cUserId: query.UserId,
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
    let container = document.querySelector(".forum-post-search-list");
    let results = document.querySelector(".forum-post-search-results span");
    if (!!data && data.success == true) {
      results.textContent = data.result;
      data.posts.forEach((el) => {
        let likeIconClass = el.isLiked ? "fa-solid" : "fa-regular";
        let highlightedTitle;
        if (query.byNumber == false) {
          let searchRegex = new RegExp(forum_post_search.search.trim(), "gi");
          highlightedTitle = el.title.replace(
            searchRegex,
            (match) => `<span class="highlight">${match}</span>`
          );
          // highlightedDescription = el.description.replace(
          //   searchRegex,
          //   (match) => `<span class="highlight">${match}</span>`
          // );
        } else {
          highlightedTitle = el.title;
          // highlightedDescription = el.description;
        }
        if (el.userId._id == sessionStorage.getItem("user")) {
          result += `
          <div class="forum-post-template-search">
          <h3 class="forum-post-title">${highlightedTitle}</h3>
          <p class="forum-post-description">${el.description}</p>
          <div class="forum-post-user-info-container">
            <div class="forum-post-date-time">
              <span class="forum-post-date">${formatDate(el.createdAt)}</span>
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
            <i
              class="${likeIconClass} fa-heart forum-post-like"
              data-postid="${el._id}"
            ></i>
            <i
              class="fa-solid fa-comment forum-post-user-comment"
              data-postid="${el._id}"
            ></i>
            <i
              class="fa-solid fa-trash-can forum-post-delete"
              data-postid="${el._id}"
            ></i>
          </div>
        </div>
          `;
        } else {
          result += `
          <div class="forum-post-template-search">
          <h3 class="forum-post-title">${highlightedTitle}</h3>
          <p class="forum-post-description">${el.description}</p>
          <div class="forum-post-user-info-container">
            <div class="forum-post-date-time">
              <span class="forum-post-date">${formatDate(el.createdAt)}</span>
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
            <i
              class="${likeIconClass} fa-heart forum-post-like"
              data-postid="${el._id}"
            ></i>
            <i
              class="fa-solid fa-comment forum-post-user-comment"
              data-postid="${el._id}"
            ></i>
          </div>
        </div>
          `;
        }
      });
      container.innerHTML = result;
      container.scrollTop = 0;
      forum_post_search_startPoint = data.nextStartPoint;
    } else {
      container.innerHTML = data.message;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in searchForumPostC`);
  }
}

// SEARCH USER POST IN FORUM SCROLL
async function searchForumPostScroll(query) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/post/search",
      {
        method: "POST",
        body: JSON.stringify({
          forumId: query.forumId,
          byNumber: query.byNumber,
          search: query.search,
          cUserId: query.UserId,
          startPoint: forum_post_search_startPoint,
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
    let container = document.querySelector(".forum-post-search-list");
    if (!!data && data.success == true) {
      data.posts.forEach((el) => {
        let likeIconClass = el.isLiked ? "fa-solid" : "fa-regular";
        let highlightedTitle;
        if (query.byNumber == false) {
          let searchRegex = new RegExp(forum_post_search.search.trim(), "gi");
          highlightedTitle = el.title.replace(
            searchRegex,
            (match) => `<span class="highlight">${match}</span>`
          );
          // highlightedDescription = el.description.replace(
          //   searchRegex,
          //   (match) => `<span class="highlight">${match}</span>`
          // );
        } else {
          highlightedTitle = el.title;
          // highlightedDescription = el.description;
        }
        if (el.userId._id == sessionStorage.getItem("user")) {
          result += `
          <div class="forum-post-template-search">
          <h3 class="forum-post-title">${highlightedTitle}</h3>
          <p class="forum-post-description">${el.description}</p>
          <div class="forum-post-user-info-container">
            <div class="forum-post-date-time">
              <span class="forum-post-date">${formatDate(el.createdAt)}</span>
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
            <i
              class="${likeIconClass} fa-heart forum-post-like"
              data-postid="${el._id}"
            ></i>
            <i
              class="fa-solid fa-comment forum-post-user-comment"
              data-postid="${el._id}"
            ></i>
            <i
              class="fa-solid fa-trash-can forum-post-delete"
              data-postid="${el._id}"
            ></i>
          </div>
        </div>
          `;
        } else {
          result += `
          <div class="forum-post-template-search">
          <h3 class="forum-post-title">${highlightedTitle}</h3>
          <p class="forum-post-description">${el.description}</p>
          <div class="forum-post-user-info-container">
            <div class="forum-post-date-time">
              <span class="forum-post-date">${formatDate(el.createdAt)}</span>
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
            <i
              class="${likeIconClass} fa-heart forum-post-like"
              data-postid="${el._id}"
            ></i>
            <i
              class="fa-solid fa-comment forum-post-user-comment"
              data-postid="${el._id}"
            ></i>
          </div>
        </div>
          `;
        }
      });
      let prevScrollHeight = container.scrollHeight;
      container.insertAdjacentHTML("beforeend", result);
      container.scrollTop = prevScrollHeight;
      forum_post_search_startPoint = data.nextStartPoint;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in searchForumPostScrollC`);
  }
}

// DELETE USER POST
async function deleteUserPost(target) {
  try {
    let confirm = await showConfirmation("Do you want to delete this post?");
    if (confirm == true) {
      document
        .querySelector(".user-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document.querySelector(".user-confirm-pass-button").value =
        JSON.stringify({ postId: target.dataset.postid });
      document.querySelector(".user-confirm-pass-input").value = "";
      document
        .querySelector(".user-confirm-pass-button")
        .classList.add("deleteUserPost");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in deleteUserPostC`);
  }
}

async function deleteUserPostMain(password, query) {
  try {
    loader(1);

    let response = await fetch("https://opentalks.cyclic.app/api/post/delete", {
      method: "POST",
      body: JSON.stringify({
        postId: query.postId,
        user_password: password,
        user_id: sessionStorage.getItem("user"),
      }),
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      document
        .querySelector(".user-confirm-pass-button")
        .classList.remove("deleteUserPost");
      document
        .querySelector(".user-confirm-pass-container")
        .classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      targetedContainer.remove();
      showNotification("Your post has been deleted", 2500);
    } else {
      showNotification(data.message, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in deleteUserPostMainC`);
  }
}

// USERS WHO LIKED POST
async function fetchPostLikesUsers(target) {
  try {
    targetedContainer = target;
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/post/like/user",
      {
        method: "POST",
        body: JSON.stringify({
          postId: target.dataset.postid,
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
    let container = document.querySelector(".post-like-list");
    if (!!data && data.success == true) {
      document.querySelector(".post-likes-container").classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      data.person.forEach((el) => {
        result += `
        <div class="post-like-template">
        <div class="post-like-profile">
          <img src="https://opentalks.cyclic.app${
            el.userId.image
          }" alt="User Profile" />
        </div>
        <div class="post-like-info">
          <span class="post-like-user">By ${el.userId.name}</span><br />
          <span class="post-like-date">Liked on ${formatDate(
            el.createdAt
          )}</span>
        </div>
      </div>`;
      });
      container.innerHTML = result;
      container.scrollTop = 0;
      post_like_startPoint = data.nextStartPoint;
    } else {
      showNotification("No user liked this post.", 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchPostLikesUsersC`);
  }
}

async function fetchPostLikesUsersScroll(target) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/post/like/user",
      {
        method: "POST",
        body: JSON.stringify({
          postId: target.dataset.postid,
          startPoint: post_like_startPoint,
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
    let container = document.querySelector(".post-like-list");
    if (!!data && data.success == true) {
      document.querySelector(".post-likes-container").classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      data.person.forEach((el) => {
        result += `
        <div class="post-like-template">
        <div class="post-like-profile">
          <img src="https://opentalks.cyclic.app${
            el.userId.image
          }" alt="User Profile" />
        </div>
        <div class="post-like-info">
          <span class="post-like-user">By ${el.userId.name}</span><br />
          <span class="post-like-date">Liked on ${formatDate(
            el.createdAt
          )}</span>
        </div>
      </div>`;
      });

      let prevScrollHeight = container.scrollHeight;
      container.insertAdjacentHTML("beforeend", result);
      container.scrollTop = prevScrollHeight;

      post_like_startPoint = data.nextStartPoint;
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchPostLikesUsersScrollC`);
  }
}

// ** CREATE FORUM POST
async function createPost(data) {
  try {
    document.querySelector(".post-editor-container").classList.add("hide");
    let confirm = await showConfirmation("Do you want to create this post?");
    if (confirm) {
      document
        .querySelector(".user-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document.querySelector(".user-confirm-pass-button").value =
        JSON.stringify(data);
      document.querySelector(".user-confirm-pass-input").value = "";
      document
        .querySelector(".user-confirm-pass-button")
        .classList.add("createUserPost");
    } else {
      document.querySelector(".post-editor-container").classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in createPostC`);
  }
}

async function createPostMain(query, password) {
  try {
    loader(1);

    let forumId =
      currentForumID == createdForumID ? createdForumID : joinedForumID;
    let joined = currentForumID == createdForumID ? false : true;
    let response = await fetch("https://opentalks.cyclic.app/api/post/add", {
      method: "POST",
      body: JSON.stringify({
        userId: sessionStorage.getItem("user"),
        ...query,
        forumId,
        user_id: sessionStorage.getItem("user"),
        user_password: password,
      }),
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      document
        .querySelector(".user-confirm-pass-button")
        .classList.remove("createUserPost");
      document
        .querySelector(".user-confirm-pass-container")
        .classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      await fetchForumPosts_initially(forumId, joined);
      showNotification("Post created successfully.", 2500);
    } else {
      showNotification(data.message, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in createPostC`);
  }
}

// ** FORUM DELETE
async function deleteCreatedForum() {
  try {
    let confirm = await showConfirmation("Do you want to delete this forum?");
    if (confirm) {
      document
        .querySelector(".user-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document.querySelector(".user-confirm-pass-input").value = "";
      document
        .querySelector(".user-confirm-pass-button")
        .classList.add("deleteForum");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in deleteCreatedForumC`);
  }
}

async function deleteCreatedForumMain(password) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/delete",
      {
        method: "POST",
        body: JSON.stringify({
          _id: createdForumID,
          byAdmin: false,
          user_id: sessionStorage.getItem("user"),
          user_password: password,
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
        .querySelector(".user-confirm-pass-button")
        .classList.remove("deleteForum");
      document
        .querySelector(".user-confirm-pass-container")
        .classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      showNotification("Forum deleted successfully", 2500);
      document.querySelector(".main-forums-forum-layout").classList.add("hide");
      document.querySelector(".main-forums-bottom").classList.remove("hide");
      document.querySelector(".main-forum-parent-top").classList.remove("hide");
      await fetchCreatedForums();
    } else {
      showNotification("Forum does not get deleted", 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in deleteCreatedForumMainC`);
  }
}

// ** FORUM REVIEWS

async function fetchForumReviews() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/rate/all",
      {
        method: "POST",
        body: JSON.stringify({
          forumId: createdForumID,
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
      "https://opentalks.cyclic.app/api/forum/rate/all",
      {
        method: "POST",
        body: JSON.stringify({
          forumId: createdForumID,
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

// ** FORUM RATING
// FETCH THE FORUM RATING IF ANY
async function fetchForumRating() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/rate/get",
      {
        method: "POST",
        body: JSON.stringify({
          userId: sessionStorage.getItem("user"),
          forumId: joinedForumID,
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
      prevRating = data.rating;
      if (data.rating == 1) {
        document
          .querySelector(".like-forum-rating")
          .classList.add("selected-forum-rating");
      } else {
        document
          .querySelector(".dislike-forum-rating")
          .classList.add("selected-forum-rating");
      }
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in fetchForumRatingC`);
  }
}

// SUBMIT THE NEW RATING OR UPDATE THE PREVIOUS ONE
async function submitForumRating() {
  try {
    loader(1);

    let response = await fetch("https://opentalks.cyclic.app/api/forum/rate", {
      method: "POST",
      body: JSON.stringify({
        userId: sessionStorage.getItem("user"),
        forumId: joinedForumID,
        rating,
      }),
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    let data = await response.json();
    loader(0);

    if (!!data && data.success == true) {
      showNotification("Feedback updated successfully.");
    } else {
      showNotification("Feedback not updated successfully.");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in submitForumRatingC`);
  }
}

// ** LEFT FORUM
// LEFT JOINED FORUM
async function leftJoinedForum() {
  try {
    let confirm = await showConfirmation(
      "Do you want to left this forum permanently?"
    );
    if (confirm) {
      document
        .querySelector(".user-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document.querySelector(".user-confirm-pass-input").value = "";
      document
        .querySelector(".user-confirm-pass-button")
        .classList.add("leftJoinedForum");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in leftJoinedForumC`);
  }
}

async function leftJoinedForumMain(password) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/join/left",
      {
        method: "POST",
        body: JSON.stringify({
          userId: sessionStorage.getItem("user"),
          forumId: joinedForumID,
          user_id: sessionStorage.getItem("user"),
          user_password: password,
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
        .querySelector(".user-confirm-pass-container")
        .classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      document
        .querySelector(".user-confirm-pass-button")
        .classList.remove("leftJoinedForum");
      document
        .querySelector(".joined-forums-forum-layout")
        .classList.add("hide");
      document.querySelector(".main-forums-bottom").classList.remove("hide");
      document.querySelector(".main-forum-parent-top").classList.remove("hide");
      showNotification("Fourm left successfully.");
      await fetchJoinedForums();
    } else {
      showNotification("Fourm does not left successfully.");
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in leftJoinedForumMainC`);
  }
}

// ** SEARCH FILTER
async function searchForumFilter(query) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/join/member/search/filter",
      {
        method: "POST",
        body: JSON.stringify({
          ...query,
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
    let container = document.querySelector(".main-forums-searched-container");
    let result_no = document.querySelector(
      ".main-forums-searched-list h2 span"
    );
    if (!!data && data.success == true) {
      document.querySelector(".forum-filter-container").classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      data.forums.forEach((el) => {
        result += `<div class="searched-forum-template">
          <div class="searched-forum-name">${el.name}</div>
          <div class="searched-forum-description">
            ${el.description}
          </div>
          <div class="searched-forum-bottom">
            <p>${formatDate(el.createdAt)}</p>
            <button
              class="searched-forum-join"
              value="${el._id}"
            >
              Request to join
            </button>
          </div>
          <p class="searched-forum-admin-name">
            <span>
              <img
                src="https://opentalks.cyclic.app${el.userId.image}"
                alt="admin-profile-pic"
              />Created By ${el.userId.name}</span
            >
          </p>
        </div>`;
      });
      container.innerHTML = result;
      container.scrollTop = 0;
      forum_search_startPoint = data.nextStartPoint;
      result_no.textContent = data.results;
    } else {
      showNotification("No result found", 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in searchForumFilterC`);
  }
}

async function searchForumFilterScroll(query) {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/forum/join/member/search/filter",
      {
        method: "POST",
        body: JSON.stringify({
          ...query,
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
    let container = document.querySelector(".main-forums-searched-container");
    if (!!data && data.success == true) {
      data.forums.forEach((el) => {
        result += `<div class="searched-forum-template">
        <div class="searched-forum-name">${el.name}</div>
        <div class="searched-forum-description">
          ${el.description}
        </div>
        <div class="searched-forum-bottom">
          <p>${formatDate(el.createdAt)}</p>
          <button
            class="searched-forum-join"
            value="${el._id}"
          >
            Request to join
          </button>
        </div>
        <p class="searched-forum-admin-name">
          <span>
            <img
              src="https://opentalks.cyclic.app${el.userId.image}"
              alt="admin-profile-pic"
            />Created By ${el.userId.name}</span
          >
        </p>
      </div>`;
      });
      let prevScrollHeight = container.scrollHeight;
      container.insertAdjacentHTML("beforeend", result);
      container.scrollTop = prevScrollHeight;
      forum_search_startPoint = data.nextStartPoint;
    }
  } catch (error) {
    console.clear(`Error: ${error.toString()} in searchForumFilterScrollC`);
  }
}

// ** CREATE FORUM
async function createForum(data) {
  try {
    document.querySelector(".add-forum-container").classList.add("hide");
    let confirm = await showConfirmation("Do you want to create this forum?");
    if (confirm) {
      document
        .querySelector(".user-confirm-pass-container")
        .classList.remove("hide");
      document.querySelector(".blur").classList.remove("hide");
      document.querySelector(".user-confirm-pass-input").value = "";
      document
        .querySelector(".user-confirm-pass-button")
        .classList.add("createForum");
      document.querySelector(".user-confirm-pass-button").value =
        JSON.stringify(data);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in createForumC`);
  }
}

async function createForumMain(query, password) {
  try {
    loader(1);

    let response = await fetch("https://opentalks.cyclic.app/api/forum/add", {
      method: "POST",
      body: JSON.stringify({
        ...query,
        user_id: sessionStorage.getItem("user"),
        user_password: password,
      }),
      headers: {
        "Content-type": "application/json;charset=utf-8",
        Authorization: sessionStorage.getItem("token"),
      },
    });
    let data = await response.json();
    loader(0);

    let result = "";
    let container = document.querySelector(".main-forums-created-container");
    if (!!data && data.success == true) {
      document
        .querySelector(".user-confirm-pass-container")
        .classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
      document
        .querySelector(".user-confirm-pass-button")
        .classList.remove("createForum");
      let el = { ...data.new_forum };
      result = `<div class="created-forum-template">
                <div class="created-forum-name">${el.name}</div>
                <div class="created-forum-description">${el.description}</div>
                <div class="created-forum-bottom">
                  <p>${formatDate(el.createdAt)}</p>
                  <button class="created-forum-vist" value="${
                    el._id
                  }">Visit Forum</button>
                </div>
              </div>`;
      let prevScrollHeight = container.scrollHeight;
      container.insertAdjacentHTML("beforeend", result);
      container.scrollTop = prevScrollHeight;
      showNotification("New forum created successfully.", 2500);
    } else {
      showNotification(data.message, 2500);
    }
  } catch (error) {
    console.log(`Error: ${error.toString()} in createForumMain`);
  }
}
// ** FORGET PASSWORD
async function forgetPassword() {
  try {
    loader(1);

    let response = await fetch(
      "https://opentalks.cyclic.app/api/password/forget",
      {
        method: "POST",
        body: JSON.stringify({ userId: sessionStorage.getItem("user") }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    );
    let data = await response.json();
    loader(0);

    showNotification(data.message, 2500);
  } catch (error) {
    console.log(`Error: ${error.toString()} in forgetPasswordC`);
  }
}

// ! *********************************************************************************************************************************************************EVENT LISTNERS

// ** NAVBAR
document.querySelectorAll(".nav-link").forEach((el) => {
  el.addEventListener("click", () => {
    let targetClass = el.dataset.value;
    document.querySelectorAll(".main-section > section").forEach((el) => {
      el.classList.add("hide");
    });

    document.querySelector(`.${targetClass}`).classList.remove("hide");
  });
});

// ** USER PASSWORD CONFIRMATION
document
  .querySelector(".user-confirm-pass-button")
  .addEventListener("click", async () => {
    let password = document
      .querySelector(".user-confirm-pass-input")
      .value.trim();
    let button = document.querySelector(".user-confirm-pass-button");
    if (password != "") {
      if (button.classList.contains("deleteUserPost")) {
        await deleteUserPostMain(password, JSON.parse(button.value));
      } else if (button.classList.contains("removeForumMember")) {
        await removeForumMemberMain(password, JSON.parse(button.value));
      } else if (button.classList.contains("updateForumDetails")) {
        await updateForumDetailsMain(password, JSON.parse(button.value));
      } else if (button.classList.contains("deleteForum")) {
        await deleteCreatedForumMain(password);
      } else if (button.classList.contains("deleteReply")) {
        await deleteReplyMain(password, JSON.parse(button.value));
      } else if (button.classList.contains("leftJoinedForum")) {
        await leftJoinedForumMain(password);
      } else if (button.classList.contains("createForum")) {
        await createForumMain(JSON.parse(button.value), password);
      } else if (button.classList.contains("updateUserDetails")) {
        await updateUserProfileMain(JSON.parse(button.value), password);
      } else if (button.classList.contains("updateUserProfile")) {
        await updateUserPicMain(password);
      } else if (button.classList.contains("createUserPost")) {
        await createPostMain(JSON.parse(button.value), password);
      }
    } else {
      showNotification("Password is required", 2500);
    }
  });

document
  .querySelector(".close-user-pass-confirm-form")
  .addEventListener("click", () => {
    document
      .querySelector(".user-confirm-pass-container")
      .classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
    let classlist = document.querySelector(".user-confirm-pass-button");
    classlist.classList.forEach((el) => {
      if (el != "user-confirm-pass-button") {
        classlist.classList.remove(el);
      }
    });
  });

// ** RECENT POSTS
document
  .querySelector(".recent-posts-list")
  .addEventListener("scroll", async function (event) {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      await fetchPostsAfterLastLogin();
    }
  });

// ** TOP FORUMS
document
  .querySelector(".top-forums-list")
  .addEventListener("scroll", async function (event) {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      await fetchtopForumsScroll();
    }
  });

// ** NOTIFICATION POPUP
document.querySelector(".popup-msg-close").addEventListener("click", () => {
  hideNotification();
});

// ** JOIN FORUM
document
  .querySelector(".top-forums-list")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("join-top-forum-btn")) {
      await sentForumJoinRequest(target.value);
    }
  });

//** EDIT USER PROFILE IMAGE
document
  .querySelector(".user-profile-pic-change")
  .addEventListener("click", () => {
    document.querySelector(".edit-user-container").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    document.querySelector(
      ".edit-user-profile-pic-img"
    ).src = `https://opentalks.cyclic.app${user_details.user.image}`;
  });

document.querySelector(".close-edit-user").addEventListener("click", () => {
  document.querySelector(".edit-user-container").classList.add("hide");
  document.querySelector(".blur").classList.add("hide");
});

document
  .querySelector(".edit-user-upload-btn")
  .addEventListener("click", async () => {
    let fileInput = document.querySelector(".edit-user-profile-pic-upload");
    if (!!fileInput.files[0]) {
      return await updateUserPic();
    }
    showNotification("No profile pic available", 2500);
  });

document
  .querySelector(".edit-user-profile-pic-upload")
  .addEventListener("change", (event) => {
    const fileInput = event.target;
    const label = document.querySelector(".edit-user-pic-label");

    if (fileInput.files.length > 0) {
      const fileName = `${fileInput.files[0].name} image selected`;
      label.textContent = fileName;
    } else {
      label.textContent = "Click to Upload New Profile Pic";
    }
  });

//** EDIT USER PROFILE DETAILS

document.querySelector(".edit-user-profile").addEventListener("click", () => {
  let list = "";
  document.querySelector(".edit-user-container2").classList.remove("hide");
  document.querySelector(".blur").classList.remove("hide");
  document.querySelector(".edit-user-details-name").value =
    user_details.user.name;

  departmentList.forEach((el) => {
    list += `<option value="${el._id}">${el.name}</option>`;
  });
  document.querySelector(".edit-user-details-department").innerHTML = list;
  document.querySelector(".edit-user-details-department").value =
    user_details.user.departmentId._id;
});

document.querySelector(".close-edit-user2").addEventListener("click", () => {
  document.querySelector(".edit-user-container2").classList.add("hide");
  document.querySelector(".blur").classList.add("hide");
});

document
  .querySelector(".edit-user-details-btn")
  .addEventListener("click", () => {
    let userName = document
      .querySelector(".edit-user-details-name")
      .value.trim();

    let userDepId = document
      .querySelector(".edit-user-details-department")
      .value.trim();
    let toUpdate = {};
    let count = 0;
    if (user_details.user.name != userName) {
      toUpdate.name = userName;
      count++;
    }

    if (user_details.user.departmentId._id != userDepId) {
      toUpdate.departmentId = userDepId;
      count++;
    }
    if (count == 0) {
      showNotification("Nothing upated", 3000);
      return;
    }

    toUpdate._id = sessionStorage.getItem("user");

    updateUserProfile(toUpdate);
  });

// ** RECENT POSTS AND LIKED POSTS
document.querySelector(".show-posts").addEventListener("click", async () => {
  document.querySelector(".liked-posts-main").classList.remove("hide");
  document.querySelector(".searched-posts-main").classList.add("hide");
  document.querySelector(".favourite-posts-main").classList.add("hide");
  document.querySelector(".search-post-main-posts").value = "";
  if (posts == 0) {
    await Promise.all([userRecentPosts(), userLikedPosts()]);
  }
});

document
  .querySelector(".recent-main-posts-container")
  .addEventListener("scroll", async function (event) {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      loader(1);

      let response = await fetch(
        "https://opentalks.cyclic.app/api/post/recent/5",
        {
          method: "POST",
          body: JSON.stringify({
            userId: sessionStorage.getItem("user"),
            startPoint: recent_created_posts_startPoint,
          }),
          headers: {
            "Content-type": "application/json;charset=utf-8",
            Authorization: sessionStorage.getItem("token"),
          },
        }
      );

      let data = await response.json();
      loader(0);

      let container = document.querySelector(".recent-main-posts-container");
      let result = "";
      if (!!data && data.success == true) {
        recent_created_posts_startPoint = data.nextStartPoint;
        data.recentPosts.forEach((el) => {
          result += `<div class="recent-main-post-template">
  <div class="recent-main-post-top">
    <div class="recent-main-post-title">${el.title}</div>
    <div class="recent-main-post-forum-name">
      <i class="fa-solid fa-comments"></i>
      <span>${el.forumId.name}</span>
    </div>
  </div>
  <div class="recent-main-post-description">${el.description}</div>
  <div class="recent-main-post-bottom">
    <div class="recent-main-post-createdOn">${formatDate(el.createdAt)}</div>
    <div class="recent-main-post-buttons">
      <i class="fa-solid fa-thumbs-up recent-main-post-likes" data-postid="${
        el._id
      }"></i>
      <i class="fa-solid fa-reply recent-main-post-replies" data-postid="${
        el._id
      }"></i>
      <i
        class="fa-solid fa-trash-can recent-main-post-delete" data-postid="${
          el._id
        }"
      ></i>
    </div>
  </div>
</div>`;
        });
        let prevScrollHeight = container.scrollHeight;
        container.insertAdjacentHTML("beforeend", result);
        container.scrollTop = prevScrollHeight;
      }
    }
  });

document
  .querySelector(".liked-main-posts-container")
  .addEventListener("scroll", async function (event) {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      loader(1);

      let response = await fetch("https://opentalks.cyclic.app/api/post/top", {
        method: "POST",
        body: JSON.stringify({
          userId: sessionStorage.getItem("user"),
          startPoint: liked_posts_startPoint,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      });
      let data = await response.json();
      loader(0);

      let result = "";
      let container = document.querySelector(".liked-main-posts-container");

      if (!!data && data.success == true) {
        liked_posts_startPoint = data.nextStartPoint;
        data.topPosts.forEach((el) => {
          let iconClass = el.likes == 0 ? "fa-regular" : "fa-solid";
          result += `<div class="liked-main-post-template">
          <div class="liked-main-post-top">
            <div class="liked-main-post-title">${el.title}</div>
            <div class="liked-main-post-forum-name">
              <i class="fa-solid fa-comments"></i>
              <span>${el.forumId.name}</span>
            </div>
          </div>
          <div class="liked-main-post-description">${el.description}</div>
          <div class="liked-main-post-bottom">
            <div class="liked-main-post-createdOn">${formatDate(
              el.createdAt
            )}</div>
            <div class="liked-main-post-buttons">
            <i class="${iconClass} fa-heart liked-main-post-likes" data-postid="${
            el._id
          }"></i>
              <i class="fa-solid fa-reply liked-main-post-replies" data-postid="${
                el._id
              }"></i>
              <i class="fa-solid fa-trash-can liked-main-post-delete" data-postid="${
                el._id
              }"></i>
            </div>
          </div>
        </div>`;
        });
        let prevScrollHeight = container.scrollHeight;
        container.insertAdjacentHTML("beforeend", result);
        container.scrollTop = prevScrollHeight;
      }
    }
  });

// ** MY POST SEARCH
document
  .querySelector(".search-post-main-posts")
  .addEventListener("keydown", async (e) => {
    let target = document.querySelector(".search-post-main-posts").value.trim();
    if (e.key == "Enter" && target != "") {
      myPost_search = target;
      loader(1);

      let response = await fetch(
        "https://opentalks.cyclic.app/api/post/search",
        {
          method: "POST",
          body: JSON.stringify({
            search: target,
            userId: sessionStorage.getItem("user"),
          }),
          headers: {
            "Content-type": "application/json;charset=utf-8",
            Authorization: sessionStorage.getItem("token"),
          },
        }
      );
      let data = await response.json();
      loader(0);

      let results = document.querySelector(".searched-posts-main h2 span");
      let result = "";
      let container = document.querySelector(".searched-main-posts-container");
      document.querySelector(".liked-posts-main").classList.add("hide");
      document.querySelector(".favourite-posts-main").classList.add("hide");

      document.querySelector(".searched-posts-main").classList.remove("hide");
      if (!!data && data.success == true) {
        results.textContent = data.result;
        data.results.forEach((el) => {
          let highlightedTitle = el.title.replace(
            new RegExp(target, "gi"),
            (match) => `<span class="highlight">${match}</span>`
          );

          // let highlightedDescription = el.description.replace(
          //   /<div[^>]*>[\s\S]*?<\/div>|<br\s*\/?>|<a[^>]*>[\s\S]*?<\/a>/gi,
          //   (match) => {
          //     if (match.includes("<a")) {
          //       return match;
          //     } else {
          //       return match.replace(
          //         new RegExp(target, "gi"),
          //         (match) => `<span class="highlight">${match}</span>`
          //       );
          //     }
          //   }
          // );

          let iconClass = el.likes == 0 ? "fa-regular" : "fa-solid";
          result += `<div class="searched-main-post-template">
        <div class="searched-main-post-top">
          <div class="searched-main-post-title">${highlightedTitle}</div>
          <div class="searched-main-post-forum-name">
            <i class="fa-solid fa-comments"></i>
            <span>${el.forumId.name}</span>
          </div>
        </div>
        <div class="searched-main-post-description">${el.description}</div>
        <div class="searched-main-post-bottom">
          <div class="searched-main-post-createdOn">${formatDate(
            el.createdAt
          )}</div>
          <div class="searched-main-post-buttons">
          <i class="${iconClass} fa-heart searched-main-post-likes" data-postid="${
            el._id
          }"></i>
            <i class="fa-solid fa-reply searched-main-post-replies" data-postid="${
              el._id
            }"></i>
            <i class="fa-solid fa-trash-can searched-main-post-delete" data-postid="${
              el._id
            }"></i>
          </div>
        </div>
      </div>`;
        });
        container.innerHTML = result;
        container.scrollTop = 0;
        searched_posts_startPoint = data.nextStartPoint;
      } else {
        results.textContent = "0";
        container.innerHTML = "No post found";
      }
    }
  });

document
  .querySelector(".searched-main-posts-container")
  .addEventListener("scroll", async function (event) {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      loader(1);

      let response = await fetch(
        "https://opentalks.cyclic.app/api/post/search",
        {
          method: "POST",
          body: JSON.stringify({
            search: myPost_search,
            userId: sessionStorage.getItem("user"),
            startPoint: searched_posts_startPoint,
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
      let container = document.querySelector(".searched-main-posts-container");

      if (!!data && data.success == true) {
        searched_posts_startPoint = data.nextStartPoint;

        data.results.forEach((el) => {
          let highlightedTitle = el.title.replace(
            new RegExp(myPost_search, "gi"),
            (match) => `<span class="highlight">${match}</span>`
          );
          // let highlightedDescription = el.description.replace(
          //   new RegExp(myPost_search, "gi"),
          //   (match) => `<span class="highlight">${match}</span>`
          // );
          let iconClass = el.likes == 0 ? "fa-regular" : "fa-solid";
          result += `<div class="searched-main-post-template">
    <div class="searched-main-post-top">
      <div class="searched-main-post-title">${highlightedTitle}</div>
      <div class="searched-main-post-forum-name">
        <i class="fa-solid fa-comments"></i>
        <span>${el.forumId.name}</span>
      </div>
    </div>
    <div class="searched-main-post-description">${el.description}</div>
    <div class="searched-main-post-bottom">
      <div class="searched-main-post-createdOn">${formatDate(
        el.createdAt
      )}</div>
      <div class="searched-main-post-buttons">
      <i class="${iconClass} fa-heart searched-main-post-likes" data-postid="${
            el._id
          }"></i>
        <i class="fa-solid fa-reply searched-main-post-replies" data-postid="${
          el._id
        }"></i>
        <i class="fa-solid fa-trash-can searched-main-post-delete" data-postid="${
          el._id
        }"></i>
      </div>
    </div>
  </div>`;
        });

        let prevScrollHeight = container.scrollHeight;
        container.insertAdjacentHTML("beforeend", result);
        container.scrollTop = prevScrollHeight;
      }
    }
  });

// ** FAVOURITE POSTS
document
  .querySelector(".favourite-posts-main-posts")
  .addEventListener("click", async () => {
    document.querySelector(".liked-posts-main").classList.add("hide");
    document.querySelector(".searched-posts-main").classList.add("hide");
    document.querySelector(".favourite-posts-main").classList.remove("hide");
    await fetchFavouritePosts();
  });

document
  .querySelector(".favourite-main-posts-container")
  .addEventListener("scroll", async function (event) {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      loader(1);

      let response = await fetch(
        "https://opentalks.cyclic.app/api/post/favourite",
        {
          method: "POST",
          body: JSON.stringify({
            userId: sessionStorage.getItem("user"),
            startPoint: favourite_posts_startPoint,
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
      let container = document.querySelector(".favourite-main-posts-container");
      if (!!data && data.success == true) {
        data.posts.forEach((el) => {
          result += `<div class="favourite-main-post-template">
    <div class="favourite-main-post-top">
      <div class="favourite-main-post-title">${el.postId.title}</div>
      <div class="favourite-main-post-forum-name">
        <i class="fa-solid fa-comments"></i>
        <span>${el.forumId.name}</span>
      </div>
    </div>
    <div class="favourite-main-post-description">${el.postId.description}</div>
  
    <div class="favourite-main-post-bottom">
      <div class="favourite-main-post-createdOn">${formatDate(
        el.createdAt
      )}</div>
      <div class="favourite-main-post-info">
        <img
          src="https://opentalks.cyclic.app${el.postId.userId.image}"
          class="favourite-main-post-user-image"
          alt="post-owner-image"
        />
        <p>By ${el.postId.userId.name}</p>
      </div>
    </div>
  
    <div class="favourite-main-post-buttons">
      <i
        class="fa-solid fa-heart favourite-main-post-likes"
        data-postid="${el.postId._id}" data-forumid="${el.forumId._id}" 
      ></i>
    </div>
  </div>`;
        });
        favourite_posts_startPoint = data.nextStartPoint;
        let prevScrollHeight = container.scrollHeight;
        container.insertAdjacentHTML("beforeend", result);
        container.scrollTop = prevScrollHeight;
      }
    }
  });

// ** RESET MY POST PAGE
document
  .querySelector(".reset-posts-main-posts")
  .addEventListener("click", () => {
    document.querySelector(".liked-posts-main").classList.remove("hide");
    document.querySelector(".searched-posts-main").classList.add("hide");
    document.querySelector(".favourite-posts-main").classList.add("hide");
    document.querySelector(".search-post-main-posts").value = "";
  });

// ** FORUM SEARCH
document
  .querySelector(".main-forum-search-input")
  .addEventListener("keydown", async (event) => {
    let target = document.querySelector(".main-forum-search-input");
    forum_search = target.value.trim();
    if (event.key == "Enter" && forum_search != "") {
      is_forum_filter = false;
      loader(1);

      let response = await fetch(
        "https://opentalks.cyclic.app/api/forum/search",
        {
          method: "POST",
          body: JSON.stringify({ searchQuery: forum_search }),
          headers: {
            "Content-type": "application/json;charset=utf-8",
            Authorization: sessionStorage.getItem("token"),
          },
        }
      );
      let data = await response.json();
      loader(0);

      document.querySelector(".main-forums-joined-list").classList.add("hide");
      document
        .querySelector(".main-forums-searched-list")
        .classList.remove("hide");
      let result = "";
      let container = document.querySelector(".main-forums-searched-container");
      let result_no = document.querySelector(
        ".main-forums-searched-list h2 span"
      );
      if (!!data && data.success == true) {
        data.forums.forEach((el) => {
          let regex = new RegExp(forum_search, "gi");
          let highlightedName = el.name.replace(
            regex,
            `<span class="highlight">$&</span>`
          );
          let highlightedDescription = el.description.replace(
            regex,
            `<span class="highlight">$&</span>`
          );
          result += `<div class="searched-forum-template">
          <div class="searched-forum-name">${highlightedName}</div>
          <div class="searched-forum-description">
            ${highlightedDescription}
          </div>
          <div class="searched-forum-bottom">
            <p>${formatDate(el.createdAt)}</p>
            <button
              class="searched-forum-join"
              value="${el._id}"
            >
              Request to join
            </button>
          </div>
          <p class="searched-forum-admin-name">
            <span>
              <img
                src="https://opentalks.cyclic.app${el.userId.image}"
                alt="admin-profile-pic"
              />Created By ${el.userId.name}</span
            >
          </p>
        </div>`;
        });
        container.innerHTML = result;
        container.scrollTop = 0;
        forum_search_startPoint = data.nextStartPoint;
        result_no.textContent = data.results;
      } else {
        container.innerHTML = "No such forum name or description found.";
        result_no.textContent = "0";
      }
    }
  });

document
  .querySelector(".main-forums-searched-container")
  .addEventListener("scroll", async function (event) {
    let { scrollHeight, scrollTop, clientHeight } = event.target;
    if (
      Math.abs(scrollHeight - clientHeight - scrollTop) < 1 &&
      is_forum_filter == false
    ) {
      loader(1);

      let response = await fetch(
        "https://opentalks.cyclic.app/api/forum/search",
        {
          method: "POST",
          body: JSON.stringify({
            searchQuery: forum_search,
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
      let container = document.querySelector(".main-forums-searched-container");
      if (!!data && data.success == true) {
        data.forums.forEach((el) => {
          let regex = new RegExp(forum_search, "gi");
          let highlightedName = el.name.replace(
            regex,
            `<span class="highlight">$&</span>`
          );
          let highlightedDescription = el.description.replace(
            regex,
            `<span class="highlight">$&</span>`
          );
          result += ` <div class="searched-forum-template">
          <div class="searched-forum-name">${highlightedName}</div>
          <div class="searched-forum-description">
            ${highlightedDescription}
          </div>
          <div class="searched-forum-bottom">
            <p>${formatDate(el.createdAt)}</p>
            <button
              class="searched-forum-join"
              value="${el._id}"
            >
              Request to join
            </button>
          </div>
          <p class="searched-forum-admin-name">
            <span>
              <img
                src="https://opentalks.cyclic.app${el.userId.image}"
                alt="admin-profile-pic"
              />Created By ${el.userId.name}</span
            >
          </p>
        </div>`;
        });
        let prevScrollHeight = container.scrollHeight;
        container.insertAdjacentHTML("beforeend", result);
        container.scrollTop = prevScrollHeight;
        forum_search_startPoint = data.nextStartPoint;
      }
    }
  });

document
  .querySelector(".main-forums-searched-container")
  .addEventListener("click", async (event) => {
    let target = event.target;
    if (target.classList.contains("searched-forum-join")) {
      // console.log(target);
      await sentForumJoinRequest(target.value);
    }
  });

// **FORUM DETAILS

document.querySelector(".detail-forum-main").addEventListener("click", () => {
  document.querySelector(".details-of-forum").classList.remove("hide");
  document.querySelector(".blur").classList.remove("hide");
});

document
  .querySelector(".close-details-of-forum")
  .addEventListener("click", () => {
    document.querySelector(".details-of-forum").classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

// **FORUM MEMBERS
document
  .querySelector(".members-forum-main")
  .addEventListener("click", async () => {
    document.querySelector(".forum-members-container").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    document.querySelector(".forum-member-table-top h4").textContent =
      "Recent Users List";
    document.querySelector(".forum-member-search-bar").value = "";
    document.querySelector(".forum-member-table-top h4").textContent =
      "Recent Users List";
    is_search_member = false;
    await fetchForumMembers();
  });

document
  .querySelector(".forum-members-container")
  .addEventListener("click", async (event) => {
    let target = event.target;
    if (target.classList.contains("forum-member-remove-user")) {
      await removeForumMember(target);
    }
  });

document
  .querySelector(".close-forum-member")
  .addEventListener("click", async () => {
    document.querySelector(".forum-members-container").classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
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

// ** FORUM COMPLAINTS
document
  .querySelector(".complaints-forum-main")
  .addEventListener("click", async () => {
    document
      .querySelector(".forum-complaints-container")
      .classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    document.querySelector(".complaint-search-bar").value = "";
    // document.querySelector(".forum-complaints-sub-heading").textContent =
    //   "Recent complaints";
    await fetchAllComplaints();
  });

document
  .querySelector(".close-forum-complaints-container")
  .addEventListener("click", () => {
    document.querySelector(".forum-complaints-container").classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

document
  .querySelector(".forum-complaints-main")
  .addEventListener("scroll", async (event) => {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      await fetchAllComplaintsScroll();
    }
  });

document
  .querySelector(".complaint-search-bar")
  .addEventListener("keydown", async (e) => {
    let target = document.querySelector(".complaint-search-bar");
    if (e.key == "Enter" && target.value.trim() != "") {
      complaint_search = target.value.trim();
      await fetchSearchedComplaint();
    }
  });

document
  .querySelector(".forum-complaints-main")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("forum-complaint-reply-btn")) {
      let container = target.closest(".forum-complaints-template");
      let inputField = container.querySelector(
        ".forum-complaint-response-input"
      );
      inputField.classList.toggle("hide");
    } else if (target.classList.contains("forum-complaint-responses-btn")) {
      document
        .querySelector(".forum-response-container")
        .classList.remove("hide");
      document
        .querySelector(".forum-complaints-container")
        .classList.add("hide");
      let container = target.closest(".forum-complaints-template");
      await fetchComplaintResponses(JSON.parse(target.value), container);
    }
  });

document
  .querySelector(".forum-complaints-main")
  .addEventListener("keydown", async (event) => {
    let target = event.target;
    if (event.key == "Enter") {
      let inputField = target.closest(".forum-complaint-response-input");
      let isLengthValid = isInputLengthValid(inputField.value.trim(), 30).valid;
      if (inputField && inputField.value.trim() != "" && isLengthValid) {
        let complaintId = inputField.dataset.complaintid;
        let userId = inputField.dataset.userid;
        let container = target.closest(".forum-complaints-template");
        await sendResponseToComplaint(
          complaintId,
          userId,
          inputField.value.trim(),
          container
        );
      } else {
        showNotification(`Response exceeds the maximum allowed length`, 3000);
      }
    }
  });

document
  .querySelector(".close-forum-responses-container")
  .addEventListener("click", () => {
    document.querySelector(".forum-response-container").classList.add("hide");
    document
      .querySelector(".forum-complaints-container")
      .classList.remove("hide");
  });

// ** FORUM REQUESTS LIST
document
  .querySelector(".requests-forum-main")
  .addEventListener("click", async () => {
    document.querySelector(".forum-member-join-list").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    await fetchMemberJoinRequests();
  });

document
  .querySelector(".close-forum-member-join-list")
  .addEventListener("click", () => {
    document.querySelector(".forum-member-join-list").classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

document
  .querySelector(".forum-member-join-list-main")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("forum-member-join-reject-btn")) {
      await respondJoinRequest(target, "rejected");
    } else if (target.classList.contains("forum-member-join-accept-btn")) {
      await respondJoinRequest(target, "accepted");
    }
  });

// ** POST REPLIES

document
  .querySelector(".close-post-reply-container")
  .addEventListener("click", () => {
    if (is_forum_post_search_open == false) {
      document.querySelector(".post-reply-container").classList.add("hide");
      document.querySelector(".blur").classList.add("hide");
    } else {
      document.querySelector(".post-reply-container").classList.add("hide");
      document
        .querySelector(".user-created-forum-post-search-container")
        .classList.remove("hide");
    }
  });

document
  .querySelector(".post-add-reply-input")
  .addEventListener("keydown", async (e) => {
    let target = document.querySelector(".post-add-reply-input");
    isInputLengthValid(target.value.trim(), 20).valid
      ? target.classList.remove("overwritten")
      : target.classList.add("overwritten");
    if (
      e.key == "Enter" &&
      target.value.trim() != "" &&
      isInputLengthValid(target.value.trim(), 20).valid
    ) {
      currentForumID == createdForumID
        ? await addPostReply(target.value.trim(), target)
        : await addPostReply(target.value.trim(), target, true);
    }
  });

document
  .querySelector(".post-reply-list")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("post-reply-delete")) {
      await deleteReply(target);
    }
  });

// ** SEARCH POST
document
  .querySelector(".search-post-forum-main")
  .addEventListener("click", () => {
    document
      .querySelector(".user-created-forum-post-search-container")
      .classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    document.querySelector(
      ".user-created-forum-post-search-input-field"
    ).value = "";
    document.querySelector(".forum-post-search-list").scrollTop = 0;
    document.querySelector(".forum-post-search-list").textContent = "";
    document.querySelector(".forum-post-search-results span").textContent =
      "Nothing searched";
    is_forum_post_search_open = true;
  });

document
  .querySelector(".close-forum-post-search-container")
  .addEventListener("click", () => {
    document.querySelector(".forum-post-search-list").scrollTop = 0;
    document
      .querySelector(".user-created-forum-post-search-container")
      .classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
    is_forum_post_search_open = false;
  });

document
  .querySelector(".user-created-forum-post-search-input-field")
  .addEventListener("keydown", async (e) => {
    let data = {};
    let target = document.querySelector(
      ".user-created-forum-post-search-input-field"
    ).value;
    let inputField = document.querySelector(
      ".user-created-forum-post-search-input-field"
    );
    if (
      e.key == "Enter" &&
      target.trim() != "" &&
      isInputLengthValid(target.trim(), 30).valid
    ) {
      data.search =
        inputField.type == "number" ? Number(target.trim()) : target.trim();
      data.byNumber = inputField.type == "number" ? true : false;
      data.forumId =
        currentForumID == createdForumID ? createdForumID : joinedForumID;
      data.UserId = sessionStorage.getItem("user");
      forum_post_search = { ...data };
      await searchForumPost(data);
    } else if (
      e.key == "Enter" &&
      target.trim() != "" &&
      !isInputLengthValid(target.trim(), 30).valid
    ) {
      showNotification("Max lenght of input allowed is 30", 3000);
    }
  });

document
  .querySelector(".forum-post-search-list")
  .addEventListener("scroll", async function (event) {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      await searchForumPostScroll(forum_post_search);
    }
  });

document
  .querySelector(".forum-post-search-list")
  .addEventListener("click", async function (event) {
    let target = event.target;
    if (target.classList.contains("forum-post-like")) {
      let isLiked = target.classList.contains("fa-regular") ? false : true;
      if (isLiked) {
        await unlikeUserPost(target);
      } else {
        await likeUserPost(target);
      }
    }
    if (target.classList.contains("forum-post-user-comment")) {
      if (is_forum_post_search_open == true) {
        document
          .querySelector(".user-created-forum-post-search-container")
          .classList.add("hide");
      }
      document.querySelector(".post-add-reply-input").classList.remove("hide");
      await fetchUserComments(target);
    }
    if (target.classList.contains("forum-post-delete")) {
      if (is_forum_post_search_open == true) {
        document
          .querySelector(".user-created-forum-post-search-container")
          .classList.add("hide");
      }
      targetedContainer = target.closest(".forum-post-template-search");
      await deleteUserPost(target);
    }
  });

document
  .querySelector(".interchage-post-search-input")
  .addEventListener("click", () => {
    let input = document.querySelector(
      ".user-created-forum-post-search-input-field"
    );
    if (input.type == "text") {
      input.type = "number";
      input.placeholder = "Search by user's registration number...";
      input.value = "";
    } else {
      input.type = "text";
      input.placeholder = "Search by post's title or description...";
      input.value = "";
    }
  });

// ** EDIT FORUM
document.querySelector(".main-edit-forum").addEventListener("click", () => {
  document.querySelector(".edit-forum").classList.remove("hide");
  document.querySelector(".blur").classList.remove("hide");
  document.querySelector(".edit-forum-name").value = currentForumDetails.name;
  document.querySelector(".edit-forum-description").value =
    currentForumDetails.description;
});

document.querySelector(".close-edit-forum").addEventListener("click", () => {
  document.querySelector(".edit-forum").classList.add("hide");
  document.querySelector(".blur").classList.add("hide");
});

document
  .querySelector(".edit-forum-submit")
  .addEventListener("click", async () => {
    let forumName = document.querySelector(".edit-forum-name").value.trim();
    let forumDescription = document
      .querySelector(".edit-forum-description")
      .value.trim();
    let data = {},
      count = 0;
    if (forumName != currentForumDetails.name) {
      if (isInputLengthValid(forumName, 5).valid) {
        data.name = forumName;
        count++;
      } else {
        showNotification("Max words count for forum name is 5", 2500);
      }
    }
    if (forumDescription != currentForumDetails.description) {
      if (isInputLengthValid(forumDescription, 15).valid) {
        data.description = forumDescription;
        count++;
      } else {
        showNotification("Max words count for forum description is 15", 2500);
      }
    }
    if (count != 0) {
      await updateForumDetails(data);
    }
  });

// ** REFERSH FORUM
document
  .querySelector(".main-refresh-forum")
  .addEventListener("click", async () => {
    await Promise.all([
      fetchForumPosts_initially(createdForumID),
      fetchForumData_initially(createdForumID),
    ]);
  });

// ** DELETE FORUM
document
  .querySelector(".delete-forum-main")
  .addEventListener("click", async () => {
    await deleteCreatedForum();
  });

// ** FORUM REVIEWS
document
  .querySelector(".reviews-forum-main")
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

// ** FORUM LAYOUT SECTION (MAIN)
document.querySelector(".show-forums").addEventListener("click", async () => {
  document.querySelector(".main-forums-joined-list").classList.remove("hide");
  document.querySelector(".main-forums-searched-list").classList.add("hide");
  document.querySelector(".main-forums-forum-layout").classList.add("hide");
  document.querySelector(".joined-forums-forum-layout").classList.add("hide");
  document.querySelector(".main-forums-bottom").classList.remove("hide");
  document.querySelector(".main-forum-parent-top").classList.remove("hide");
  document.querySelector(".main-forum-search-input").value = "";
  if (forums == 0) {
    await Promise.all([fetchCreatedForums(), fetchJoinedForums()]);
  }
});

document
  .querySelector(".reset-main-forums-section")
  .addEventListener("click", () => {
    document.querySelector(".main-forums-joined-list").classList.remove("hide");
    document.querySelector(".main-forums-searched-list").classList.add("hide");
    document.querySelector(".main-forum-search-input").value = "";
  });

// ** FORUM LAYOUT SECTION (CREATED)
document.querySelector(".main-close-forum").addEventListener("click", () => {
  document.querySelector(".main-forums-forum-layout").classList.add("hide");
  document.querySelector(".main-forums-bottom").classList.remove("hide");
  document.querySelector(".main-forum-parent-top").classList.remove("hide");
});

document
  .querySelector(".main-forums-created-container")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("created-forum-vist")) {
      createdForumID = target.value;
      currentForumID = target.value;
      document
        .querySelector(".main-forums-forum-layout")
        .classList.remove("hide");
      document.querySelector(".main-forums-bottom").classList.add("hide");
      document.querySelector(".main-forum-parent-top").classList.add("hide");
      await Promise.all([
        fetchForumData_initially(createdForumID),
        fetchForumPosts_initially(createdForumID),
      ]);
    }
  });

document
  .querySelector(".forum-main-layout-container")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("forum-post-like")) {
      let isLiked = target.classList.contains("fa-regular") ? false : true;
      if (isLiked) {
        await unlikeUserPost(target);
      } else {
        await likeUserPost(target);
      }
    } else if (target.classList.contains("forum-post-user-comment")) {
      document.querySelector(".post-add-reply-input").classList.remove("hide");
      await fetchUserComments(target);
    } else if (target.classList.contains("forum-post-delete")) {
      targetedContainer = target.closest(".forum-post-template-main");
      await deleteUserPost(target);
    }
  });

document
  .querySelector(".forum-main-layout-container")
  .addEventListener("scroll", async function () {
    let container = this;
    let isAtTop = container.scrollTop === 0;

    if (isAtTop) {
      loader(1);

      let response = await fetch("https://opentalks.cyclic.app/api/post/all", {
        method: "POST",
        body: JSON.stringify({
          forumId: createdForumID,
          userId: sessionStorage.getItem("user"),
          startPoint: forum_posts_startPoint,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      });
      let data = await response.json();
      loader(0);

      let result = "";
      let container = document.querySelector(".forum-main-layout-container");
      if (!!data && data.success == true) {
        let posts = data.post.reverse();
        posts.forEach((el) => {
          let likeIconClass = el.isLiked ? "fa-solid" : "fa-regular";
          if (el.userId._id == sessionStorage.getItem("user")) {
            result += `
          <div class="forum-post-template-main">
          <h3 class="forum-post-title">${el.title}</h3>
          <p class="forum-post-description">${el.description}</p>
          <div class="forum-post-user-info-container">
            <div class="forum-post-date-time">
              <span class="forum-post-date">${formatDate(el.createdAt)}</span>
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
            <i
              class="${likeIconClass} fa-heart forum-post-like"
              data-postid="${el._id}"
            ></i>
            <i
              class="fa-solid fa-comment forum-post-user-comment"
              data-postid="${el._id}"
            ></i>
            <i
              class="fa-solid fa-trash-can forum-post-delete"
              data-postid="${el._id}"
            ></i>
          </div>
        </div>
          `;
          } else {
            result += `
          <div class="forum-post-template">
          <h3 class="forum-post-title">${el.title}</h3>
          <p class="forum-post-description">${el.description}</p>
          <div class="forum-post-user-info-container">
            <div class="forum-post-date-time">
              <span class="forum-post-date">${formatDate(el.createdAt)}</span>
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
            <i
              class="${likeIconClass} fa-heart forum-post-like"
              data-postid="${el._id}"
            ></i>
            <i
              class="fa-solid fa-comment forum-post-user-comment"
              data-postid="${el._id}"
            ></i>
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
        forum_posts_startPoint = data.nextStartPoint;
      }
    }
  });

// ** FORUM LAYOUT SECTION (JOINED)

document
  .querySelector(".main-forums-joined-container")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("joined-forum-vist")) {
      joinedForumID = target.value;
      currentForumID = target.value;
      document
        .querySelector(".joined-forums-forum-layout")
        .classList.remove("hide");
      document.querySelector(".main-forums-bottom").classList.add("hide");
      document.querySelector(".main-forum-parent-top").classList.add("hide");
      await Promise.all([
        fetchForumData_initially(joinedForumID, true),
        fetchForumPosts_initially(joinedForumID, true),
      ]);
    }
  });

document
  .querySelector(".forum-joined-layout-container")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("forum-post-like")) {
      let isLiked = target.classList.contains("fa-regular") ? false : true;
      if (isLiked) {
        await unlikeUserPost(target);
      } else {
        await likeUserPost(target);
      }
    } else if (target.classList.contains("forum-post-user-comment")) {
      document.querySelector(".post-add-reply-input").classList.remove("hide");
      await fetchUserComments(target);
    } else if (target.classList.contains("forum-post-delete")) {
      targetedContainer = target.closest(".forum-post-template-main");
      await deleteUserPost(target);
    }
  });

document
  .querySelector(".forum-joined-layout-container")
  .addEventListener("scroll", async function () {
    let container = this;
    let isAtTop = container.scrollTop === 0;

    if (isAtTop) {
      loader(1);

      let response = await fetch("https://opentalks.cyclic.app/api/post/all", {
        method: "POST",
        body: JSON.stringify({
          forumId: joinedForumID,
          userId: sessionStorage.getItem("user"),
          startPoint: forum_posts_startPoint,
        }),
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization: sessionStorage.getItem("token"),
        },
      });
      let data = await response.json();
      loader(0);

      let result = "";
      let container = document.querySelector(".forum-joined-layout-container");
      if (!!data && data.success == true) {
        let posts = data.post.reverse();
        posts.forEach((el) => {
          let likeIconClass = el.isLiked ? "fa-solid" : "fa-regular";
          if (el.userId._id == sessionStorage.getItem("user")) {
            result += `
          <div class="forum-post-template-main">
          <h3 class="forum-post-title">${el.title}</h3>
          <p class="forum-post-description">${el.description}</p>
          <div class="forum-post-user-info-container">
            <div class="forum-post-date-time">
              <span class="forum-post-date">${formatDate(el.createdAt)}</span>
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
            <i
              class="${likeIconClass} fa-heart forum-post-like"
              data-postid="${el._id}"
            ></i>
            <i
              class="fa-solid fa-comment forum-post-user-comment"
              data-postid="${el._id}"
            ></i>
            <i
              class="fa-solid fa-trash-can forum-post-delete"
              data-postid="${el._id}"
            ></i>
          </div>
        </div>
          `;
          } else {
            result += `
          <div class="forum-post-template">
          <h3 class="forum-post-title">${el.title}</h3>
          <p class="forum-post-description">${el.description}</p>
          <div class="forum-post-user-info-container">
            <div class="forum-post-date-time">
              <span class="forum-post-date">${formatDate(el.createdAt)}</span>
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
            <i
              class="${likeIconClass} fa-heart forum-post-like"
              data-postid="${el._id}"
            ></i>
            <i
              class="fa-solid fa-comment forum-post-user-comment"
              data-postid="${el._id}"
            ></i>
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
        forum_posts_startPoint = data.nextStartPoint;
      }
    }
  });

document.querySelector(".joined-close-forum").addEventListener("click", () => {
  document.querySelector(".joined-forums-forum-layout").classList.add("hide");
  document.querySelector(".main-forums-bottom").classList.remove("hide");
  document.querySelector(".main-forum-parent-top").classList.remove("hide");
});

// ** REFRESH JOINED FORUM
document
  .querySelector(".refresh-forum-joined")
  .addEventListener("click", async () => {
    await Promise.all([
      fetchForumData_initially(joinedForumID, true),
      fetchForumPosts_initially(joinedForumID, true),
    ]);
  });

// ** JOINED FORUM DETAILS
document
  .querySelector(".detail-forum-joined")
  .addEventListener("click", async () => {
    document.querySelector(".details-of-joined-forum").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
  });

document
  .querySelector(".close-details-of-joined-forum")
  .addEventListener("click", async () => {
    document.querySelector(".details-of-joined-forum").classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

// ** SEARCH POST IN JOINED FORUM
document
  .querySelector(".search-post-forum-joined")
  .addEventListener("click", () => {
    document
      .querySelector(".user-created-forum-post-search-container")
      .classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    document.querySelector(
      ".user-created-forum-post-search-input-field"
    ).value = "";
    document.querySelector(".forum-post-search-list").scrollTop = 0;
    document.querySelector(".forum-post-search-list").textContent = "";
    document.querySelector(".forum-post-search-results span").textContent =
      "Nothing searched";
    is_forum_post_search_open = true;
  });

// ** COMPLAINTS OF JOINED FORUMS
document
  .querySelector(".complaints-forum-joined")
  .addEventListener("click", async () => {
    document
      .querySelector(".joined-forum-complaints-container")
      .classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    document.querySelector(".joined-forum-complaint-search-bar").value = "";
    document.querySelector(".forum-create-complaint-input").value = "";
    await fetchJoinedForumComplaints();
  });

document
  .querySelector(".joined-forum-complaints-main")
  .addEventListener("scroll", async (event) => {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      await fetchJoinedForumComplaintsScroll();
    }
  });

document
  .querySelector(".close-joined-forum-complaints-container")
  .addEventListener("click", () => {
    document
      .querySelector(".joined-forum-complaints-container")
      .classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

document
  .querySelector(".joined-forum-complaints-main")
  .addEventListener("click", async (event) => {
    let target = event.target;
    if (target.classList.contains("forum-complaint-responses-btn")) {
      document
        .querySelector(".joined-forum-response-container")
        .classList.remove("hide");
      document
        .querySelector(".joined-forum-complaints-container")
        .classList.add("hide");
      let container = target.closest(".forum-complaints-template");
      await fetchJoinedForumComplaintResponses(
        JSON.parse(target.value),
        container
      );
    }
  });

document
  .querySelector(".forum-create-complaint-input")
  .addEventListener("keydown", async (e) => {
    let target = document.querySelector(".forum-create-complaint-input").value;
    if (
      e.key == "Enter" &&
      target.trim() != "" &&
      isInputLengthValid(target.trim(), 30).valid
    ) {
      await createComplaint(target.trim());
    } else if (
      e.key == "Enter" &&
      target.trim() != "" &&
      !isInputLengthValid(target.trim(), 30).valid
    ) {
      showNotification("Max words for complaint are 30", 2500);
    }
  });

document
  .querySelector(".close-joined-forum-responses-container")
  .addEventListener("click", () => {
    document
      .querySelector(".joined-forum-response-container")
      .classList.add("hide");
    document
      .querySelector(".joined-forum-complaints-container")
      .classList.remove("hide");
  });

document
  .querySelector(".joined-forum-complaint-search-bar")
  .addEventListener("keydown", async (e) => {
    let target = document.querySelector(".joined-forum-complaint-search-bar");
    if (e.key == "Enter" && target.value.trim() != "") {
      document.querySelector(".joined-forum-complaints-main").scrollTop = 0;
      complaint_search = target.value.trim();
      await fetchSearchedComplaintinJoinedForum();
    }
  });

// ** RATE FORUM
document
  .querySelector(".rate-forum-joined")
  .addEventListener("click", async () => {
    document.querySelector(".forum-rating").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    document
      .querySelector(".like-forum-rating")
      .classList.remove("selected-forum-rating");
    document
      .querySelector(".dislike-forum-rating")
      .classList.remove("selected-forum-rating");
    await fetchForumRating();
  });

document
  .querySelector(".close-forum-rating")
  .addEventListener("click", async () => {
    document.querySelector(".forum-rating").classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

document.querySelector(".forum-rating-main").addEventListener("click", (e) => {
  let target = e.target;
  const likeButton = document.querySelector(".like-forum-rating");
  const dislikeButton = document.querySelector(".dislike-forum-rating");
  rating;
  if (
    target.classList.contains("like-forum-rating") ||
    target.classList.contains("dislike-forum-rating")
  ) {
    if (target.classList.contains("like-forum-rating")) {
      target.classList.add("selected-forum-rating");
      dislikeButton.classList.remove("selected-forum-rating");
      rating = target.dataset.rating;
    } else if (target.classList.contains("dislike-forum-rating")) {
      target.classList.add("selected-forum-rating");
      likeButton.classList.remove("selected-forum-rating");
      rating = target.dataset.rating;
    }
  }
});

document
  .querySelector(".submit-forum-rating")
  .addEventListener("click", async () => {
    if (prevRating != rating && !!rating) {
      await submitForumRating();
    } else {
      showNotification("Feedback submitted successfully");
    }
  });

// ** LEFT JOINED FORUM
document
  .querySelector(".left-forum-joined")
  .addEventListener("click", async () => {
    await leftJoinedForum();
  });

// ** MY POST SECTION
// RECENT POSTS
document
  .querySelector(".recent-main-posts-container")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("recent-main-post-likes")) {
      await fetchPostLikesUsers(target);
    } else if (target.classList.contains("recent-main-post-replies")) {
      document.querySelector(".post-add-reply-input").classList.add("hide");
      await fetchUserComments(target);
    } else if (target.classList.contains("recent-main-post-delete")) {
      targetedContainer = target.closest(".recent-main-post-template");
      await deleteUserPost(target);
    }
  });

// LIKED POSTS
document
  .querySelector(".liked-main-posts-container")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("liked-main-post-likes")) {
      await fetchPostLikesUsers(target);
    } else if (target.classList.contains("liked-main-post-replies")) {
      document.querySelector(".post-add-reply-input").classList.add("hide");
      await fetchUserComments(target);
    } else if (target.classList.contains("liked-main-post-delete")) {
      targetedContainer = target.closest(".liked-main-post-template");
      await deleteUserPost(target);
    }
  });

// FAVOURITE POSTS
document
  .querySelector(".favourite-main-posts-container")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("favourite-main-post-likes")) {
      await unlikeUserFavouritePost(target);
    }
  });

// SEARCHED POSTS
document
  .querySelector(".searched-main-posts-container")
  .addEventListener("click", async (e) => {
    let target = e.target;
    if (target.classList.contains("searched-main-post-delete")) {
      targetedContainer = target.closest(".recent-main-post-template");
      await deleteUserPost(target);
    } else if (target.classList.contains("searched-main-post-replies")) {
      document.querySelector(".post-add-reply-input").classList.add("hide");
      await fetchUserComments(target);
    } else if (target.classList.contains("searched-main-post-likes")) {
      await fetchPostLikesUsers(target);
    }
  });

// ** POST LIKES

document
  .querySelector(".close-post-like-container")
  .addEventListener("click", () => {
    document.querySelector(".post-likes-container").classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
  });

document
  .querySelector(".post-like-list")
  .addEventListener("scroll", async (event) => {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      await fetchPostLikesUsersScroll(targetedContainer);
    }
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
    let data = { title, description };

    await createPost(data);
    document.querySelector(".post-editor-title").value = "";
    document.querySelector(".post-editor-description").value = "";
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
        src="https://opentalks.cyclic.app${user_details.user.image}"
        class="forum-post-main-user-profile"
      />
      <span class="forum-post-user-name">By ${user_details.user.name}</span>
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

// ** ADD POST CREATED FORUM
document.querySelector(".main-add-post").addEventListener("click", () => {
  document.querySelector(".post-editor-container").classList.remove("hide");
  document.querySelector(".blur").classList.remove("hide");
});

document
  .querySelector(".add-post-forum-joined")
  .addEventListener("click", () => {
    document.querySelector(".post-editor-container").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
  });

// ** FORUM FILTER
document
  .querySelector(".filter-search-main-forums")
  .addEventListener("click", () => {
    document.querySelector(".forum-filter-container").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    let result = "";
    let container = document.querySelector(".forum-filter-department");
    departmentList.forEach((el) => {
      result += `<option value="${el._id}">${el.name}</option>`;
    });
    container.innerHTML = result;
    container.insertAdjacentHTML(
      "afterbegin",
      '<option value="" selected>Select the department</option>'
    );
    is_forum_filter = true;
  });

document
  .querySelector(".forum-filter-clear-button")
  .addEventListener("click", () => {
    document.querySelector(".forum-filter-department").value = "";
    document.querySelector(".forum-filter-username").value = "";
    document.querySelector(".forum-filter-date-createdAt").value = "";
  });

document.querySelector(".close-forum-filter").addEventListener("click", () => {
  is_forum_filter = false;
  document.querySelector(".forum-filter-container").classList.add("hide");
  document.querySelector(".blur").classList.add("hide");
});

document
  .querySelector(".forum-filter-apply-button")
  .addEventListener("click", async () => {
    let name = document.querySelector(".forum-filter-username").value.trim();
    let department = document.querySelector(".forum-filter-department").value;
    let createdAt = document.querySelector(
      ".forum-filter-date-createdAt"
    ).value;
    let count = 0,
      data = {};
    if (name != "") {
      data.name = name;
      count++;
    }
    if (department != "") {
      data.departmentId = department;
      count++;
    }
    if (createdAt != "") {
      let [year, month, day] = createdAt.split("-");
      const isoDate = new Date(
        `${year}-${month}-${day}T00:00:00.000Z`
      ).toISOString();
      data.createdAt = isoDate;
      count++;
    }
    if (count == 0) {
      return showNotification("No filter is selected!", 2500);
    }
    document.querySelector(".main-forums-joined-list").classList.add("hide");
    document
      .querySelector(".main-forums-searched-list")
      .classList.remove("hide");
    forum_search = { ...data };
    is_forum_filter = true;
    await searchForumFilter(data);
  });

document
  .querySelector(".main-forums-searched-container")
  .addEventListener("scroll", async (event) => {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (
      Math.abs(scrollHeight - clientHeight - scrollTop) < 1 &&
      is_forum_filter == true
    ) {
      await searchForumFilterScroll(forum_search);
    }
  });

// ** CREATE NEW FORUM
document.querySelector(".create-main-forums").addEventListener("click", () => {
  document.querySelector(".add-forum-container").classList.remove("hide");
  document.querySelector(".blur").classList.remove("hide");
  let result = "";
  let container = document.querySelector(".add-forum-department");
  departmentList.forEach((el) => {
    result += `<option value="${el._id}">${el.name}</option>`;
  });
  container.innerHTML = result;
  container.insertAdjacentHTML(
    "afterbegin",
    '<option value="" selected>Select the department</option>'
  );

  document.querySelector(".add-forum-name").value = "";
  document.querySelector(".add-forum-description").value = "";
});

document.querySelector(".add-forum-btn").addEventListener("click", async () => {
  let name = document.querySelector(".add-forum-name").value.trim();
  let description = document
    .querySelector(".add-forum-description")
    .value.trim();
  let departmentId = document.querySelector(".add-forum-department").value;

  let nameLength = isInputLengthValid(name, 5).valid;
  let descriptionLength = isInputLengthValid(description, 20).valid;

  if (!nameLength) {
    return showNotification("Max allowed Forum name length is 5 words", 2500);
  }
  if (!descriptionLength) {
    return showNotification("Max allowed Description length is 20 words", 2500);
  }

  let data = {};
  let invalidInputs = [];
  if (name == "") {
    invalidInputs.push("Forum name");
  }
  if (description == "") {
    invalidInputs.push("Description");
  }
  if (departmentId == "") {
    invalidInputs.push("Department ID");
  }

  if (invalidInputs.length != 0) {
    return showNotification(`${invalidInputs.join(", ")} is required`);
  }

  data.name = name;
  data.description = description;
  data.departmentId = departmentId;
  data.userId = sessionStorage.getItem("user");

  await createForum(data);
});

document.querySelector(".close-add-forum").addEventListener("click", () => {
  document.querySelector(".add-forum-container").classList.add("hide");
  document.querySelector(".blur").classList.add("hide");
});

// ** RECENT REPLIES
document
  .querySelector(".recent-replies-list")
  .addEventListener("scroll", async (event) => {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      await fetchRecentRepliesScroll();
    }
  });

// ** DASHBOARD RECENT UPDATES NAVIGATION
document.querySelector(".paddle-btns").addEventListener("click", (e) => {
  let target = e.target;
  let containers = ["recent-posts-all", "top-forums-all", "recent-replies"];
  if (target.classList.contains("move-right")) {
    document.querySelector(`.${containers[i]}`).classList.add("hide");
    document.querySelector(`.${containers[2 - i]}`).classList.remove("hide");
    i++;
    if (i == 1) {
      i = 2;
      document.querySelector(".move-left").classList.remove("hide");
      document.querySelector(".move-right").classList.add("hide");
    }
  } else if (target.classList.contains("move-left")) {
    document.querySelector(`.${containers[i]}`).classList.add("hide");
    document.querySelector(`.${containers[2 - i]}`).classList.remove("hide");
    i--;
    if (i == 1) {
      i = 0;
      document.querySelector(".move-left").classList.add("hide");
      document.querySelector(".move-right").classList.remove("hide");
    }
  }
});

// ** NOTIFICATIONS
document
  .querySelector(".show-notification")
  .addEventListener("click", async () => {
    document.querySelector(".notification-container").classList.remove("hide");
    document.querySelector(".blur").classList.remove("hide");
    await fetchNotifications();
  });

document
  .querySelector(".notification-list")
  .addEventListener("scroll", async (event) => {
    let { scrollHeight, scrollTop, clientHeight } = event.target;

    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      await fetchNotificationsScroll();
    }
  });

document.querySelector(".close-notification").addEventListener("click", () => {
  document.querySelector(".notification-container").classList.add("hide");
  document.querySelector(".blur").classList.add("hide");
});

document
  .querySelector(".clear-notification")
  .addEventListener("click", async () => {
    await clearNotifications();
    document.querySelector(".notification-list").style.overflowY = "auto";
    document.querySelector(".clear-notification").classList.add("hide");
  });

// ** CHANGE PASSOWRD
document.querySelector(".change-password").addEventListener("click", () => {
  document.querySelector(".edit-user-container3").classList.remove("hide");
  document.querySelector(".blur").classList.remove("hide");
});

document.querySelector(".close-edit-user3").addEventListener("click", () => {
  document.querySelector(".edit-user-container3").classList.add("hide");
  document.querySelector(".blur").classList.add("hide");
});

document
  .querySelector(".edit-user-save-password-btn")
  .addEventListener("click", async () => {
    let prevPassword = document
      .querySelector(".edit-user-previous-password")
      .value.trim();
    let newPassword = document
      .querySelector(".edit-user-new-password")
      .value.trim();
    let confirmPassword = document
      .querySelector(".edit-user-confirm-password")
      .value.trim();
    let invalidInputs = [];
    if (prevPassword == "") {
      invalidInputs.push("Previous password");
    }
    if (newPassword == "") {
      invalidInputs.push("New password");
    }
    if (confirmPassword == "") {
      invalidInputs.push("Confirm password");
    }

    if (invalidInputs.length != 0) {
      return showNotification(`${invalidInputs.join(", ")} is required`);
    }

    if (newPassword != confirmPassword) {
      return showNotification(
        "New Password does not match confirmation password"
      );
    }

    if (newPassword.length < 5 && confirmPassword.length < 5) {
      return showNotification("Password must be at least 5 characters.");
    }

    if (prevPassword == newPassword) {
      return showNotification(
        "New password should be different from previous password."
      );
    }

    await updateUserPassword(prevPassword, newPassword);
    document.querySelector(".edit-user-previous-password").value = "";
    document.querySelector(".edit-user-new-password").value = "";
    document.querySelector(".edit-user-confirm-password").value = "";
  });

// ** LOGOUT
document.querySelector(".user-logout-btn").addEventListener("click", () => {
  sessionStorage.removeItem("lastLogin");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("token");
});

// ** FORGET PASSWORD
document
  .querySelector(".forget-user-passowrd")
  .addEventListener("click", async () => {
    document.querySelector(".edit-user-container3").classList.add("hide");
    document.querySelector(".blur").classList.add("hide");
    let confirm = await showConfirmation("Do you want to reset your password?");
    if (confirm) {
      await forgetPassword();
    }
  });
