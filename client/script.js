let token = '';
const API = 'http://localhost:5000/api';

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const res = await fetch(`${API}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
        token = data.token;
        document.getElementById('login-status').textContent = 'Logged in';
        document.getElementById('goals').classList.remove('hidden');
        document.getElementById('ai').classList.remove('hidden');
        loadGoals();
    } else {
        document.getElementById('login-status').textContent = data.error || 'Login failed';
    }
}

async function createGoal() {
    const name = document.getElementById('goal-name').value;
    const targetAmount = document.getElementById('goal-amount').value;
    const dueDate = document.getElementById('goal-date').value;
    await fetch(`${API}/goals`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, targetAmount, dueDate })
    });
    loadGoals();
}

async function loadGoals() {
    const res = await fetch(`${API}/goals`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const goals = await res.json();
    const list = document.getElementById('goal-list');
    list.innerHTML = '';
    goals.forEach(g => {
        const li = document.createElement('li');
        li.textContent = `${g.name}: $${g.current_amount} / $${g.target_amount} by ${g.due_date}`;
        list.appendChild(li);
    });
}

async function loadPrediction() {
    const res = await fetch(`${API}/ai/prediction`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    document.getElementById('prediction').textContent = JSON.stringify(data, null, 2);
}
