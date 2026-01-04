const tg = window.Telegram.WebApp;
tg.ready();

let balance = 1000;
let isFlying = false;
let coef = 1.00;
let interval;

const rocket = document.getElementById('rocket');
const coefDisplay = document.getElementById('coef');
const balanceEl = document.getElementById('balance');
const betBtn = document.getElementById('bet-btn');
const collectBtn = document.getElementById('collect-btn');
const timerEl = document.getElementById('timer');
const timerValue = document.getElementById('timer-value');

// Замени на ссылку с Railway после деплоя бэкенда
const API_URL = 'https://rocket-backend.up.railway.app';

function updateBalance() {
  balanceEl.textContent = balance + ' 🌟';
}

async function loadUser() {
  const user = tg.initDataUnsafe.user;
  if (!user) return;

  try {
    const res = await fetch(`${API_URL}/api/user/${user.id}`);
    const data = await res.json();
    balance = data.stars_balance || 1000;
    updateBalance();
  } catch (e) {
    console.log("Локальный режим: API недоступен");
  }
}

async function saveBalance() {
  const user = tg.initDataUnsafe.user;
  if (!user) return;

  try {
    await fetch(`${API_URL}/api/user/${user.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stars_balance: balance })
    });
  } catch (e) {
    console.log("API не доступно (локально)");
  }
}

betBtn.onclick = () => {
  if (balance < 100 || isFlying) return;
  balance -= 100;
  updateBalance();
  betBtn.disabled = true;
  saveBalance();
  startRocket();
};

function startRocket() {
  isFlying = true;
  rocket.style.bottom = '80vh';
  coef = 1.00;
  coefDisplay.textContent = coef.toFixed(2) + 'x';

  interval = setInterval(() => {
    coef += 0.1;
    coefDisplay.textContent = coef.toFixed(2) + 'x';

    if (Math.random() < 0.04) {
      explode();
    }
  }, 300);
}

function explode() {
  clearInterval(interval);
  isFlying = false;
  rocket.style.bottom = '20px';
  collectBtn.disabled = false;
  collectBtn.onclick = () => {
    const win = Math.floor(100 * coef);
    balance += win;
    updateBalance();
    saveBalance();
    alert(`Вы выиграли ${win} 🌟!`);
    collectBtn.disabled = true;
    timerEl.classList.add('hidden');
    betBtn.disabled = false;
  };
  timerEl.classList.remove('hidden');
  let time = 15;
  timerValue.textContent = time;
  const timer = setInterval(() => {
    time--;
    timerValue.textContent = time;
    if (time <= 0) {
      clearInterval(timer);
      timerEl.classList.add('hidden');
      collectBtn.click();
    }
  }, 1000);
}

loadUser();
