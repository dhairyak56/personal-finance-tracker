const express = require('express');
const { getSpendingPrediction, getSavingsRecommendations, getSpendingInsights } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/prediction', getSpendingPrediction);
router.get('/recommendations', getSavingsRecommendations);
router.get('/insights', getSpendingInsights);

module.exports = router;
