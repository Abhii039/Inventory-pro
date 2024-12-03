const express = require("express");
const mongoose = require('mongoose');
const custRoute = require('./routes/customerRoutes');
const cors = require("cors");
const fs = require('fs');
const multer = require('multer');
const xlsxToJson = require('xlsx-to-json');
const path = require('path');
const Product = require('./models/Product');
const app = express();
const productRoute = require('./routes/productRoutes');
const invoiceRoute = require('./routes/invoiceRoutes');
app.use(express.json());
app.use(cors());


mongoose.connect("mongodb+srv://abhidobariya2004:Abhi%40039@invoice.jc9ot.mongodb.net/invoice").then(() => {
    console.log("Connected to mongodb.");
}).catch((err) => {
    console.log(err);
})
app.use('/customer', custRoute);
app.use('/products', productRoute);
app.use('/invoices', invoiceRoute);
const upload = multer({ dest: 'uploads/' });

// API Route for Uploading Excel and Importing to MongoDB
app.post('/upload-excel', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.path;

    xlsxToJson(
        {
            input: filePath,
            output: null,
        },
        async (err, jsonData) => {
            if (err) {
                console.error('Error converting Excel to JSON:', err);
                return res.status(500).send('Error parsing Excel file.');
            }

            // Find the last non-empty row index
            const lastValidIndex = jsonData.reduce((lastIndex, item, currentIndex) => {
                if (Object.values(item).some(value => value)) {
                    return currentIndex;
                }
                return lastIndex;
            }, -1);

            // Slice the array to include only up to the last valid row
            const validData = jsonData.slice(0, lastValidIndex + 1);

            // Transform JSON to match schema and clean up fields
            const products = validData.map(item => ({
                partType: item.PartType,
                partDescription: item.PartDescription,
                productInfo: item.ProductInfo,
                color: item.Color,
                quantity: parseInt(item.Quantity, 10) || 0,
                partNumber: item.PartNumber,
                singlePrice: parseFloat(item.SingleP?.replace(/[^0-9.]/g, '')) || 0,
                bulkPrice: parseFloat(item.BulkP?.replace(/[^0-9.]/g, '')) || 0,
            }));

            console.log(products)
            try {
                await Product.insertMany(products);
                res.send(`Successfully imported ${products.length} products.`);
            } catch (dbError) {
                console.error('Database error:', dbError);
                res.status(500).send('Error saving products to database.');
            } finally {
                fs.unlink(filePath, err => {
                    if (err) console.error('Error deleting file:', err);
                    console.log("File deleted successfully")
                    
                });
            }
        }
    );
});


app.listen("5000", () => {
    console.log("Backend is running")
})


