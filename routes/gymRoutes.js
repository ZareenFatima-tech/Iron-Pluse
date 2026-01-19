const express = require('express');
const router = express.Router();
const { getGyms, createGym, updateGym, deleteGym } = require('../controllers/gymController');

// Middleware to protect admin routes could be added here
// For this demo, we assume the frontend handles role checks, but in production, verify JWT/Session here.

router.get('/', getGyms);
router.post('/', createGym);
router.put('/:id', updateGym);
router.delete('/:id', deleteGym);

module.exports = router;
