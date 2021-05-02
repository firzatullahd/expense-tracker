
export function handleMsg(dom) {
    dom.style.display = "block";
    setTimeout(() => {
        dom.style.display = "none";
    }, 5000);
}

export function checkIsLoggedIn() {
    const token = localStorage.getItem('expense-tracker-token');
    if (token) return true;
    else return false;
}

export function formatCurrency(amount) {
    return "Rp" + Math.abs(amount).toLocaleString("id-ID") + ",00";
}