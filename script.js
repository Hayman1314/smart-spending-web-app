// Initialize Firebase
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

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// REGISTER
document.getElementById("registerBtn").onclick = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const name = document.getElementById("name").value;
  const balance = document.getElementById("balance").value;
  const limit = document.getElementById("limit").value;

  if (!email || !password || !name || !balance || !limit) {
    document.getElementById("auth-msg").innerText = "All fields required!";
    return;
  }

  auth
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const uid = userCredential.user.uid;
      database.ref("users/" + uid).set({ name, email, balance, limit });
      document.getElementById("auth-msg").innerText =
        "✅ Registered! Now login.";
    })
    .catch((err) => {
      document.getElementById("auth-msg").innerText = err.message;
    });
};

// LOGIN
document.getElementById("loginBtn").onclick = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    document.getElementById("auth-msg").innerText =
      "Email & password required!";
    return;
  }

  auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const uid = userCredential.user.uid;
      database
        .ref("users/" + uid)
        .once("value")
        .then((snap) => {
          startApp(uid, snap.val());
        });
    })
    .catch((err) => {
      document.getElementById("auth-msg").innerText = err.message;
    });
};

// START APP
function startApp(uid, data) {
  document.getElementById("auth").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("welcome").innerText = "Welcome " + data.name;
  document.getElementById("balance-display").innerText = data.balance;
  document.getElementById("limit-display").innerText = data.limit;
  loadExpenses(uid);
}

// LOAD EXPENSES
function loadExpenses(uid) {
  database
    .ref("expenses/" + uid)
    .once("value")
    .then((snap) => {
      let total = 0;
      snap.forEach((child) => (total += parseFloat(child.val().amount)));
      document.getElementById("spent-display").innerText = total;
    });
}

// ADD EXPENSE
document.getElementById("addBtn").onclick = function () {
  const user = auth.currentUser;
  if (!user) {
    alert("Login first");
    return;
  }

  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const note = document.getElementById("note").value;

  if (!amount) {
    alert("Amount required");
    return;
  }

  const newRef = database.ref("expenses/" + user.uid).push();
  newRef.set({ amount, category, note }).then(() => {
    document.getElementById("msg").innerText = "✅ Saved!";
    loadExpenses(user.uid);
  });
};

// Stay logged in
auth.onAuthStateChanged((user) => {
  if (user) {
    database
      .ref("users/" + user.uid)
      .once("value")
      .then((snap) => {
        startApp(user.uid, snap.val());
      });
  }
});
