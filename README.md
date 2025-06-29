# Personal-Finance-Tracker

![Finance Tracker Demo](finance.jpeg)

# About

Personal Finance Tracker is a full-stack application combining a Node.js/Express REST API, a Python/Flask AI microservice, and a static front-end, enabling users to track expenses, manage budgets, and gain AI-powered spending insights.

## Table of Contents

* [Key Features](#key-features)
* [Technologies Used](#technologies-used)
* [Installation](#installation)
* [Configuration](#configuration)
* [Running the App](#running-the-app)
* [Project Structure](#project-structure)
* [License](#license)

## Key Features

* **User Authentication**: Secure user registration and login with JWT-protected routes.
* **Transaction Management**: Create, read, update, and delete transactions; automatic budget adjustments.
* **Budget Tracking**: Set monthly budgets and compare actual vs. planned spending.
* **Spending Summaries**: View monthly totals and category breakdowns.
* **AI-Powered Insights**: 30-day spending forecasts, anomaly detection, and personalized saving tips.
* **Integrated AI Endpoints**: Express server proxies the Flask AI microservice, providing predictions and recommendations under `/api/ai`.
* **Savings Goals**: Set personal savings goals and track progress over time.
* **Front-End Dashboard**: Modern Bootstrap UI with interactive charts.

## Technologies Used

* **Node.js & Express**: REST API server.
* **Python & Flask**: AI microservice leveraging Pandas, NumPy, Prophet, and Scikit-Learn.
* **MySQL**: Relational database via `mysql2`.
* **JWT**: JSON Web Tokens for authentication.
* **dotenv**: Environment variable management.
* **HTML/CSS/JavaScript (Bootstrap 5, Chart.js)**: Static front-end.
* **npm & pip**: Dependency management.

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/dhairyak56/personal-finance-tracker.git
   cd personal-finance-tracker
   ```
2. **Install back-end dependencies**

   ```bash
   npm install
   ```
3. **Install AI service dependencies**

   ```bash
   cd ai-service
   pip install -r requirements.txt
   cd ..
   ```
4. **Prepare front-end (no extra dependencies)**
   The client is static HTML/CSS/JS.

## Configuration

Create a `.env` file in the project root and in `ai-service/`:

```ini
# Root .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=finance_tracker
JWT_SECRET=your_jwt_secret
PORT=5000
AI_SERVICE_URL=http://localhost:8000

# ai-service/.env
PORT=8000
```

## Running the App

1. **Start the API server**

   ```bash
   npm run start:server
   # or
   node server/server.js
   ```

   Runs at `http://localhost:5000`
2. **Start the AI microservice**

   ```bash
   cd ai-service
   python app.py
   ```

   Runs at `http://localhost:8000`
   The Express API will proxy these features under `/api/ai`.
3. **Serve the front-end**
   Use any static server, e.g.:

   ```bash
   npx http-server client -p 3000
   ```

   Open `http://localhost:3000`.

## Development Scripts

- **Run tests**:

  ```bash
  npm test
  ```

- **Run ESLint**:

  ```bash
  npm run lint
  ```

## Project Structure

```
personal-finance-tracker/
├── ai-service/        # Flask microservice for AI insights
├── server/            # Express REST API server
├── client/            # Static front-end assets
├── .env               # Environment variables (gitignored)
├── package.json       # Node.js dependencies & scripts
└── README.md          # This file
```

## API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST   | `/api/users/register` | Register a new user |
| POST   | `/api/users/login` | User login |
| GET    | `/api/transactions` | List user transactions |
| GET    | `/api/budgets` | List budgets |
| GET    | `/api/ai/prediction` | AI spending prediction |
| GET    | `/api/goals` | List savings goals |


