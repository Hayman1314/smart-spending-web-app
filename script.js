// Access Firebase from window
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  child,
  push,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

const auth = window.firebaseAuth;
const db = window.firebaseDB;
let currentUser = null;

// REGISTER
export function register() {
  const email = document.getElementById("email").value;
  const password = "defaultPassword"; // Simple password since you didn’t collect one
  const name = document.getElementById("name").value;
  const balance = document.getElementById("balance").value;
  const limit = document.getElementById("limit").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;

      // Save user info in Realtime Database
      set(ref(db, "users/" + currentUser.uid), {
        name,
        email,
        balance,
        limit,
      });

      document.getElementById("auth-msg").innerText = "Registered! Now login.";
    })
    .catch((error) => {
      document.getElementById("auth-msg").innerText = error.message;
      console.error(error);
    });
}

// LOGIN
export function login() {
  const email = document.getElementById("email").value;
  const password = "defaultPassword"; // Same default

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;

      // Get user info from database
      get(child(ref(db), "users/" + currentUser.uid)).then((snapshot) => {
        if (snapshot.exists()) {
          startApp(currentUser.uid, snapshot.val());
        } else {
          document.getElementById("auth-msg").innerText =
            "User data not found.";
        }
      });
    })
    .catch((error) => {
      document.getElementById("auth-msg").innerText = error.message;
      console.error(error);
    });
}

// START APP
function startApp(uid, data) {
  currentUser = uid;

  document.getElementById("auth").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("welcome").innerText = "Welcome " + data.name;
  document.getElementById("balance-display").innerText = data.balance;
  document.getElementById("limit-display").innerText = data.limit;
}

// ADD EXPENSE
export function addExpense() {
  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const time = document.getElementById("time").value;
  const note = document.getElementById("note").value;

  if (!currentUser) {
    alert("Please login first!");
    return;
  }

  const expenseRef = push(ref(db, "expenses/" + currentUser));
  set(expenseRef, {
    amount,
    category,
    time,
    note,
    timestamp: Date.now(),
  })
    .then(() => {
      document.getElementById("msg").innerText = "✅ Saved!";
    })
    .catch((err) => console.error(err));
}
