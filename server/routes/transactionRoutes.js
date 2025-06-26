const express = require('express');
const {
    createTransaction,
    getTransactions,
    updateTransaction,
    deleteTransaction,
    getTransactionSummary
} = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// All routes are protected
router.use(authMiddleware);

router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/summary', getTransactionSummary);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
