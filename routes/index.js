const express = require('express')
// const ejs = require('ejs')
const router = express.Router()
const { ensureAuth,ensureGuest } = require('../middleware/auth')

const Story = require('../models/Story')

// router.set("view-engine","ejs")

router.get('/', ensureGuest, (req,res) => {
    res.render('login')
})

router.get('/dashboard', ensureAuth, (req,res) => {
    Story.find({ user: req.user._id}, function (err, stories) {
        if(err) {
            console.log(err) 
            res.render('error/500')
        }
        else
        {
           
            res.render('main',{
                name: req.user.firstName,
                stories: stories
            })
        }


    });

   
})

module.exports = router