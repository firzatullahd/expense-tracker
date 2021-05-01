import './styles/css/app.css';
import axios from 'axios';
const app = document.querySelector('#app');

function loadDOM() {
  const isLoggedIn = checkIsLoggedIn();
  if (isLoggedIn) loadLoggedInDOM();
  if (!isLoggedIn) loadLoginDOM();
}

function init() {
  loadDOM();
}

init();


async function handleLogin(e) {
  e.preventDefault();
  const username = document.querySelector('#username');
  const password = document.querySelector('#password');
  try {
    const res = await axios({
      method: "post",
      url: "https://fir-expense-tracker-api.herokuapp.com/api/login",
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        "username": username.value,
        "password": password.value
      })
    });

    localStorage.setItem("expense-tracker-token", res.data.data);
    localStorage.setItem("username", username.value);
    loadDOM();
  } catch (error) {
    handleMsg(document.querySelector('#login-error-msg'));
  }
}

function handleMsg(dom) {
  dom.style.display = "block";
  setTimeout(() => {
    dom.style.display = "none";
  }, 5000);

}

async function handleRegister(e) {
  e.preventDefault();
  const usernameRegister = document.querySelector('#usernameRegister');
  const passwordRegister = document.querySelector('#passwordRegister');
  const passwordRegisterRepeat = document.querySelector('#passwordRegisterRepeat');
  if (passwordRegister.value !== passwordRegisterRepeat.value) {
    handleMsg(document.querySelector('#register-error-msg-password'));
    return;
  }

  try {
    const res = await axios({
      method: "post",
      url: "https://fir-expense-tracker-api.herokuapp.com/api/register",
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        "username": usernameRegister.value,
        "password": passwordRegister.value
      })
    });
    handleMsg(document.querySelector('#success-msg'));
  } catch (error) {
    handleMsg(document.querySelector('#register-error-msg-username'));
  }
}

function handleLogout() {
  localStorage.removeItem("expense-tracker-token");
  localStorage.removeItem("username");
  loadDOM();
}

function loadLoginDOM() {
  app.innerHTML = `
    <div class="card">
      <h2>Log in to Expense Tracker</h2>
      <form>
        <p id="login-error-msg"><i class="fa fa-times-circle"></i> Invalid username/password</p>
        <input type="text" name="username" id="username" placeholder="Username" />
        <input type="password" name="password" id="password" placeholder="Password" />
        <button id="submitLogin">Log in</button>
      </form>
      <p>or</p>
      <button id="registerPage">Create New Account</button>
    </div>
  `;
  const submitLogin = document.querySelector('#submitLogin');
  submitLogin.addEventListener('click', handleLogin);

  const registerPage = document.querySelector('#registerPage');
  registerPage.addEventListener('click', loadRegisterDOM);

  ;
}

function loadRegisterDOM() {
  app.innerHTML = `
  <div class="card">
    <h2>Create a new account</h2>
    <form>
        <div id="success-msg"> <i class="fa fa-check"></i> Sign Up Success.</div>
        <div id="register-error-msg-username"><i class="fa fa-times-circle"></i> Something went wrong</div>
        <div id="register-error-msg-password"><i class="fa fa-times-circle"></i> Password mismatch</div>
        <input type="text" name="usernameRegister" id="usernameRegister" placeholder="Username" />
        <input type="password" name="passwordRegister" id="passwordRegister" placeholder="Password" />
        <input type="password" name="passwordRegisterRepeat" id="passwordRegisterRepeat" placeholder="Confirm Password" />
        <button id="submitRegister">Sign Up</button>
      </form>
      <a id="loginPage">Log in to an existing account</a>
    </div>
    `;
  // <div class="modal">
  //   <h2>hello</h2>
  //   <h3>
  // </div>

  const loginPage = document.querySelector('#loginPage');
  loginPage.addEventListener('click', loadLoginDOM);

  const submitRegister = document.querySelector('#submitRegister');
  submitRegister.addEventListener('click', handleRegister);
}

function getBalance() {
  const transactions = JSON.parse(localStorage.getItem("transactions"));
  let balance = transactions.reduce((res, t) => {
    return res + Number(t.amount);
  }, 0);
  return balance;
}

