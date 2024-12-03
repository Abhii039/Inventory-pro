const express = require('express');
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const PDFDocument = require('pdfkit');
const invoiceRouter = express.Router();

// Get all invoices with search
invoiceRouter.get("/getInvoices", async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query.customerName = new RegExp(search, 'i');
    }
    
    const invoices = await Invoice.find(query)
      .populate('items.product')
      .sort({ date: -1 });
    
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new invoice
invoiceRouter.post("/addInvoice", async (req, res) => {
  try {
    const { customerName, items } = req.body;
    
    // Calculate totals
    let totalAmount = 0;
    const processedItems = await Promise.all(items.map(async (item) => {
      const product = await Product.findById(item.product);
      const price = item.priceType === 'bulk' ? product.bulkPrice : product.singlePrice;
      const subtotal = price * item.quantity;
      totalAmount += subtotal;
      
      return {
        ...item,
        price,
        subtotal
      };
    }));
    
    const invoice = new Invoice({
      customerName,
      items: processedItems,
      totalAmount
    });
    
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Generate PDF
invoiceRouter.get("/:id/pdf", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('items.product');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Create a PDF document
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4'
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice._id}.pdf`);

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add styling
    doc.font('Helvetica-Bold').fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();

    // Add company info
    doc.font('Helvetica').fontSize(12);
    doc.text('Your Company Name', { align: 'left' });
    doc.text('123 Business Street', { align: 'left' });
    doc.text('Business City, ST 12345', { align: 'left' });
    doc.moveDown();

    // Add invoice details
    doc.font('Helvetica-Bold').text('Invoice Details');
    doc.font('Helvetica');
    doc.text(`Invoice Number: ${invoice._id}`);
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`);
    doc.text(`Customer Name: ${invoice.customerName}`);
    doc.moveDown();

    // Add table headers
    const tableTop = doc.y;
    const tableHeaders = ['Product', 'Quantity', 'Price Type', 'Price', 'Subtotal'];
    const columnWidth = 100;
    
    // Draw headers
    doc.font('Helvetica-Bold');
    tableHeaders.forEach((header, i) => {
      doc.text(header, 50 + (i * columnWidth), tableTop, { width: columnWidth, align: 'left' });
    });

    // Draw items
    doc.font('Helvetica');
    let tableRow = tableTop + 25;
    
    invoice.items.forEach((item) => {
      doc.text(item.product.partNumber, 50, tableRow, { width: columnWidth });
      doc.text(item.quantity.toString(), 50 + columnWidth, tableRow, { width: columnWidth });
      doc.text(item.priceType, 50 + (columnWidth * 2), tableRow, { width: columnWidth });
      doc.text(`$${item.price.toFixed(2)}`, 50 + (columnWidth * 3), tableRow, { width: columnWidth });
      doc.text(`$${item.subtotal.toFixed(2)}`, 50 + (columnWidth * 4), tableRow, { width: columnWidth });
      tableRow += 20;
    });

    // Add total
    doc.moveDown();
    doc.font('Helvetica-Bold')
       .text(`Total Amount: $${invoice.totalAmount.toFixed(2)}`, { align: 'right' });

    // Add footer
    doc.moveDown(2);
    doc.font('Helvetica')
       .fontSize(10)
       .text('Thank you for your business!', { align: 'center' });

    // Finalize the PDF
    doc.end();

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
});

// Update invoice
invoiceRouter.put("/updateInvoice/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete invoice
invoiceRouter.delete("/deleteInvoice/:id", async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = invoiceRouter;
