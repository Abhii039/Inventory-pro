const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number,
    priceType: {
      type: String,
      enum: ['single', 'bulk']
    },
    price: Number,
    subtotal: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);