const mongoose = require('mongoose');
const  passportLocalMongoose = require("passport-local-mongoose");


const userSchema = new mongoose.Schema({
    username:{type:String,trim:true,default:''},
    password:{type:String,default:''},
    bio:{type:String,default:''},
    score:{type:Number,default:0},
    date:{type:Date,default: Date.now},
});

userSchema.plugin(passportLocalMongoose);

module.exports  = mongoose.model('users',userSchema);


