const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://0.0.0.0/student-info").then(()=>console.log("hyyyy"));

const userModel = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  token:{
    type:Number,
    default:-1
  },
  expense: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "expense"
  }]
});

userModel.plugin(plm);

module.exports = mongoose.model("users", userModel)