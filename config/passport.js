var localStrategy = require('passport-local').Strategy;

var User = require('../models/user'); 

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
                        newUser.local.password = password;

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
    }
    
    ))

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
                if(user.local.password != password){
                    return done(null, false, req.flash('loginMessage', 'inavalid password'));
                }
                return done(null, user);

            });
        });
    }));

}