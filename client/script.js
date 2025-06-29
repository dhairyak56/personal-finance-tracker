let token = '';
const API = 'http://localhost:5000/api';
let chart;

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
        document.getElementById('dashboard').classList.remove('d-none');
        loadData();
    } else {
        document.getElementById('login-status').textContent = data.error || 'Login failed';
    }
}

async function createTransaction() {
    const amount = document.getElementById('trans-amount').value;
    const category = document.getElementById('trans-category').value;
    const date = document.getElementById('trans-date').value;
    const description = document.getElementById('trans-desc').value;
    await fetch(`${API}/transactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, category, date, description })
    });
    await loadTransactions();
    await loadSummary();
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
    await loadGoals();
}

async function loadTransactions() {
    const res = await fetch(`${API}/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const transactions = await res.json();
    const tbody = document.querySelector('#transaction-table tbody');
    tbody.innerHTML = '';
    transactions.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${t.date}</td><td>${t.category}</td><td>$${t.amount}</td><td>${t.description}</td>`;
        tbody.appendChild(tr);
    });
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
        li.className = 'list-group-item';
        li.textContent = `${g.name}: $${g.current_amount} / $${g.target_amount} by ${g.due_date}`;
        list.appendChild(li);
    });
}

async function loadSummary() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const res = await fetch(`${API}/transactions/summary?year=${year}&month=${month}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    const categories = data.monthlySpending.map(s => s.category);
    const totals = data.monthlySpending.map(s => s.total);
    if (chart) chart.destroy();
    const ctx = document.getElementById('spending-chart');
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{ label: 'Amount', data: totals, backgroundColor: '#0d6efd' }]
        },
        options: {
            scales: { y: { beginAtZero: true } }
        }
    });
}

async function loadPrediction() {
    const res = await fetch(`${API}/ai/prediction`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    document.getElementById('prediction').textContent = JSON.stringify(data, null, 2);
}

async function loadData() {
    await Promise.all([loadTransactions(), loadGoals(), loadSummary()]);
}
