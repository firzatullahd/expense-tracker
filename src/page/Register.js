import { handleMsg } from '../utils';
import { Login } from './Login';
import axios from 'axios';

export function Register() {
    app.innerHTML = `
    <div class="card">
      <h2>Create a new account</h2>
      <form>
          <div id="register-success-msg"> <i class="fa fa-check"></i> Sign Up Success.</div>
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
    document.querySelector('#loginPage').addEventListener('click', Login);
    document.querySelector('#submitRegister').addEventListener('click', handleRegister);
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
        await axios({
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
        handleMsg(document.querySelector('#register-success-msg'));
    } catch (error) {
        handleMsg(document.querySelector('#register-error-msg-username'));
    }
}

