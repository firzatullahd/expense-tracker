import { App } from '../main';
import axios from 'axios';
import { formatCurrency } from '../utils';

let transactionsLocalStorage = JSON.parse(localStorage.getItem("transactions"));
console.log(transactionsLocalStorage)
const username = localStorage.getItem("username");
const token = localStorage.getItem('expense-tracker-token');
//refactor into transactions & usrname

export async function ExpenseTracker() {
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
            <p id="money-plus" class="money plus">+Rp0.00</p>
          </div>
          <div>
            <h4>EXPENSE</h4>
            <p id="money-minus" class="money minus">-Rp0.00</p>
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
    document.querySelector('#logout-btn').addEventListener('click', handleLogout);
    document.querySelector('#submitAddTransaction').addEventListener('click', addTransaction);
    document.querySelector('#hi-username').innerHTML = "Hi, " + username;

    updateValues();
    // + reload
    const transactionListDOM = document.querySelector('#transaction-list');
    await getTransactions();
    transactionListDOM.innerHTML = '';
    let transactionData = JSON.parse(localStorage.getItem('transactions'));
    transactionData.forEach(t => addTransactionDOM(t));
    //

    const deleteBtns = document.querySelectorAll('.delete-btn')
    deleteBtns.forEach(d => {
        d.addEventListener('click', () => {
            deleteTransaction(d.parentNode.parentNode.id);
        });
    });

}


function addTransactionDOM(transaction) {
    const sign = transaction.amount < 0 ? '-' : '+';
    let amount = sign + formatCurrency(transaction.amount);
    const transactionItem = document.createElement('div');
    transactionItem.className = "transaction";
    transactionItem.setAttribute("id", transaction._id);

    transactionItem.innerHTML = `
        <span>${transaction.text}</span>
        <div>
        <span class="transaction-amount">${amount} </span>
        <button class="delete-btn">x</button>
        </div>
    `;
    const transactionListDOM = document.querySelector('#transaction-list');
    transactionListDOM.appendChild(transactionItem);
    console.log(transactionListDOM)

}



function getIncomeExpense() {
    let res = transactionsLocalStorage;
    if (res.length == 0) return { income: 0, expense: 0 }
    else {
        res = res.map(t => t.amount);
        let income = res.filter(t => t > 0)
        let expense = res.filter(t => t < 0)
        income = income.reduce((totalIncome, i) => {
            return totalIncome + i;
        }, 0)
        expense = expense.reduce((totalExpense, i) => {
            return totalExpense + i;
        }, 0)
        return { income, expense };
    }

}

function getBalance() {
    if (transactionsLocalStorage.length == 0) return formatCurrency(0);
    else {
        let balance = transactionsLocalStorage;
        balance = balance.reduce((totalBalance, t) => {
            return totalBalance + Number(t.amount);
        }, 0);
        const sign = balance < 0 ? '-' : '+';
        return sign + formatCurrency(balance);
    }

}

function handleLogout() {
    localStorage.removeItem("expense-tracker-token");
    localStorage.removeItem("username");
    localStorage.removeItem("transactions");
    App();
}

async function addTransaction(e) {
    e.preventDefault();
    const text = document.querySelector('#text');
    const amount = document.querySelector('#amount');
    try {
        let res = await axios.post('https://fir-expense-tracker-api.herokuapp.com/api/transactions', {
            text: text.value, amount: +amount.value
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            }
        });
        localStorage.setItem('transactions', JSON.stringify([...transactionsLocalStorage, res.data.data]));
        ExpenseTracker();
    } catch (error) {
        console.log(error)
    }
}


async function getTransactions() {
    let res = await axios({
        method: 'get',
        url: 'https://fir-expense-tracker-api.herokuapp.com/api/transactions',
        headers: {
            'x-auth-token': token
        }
    });
    localStorage.setItem('transactions', JSON.stringify(res.data.data));
    console.log("get", transactionsLocalStorage)
    // console.log("get", JSON.parse(localStorage.getItem("transactions")));
}

async function deleteTransaction(id) {
    try {
        await axios({
            method: 'delete',
            url: `https://fir-expense-tracker-api.herokuapp.com/api/transactions/${id}`,
            headers: {
                'x-auth-token': token
            }
        });

        let transactions = transactionsLocalStorage.filter(transaction => transaction._id !== id);
        localStorage.setItem('transactions', JSON.stringify(transactions));

    } catch (error) {
        console.log(error)
    }
}

function updateValues() {
    const { income, expense } = getIncomeExpense();
    document.querySelector('#balance').innerHTML = getBalance();
    document.querySelector("#money-plus").innerHTML = "+ " + formatCurrency(income);
    document.querySelector("#money-minus").innerHTML = "-" + formatCurrency(expense);
}
