const mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var userSchema = mongoose.Schema({
    local : {
        username : String,
        password : String
    },
    facebook : {
        id : String,
        token : String,
        name : String,
        email : String,
        details: String
    },
    google : {
        id : String,
        token : String,
        name : String,
        email : String,
    }
})

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
}

userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.local.password);
}

module.exports = mongoose.model('User', userSchema);