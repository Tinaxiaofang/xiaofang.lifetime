/* =========================
   Firebase
========================= */

import {
  db,
  auth,
  provider
} from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  signInWithRedirect
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================
   登录
========================= */

const loginBtn = document.getElementById("loginBtn");
const passwordBtn = document.getElementById("passwordBtn");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const siteContent = document.getElementById("siteContent");

siteContent.style.display = "none";

passwordBtn.addEventListener("click", () => {
  if (
    usernameInput.value === "xiaofang" &&
    passwordInput.value === "5201314"
  ) {
    siteContent.style.display = "block";
    document.querySelector(".login-box").style.display = "none";
  } else {
    alert("账号或密码错误");
  }
});

loginBtn.addEventListener("click", async () => {
  try {
    await signInWithRedirect(auth, provider);
  } catch (e) {
    console.error(e);
    alert("Google 登录失败");
  }
});

/* =========================
   地图
========================= */

const map = L.map("map").setView([21.4858, 39.1925], 3);

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  { attribution: "© OpenStreetMap" }
).addTo(map);

const cityMap = {
  "吉达": [21.4858,39.1925],
  "麦地那": [24.5247,39.5692],
  "广州": [23.1291,113.2644],
  "北京": [39.9042,116.4074],
  "上海": [31.2304,121.4737],
  "迪拜": [25.2048,55.2708],
  "拉各斯": [6.5244,3.3792],
  "麦加": [21.3891,39.8579]
};

/* =========================
   日记
========================= */

const saveDiaryBtn = document.getElementById("saveDiaryBtn");
const diaryTitle = document.getElementById("diaryTitle");
const diaryContent = document.getElementById("diaryContent");
const diaryLocation = document.getElementById("diaryLocation");
const diaryList = document.getElementById("diaryList");

/* 保存 */
saveDiaryBtn.addEventListener("click", async () => {
  if (!diaryTitle.value || !diaryContent.value) {
    alert("请填写完整");
    return;
  }

  await addDoc(collection(db, "diaries"), {
    title: diaryTitle.value,
    content: diaryContent.value,
    location: diaryLocation.value,
    time: Date.now()
  });

  diaryTitle.value = "";
  diaryContent.value = "";
  diaryLocation.value = "";

  loadDiaries();
  loadMemory();
});

/* 加载 + 排序 */
async function loadDiaries() {
  diaryList.innerHTML = "";

  const q = query(collection(db, "diaries"), orderBy("time", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach((docItem) => {
    const d = docItem.data();

    const div = document.createElement("div");
    div.className = "diary-item";

    div.innerHTML = `
      <h3>${d.title}</h3>
      <p>${d.content}</p>

      <small>📍 ${d.location}</small><br>
      <small>⏰ ${new Date(d.time).toLocaleString()}</small>

      <div style="margin-top:10px; display:flex; gap:10px;">
        <button style="background:#f44336;color:#fff;border:none;padding:5px 10px;border-radius:6px;"
          onclick="deleteDiary('${docItem.id}')">
          删除
        </button>

        <button style="background:#2196f3;color:#fff;border:none;padding:5px 10px;border-radius:6px;"
          onclick="editDiary('${docItem.id}', \`${d.title}\`, \`${d.content}\`)">
          编辑
        </button>
      </div>
    `;

    diaryList.appendChild(div);

    if (cityMap[d.location]) {
      L.marker(cityMap[d.location])
        .addTo(map)
        .bindPopup(`<h3>${d.title}</h3><p>${d.content}</p>`);
    }
  });
}

loadDiaries();

/* 删除 */
window.deleteDiary = async function(id) {
  if (!confirm("确定删除？")) return;
  await deleteDoc(doc(db, "diaries", id));
  loadDiaries();
};

/* 编辑 */
window.editDiary = async function(id, title, content) {
  const t = prompt("修改标题", title);
  const c = prompt("修改内容", content);

  if (!t || !c) return;

  await updateDoc(doc(db, "diaries", id), {
    title: t,
    content: c
  });

  loadDiaries();
};

/* =========================
   回忆
========================= */

async function loadMemory() {
  const el = document.getElementById("memoryContent");
  el.innerHTML = "";

  const snapshot = await getDocs(collection(db, "diaries"));

  const today = new Date();
  let found = false;

  snapshot.forEach((d) => {
    const data = d.data();
    const date = new Date(data.time);

    if (
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    ) {
      found = true;
      el.innerHTML += `
        <div class="diary-item">
          <h3>${data.title}</h3>
          <p>${data.content}</p>
        </div>
      `;
    }
  });

  if (!found) el.innerHTML = "今天还没有过去的回忆。";
}

loadMemory();

/* =========================
   Cloudinary 照片
========================= */

const uploadBtn = document.getElementById("uploadBtn");
const photoInput = document.getElementById("photoInput");
const photoLocation = document.getElementById("photoLocation");
const photoList = document.getElementById("photoList");

/* 上传 */
uploadBtn.addEventListener("click", async () => {
  const file = photoInput.files[0];
  if (!file) return alert("请选择照片");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "xiaofang");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dzlxnbtoo/image/upload",
    { method: "POST", body: formData }
  );

  const data = await res.json();

  if (!data.secure_url) {
    console.error(data);
    return alert("上传失败");
  }

  await addDoc(collection(db, "photos"), {
    imageUrl: data.secure_url,
    location: photoLocation.value,
    time: Date.now()
  });

  loadPhotos();
});

/* 加载照片 */
async function loadPhotos() {
  photoList.innerHTML = "";

  const q = query(collection(db, "photos"), orderBy("time", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach((docItem) => {
    const d = docItem.data();

    const div = document.createElement("div");
    div.className = "photo-card";

    div.innerHTML = `
      <img src="${d.imageUrl}" class="memory-photo">

      <div class="photo-info">
        <p>📍 ${d.location}</p>
        <small>⏰ ${new Date(d.time).toLocaleString()}</small>

        <div style="margin-top:10px;">
          <button style="background:#f44336;color:#fff;border:none;padding:5px 10px;border-radius:6px;"
            onclick="deletePhoto('${docItem.id}')">
            删除
          </button>
        </div>
      </div>
    `;

    photoList.appendChild(div);

    if (cityMap[d.location]) {
      L.marker(cityMap[d.location])
        .addTo(map)
        .bindPopup(`<img src="${d.imageUrl}" width="180"><p>${d.location}</p>`);
    }
  });
}

loadPhotos();

/* 删除照片 */
window.deletePhoto = async function(id) {
  if (!confirm("确定删除？")) return;
  await deleteDoc(doc(db, "photos", id));
  loadPhotos();
};

/* =========================
   工具
========================= */

window.scrollToSection = function(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js");
}

console.log("小方树洞启动成功");
