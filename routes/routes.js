const User = require('../models/user');

module.exports = function(app, passport){
    app.get('/', (req, res)=>{
        // res.send('Out first Express response');
        res.render('index.ejs')
        // console.log('Cookies', req.cookies);
        // console.log('session', req.session);
    })

    app.get('/signup', (req, res) => {
        res.render('signup.ejs', {message : req.flash('Normal Signup Page')});
    })

    app.post('/signup', passport.authenticate('local-strategy',{
        successRedirect : '/',
        failureRedirect : '/signup',
        failureFlash : true  
    }))

    app.get('/login', (req, res) => {
        res.render('login.ejs', {message : req.flash('Normal login Page')});        
    })

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile',
        failureRedirect : '/',
        failureFlash : true
    }))

    app.get('/profile', isLoggedIn, (req, res) => {
        res.render('profile.ejs', {user : req.user} )
        res.status(200).json({user: req.user});
    })

    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    })

    app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

    app.get('/auth/facebook/callback', passport.authenticate('facebook', { 
        successRedirect: '/profile',
        failureRedirect: '/' 
    }));

    // app.get('/auth/facebook/callback', passport.authenticate('facebook', {session : false}), 
    // function(req, res, next){
    //     res.status(200).json({
    //         message : profile
    //     })
    // })
}

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }

    res.redirect('/');
}