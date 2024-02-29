var express = require('express');
var router = express.Router();
const userModel = require("./users.js")
const postModel = require("./post.js");
const passport = require('passport');
// this two lines of code help us to login the user
const localStrategy = require("passport-local")
passport.use(new localStrategy(userModel.authenticate()))
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/profile",isLoggedIn,(req,res)=>{
  res.render("Profile")
})
router.get("/login",function(req,res){
  res.render('login')
})
router.get("/feed",function(req,res){
  res.render("feed")
})
router.post("/register",function(req,res){
  let {username,email,fullName} = req.body;
  console.log(username,email,fullName)
  let userdata = new userModel({username,email,fullName})
  userModel.register(userdata,req.body.password).then(()=>{
    passport.authenticate("local")(req,res,function(){
      res.redirect("/profile")
    })
  })
})

router.post("/login",passport.authenticate("local",{
  successRedirect: "/profile",
  failureRedirect: "/login"
}),function(req,res){})

router.get("/logout",function(req,res,next){
  req.logout(function(err){
    if(err){
      return next(err)
    }
    res.redirect("/")
  })
})

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login")
}

module.exports = router;
