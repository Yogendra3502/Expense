const  mongoose  = require("mongoose");

const expenseModel = new mongoose.Schema({
    amount: Number,
    remarks: String,
    category: String,
    paymentmode: {
      type:String,
      enum: ['cash', 'online', 'check']
    },
    date: {type:Date, default:Date.now()},
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }]
},{timestamps:true});

module.exports = mongoose.model("expense", expenseModel);