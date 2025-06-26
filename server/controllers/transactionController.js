const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

exports.createTransaction = async (req, res) => {
    try {
        const { amount, category, date, description } = req.body;
        const userId = req.userId;

        console.log('Creating transaction:', { amount, category, date, description, userId }); // Add logging

        if (!amount || !category || !date) {
            return res.status(400).json({ error: 'Amount, category, and date are required' });
        }

        const result = await Transaction.create(userId, amount, category, date, description || '');
        
        console.log('Transaction created:', result); // Add logging

        // Update budget actual amount if exists
        const transactionDate = new Date(date);
        const month = transactionDate.getMonth() + 1;
        const year = transactionDate.getFullYear();
        
        const monthlySpending = await Transaction.getMonthlySpending(userId, year, month);
        const categorySpending = monthlySpending.find(s => s.category === category);
        
        if (categorySpending) {
            await Budget.updateActualAmount(userId, category, month, year, categorySpending.total);
        }

        res.status(201).json({ 
            message: 'Transaction created successfully',
            transactionId: result.insertId 
        });
    } catch (error) {
        console.error('Create transaction error details:', error); // More detailed error logging
        res.status(500).json({ error: 'Failed to create transaction', details: error.message });
    }
};


exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findByUserId(req.userId);
        res.json(transactions);
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Failed to get transactions' });
    }
};

exports.updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, category, date, description } = req.body;
        const userId = req.userId;

        const existingTransaction = await Transaction.findById(id, userId);
        if (!existingTransaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        await Transaction.update(id, userId, amount, category, date, description);
        res.json({ message: 'Transaction updated successfully' });
    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({ error: 'Failed to update transaction' });
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const result = await Transaction.delete(id, userId);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({ error: 'Failed to delete transaction' });
    }
};

exports.getTransactionSummary = async (req, res) => {
    try {
        const userId = req.userId;
        const { year, month } = req.query;

        const monthlySpending = await Transaction.getMonthlySpending(userId, year, month);
        const totalSpending = await Transaction.getTotalSpending(userId);

        res.json({
            monthlySpending,
            totalSpending
        });
    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({ error: 'Failed to get transaction summary' });
    }
};
