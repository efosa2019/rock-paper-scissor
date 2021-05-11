const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const cors  = require("cors");
const passport = require("passport");

require('dotenv/config');

const User = require("./models/User")


const app = express();

//Middleware
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());
app.use(express.static("public"));
app.set("view engine","ejs");

app.use(session({
    secret:process.env.APP_SECRET,
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

const main = async() => {
    try{
        //Connect to Database
       await  mongoose.connect( process.env.DB_CONNECTION, {
            useNewUrlParser: true,
            useFindAndModify: true,
            useUnifiedTopology: true,
        });
       console.log("DATABASE CONNECTED..");
    }catch(err){
      console.log(`Unable to start server \n${err.message}`);
    }
};

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
});


app.get("/signup",async(req,res) => {
try{
 res.render("signup");
}catch(err){
    res.json({message:err});
}
});

app.post("/signup",async(req,res) => {
    try{
    User.register({username:req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/signup");
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/profile");
            })
        }
    })
}catch(err){
    res.json({message:err});
}
});


app.get("/login",async(req,res) => {
    try{
    res.render("login");
    }catch(err){
        res.json({message:err});
    }
})

app.post("/login",async(req,res) => {
    try{
    const user = new User({
        username:req.body.username,
        password:req.body.password
    });
    req.login(user,function(err){
        if(!err){
            passport.authenticate("local")(req,res,function(){
                res.redirect("/");
            })
        }
    })
     }catch(err){
        res.json({message:err});
    }
});

app.get("/",async(req,res) => {
    try{
    if(req.isAuthenticated()){
        res.render("play")
    }else{
        res.redirect("/login");
    }
  }catch(err){
    res.json({message:err});
}
});


app.post("/",async(req,res) => {
    try{
    const scoreData = Number(req.body.highScore);
    User.findById(req.user.id,function(err,foundUser){
        if(!err){
            foundUser.score = scoreData;
            foundUser.save();
        }
    });
}catch(err){
    res.json({message:err});
}
})

app.get("/profile",async(req,res) => {
    try{
    if(req.isAuthenticated()){
        User.findById(req.user.id,function(err,foundUser){
            if(!err){
                res.render("profile",{user:foundUser});
            }
        })
    }else{
        res.redirect("/login");
    }
}catch(err){
    res.json({message:err});
}
});

app.get("/profile/edit",async(req,res) => {
    try{
    if(req.isAuthenticated()){
        res.render("edit");
    }else{
        res.redirect("/login");
    }
  }catch(err){
    res.json({message:err});
}
});

app.post("/profile/edit",async(req,res) => {
    try{
    const editedBio = req.body.bioPara;
    User.findById(req.user.id,function(err,foundUser){
        if(!err){
            foundUser.bio = editedBio;
            foundUser.save(function(){
                res.redirect("/");
            });
        }
    });
}catch(err){
    res.json({message:err});
}
})

app.get("/rank",async(req,res) => {
    try{
    User.find({"score":{$ne:null}},function(err,result){
        if(!err){
            res.render("rank",{profile:result});
        }else{
            console.log(err);
        }
    });
}catch(err){
    res.json({message:err});
}
});

app.get("/logout",async(req,res) => {
    try{
    req.logout();
    res.redirect("/");
   }catch(err){
    res.json({message:err});
}
});


app.listen(5000,function(){
    console.log("Port started on 5000");
});

main();
