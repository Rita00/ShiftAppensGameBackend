const express = require('express');
const challengesController = require('../controllers/challenges');
const isAdmin = require('../middleware/is-admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', challengesController.getChallenges)
router.post('/', challengesController.createChallenge)
router.post('/validate', [isAuth], challengesController.validateCode)
router.post('/generate', [isAuth, isAdmin], challengesController.generateCodes)
router.post('/userChallenges', [isAuth], challengesController.getUserChallenges)

module.exports = router;