const Budget = require('../models/Budget');

exports.createBudget = async (req, res) => {
    try {
        const { category, budgetedAmount, month, year } = req.body;
        const userId = req.userId;

        if (!category || !budgetedAmount || !month || !year) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const result = await Budget.create(userId, category, budgetedAmount, month, year);
        res.status(201).json({ 
            message: 'Budget created successfully',
            budgetId: result.insertId 
        });
    } catch (error) {
        console.error('Create budget error:', error);
        res.status(500).json({ error: 'Failed to create budget' });
    }
};

exports.getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.findByUserId(req.userId);
        res.json(budgets);
    } catch (error) {
        console.error('Get budgets error:', error);
        res.status(500).json({ error: 'Failed to get budgets' });
    }
};

exports.getBudgetsByMonth = async (req, res) => {
    try {
        const { month, year } = req.query;
        const budgets = await Budget.findByUserAndMonth(req.userId, month, year);
        res.json(budgets);
    } catch (error) {
        console.error('Get budgets by month error:', error);
        res.status(500).json({ error: 'Failed to get budgets' });
    }
};

exports.updateBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const { budgetedAmount } = req.body;
        const userId = req.userId;

        await Budget.update(id, userId, budgetedAmount);
        res.json({ message: 'Budget updated successfully' });
    } catch (error) {
        console.error('Update budget error:', error);
        res.status(500).json({ error: 'Failed to update budget' });
    }
};

exports.deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const result = await Budget.delete(id, userId);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Budget not found' });
        }

        res.json({ message: 'Budget deleted successfully' });
    } catch (error) {
        console.error('Delete budget error:', error);
        res.status(500).json({ error: 'Failed to delete budget' });
    }
};
