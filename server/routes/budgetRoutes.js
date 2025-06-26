const express = require('express');
const {
    createBudget,
    getBudgets,
    getBudgetsByMonth,
    updateBudget,
    deleteBudget
} = require('../controllers/budgetController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// All routes are protected
router.use(authMiddleware);

router.post('/', createBudget);
router.get('/', getBudgets);
router.get('/monthly', getBudgetsByMonth);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
