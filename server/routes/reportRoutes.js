const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { downloadReport } = require('../controllers/reportController');

router.use(authenticate);

router.get('/assessment/:assessmentId', downloadReport);

module.exports = router;
