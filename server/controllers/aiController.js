const fetch = global.fetch || require('node-fetch');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

async function forwardRequest(endpoint) {
    const res = await fetch(`${AI_SERVICE_URL}${endpoint}`);
    const data = await res.json();
    return { status: res.status, data };
}

exports.getSpendingPrediction = async (req, res) => {
    try {
        const { status, data } = await forwardRequest(`/api/ai/spending-prediction/${req.userId}`);
        res.status(status).json(data);
    } catch (error) {
        console.error('Error fetching spending prediction:', error);
        res.status(500).json({ error: 'Failed to contact AI service' });
    }
};

exports.getSavingsRecommendations = async (req, res) => {
    try {
        const { status, data } = await forwardRequest(`/api/ai/savings-recommendations/${req.userId}`);
        res.status(status).json(data);
    } catch (error) {
        console.error('Error fetching savings recommendations:', error);
        res.status(500).json({ error: 'Failed to contact AI service' });
    }
};

exports.getSpendingInsights = async (req, res) => {
    try {
        const { status, data } = await forwardRequest(`/api/ai/spending-insights/${req.userId}`);
        res.status(status).json(data);
    } catch (error) {
        console.error('Error fetching spending insights:', error);
        res.status(500).json({ error: 'Failed to contact AI service' });
    }
};
