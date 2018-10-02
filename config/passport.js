var localStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user'); 
var configAuth = require('../config/auth');

module.exports = function(passport){

    passport.serializeUser(function(user, done){
        done(null, user.id);
    })

    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user);
        })
    })

    passport.use('local-strategy', new localStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true,

    }, function(req, email, password, done){
        process.nextTick(function(){
            User.findOne({'local.username': email}, function(err, user){
                    if(err){
                        throw err;
                    } 
                    
                    if(user) {
                        return done(null, false, req.flash('signupMessage','Email already exist'))
                    } else {
                        var newUser = new User();
                        newUser.local.username = email;
                        newUser.local.password = newUser.generateHash(password);

                        newUser.save(function(err){
                            if(err){
                                throw err;
                            } else {
                                return done(null, newUser);
                            }
                        })
                    }
            })
        })
    }))

    passport.use('local-login', new localStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },function(req, email, password, done){
        process.nextTick(function(){
            User.findOne({ 'local.username': email}, function(err, user){
                if(err)
                    return done(err);
                if(!user)
                    return done(null, false, req.flash('loginMessage', 'No User found'));
                if(!user.validPassword(password)){
                    return done(null, false, req.flash('loginMessage', 'inavalid password'));
                }
                return done(null, user);

            });
        });
    }));

    passport.use(new FacebookStrategy({
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL
    }, function(accessToken, refreshToken, profile, done) {
        process.nextTick(function(){
            User.findOne({'facebook.id': profile.id}, function(err, user){
                if(err)
                    return done(err);
                if(user){
                    console.log('------ Profile from FB -----------',profile);
                    alert(user);
                    return done(null, user);
                } else {
                    var newUser = new User();
                    console.log('------ Profile from FB -----------',profile);
                    newUser.facebook.id = profile.id;
                    newUser.facebook.token = accessToken;
                    newUser.facebook.name = profile.name;
                    newUser.facebook.email = profile.emails[0];
                    newUser.facebook.details = JSON.stringify(profile);
                    newUser.facebook.details1 = profile;

                    newUser.save(function(err){
                        if(err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            })
        })
    }));

}