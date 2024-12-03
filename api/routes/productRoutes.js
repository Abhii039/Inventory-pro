const express = require('express');
const Product = require('../models/Product');
const productRouter = express.Router();

productRouter.get("/getProducts", async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

productRouter.post("/addProduct", async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({ message: 'Product added successfully', product });
      } catch (error) {
        if (error.code === 11000) { // Duplicate key error
          return res.status(400).json({ message: 'Part number already exists' });
        }
        res.status(400).json({ message: error.message });
      }
});

productRouter.post("/import", async (req, res) => {
    try {
        const products = req.body;
        let importedCount = 0;
        let errors = [];
    
        for (const [index, product] of products.entries()) {
          try {
            // Validate required fields
            if (!product.partNumber || !product.partType || !product.color) {
              errors.push(`Row ${index + 1}: Missing required fields`);
              continue;
            }
    
            // Check for duplicate part number
            const existingProduct = await Product.findOne({ partNumber: product.partNumber });
            if (existingProduct) {
              errors.push(`Row ${index + 1}: Part number ${product.partNumber} already exists`);
              continue;
            }
    
            const newProduct = new Product({
              partType: product.partType,
              partNumber: product.partNumber,
              partDescription: product.partDescription || '',
              productInfo: product.productInfo || '',
              color: product.color,
              quantity: Number(product.quantity) || 0,
              singlePrice: Number(product.singlePrice) || 0,
              bulkPrice: Number(product.bulkPrice) || 0
            });
    
            await newProduct.save();
            importedCount++;
          } catch (error) {
            errors.push(`Row ${index + 1}: ${error.message}`);
          }
        }
    
        // Send response with import results
        res.json({
          message: 'Import completed',
          count: importedCount,
          errors: errors.length > 0 ? errors : undefined
        });
    
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
});

productRouter.delete("/deleteProduct/:id", async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
});

productRouter.get('/search', async (req, res) => {
  try {
    const { term } = req.query;
    
    // Create a case-insensitive regex for the search term
    const searchRegex = new RegExp(term, 'i');
    
    // Search across multiple fields
    const products = await Product.find({
      $or: [
        { partType: searchRegex },
        { partNumber: searchRegex },
        { color: searchRegex },
        { partDescription: searchRegex },
        { productInfo: searchRegex }
      ]
    });
    
    res.json(products);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Error searching products' });
  }
});

productRouter.put("/updateProduct/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product' });
  }
});

module.exports = productRouter;
