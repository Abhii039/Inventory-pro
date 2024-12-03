const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    customerName:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    no_of_order:{
        type:Number,
        required:false,
        default: 0
    }
},
{timestamps:true});

module.exports = mongoose.model("Customer",customerSchema);