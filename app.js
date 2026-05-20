import { db, auth, provider } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const storage = getStorage();

/* =========================
   当前用户
========================= */

let currentUser = null;

signInWithPopup(auth, provider);

onAuthStateChanged(auth, (user) => {
  if (user) currentUser = user;
});

/* =========================
   发布动态（文字+多图）
========================= */

window.publish = async function () {

  const text = document.getElementById("textInput").value;
  const files = document.getElementById("imageInput").files;

  let images = [];

  for (let file of files) {
    const r = ref(storage, `posts/${Date.now()}_${file.name}`);
    await uploadBytes(r, file);
    images.push(await getDownloadURL(r));
  }

  await addDoc(collection(db, "posts"), {
    uid: currentUser.uid,
    username: currentUser.displayName,
    avatar: currentUser.photoURL,
    text,
    images,
    time: Date.now(),
    likes: []
  });

  loadPosts();
};

/* =========================
   点赞（可取消）
========================= */

window.likePost = async function (postId) {

  const refDoc = doc(db, "posts", postId);
  const snap = await getDoc(refDoc);
  const data = snap.data();

  let likes = data.likes || [];
  const uid = currentUser.uid;

  if (likes.includes(uid)) {
    likes = likes.filter(i => i !== uid);
  } else {
    likes.push(uid);
  }

  await updateDoc(refDoc, { likes });

  loadPosts();
};

/* =========================
   关注系统
========================= */

window.toggleFollow = async function (targetUid) {

  const meRef = doc(db, "users", currentUser.uid);
  const targetRef = doc(db, "users", targetUid);

  const meSnap = await getDoc(meRef);
  const targetSnap = await getDoc(targetRef);

  let following = meSnap.data()?.following || [];
  let followers = targetSnap.data()?.followers || [];

  if (following.includes(targetUid)) {
    following = following.filter(i => i !== targetUid);
    followers = followers.filter(i => i !== currentUser.uid);
  } else {
    following.push(targetUid);
    followers.push(currentUser.uid);
  }

  await updateDoc(meRef, { following });
  await updateDoc(targetRef, { followers });

  loadPosts();
};

/* =========================
   加载动态（推荐流 / 关注流）
========================= */

window.loadPosts = async function (mode = "all") {

  const box = document.getElementById("postList");
  box.innerHTML = "";

  const q = query(collection(db, "posts"), orderBy("time", "desc"));
  const snapshot = await getDocs(q);

  const meSnap = await getDoc(doc(db, "users", currentUser.uid));
  const following = meSnap.data()?.following || [];

  snapshot.forEach((d) => {

    const p = d.data();

    if (mode === "follow" && !following.includes(p.uid)) return;

    let imgs = "";
    p.images?.forEach(url => {
      imgs += `<img src="${url}" style="width:100%;border-radius:10px;margin-top:5px;">`;
    });

    const div = document.createElement("div");

    div.innerHTML = `
      <div style="border:1px solid #ddd;margin:10px;padding:10px;border-radius:10px;">

        <div style="display:flex;align-items:center;gap:10px;">
          <img src="${p.avatar}" width="40" style="border-radius:50%;cursor:pointer"
            onclick="openProfile('${p.uid}')">
          <b>${p.username}</b>

          <button onclick="toggleFollow('${p.uid}')">关注</button>
        </div>

        <p>${p.text}</p>

        ${imgs}

        <small>${new Date(p.time).toLocaleString()}</small>

        <div>
          ❤️ ${(p.likes || []).length}
          <button onclick="likePost('${d.id}')">点赞</button>
          <button onclick="deletePost('${d.id}')">删除</button>
          <button onclick="openComment('${d.id}')">评论</button>
        </div>

        <div id="c-${d.id}"></div>

      </div>
    `;

    box.appendChild(div);

    loadComments(d.id);
  });
};

/* =========================
   删除
========================= */

window.deletePost = async function (id) {
  if (!confirm("删除？")) return;
  await deleteDoc(doc(db, "posts", id));
  loadPosts();
};

/* =========================
   评论
========================= */

window.openComment = async function (postId) {

  const text = prompt("评论内容");
  if (!text) return;

  await addDoc(collection(db, "comments"), {
    postId,
    uid: currentUser.uid,
    username: currentUser.displayName,
    text,
    time: Date.now()
  });

  loadComments(postId);
};

/* =========================
   加载评论
========================= */

async function loadComments(postId) {

  const box = document.getElementById(`c-${postId}`);
  if (!box) return;

  box.innerHTML = "";

  const q = query(collection(db, "comments"), orderBy("time", "asc"));
  const snap = await getDocs(q);

  snap.forEach((d) => {

    const c = d.data();

    if (c.postId !== postId) return;

    box.innerHTML += `
      <div style="font-size:12px;margin-left:10px;">
        <b>${c.username}</b>: ${c.text}
      </div>
    `;
  });
}

/* =========================
   用户主页
========================= */

window.openProfile = async function (uid) {

  const user = await getDoc(doc(db, "users", uid));

  const u = user.data();

  alert(
    `用户：${u.username}
粉丝：${u.followers?.length || 0}
关注：${u.following?.length || 0}`
  );

  loadPosts("user");
};

/* =========================
   切换信息流
========================= */

window.feedAll = function () {
  loadPosts("all");
};

window.feedFollow = function () {
  loadPosts("follow");
};
