const { promiseDb } = require('../config/db');

class Goal {
    static async create(userId, name, targetAmount, currentAmount, dueDate) {
        const [result] = await promiseDb.query(
            'INSERT INTO goals (user_id, name, target_amount, current_amount, due_date) VALUES (?, ?, ?, ?, ?)',
            [userId, name, targetAmount, currentAmount, dueDate]
        );
        return result;
    }

    static async findByUserId(userId) {
        const [goals] = await promiseDb.query(
            'SELECT * FROM goals WHERE user_id = ? ORDER BY due_date',
            [userId]
        );
        return goals;
    }

    static async update(id, userId, fields) {
        const updates = [];
        const values = [];
        if (fields.name !== undefined) { updates.push('name = ?'); values.push(fields.name); }
        if (fields.targetAmount !== undefined) { updates.push('target_amount = ?'); values.push(fields.targetAmount); }
        if (fields.currentAmount !== undefined) { updates.push('current_amount = ?'); values.push(fields.currentAmount); }
        if (fields.dueDate !== undefined) { updates.push('due_date = ?'); values.push(fields.dueDate); }
        values.push(id, userId);
        const [result] = await promiseDb.query(
            `UPDATE goals SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
            values
        );
        return result;
    }

    static async delete(id, userId) {
        const [result] = await promiseDb.query(
            'DELETE FROM goals WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        return result;
    }
}

module.exports = Goal;
