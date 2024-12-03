const express = require('express');
const {signup , signin} = require('../controllers/CustomerController');
const customerRouter = express.Router();


customerRouter.post("/signup",signup);

customerRouter.post("/signin",signin);
customerRouter.put("/update", async (req, res) => {
    try {
        const { username } = req.body;
        const userId = req.user.id; // From auth middleware

        const updatedUser = await Customer.findByIdAndUpdate(
            userId,
            { username },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ 
            success: true, 
            message: "Username updated successfully",
            user: {
                username: updatedUser.username
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating username" });
    }
} );


customerRouter.post("/logout",  (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.json({ success: true, message: 'Logged out successfully' });
    });
});


module.exports = customerRouter;