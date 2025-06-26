const { promiseDb } = require('../config/db');

class Budget {
    static async create(userId, category, budgetedAmount, month, year) {
        const [result] = await promiseDb.query(
            'INSERT INTO budgets (user_id, category, budgeted_amount, month, year) VALUES (?, ?, ?, ?, ?)',
            [userId, category, budgetedAmount, month, year]
        );
        return result;
    }

    static async findByUserId(userId) {
        const [budgets] = await promiseDb.query(
            'SELECT * FROM budgets WHERE user_id = ? ORDER BY year DESC, month DESC',
            [userId]
        );
        return budgets;
    }

    static async findByUserAndMonth(userId, month, year) {
        const [budgets] = await promiseDb.query(
            'SELECT * FROM budgets WHERE user_id = ? AND month = ? AND year = ?',
            [userId, month, year]
        );
        return budgets;
    }

    static async update(id, userId, budgetedAmount) {
        const [result] = await promiseDb.query(
            'UPDATE budgets SET budgeted_amount = ? WHERE id = ? AND user_id = ?',
            [budgetedAmount, id, userId]
        );
        return result;
    }

    static async delete(id, userId) {
        const [result] = await promiseDb.query(
            'DELETE FROM budgets WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        return result;
    }

    static async updateActualAmount(userId, category, month, year, actualAmount) {
        const [result] = await promiseDb.query(
            'UPDATE budgets SET actual_amount = ? WHERE user_id = ? AND category = ? AND month = ? AND year = ?',
            [actualAmount, userId, category, month, year]
        );
        return result;
    }
}

module.exports = Budget;
