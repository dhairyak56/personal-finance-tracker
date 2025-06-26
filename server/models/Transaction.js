const { promiseDb } = require('../config/db');

class Transaction {
    static async create(userId, amount, category, date, description) {
        try {
            const [result] = await promiseDb.query(
                'INSERT INTO transactions (user_id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)',
                [userId, amount, category, date, description]
            );
            return result;
        } catch (error) {
            console.error('Database error in Transaction.create:', error);
            throw error;
        }
    }

    static async findByUserId(userId) {
        try {
            const [transactions] = await promiseDb.query(
                'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC',
                [userId]
            );
            return transactions;
        } catch (error) {
            console.error('Database error in Transaction.findByUserId:', error);
            throw error;
        }
    }

    static async findById(id, userId) {
        try {
            const [transactions] = await promiseDb.query(
                'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
                [id, userId]
            );
            return transactions[0];
        } catch (error) {
            console.error('Database error in Transaction.findById:', error);
            throw error;
        }
    }

    static async update(id, userId, amount, category, date, description) {
        try {
            const [result] = await promiseDb.query(
                'UPDATE transactions SET amount = ?, category = ?, date = ?, description = ? WHERE id = ? AND user_id = ?',
                [amount, category, date, description, id, userId]
            );
            return result;
        } catch (error) {
            console.error('Database error in Transaction.update:', error);
            throw error;
        }
    }

    static async delete(id, userId) {
        try {
            const [result] = await promiseDb.query(
                'DELETE FROM transactions WHERE id = ? AND user_id = ?',
                [id, userId]
            );
            return result;
        } catch (error) {
            console.error('Database error in Transaction.delete:', error);
            throw error;
        }
    }

    static async getMonthlySpending(userId, year, month) {
        try {
            const [result] = await promiseDb.query(
                'SELECT category, SUM(amount) as total FROM transactions WHERE user_id = ? AND YEAR(date) = ? AND MONTH(date) = ? GROUP BY category',
                [userId, year, month]
            );
            return result;
        } catch (error) {
            console.error('Database error in Transaction.getMonthlySpending:', error);
            throw error;
        }
    }

    static async getTotalSpending(userId) {
        try {
            const [result] = await promiseDb.query(
                'SELECT SUM(amount) as total FROM transactions WHERE user_id = ?',
                [userId]
            );
            return result[0].total || 0;
        } catch (error) {
            console.error('Database error in Transaction.getTotalSpending:', error);
            throw error;
        }
    }
}

module.exports = Transaction;
