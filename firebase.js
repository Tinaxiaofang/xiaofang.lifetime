/* =========================
   Firebase 初始化
========================= */

import { initializeApp }

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getFirestore }

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {

  getAuth,

  GoogleAuthProvider

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* Firebase 配置 */

const firebaseConfig = {

  apiKey:

  "AIzaSyBp3yXkRP1BaAxXqscVb7NuFWmUtMn4xPI",

  authDomain:

  "xiaofanglife.firebaseapp.com",

  projectId:

  "xiaofanglife",

  storageBucket:

  "xiaofanglife.appspot.com",

  messagingSenderId:

  "34189068819",

  appId:

  "1:34189068819:web:2f17d673b2fdd750200de6"

};

/* 初始化 */

const app =

initializeApp(firebaseConfig);

/* 数据库 */

const db =

getFirestore(app);

/* 登录系统 */

const auth =

getAuth(app);

const provider =

new GoogleAuthProvider();

/* 导出 */

export {

  db,

  auth,

  provider

};
