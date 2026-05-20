/* =========================
   Firebase
========================= */

import {

  db,

  auth,

  provider

}

from "./firebase.js";

import {

  collection,

  addDoc,

  getDocs

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {

  signInWithRedirect

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================
   登录系统
========================= */

const loginBtn =
document.getElementById("loginBtn");

const passwordBtn =
document.getElementById("passwordBtn");

const usernameInput =
document.getElementById("usernameInput");

const passwordInput =
document.getElementById("passwordInput");

const siteContent =
document.getElementById("siteContent");

/* 默认隐藏 */

siteContent.style.display = "none";

/* 密码登录 */

passwordBtn.addEventListener(
  "click",
  () => {

    const username =
    usernameInput.value;

    const password =
    passwordInput.value;

    if (

      username === "xiaofang"

      &&

      password === "5201314"

    ) {

      siteContent.style.display =
      "block";

      document.querySelector(
        ".login-box"
      ).style.display = "none";

    }

    else {

      alert("账号或密码错误");

    }

  }
);

/* Google 登录 */

loginBtn.addEventListener(
  "click",
  async () => {

    try {

      await signInWithRedirect(

        auth,

        provider

      );

    }

    catch (error) {

      console.error(error);

      alert("Google 登录失败");

    }

  }
);

/* =========================
   地图
========================= */

const map =
L.map("map").setView(

  [21.4858,39.1925],

  3

);

L.tileLayer(

  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

  {

    attribution:
    "© OpenStreetMap"

  }

).addTo(map);

/* 城市坐标 */

const cityMap = {

  "吉达":
  [21.4858,39.1925],

  "麦地那":
  [24.5247,39.5692],

  "广州":
  [23.1291,113.2644],

  "北京":
  [39.9042,116.4074],

  "上海":
  [31.2304,121.4737],

  "迪拜":
  [25.2048,55.2708],

  "拉各斯":
  [6.5244,3.3792],

  "麦加":
  [21.3891,39.8579]

};

/* =========================
   日记系统
========================= */

const saveDiaryBtn =
document.getElementById(
  "saveDiaryBtn"
);

const diaryTitle =
document.getElementById(
  "diaryTitle"
);

const diaryContent =
document.getElementById(
  "diaryContent"
);

const diaryLocation =
document.getElementById(
  "diaryLocation"
);

const diaryList =
document.getElementById(
  "diaryList"
);

/* 保存日记 */

saveDiaryBtn.addEventListener(
  "click",
  async () => {

    if (

      diaryTitle.value === ""

      ||

      diaryContent.value === ""

    ) {

      alert("请填写完整");

      return;

    }

    try {

      await addDoc(

        collection(
          db,
          "diaries"
        ),

        {

          title:
          diaryTitle.value,

          content:
          diaryContent.value,

          location:
          diaryLocation.value,

          time:
          new Date()
          .toLocaleString()

        }

      );

      alert("日记已保存");

      diaryTitle.value = "";

      diaryContent.value = "";

      diaryLocation.value = "";

      loadDiaries();

      loadMemory();

    }

    catch (error) {

      console.error(error);

      alert("保存失败");

    }

  }
);

/* 加载日记 */

async function loadDiaries() {

  diaryList.innerHTML = "";

  const querySnapshot =
  await getDocs(

    collection(
      db,
      "diaries"
    )

  );

  querySnapshot.forEach((doc) => {

    const data =
    doc.data();

    const div =
    document.createElement("div");

    div.className =
    "diary-item";

    div.innerHTML = `

      <h3>
        ${data.title}
      </h3>

      <p>
        ${data.content}
      </p>

      <small>
        📍 ${data.location}
      </small>

      <br>

      <small>
        ⏰ ${data.time}
      </small>

    `;

    diaryList.appendChild(div);

    /* 地图标记 */

    if (
      cityMap[data.location]
    ) {

      L.marker(
        cityMap[data.location]
      )

      .addTo(map)

      .bindPopup(`

        <h3>
          ${data.title}
        </h3>

        <p>
          ${data.content}
        </p>

      `);

    }

  });

}

loadDiaries();

/* =========================
   那年今天
========================= */

async function loadMemory() {

  const memoryContent =
  document.getElementById(
    "memoryContent"
  );

  memoryContent.innerHTML = "";

  const querySnapshot =
  await getDocs(

    collection(
      db,
      "diaries"
    )

  );

  const today =
  new Date();

  let found = false;

  querySnapshot.forEach((doc) => {

    const data =
    doc.data();

    const diaryDate =
    new Date(data.time);

    if (

      diaryDate.getMonth()
      === today.getMonth()

      &&

      diaryDate.getDate()
      === today.getDate()

    ) {

      found = true;

      memoryContent.innerHTML += `

        <div class="diary-item">

          <h3>
            ${data.title}
          </h3>

          <p>
            ${data.content}
          </p>

        </div>

      `;

    }

  });

  if (!found) {

    memoryContent.innerHTML =

    "今天还没有过去的回忆。";

  }

}

loadMemory();

/* =========================
   Cloudinary 照片系统
========================= */

const uploadBtn =
document.getElementById(
  "uploadBtn"
);

const photoInput =
document.getElementById(
  "photoInput"
);

const photoLocation =
document.getElementById(
  "photoLocation"
);

const photoList =
document.getElementById(
  "photoList"
);

/* 上传照片 */

uploadBtn.addEventListener(
  "click",
  async () => {

    const file =
    photoInput.files[0];

    if (!file) {

      alert("请选择照片");

      return;

    }

    const formData =
    new FormData();

    formData.append(
      "file",
      file
    );

    formData.append(
      "upload_preset",
      "xiaofang"
    );

    try {

      const response =
      await fetch(

        "https://api.cloudinary.com/v1_1/dzlxnbtoo/image/upload",

        {

          method: "POST",

          body: formData

        }

      );

      const data =
      await response.json();

      if (!data.secure_url) {

        console.error(data);

        alert("上传失败");

        return;

      }

      /* 保存数据库 */

      await addDoc(

        collection(
          db,
          "photos"
        ),

        {

          imageUrl:
          data.secure_url,

          location:
          photoLocation.value,

          time:
          new Date()
          .toLocaleString()

        }

      );

      alert("照片上传成功");

      loadPhotos();

    }

    catch (error) {

      console.error(error);

      alert("上传失败");

    }

  }
);

/* 加载照片 */

async function loadPhotos() {

  photoList.innerHTML = "";

  const querySnapshot =
  await getDocs(

    collection(
      db,
      "photos"
    )

  );

  querySnapshot.forEach((doc) => {

    const data =
    doc.data();

    const div =
    document.createElement("div");

    div.className =
    "photo-card";

    div.innerHTML = `

      <img
        src="${data.imageUrl}"
        class="memory-photo"
      >

      <div class="photo-info">

        <p>
          📍 ${data.location}
        </p>

        <small>
          ⏰ ${data.time}
        </small>

      </div>

    `;

    photoList.appendChild(div);

    /* 地图照片 */

    if (
      cityMap[data.location]
    ) {

      L.marker(
        cityMap[data.location]
      )

      .addTo(map)

      .bindPopup(`

        <img
          src="${data.imageUrl}"
          width="180"
          style="
            border-radius:12px;
          "
        >

        <p>
          📍 ${data.location}
        </p>

      `);

    }

  });

}

loadPhotos();

/* =========================
   页面滚动
========================= */

window.scrollToSection =
function(id) {

  const section =
  document.getElementById(id);

  if (section) {

    section.scrollIntoView({

      behavior:
      "smooth"

    });

  }

};

/* =========================
   PWA
========================= */

if (

  "serviceWorker"
  in navigator

) {

  navigator.serviceWorker
  .register(
    "./service-worker.js"
  );

}

console.log(
  "小方树洞启动成功"
);
