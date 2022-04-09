const express = require('express');
const challengesController = require('../controllers/challenges');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', challengesController.getChallenges)
router.post('/', challengesController.createChallenge)
router.post('/validate', [isAuth], challengesController.validateCode)

module.exports = router;