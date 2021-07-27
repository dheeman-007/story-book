const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
const ejs = require('ejs');
const methodOverride = require('method-override')
const connectDB = require('./config/db')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')
var bodyParser = require('body-parser')
const { ensureAuth } = require('./middleware/auth')
const Story = require('./models/Story')
const User = require('./models/User')

//load configure
dotenv.config({ path: './config/config.env' })

require('./config/passport')(passport)
connectDB()


const app = express()
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
// app.use(bodyParser.json())
app.set("view engine", "ejs")

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}))

app.use(passport.initialize())
app.use(passport.session())



app.use(express.static('public'))
//logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        let method = req.body._method
        delete req.body._method
        return method
    }
}))

app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

app.post('/stories', ensureAuth, (req, res) => {
    req.body.user = req.user._id
    const Story1 = new Story({
        title: req.body.title,
        body: req.body.Body,
        status: req.body.Status,
        user: req.body.user,
        username: req.user.displayName,
    })
    Story1.save()
    res.redirect('/dashboard')
})
app.get('/stories/public', ensureAuth, (req, res) => {

    Story.find({ status:'Public' }).sort({ createdAt: 'descending' }).exec((err, docs) => {
        if (err) {
            console.log(err)
        }

        else {
            const arr = [];

            for (let i = 0; i < docs.length; i++) {

                arr[i] = docs[i].body.slice(0, 70)
                arr[i] = arr[i].replace(/<(?:.|\n)*?>/gm, '');
                if (docs[i].body.length > 70) {
                    arr[i] = arr[i] + "...";
                }

            }
            console.log(docs)

            res.render('stories/index', {
                Stories: docs,
                body: arr,
            })

        }
    });
})
app.get("/stories/edit/:id", ensureAuth, (req, res) => {
    Story.find({ _id: req.params.id }, function (err, adv) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(adv)
            res.render('stories/edit', { adv: adv[0] })
        }
    })
})
app.put('/edit/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id).lean()

        if (!story) {
            return res.render('error/404')
        }
        else {
            console.log(req.body)
            story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
                new: true,
                runValidators: true,
                useFindAndModify:false
            })

            res.redirect('/dashboard')
        }
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})
app.get("/stories/delete/:id",ensureAuth,function(req,res){
    console.log(req.params.id)
    Story.findOneAndRemove({_id:req.params.id},function(err,docs){
        if(err){
            console.log(err)
        }
        else{
            res.redirect("/dashboard");
        }
    })
})
app.get("/stories/:id",ensureAuth,function(req,res){
    Story.findOne({_id:req.params.id}, function (err, docs) {
        if(err){
            console.log(err)
        }
        else{
            console.log(docs)
            res.render("stories/each_story",{docs:docs})
        }
    });

})
app.get("/stories/user/:id",ensureAuth,function(req,res){
    User.findOne({_id:req.params.id}, function (err, docs) {
        if(err){
            console.log(err)
        }
        else{
            Story.find({user:req.params.id,status:"Public"},function(err,dom){
                if(err){
                    console.log(err);
                }
                else{
                    console.log(docs)
                    console.log(dom)
                    res.render("Users/user",{docs:docs,dom:dom})
                }
            })
        }
    });
})

let port=process.env.PORT;
if(port==null || port==""){
    port=3000;
}

app.listen(port, function () {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
})
