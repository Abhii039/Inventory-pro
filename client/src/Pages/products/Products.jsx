import React from 'react'
import axios from 'axios';
import { useState, useEffect } from 'react';
import './Products.css';
import Sidebar from '../../components/sidebar/Sidebar';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';


export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
      return;
    }

    const searchResults = products.filter(product => 
      product.partType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.partDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productInfo?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    console.log('Search Term:', searchTerm);
    console.log('Filtered Results:', searchResults);
    setFilteredProducts(searchResults);
  }, [searchTerm, products]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/products/getProducts');
      setProducts(response.data);
      setFilteredProducts(response.data);
      console.log('Fetched Products:', response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await axios.post('/upload-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('File imported successfully');
      await fetchProducts();
      setFile(null);
    } catch (err) {
      console.error('Import error:', err);
      toast.error(err.response?.data?.message || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/products/deleteProduct/${productId}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleExport = () => {
    // Prepare the data for export
    const exportData = products.map(product => ({
      'Part Type': product.partType,
      'Part Number': product.partNumber,
      'Color': product.color,
      'Quantity': product.quantity,
      'Single Price': product.singlePrice,
      'Bulk Price': product.bulkPrice,
      'Description': product.partDescription,
      'Product Info': product.productInfo
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");

    // Save file
    XLSX.writeFile(wb, "products.xlsx");
  };

  // Modify the groupProductsByType function
  const groupProductsByType = (productsToGroup) => {
    const grouped = {};
    productsToGroup.forEach(product => {
      if (!grouped[product.partType]) {
        grouped[product.partType] = [];
      }
      grouped[product.partType].push(product);
    });
    return grouped;
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/products/updateProduct/${editingProduct._id}`, editingProduct);
      toast.success('Product updated successfully');
      setShowEditModal(false);
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="products-page dark-theme">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h2>Products List</h2>
          <div className="search-container">
            <div className="search-input-wrapper">
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className="action-buttons">
            <div className="import-section">
              <input
                type="file"
                id="fileInput"
                onChange={handleFileChange}
                accept=".xlsx, .xls"
                style={{ display: 'none' }}
              />
              <label htmlFor="fileInput" className="import-btn">
                <i className="bi bi-file-earmark-excel"></i>
                <span>Import Excel</span>
              </label>
              {file && (
                <button onClick={handleImport} className="import-submit-btn">
                  <i className="bi bi-upload"></i>
                  <span>Upload {file.name}</span>
                </button>
              )}
              <button onClick={handleExport} className="export-btn">
                <i className="bi bi-file-earmark-excel"></i>
                <span>Export Excel</span>
              </button>
            </div>
            <Link to="/addProduct" className="add-product-btn">
              <i className="bi bi-plus-lg"></i>
              <span>Add New Product</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="products-container">
            {Object.entries(groupProductsByType(filteredProducts)).map(([partType, products]) => (
              <div key={partType} className="part-type-section">
                <h2 className="part-type-header">{partType}</h2>
                <div className="products-grid">
                  {products.map((product) => (
                    <div key={product._id} className="product-card">
                      <div className="product-header">
                        <h3>{product.partType}</h3>
                        <div className="product-actions">
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(product)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(product._id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>

                      <div className="product-details">
                        <div className="detail-row">
                          <span className="label">Part Number:</span>
                          <span className="value">{product.partNumber}</span>
                        </div>

                        <div className="detail-row">
                          <span className="label">Color:</span>
                          <span className="value">{product.color}</span>
                        </div>

                        <div className="detail-row">
                          <span className="label">Quantity:</span>
                          <span className="value">{product.quantity}</span>
                        </div>

                        <div className="detail-row">
                          <span className="label">Single Price:</span>
                          <span className="value">${product.singlePrice}</span>
                        </div>

                        <div className="detail-row">
                          <span className="label">Bulk Price:</span>
                          <span className="value">${product.bulkPrice}</span>
                        </div>

                        <div className="detail-full">
                          <span className="label">Description:</span>
                          <p className="value">{product.partDescription}</p>
                        </div>

                        <div className="detail-full">
                          <span className="label">Product Info:</span>
                          <p className="value">{product.productInfo}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Product</h2>
              <button 
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label>Part Type</label>
                <input
                  type="text"
                  name="partType"
                  value={editingProduct.partType}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Part Number</label>
                <input
                  type="text"
                  name="partNumber"
                  value={editingProduct.partNumber}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Color</label>
                <input
                  type="text"
                  name="color"
                  value={editingProduct.color}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={editingProduct.quantity}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Single Price</label>
                <input
                  type="number"
                  name="singlePrice"
                  value={editingProduct.singlePrice}
                  onChange={handleEditChange}
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Bulk Price</label>
                <input
                  type="number"
                  name="bulkPrice"
                  value={editingProduct.bulkPrice}
                  onChange={handleEditChange}
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="partDescription"
                  value={editingProduct.partDescription}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Product Info</label>
                <textarea
                  name="productInfo"
                  value={editingProduct.productInfo}
                  onChange={handleEditChange}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
