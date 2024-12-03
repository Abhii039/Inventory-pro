import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/sidebar/Sidebar';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, [search]);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`/invoices/getInvoices?search=${search}`);
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await axios.delete(`/invoices/deleteInvoice/${id}`);
        fetchInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const handleDownloadPDF = async (invoiceId) => {
    try {
      const response = await axios.get(`/invoices/${invoiceId}/pdf`, {
        responseType: 'blob',
      });

      const file = new Blob([response.data], { type: 'application/pdf' });
      
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = `invoice-${invoiceId}.pdf`;
      link.click();
      
      URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF');
    }
  };

  return (
    <div className="d-flex flex-column flex-md-row">
      <Sidebar />
      <div className="flex-grow-1 content-wrapper">
        <div className="container mt-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
            <h2 className="mb-3 mb-md-0">Invoices</h2>
            <Link to="/InvoiceForm" className="btn btn-primary">
              <i className="fas fa-plus me-2"></i>Create New Invoice
            </Link>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-12 col-md-6">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search invoices..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Customer Name</th>
                      <th>Date</th>
                      <th>Total Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice._id}>
                        <td>{invoice.customerName}</td>
                        <td>{new Date(invoice.date).toLocaleDateString()}</td>
                        <td>${invoice.totalAmount.toFixed(2)}</td>
                        <td>
                          <div className="btn-group">
                            <Link
                              to={`/invoices/updateInvoice/${invoice._id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              <i className="fas fa-edit me-1"></i>Edit
                            </Link>
                            <button
                              onClick={() => handleDownloadPDF(invoice._id)}
                              className="btn btn-sm btn-outline-secondary"
                            >
                              <i className="fas fa-download me-1"></i>PDF
                            </button>
                            <button
                              onClick={() => handleDelete(invoice._id)}
                              className="btn btn-sm btn-outline-danger"
                            >
                              <i className="fas fa-trash-alt me-1"></i>Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceList;
