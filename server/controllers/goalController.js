const Goal = require('../models/Goal');

exports.createGoal = async (req, res) => {
    try {
        const { name, targetAmount, dueDate } = req.body;
        const userId = req.userId;
        const result = await Goal.create(userId, name, targetAmount, 0, dueDate);
        res.status(201).json({ message: 'Goal created', goalId: result.insertId });
    } catch (error) {
        console.error('Create goal error:', error);
        res.status(500).json({ error: 'Failed to create goal' });
    }
};

exports.getGoals = async (req, res) => {
    try {
        const goals = await Goal.findByUserId(req.userId);
        res.json(goals);
    } catch (error) {
        console.error('Get goals error:', error);
        res.status(500).json({ error: 'Failed to get goals' });
    }
};

exports.updateGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const fields = req.body;
        await Goal.update(id, req.userId, fields);
        res.json({ message: 'Goal updated' });
    } catch (error) {
        console.error('Update goal error:', error);
        res.status(500).json({ error: 'Failed to update goal' });
    }
};

exports.deleteGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Goal.delete(id, req.userId);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Goal not found' });
        }
        res.json({ message: 'Goal deleted' });
    } catch (error) {
        console.error('Delete goal error:', error);
        res.status(500).json({ error: 'Failed to delete goal' });
    }
};
