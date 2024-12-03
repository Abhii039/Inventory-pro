const Customer = require("../models/customer.js");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const SECRET_KEY = "CUSTOMERAPI";

async function signup(req, res) {
    const { customerName, email, password } = req.body;
    try {

        const existingCustomer = await Customer.findOne({ email: email , customerName: customerName });
        if (existingCustomer) {
            return res.status(400).json("Customer Already Existed");
        }

        const hassedPassword = await bcrypt.hash(password, 10);
        const finalCust = new Customer({
            customerName: customerName,
            email: email,
            password: hassedPassword
        })
        const cust = await finalCust.save();

        const token = jwt.sign({email:finalCust.email, id : finalCust._id} , SECRET_KEY)
        res.status(200).json({user : finalCust,token: token});
        
    } catch (err) {
        console.log(err);
        res.status(500).json("Something went wrong.");
    }
}

async function signin(req,res){
    const {email,password} = req.body;
    try{
        const existingCustomer = await Customer.findOne({ email: email});
        if (!existingCustomer) {
            return res.status(404).json("User does not existed.");
        }
        const matchPassword = await bcrypt.compare(password , existingCustomer.password);

        if(!matchPassword){
            return res.status(400).json("User name or password is wrong");
        }
        const token = jwt.sign({email:existingCustomer.email, id : existingCustomer._id} , SECRET_KEY)
        res.status(200).json({user : existingCustomer,token: token});

        }
        catch(err){
            console.log(err);
            res.status(500).json("Something went wrong.");
    
        }
    }
    



module.exports = {signup , signin};