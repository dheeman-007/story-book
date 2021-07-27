const express = require('express')
const passport = require('passport')
const router = express.Router()
var bodyParser = require('body-parser')
const { ensureAuth} = require('../middleware/auth')
router.use(bodyParser.urlencoded({ extended: false }))



router.get('/google',passport.authenticate('google', { scope: ['profile'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/dashboard');
  });

router.get('/logout',ensureAuth,(req,res) => {
    req.logout();
    res.redirect('/');
})

module.exports = router