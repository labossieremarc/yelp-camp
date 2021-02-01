const express = require('express')
const router = express.Router();
const passport = require('passport')
const wrapAsync = require('../utilities/catchAsync')
const users = require('../controllers/users')

router.route('/register')
    .get(users.renderRegister)
    .post(wrapAsync(users.postRegister))

router.route('/login')
        .get(users.renderLogin)
        .post(passport.authenticate('local',
    { failureFlash: true, failureRedirect: '/login' }), users.postLogin)

router.get('/logout', users.logout)

module.exports = router;