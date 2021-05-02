import '../styles/css/app.css';

import { Login } from './page/Login';
import { ExpenseTracker } from './page/ExpenseTracker';
import { checkIsLoggedIn } from './utils';
const app = document.querySelector('#app');

export function App() {
  const isLoggedIn = checkIsLoggedIn();
  if (isLoggedIn) ExpenseTracker();
  if (!isLoggedIn) Login();
}

App();



