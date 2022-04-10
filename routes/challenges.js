const express = require('express');
const challengesController = require('../controllers/challenges');
const getAuth = require('../middleware/get-auth');
const isAdmin = require('../middleware/is-admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', [getAuth], challengesController.getChallenges)
router.post('/', [isAuth, isAdmin], challengesController.createChallenge)
router.post('/validate', [isAuth], challengesController.validateCode)
router.post('/generate', [isAuth, isAdmin], challengesController.generateCodes)
router.post('/createtextcode', [isAuth, isAdmin], challengesController.createTextCode)
router.get('/userchallenges', [isAuth], challengesController.getUserChallenges)
router.get('/userpoints', [isAuth], challengesController.getUserPoints)
router.post('/challengecodes', [isAuth, isAdmin], challengesController.getChallengeCodes)

module.exports = router;