import { App } from '../main';
import { Register } from './Register';
import { handleMsg } from '../utils';
import axios from 'axios';

export function Login() {
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

    document.querySelector('#submitLogin').addEventListener('click', handleLogin);
    document.querySelector('#registerPage').addEventListener('click', Register);
}

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
        localStorage.setItem("transactions", JSON.stringify([]))
        App();
    } catch (error) {
        handleMsg(document.querySelector('#login-error-msg'));
    }
}

