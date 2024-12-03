import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import { Modal } from 'react-bootstrap';
import './InvoiceForm.css';

const InvoiceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [invoice, setInvoice] = useState({
    customerName: '',
    items: []
  });
  const [showModal, setShowModal] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({});

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchInvoice();
    }
    fetchAllProducts();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await axios.get(`/invoices/getInvoice/${id}`);
      setInvoice(response.data);
      const productIds = response.data.items.map(item => item.product);
      await fetchProductDetails(productIds);
    } catch (error) {
      console.error('Error fetching invoice:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/products/getProducts');
      const uniqueCategories = [...new Set(response.data.map(product => product.partType))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async (category) => {
    try {
      const response = await axios.get(`/products/getProducts?category=${category}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await axios.get('/products/getProducts');
      setAllProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchProductDetails = async (productIds) => {
    try {
      const productDetails = {};
      for (const id of productIds) {
        const response = await axios.get(`/products/getProducts/${id}`);
        productDetails[id] = response.data;
      }
      setSelectedProducts(productDetails);
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await axios.put(`/invoices/updateInvoice/${id}`, invoice);
      } else {
        await axios.post('/invoices/addInvoice', invoice);
      }
      navigate('/invoice');
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  const handleAddSelectedItems = () => {
    const newItems = selectedItems.map(item => ({
      product: item._id,
      quantity: 1,
      priceType: 'single'
    }));

    const newSelectedProducts = { ...selectedProducts };
    selectedItems.forEach(item => {
      newSelectedProducts[item._id] = item;
    });
    setSelectedProducts(newSelectedProducts);

    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, ...newItems]
    }));

    setSelectedItems([]);
    setShowModal(false);
  };

  const toggleItemSelection = (product) => {
    setSelectedItems(prev => {
      const isSelected = prev.find(item => item._id === product._id);
      if (isSelected) {
        return prev.filter(item => item._id !== product._id);
      } else {
        return [...prev, product];
      }
    });
  };

  const filteredProducts = allProducts.filter(product =>
    product.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.partType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ProductSelectionModal = () => (
    <Modal 
      show={showModal} 
      onHide={() => setShowModal(false)}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Select Products</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              e.preventDefault();
              setSearchTerm(e.target.value);
            }}
          />
        </div>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Select</th>
                <th>Part Number</th>
                <th>Category</th>
                <th>Description</th>
                <th>Price</th>
                <th>Bulk Price</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr 
                  key={product._id}
                  className={selectedItems.find(item => item._id === product._id) ? 'table-primary' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleItemSelection(product);
                  }}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedItems.some(item => item._id === product._id)}
                      onChange={(e) => {
                        e.preventDefault();
                        toggleItemSelection(product);
                      }}
                      className="form-check-input"
                    />
                  </td>
                  <td>{product.partNumber}</td>
                  <td>{product.partType}</td>
                  <td>{product.description}</td>
                  <td>${product.price}</td>
                  <td>${product.bulkPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button 
          type="button"
          className="btn btn-secondary" 
          onClick={(e) => {
            e.preventDefault();
            setShowModal(false);
          }}
        >
          Cancel
        </button>
        <button 
          type="button"
          className="btn btn-primary" 
          onClick={(e) => {
            e.preventDefault();
            handleAddSelectedItems();
          }}
          disabled={selectedItems.length === 0}
        >
          Add Selected Items ({selectedItems.length})
        </button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <div className="d-flex flex-column flex-md-row">
      <Sidebar />
      <div className="flex-grow-1 content-wrapper">
        <div className="container mt-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title mb-4">{id ? 'Update Invoice' : 'Create New Invoice'}</h2>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Customer Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={invoice.customerName}
                        onChange={(e) => setInvoice(prev => ({ ...prev, customerName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="items-section">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="mb-0">Items</h3>
                    <button 
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowModal(true);
                      }}
                    >
                      <i className="fas fa-plus me-2"></i>Add Item
                    </button>
                  </div>

                  {invoice.items.map((item, index) => (
                    <div key={index} className="card mb-3">
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label">Product</label>
                            <select
                              className="form-select"
                              value={item.product}
                              onChange={(e) => {
                                const items = [...invoice.items];
                                items[index].product = e.target.value;
                                setInvoice(prev => ({ ...prev, items }));
                              }}
                            >
                              <option value="">Select Product</option>
                              {Object.entries(selectedProducts).map(([id, product]) => (
                                <option key={id} value={id}>
                                  {product.partNumber} - {product.partType} (${product.price})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-2">
                            <label className="form-label">Quantity</label>
                            <input
                              type="number"
                              className="form-control"
                              value={item.quantity}
                              onChange={(e) => {
                                const items = [...invoice.items];
                                items[index].quantity = parseInt(e.target.value);
                                setInvoice(prev => ({ ...prev, items }));
                              }}
                              min="1"
                            />
                          </div>

                          <div className="col-md-2">
                            <label className="form-label">Price Type</label>
                            <select
                              className="form-select"
                              value={item.priceType}
                              onChange={(e) => {
                                const items = [...invoice.items];
                                items[index].priceType = e.target.value;
                                setInvoice(prev => ({ ...prev, items }));
                              }}
                            >
                              <option value="single">Single Price</option>
                              <option value="bulk">Bulk Price</option>
                            </select>
                          </div>

                          <div className="col-md-2 d-flex align-items-end">
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm w-100"
                              onClick={() => {
                                const items = invoice.items.filter((_, i) => i !== index);
                                setInvoice(prev => ({ ...prev, items }));
                              }}
                            >
                              <i className="fas fa-trash-alt me-2"></i>Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save me-2"></i>
                    {id ? 'Update Invoice' : 'Create Invoice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ProductSelectionModal />
    </div>
  );
};

export default InvoiceForm; 