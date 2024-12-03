import React, { useState } from 'react';
import axios from 'axios';
import './AddProduct.css';

export default function AddProduct() {
  const [product, setProduct] = useState({
    partType: '',
    partDescription: '',
    productInfo: '',
    color: '',
    quantity: '',
    partNumber: '',
    singlePrice: '',
    bulkPrice: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/products/addProduct', product);
      setMessage('Product added successfully!');
      setError('');
      // Clear form
      setProduct({
        partType: '',
        partDescription: '',
        productInfo: '',
        color: '',
        quantity: '',
        partNumber: '',
        singlePrice: '',
        bulkPrice: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding product');
      setMessage('');
    }
  };

  return (
    <div className="add-product-container">
      <div className="card">
        <div className="card-header">
          <h2>Add New Product</h2>
        </div>
        <div className="card-body">
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="partType">Part Type</label>
                <input
                  type="text"
                  id="partType"
                  name="partType"
                  value={product.partType}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="partNumber">Part Number*</label>
                <input
                  type="text"
                  id="partNumber"
                  name="partNumber"
                  value={product.partNumber}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="partDescription">Part Description</label>
                <textarea
                  id="partDescription"
                  name="partDescription"
                  value={product.partDescription}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="productInfo">Product Info</label>
                <textarea
                  id="productInfo"
                  name="productInfo"
                  value={product.productInfo}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="color">Color*</label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={product.color}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity*</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={product.quantity}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="singlePrice">Single Price ($)</label>
                <input
                  type="number"
                  id="singlePrice"
                  name="singlePrice"
                  value={product.singlePrice}
                  onChange={handleInputChange}
                  className="form-control"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bulkPrice">Bulk Price ($)</label>
                <input
                  type="number"
                  id="bulkPrice"
                  name="bulkPrice"
                  value={product.bulkPrice}
                  onChange={handleInputChange}
                  className="form-control"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Add Product
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setProduct({
                partType: '',
                partDescription: '',
                productInfo: '',
                color: '',
                quantity: '',
                partNumber: '',
                singlePrice: '',
                bulkPrice: ''
              })}>
                Clear Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}