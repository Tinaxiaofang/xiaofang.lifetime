import {

  db,

  auth,

  provider,

  storage

}

from "./firebase.js";
/* =========================
   小方树洞 · 主系统
========================= */

/* Firebase */



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

siteContent.style.display = "none";

/* 账号密码 */

passwordBtn.addEventListener("click", () => {

  const username =
  usernameInput.value;

  const password =
  passwordInput.value;

  if (
    username === "xiaofang"
    &&
    password === "5201314"
  ) {

    siteContent.style.display = "block";

    document.querySelector(".login-box")
    .style.display = "none";

  }

  else {

    alert("账号或密码错误");

  }

});

/* Google 登录 */

loginBtn.addEventListener("click", async () => {

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

});

/* =========================
   地图系统
========================= */

const map =
L.map('map').setView(
  [21.4858, 39.1925],
  3
);

L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '© OpenStreetMap'
  }
).addTo(map);

const cityMap = {

  "吉达": [21.4858, 39.1925],

  "麦地那": [24.5247, 39.5692],

  "广州": [23.1291, 113.2644],

  "迪拜": [25.2048, 55.2708],

  "拉各斯": [6.5244, 3.3792],

  "北京": [39.9042, 116.4074],

  "上海": [31.2304, 121.4737],

  "麦加": [21.3891, 39.8579]

};

/* =========================
   日记系统
========================= */

const saveDiaryBtn =
document.getElementById("saveDiaryBtn");

const diaryTitle =
document.getElementById("diaryTitle");

const diaryContent =
document.getElementById("diaryContent");

const diaryLocation =
document.getElementById("diaryLocation");

const diaryList =
document.getElementById("diaryList");

saveDiaryBtn.addEventListener("click", async () => {

  if (
    diaryTitle.value === ""
    ||
    diaryContent.value === ""
  ) {

    alert("请填写完整");

    return;

  }

  await addDoc(collection(db, "diaries"), {

    title: diaryTitle.value,

    content: diaryContent.value,

    location: diaryLocation.value,

    time: new Date().toLocaleString()

  });

  diaryTitle.value = "";

  diaryContent.value = "";

  diaryLocation.value = "";

  alert("日记已保存");

  loadDiaries();

  loadMemory();

});

/* 加载日记 */

async function loadDiaries() {

  diaryList.innerHTML = "";

  const querySnapshot =
  await getDocs(collection(db, "diaries"));

  querySnapshot.forEach((doc) => {

    const data = doc.data();

    const div =
    document.createElement("div");

    div.className = "diary-item";

    div.innerHTML = `

      <h3>${data.title}</h3>

      <p>${data.content}</p>

      <small>
        📍 ${data.location}
      </small>

      <br>

      <small>
        ⏰ ${data.time}
      </small>

      <hr>

    `;

    diaryList.appendChild(div);

    if (
      cityMap[data.location]
    ) {

      L.marker(
        cityMap[data.location]
      )

      .addTo(map)

      .bindPopup(`

        <h3>${data.title}</h3>

        <p>${data.content}</p>

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
  document.getElementById("memoryContent");

  memoryContent.innerHTML = "";

  const querySnapshot =
  await getDocs(collection(db, "diaries"));

  const today =
  new Date();

  const todayMonth =
  today.getMonth();

  const todayDate =
  today.getDate();

  let found = false;

  querySnapshot.forEach((doc) => {

    const data = doc.data();

    const diaryTime =
    new Date(data.time);

    if (

      diaryTime.getMonth()
      === todayMonth

      &&

      diaryTime.getDate()
      === todayDate

    ) {

      found = true;

      memoryContent.innerHTML += `

        <div class="memory-item">

          <h3>${data.title}</h3>

          <p>${data.content}</p>

          <small>
            📍 ${data.location}
          </small>

          <br>

          <small>
            ⏰ ${data.time}
          </small>

        </div>

      `;

    }

  });

  if (!found) {

    memoryContent.innerHTML = `

      <p>
        今天还没有过去的回忆。
      </p>

    `;

  }

}

loadMemory();

/* =========================
   照片系统
========================= */

const uploadBtn =
document.getElementById("uploadBtn");

const photoInput =
document.getElementById("photoInput");

const photoLocation =
document.getElementById("photoLocation");

const photoList =
document.getElementById("photoList");

uploadBtn.addEventListener("click", async () => {

  const file =
  photoInput.files[0];

  if (!file) {

    alert("请选择照片");

    return;

  }

  const fileName =
  Date.now() + "_" + file.name;

  const storageRef =
  ref(
    storage,
    "photos/" + fileName
  );

  await uploadBytes(
    storageRef,
    file
  );

  const url =
  await getDownloadURL(storageRef);

  await addDoc(collection(db, "photos"), {

    imageUrl: url,

    location: photoLocation.value,

    time: new Date().toLocaleString()

  });

  alert("照片上传成功");

  loadPhotos();

});

/* 加载照片 */

async function loadPhotos() {

  photoList.innerHTML = "";

  const querySnapshot =
  await getDocs(collection(db, "photos"));

  querySnapshot.forEach((doc) => {

    const data = doc.data();

    const div =
    document.createElement("div");

    div.className = "photo-card";

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
          width="200"
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
   页面跳转
========================= */

window.scrollToSection = function(id) {

  const section =
  document.getElementById(id);

  if (section) {

    section.scrollIntoView({

      behavior: "smooth"

    });

  }

};

/* =========================
   App 化
========================= */

if ('serviceWorker' in navigator) {

  navigator.serviceWorker.register(
    './service-worker.js'
  );

}

console.log(
  "小方树洞系统启动成功"
);
