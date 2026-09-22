const express = require('express');
const router = express.Router();

// Used by the ALB target group / Kubernetes liveness & readiness probes
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: process.env.SERVICE_NAME || 'unknown' });
});

module.exports = router;
