// script.js

// Firebase modules (global from HTML)
const auth = window.firebaseAuth;
const db = window.firebaseDB;

// REGISTER
function register() {
  const email = document.getElementById("email").value;
  const name = document.getElementById("name").value;
  const balance = document.getElementById("balance").value;
  const limit = document.getElementById("limit").value;
  const password = prompt("Enter a password for your account:");

  firebase
    .auth()
    .createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const userId = userCredential.user.uid;
      firebase
        .database()
        .ref(db, "users/" + userId)
        .set({
          name,
          email,
          balance,
          limit,
        });
      document.getElementById("auth-msg").innerText = "Registered! Now login.";
    })
    .catch((error) => {
      document.getElementById("auth-msg").innerText = error.message;
    });
}

// LOGIN
function login() {
  const email = document.getElementById("email").value;
  const password = prompt("Enter your password:");

  firebase
    .auth()
    .signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const userId = userCredential.user.uid;
      firebase
        .database()
        .ref(db, "users/" + userId)
        .once("value")
        .then((snapshot) => {
          const data = snapshot.val();
          startApp(userId, data);
        });
    })
    .catch((error) => {
      document.getElementById("auth-msg").innerText = error.message;
    });
}

// START APP
function startApp(uid, data) {
  document.getElementById("auth").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("welcome").innerText = "Welcome " + data.name;
  document.getElementById("balance-display").innerText = data.balance;
  document.getElementById("limit-display").innerText = data.limit;

  loadExpenses(uid);
}

// LOAD EXPENSES & CALCULATE TOTAL
function loadExpenses(uid) {
  firebase
    .database()
    .ref(db, "expenses/" + uid)
    .once("value")
    .then((snapshot) => {
      let total = 0;
      snapshot.forEach((child) => {
        const expense = child.val();
        total += parseFloat(expense.amount);
      });
      document.getElementById("spent-display").innerText = total;
    });
}

// ADD EXPENSE
function addExpense() {
  const user = firebase.auth().currentUser;
  if (!user) {
    alert("Please log in first.");
    return;
  }

  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const time = document.getElementById("time").value;
  const note = document.getElementById("note").value;

  const newExp = firebase
    .database()
    .ref(db, "expenses/" + user.uid)
    .push();
  newExp.set({ amount, category, time, note }).then(() => {
    document.getElementById("msg").innerText = "✅ Saved!";
    loadExpenses(user.uid);
  });
}