async function loadLoggedInDOM() {
  app.innerHTML = `
    <div id="loggedIn">
      <div id="profile">
        <h2 id="hi-username"></h2>
        <button id="logout-btn">Sign Out</button>
      </div>
      <h3>YOUR BALANCE</h3>
      <h3 id="balance">Rp0,00</h3>
      <div id="income-expense">
        <div>
          <h4>INCOME</h4>
          <p id="money-plus" class="money plus">+$0.00</p>
        </div>
        <div>
          <h4>EXPENSE</h4>
          <p id="money-minus" class="money minus">-$0.00</p>
      </div>
      </div>
      <h3 id="history">History</h3>
      <div id="transaction-list"></div>
      <form>
        <label for="text">Text/Expense Description</label>
        <input type="text" name="text" id="text" placeholder="Enter text.." />
        <br>
        <label for="amount">Amount</label>
        <p>(positive-income, negative-expense)</p>
        <input type="number" name="amount" id="amount" placeholder="Enter amount.." />
        <br>
        <button id="submitAddTransaction">Add Transaction</button>
      </form>
    <div>
  `
  const balance = getBalance();
  document.querySelector('#balance').innerHTML = `Rp ${balance},00`;

  const logoutBtn = document.querySelector('#logout-btn');
  logoutBtn.addEventListener('click', handleLogout);

  const addTransactionBtn = document.querySelector('#submitAddTransaction');
  addTransactionBtn.addEventListener('click', handleAddTransaction);

  document.querySelector('#hi-username').innerHTML = "Hi, " + localStorage.getItem('username');
  const transactionList = document.querySelector('#transaction-list');
  await getTransactions();
  let transactions = '';
  transactionList.innerHTML = transactions;
  let transactionData = JSON.parse(localStorage.getItem('transactions'));
  transactionData.forEach(t => transactions += showTransaction(t))
  transactionList.innerHTML = transactions;
  const deleteBtns = document.querySelectorAll('.delete-btn')
  deleteBtns.forEach(d => {
    d.addEventListener('click', () => {
      handleDelete(d.parentNode.id);
    });
  });
}

function showTransaction(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  let amount = sign + "Rp " + Math.abs(transaction.amount).toLocaleString("id-ID") + ",00";
  return `
    <div id=${transaction._id} class="transaction">
      <span>${transaction.text}</span>
      <div>
      <span class="transaction-amount">${amount} </span>
      <button class="delete-btn">x</button>
      </div>
    </div>
  `;
}


async function getTransactions() {

  let res = await axios({
    method: 'get',
    url: 'https://fir-expense-tracker-api.herokuapp.com/api/transactions',
    headers: {
      'x-auth-token': localStorage.getItem('expense-tracker-token')
    }
  });
  // console.log(res.data.data);
  localStorage.setItem('transactions', JSON.stringify(res.data.data));
}

function handleAddTransaction(e) {
  e.preventDefault();
  const text = document.querySelector('#text');
  const amount = document.querySelector('#amount');
  addTransaction(text.value, amount.value);
  loadLoggedInDOM();
}

async function addTransaction(text, amount) {
  try {
    let res = await axios.post('https://fir-expense-tracker-api.herokuapp.com/api/transactions', {
      text, amount: +amount
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('expense-tracker-token')
      }
    });
    localStorage.setItem('transactions', JSON.stringify(res.data.data));
    loadDOM();
  } catch (error) {
    console.log(error)
  }
}

async function deleteTransactions(id) {
  await axios({
    method: 'delete',
    url: `https://fir-expense-tracker-api.herokuapp.com/api/transactions/${id}`,
    headers: {
      'x-auth-token': localStorage.getItem('expense-tracker-token')
    }
  });
}


function checkIsLoggedIn() {
  const token = localStorage.getItem('expense-tracker-token');
  if (token) return true;
  else return false;
}

function handleDelete(id) {
  let transactions = JSON.parse(localStorage.getItem('transactions'));
  transactions = transactions.filter(transaction => transaction.id !== id);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  deleteTransactions(id);

  loadDOM();
}