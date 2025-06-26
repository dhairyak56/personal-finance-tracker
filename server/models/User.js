const { promiseDb } = require('../config/db');
const bcrypt = require('bcrypt');

class User {
    static async create(username, password, email) {
        try {
            const password_hash = await bcrypt.hash(password, 10);
            const [result] = await promiseDb.query(
                'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
                [username, password_hash, email]
            );
            return result;
        } catch (error) {
            console.error('Database error in User.create:', error);
            throw error;
        }
    }

    static async findByUsername(username) {
        try {
            const [users] = await promiseDb.query(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );
            return users[0];
        } catch (error) {
            console.error('Database error in User.findByUsername:', error);
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            const [users] = await promiseDb.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            return users[0];
        } catch (error) {
            console.error('Database error in User.findByEmail:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [users] = await promiseDb.query(
                'SELECT id, username, email FROM users WHERE id = ?',
                [id]
            );
            return users[0];
        } catch (error) {
            console.error('Database error in User.findById:', error);
            throw error;
        }
    }

    static async verifyPassword(password, password_hash) {
        return await bcrypt.compare(password, password_hash);
    }
}

module.exports = User;
