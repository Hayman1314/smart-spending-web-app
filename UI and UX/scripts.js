const URL = "YOUR_URL";
let currentUser = null;

// 🔐 LOGIN
function login() {
  const email = document.getElementById("email").value;

  fetch(URL, {
    method: "POST",
    body: JSON.stringify({ action: "login", email }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "found") {
        startApp(email, data);
      } else {
        document.getElementById("auth-msg").innerText =
          "User not found. Please register.";
      }
    });
}

// 🆕 REGISTER
function register() {
  const email = document.getElementById("email").value;
  const name = document.getElementById("name").value;
  const balance = document.getElementById("balance").value;
  const limit = document.getElementById("limit").value;

  fetch(URL, {
    method: "POST",
    body: JSON.stringify({
      action: "register",
      email,
      name,
      balance,
      limit,
    }),
  }).then(() => {
    document.getElementById("auth-msg").innerText = "Registered! Now login.";
  });
}

// 🚀 START APP
function startApp(email, data) {
  currentUser = email;

  document.getElementById("auth").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("welcome").innerText = "Welcome " + data.name;

  document.getElementById("balance-display").innerText = data.balance;

  document.getElementById("limit-display").innerText = data.limit;
}

// 💸 ADD EXPENSE
function addExpense() {
  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const time = document.getElementById("time").value;
  const note = document.getElementById("note").value;

  fetch(URL, {
    method: "POST",
    body: JSON.stringify({
      action: "addExpense",
      email: currentUser,
      amount,
      category,
      time,
      note,
    }),
  }).then(() => {
    document.getElementById("msg").innerText = "✅ Saved!";
  });
}
