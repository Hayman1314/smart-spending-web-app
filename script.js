// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  push,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

// ------------------ FIREBASE CONFIG ------------------
const firebaseConfig = {
  apiKey: "AIzaSyDSc0Ge5nLEDVGwdHuRKBC6rdhxD-oDMOk",
  authDomain: "smart-spending-bb90b.firebaseapp.com",
  databaseURL: "https://smart-spending-bb90b-default-rtdb.firebaseio.com",
  projectId: "smart-spending-bb90b",
  storageBucket: "smart-spending-bb90b.appspot.com",
  messagingSenderId: "945186984022",
  appId: "1:945186984022:web:243709af5ee45b02616bf7",
  measurementId: "G-12LYN5BK61",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// ------------------ GOOGLE SHEETS CONFIG ------------------
const googleSheetURL = "YOUR_GOOGLE_WEB_APP_URL"; // <-- Replace with your Apps Script Web App URL

// ------------------ REGISTER ------------------
export function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const name = document.getElementById("name").value;
  const balance = document.getElementById("balance").value;
  const limit = document.getElementById("limit").value;

  if (!email || !password || !name || !balance || !limit) {
    document.getElementById("auth-msg").innerText = "All fields are required!";
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const userId = userCredential.user.uid;
      set(ref(database, "users/" + userId), { name, email, balance, limit });
      document.getElementById("auth-msg").innerText =
        "✅ Registered! Now login.";
    })
    .catch((error) => {
      document.getElementById("auth-msg").innerText = error.message;
    });
}

// ------------------ LOGIN ------------------
export function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    document.getElementById("auth-msg").innerText =
      "Email & password required!";
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const userId = userCredential.user.uid;
      get(child(ref(database), "users/" + userId)).then((snapshot) => {
        if (snapshot.exists()) {
          startApp(userId, snapshot.val());
        }
      });
    })
    .catch((error) => {
      document.getElementById("auth-msg").innerText = error.message;
    });
}

// ------------------ START APP ------------------
function startApp(uid, data) {
  document.getElementById("auth").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("welcome").innerText = "Welcome " + data.name;
  document.getElementById("balance-display").innerText = data.balance;
  document.getElementById("limit-display").innerText = data.limit;

  loadExpenses(uid);
}

// ------------------ LOAD EXPENSES ------------------
function loadExpenses(uid) {
  get(child(ref(database), "expenses/" + uid)).then((snapshot) => {
    let total = 0;
    if (snapshot.exists()) {
      snapshot.forEach((childSnap) => {
        total += parseFloat(childSnap.val().amount);
      });
    }
    document.getElementById("spent-display").innerText = total;
  });
}

// ------------------ ADD EXPENSE ------------------
export function addExpense() {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in first.");
    return;
  }

  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const time = document.getElementById("time").value;
  const note = document.getElementById("note").value;

  if (!amount) {
    alert("Amount is required!");
    return;
  }

  // Save to Firebase
  const newExpRef = push(ref(database, "expenses/" + user.uid));
  set(newExpRef, { amount, category, time, note }).then(() => {
    document.getElementById("msg").innerText = "✅ Saved!";
    loadExpenses(user.uid);

    // Send to Google Sheets
    fetch(googleSheetURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.uid,
        amount,
        category,
        time,
        note,
      }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Google Sheet:", data))
      .catch((err) => console.error("Google Sheet Error:", err));
  });
}
