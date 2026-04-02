const URL =
  "https://script.google.com/macros/s/AKfycbz1GfBkqUiBm89qgw5Mz0ssuNzB1unBWFnjsWnsY_pX7X0jSuia63guGvnobbzLS3nj7A/exec";
let currentUser = null;

function login() {
  const email = document.getElementById("email").value;
  fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", email }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "found") startApp(email, data);
      else
        document.getElementById("auth-msg").innerText =
          "User not found. Please register.";
    })
    .catch((err) => console.error(err));
}

function register() {
  const email = document.getElementById("email").value;
  const name = document.getElementById("name").value;
  const balance = document.getElementById("balance").value;
  const limit = document.getElementById("limit").value;

  fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "register", email, name, balance, limit }),
  })
    .then((res) => res.json())
    .then(
      () =>
        (document.getElementById("auth-msg").innerText =
          "Registered! Now login."),
    )
    .catch((err) => console.error(err));
}

function startApp(email, data) {
  currentUser = email;
  document.getElementById("auth").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("welcome").innerText = "Welcome " + data.name;
  document.getElementById("balance-display").innerText = data.balance;
  document.getElementById("limit-display").innerText = data.limit;
}

function addExpense() {
  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const time = document.getElementById("time").value;
  const note = document.getElementById("note").value;

  fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "addExpense",
      email: currentUser,
      amount,
      category,
      time,
      note,
    }),
  })
    .then((res) => res.json())
    .then(() => (document.getElementById("msg").innerText = "✅ Saved!"))
    .catch((err) => console.error(err));
}
