var express = require('express');
var router = express.Router();
const userModel = require("./users.js")
const postModel = require("./post.js");
const passport = require('passport');
const upload = require("./multer.js")
// this two lines of code help us to login the user
const localStrategy = require("passport-local")
passport.use(new localStrategy(userModel.authenticate()))
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/profile",isLoggedIn,async (req,res)=>{
  const user = await userModel.findOne({
    username: req.session.passport.user  // jab tak hum login hai tab tak session m1e username save rahta hai 
    
  }).populate("posts")
  console.log(user)
  res.render("Profile",{user})
})

router.get("/login",function(req,res){
  res.render('login',{error:req.flash("error")})
})
router.get("/feed",function(req,res){
  res.render("feed")
})

// must read
router.post("/upload",isLoggedIn,upload.single("file"),async function(req,res){
  if(!req.file){
   return res.status(400).send("No files were given")
  }
  //res.send("File uploaded successfully")
  // file jo upload hui hai save kro post ko postid do 
  const user =await userModel.findOne({username:req.session.passport.user})
  const post = await postModel.create({
    image:req.file.filename,
    postText:req.body.filecaption,
    user: user._id,
  })
   user.posts.push(post._id)
   user.save()
   res.redirect("/profile")
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
  failureRedirect: "/login",
  failureFlash:true
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
