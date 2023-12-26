const  route  = require('../app');
var express = require('express');
var router = express.Router();
const userModel = require("./users");
const expenseModel = require('./expense')
const localStrategy = require('passport-local');
const passport = require('passport');
passport.use(new localStrategy(userModel.authenticate()));
const {sendMail} = require("../utils/sendmail")

router.get('/', function(req, res, next) {
  res.render('index', { Yogendra: req.user });
});

router.post('/register', (req, res, next)=>{
  let data = new userModel({
    username: req.body.username,
    email: req.body.email,
    secret: req.body.secret
  });
  userModel.register(data, req.body.password)
  .then(function(){
    passport.authenticate("local")(req, res, function(){
      res.redirect('/profile')
    })
  })
});

router.get('/profile', isLoggedIn, async function(req, res, next) {
  try {
    let {expense} = await req.user.populate('expense')
  res.render('profile', { expense, Yogendra: req.user  });
    
  } catch (error) {
    res.send(error)
  }

});

router.get('/login', function(req, res, next) {
  res.render('login', { Yogendra: req.user  });
});
router.post('/login', passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login"
}), function(req, res, next) {});

router.get('/logout', (req, res,next)=>{
  req.logout(function(err){
    if(err){return(err);}
    res.redirect('/login')
  })
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/')
};

router.get('/forget', function(req, res, next) {
  res.render('forget', { Yogendra: req.user  });
});


router.post("/forget/:id",async function(req,res,next){
  try {
    const user = await userModel.findById( req.params.id );
    if (!user)
        return res.send("User not found! <a href='/forget'>Try Again</a>.");
        if (user.token == req.body.token) {
          user.token = -1;
          await user.setPassword(req.body.newpassword);
          await user.save();
          res.redirect("/login");
          console.log(req.body.token);
      } else {
          user.token = -1;
          await user.save();
          res.send("Invalid Token! <a href='/forget'>Try Again<a/>");
      }
  }catch(error){
    res.send(error)
  }
});
router.get('/reset', isLoggedIn, function(req, res, next) {
  res.render('reset',{Yogendra: req.user });
});

router.post('/reset', isLoggedIn, async function(req, res, next){
  try {
    await req.user.changePassword(
      req.body.oldpassword,
      req.body.newpassword,
    )
    await req.user.save();
    res.redirect('/profile')
  } catch (error) {
    res.send(error)
  }
})

router.get('/createexpense', isLoggedIn, function(req, res, next) {
  res.render('createexpense', {Yogendra: req.user  });
});

router.post('/createexpense',isLoggedIn, async function(req, res, next){
  try {
    const data = await userModel.findOne({_id: req.user._id})

    const addNew = await expenseModel.create({
      amount: req.body.amount,
      remarks: req.body.remarks,
      category: req.body.category,
      paymentmode: req.body.paymentmode,
      user:data._id
    });

    data.expense.push(addNew._id)
    await data.save();
    await addNew.save();
    res.redirect('/profile')
  } catch (error) {
    res.send(error)
  }
});

router.get('/filter',isLoggedIn, async function(req, res, next){
  try {
    let {expense} = await req.user.populate("expense")
    expense = expense.filter((e) => e[req.query.key] === req.query.value )
    res.render('profile',{expense,Yogendra: req.user })
  } catch (error) {
    res.send(error)
  }
} );

router.get('/delete/:id', isLoggedIn,async function(req, res, next){
  try {
    await expenseModel.findByIdAndDelete(req.params.id)
    res.redirect('/profile')
  } catch (error) {
    res.send(error)
  }
});

router.get('/update/:id',isLoggedIn, async function(req, res, next){
  try {
    const data = await expenseModel.findById(req.params.id)
    res.render('update',{ Yogendra: req.user, data  })
  } catch (error) {
    res.send(error)
  }
});

router.post('/update/:id',isLoggedIn,async function(req, res, next){
  try {
    const data = await expenseModel.findByIdAndUpdate(req.params.id, req.body)
    await data.save()
    res.redirect('/profile')
  } catch (error) {
    
  }
})

router.post('/sendmail', async function(req, res, next) {
  try {
    const user = await userModel.findOne({email: req.body.email});
    if(!user)
      return res.send("User not found! <a href='/forget'>Try Again</a>.");
    sendMail(user.email, user, res, req)
  } catch (error) {
    console.log(error);
    res.send(error)
  }
});

module.exports = router;