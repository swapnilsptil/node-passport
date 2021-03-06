var localStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

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
                    } 
                    if(!req.user){
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
                    } else {
                        var user = req.user;
                        user.local.username = email;
                        user.local.password = user.generateHash(password);

                        user.save(function(err){
                            if(err)
                                throw err;

                            return done(null, user);
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
            callbackURL: configAuth.facebookAuth.callbackURL,
            passReqToCallback: true,
            profileFields: ['id', 'emails', 'name']
    }, function(req, accessToken, refreshToken, profile, done) {
        process.nextTick(function(){
            //  User is not logged
            if(!req.user){
                User.findOne({'facebook.id': profile.id}, function(err, user){
                    if(err)
                        return done(err);
                    if(user){
                        console.log('------ Profile from FB -----------',profile);
                        return done(null, user);
                    } else {
                        var newUser = new User();
                        console.log('------ Profile from FB -----------',profile);
                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = accessToken;
                        newUser.facebook.name = profile._json.first_name + ' ' + profile._json.last_name;
                        newUser.facebook.email = profile.emails[0].value;
                        // newUser.facebook.profileUrl = profile.profileUrl;
                        // newUser.facebook.gender = profile.gender;
                        // newUser.facebook.displayName = profile.displayName;
                        
                        newUser.save(function(err){
                            if(err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                })
            } 
            // User is already logged in with other strategy , need to merge
            else {
                var user = req.user;
                user.facebook.id = profile.id;
                user.facebook.token = accessToken;
                user.facebook.name = profile._json.first_name + ' ' + profile._json.last_name;
                user.facebook.email = profile.emails[0].value;

                user.save(function(err){
                    if(err)
                        throw err;

                    return done(null, user);
                })

            }
        })
    }));

    passport.use(new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL,
        passReqToCallback: true
    }, function(req, accessToken, refreshToken, profile, done) {
        process.nextTick(function(){
            if(!req.user){
                User.findOne({'google.id': profile.id}, function(err, user){
                    if(err)
                        return done(err);
                    if(user){
                        console.log('------ Profile from Google , User found -----------',profile);
                        return done(null, user);
                    } else {
                        var newUser = new User();
                        console.log('------ Profile from Google , New User -----------',profile);
                        newUser.google.id = profile.id;
                        newUser.google.token = accessToken;
                        newUser.google.name = profile.displayName;
                        newUser.google.email = profile.emails[0].value;
                        // newUser.facebook.profileUrl = profile.profileUrl;
                        // newUser.facebook.gender = profile.gender;
                        // newUser.facebook.displayName = profile.displayName;
                        
                        newUser.save(function(err){
                            if(err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                })
            } else {
                var user = req.user;
                user.google.id = profile.id;
                user.google.token = accessToken;
                user.google.name = profile.displayName;
                user.google.email = profile.emails[0].value;

                user.save(function(err){
                    if(err)
                        throw err;

                    return done(null, user);
                })
            }
        })
    }));

}