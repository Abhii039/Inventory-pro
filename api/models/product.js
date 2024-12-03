const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    partType: { type: String },
    partDescription: { type: String },
    productInfo: { type: String },
    color: { type: String, required: true },
    quantity: { type: Number, required: true },
    partNumber: { type: String, required: true, unique: true },
    singlePrice: { type: Number },
    bulkPrice: { type: Number },
});

module.exports = mongoose.model('Product', ProductSchema);
