import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/sidebar/Sidebar'
import './Dashboard.css'

export default function Dashboard() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalInvoiceAmount, setTotalInvoiceAmount] = useState(0);
  const [mostSoldProduct, setMostSoldProduct] = useState({ name: '', quantity: 0 });

  useEffect(() => {
    fetchTotalProducts();
    fetchTotalInvoiceAmount();
    fetchMostSoldProduct();
  }, []);

  const fetchTotalProducts = async () => {
    try {
      const response = await axios.get('/products/getProducts');
      setTotalProducts(response.data.length);
    } catch (error) {
      console.error('Error fetching total products:', error);
    }
  };

  const fetchTotalInvoiceAmount = async () => {
    try {
      const response = await axios.get('/invoices/getInvoices');
      const totalAmount = response.data.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
      setTotalInvoiceAmount(totalAmount);
    } catch (error) {
      console.error('Error fetching total invoice amount:', error);
    }
  };

  const fetchMostSoldProduct = async () => {
    try {
      const response = await axios.get('/invoices/getInvoices');
      const productSales = {};

      response.data.forEach(invoice => {
        invoice.items.forEach(item => {
          if (productSales[item.product]) {
            productSales[item.product] += item.quantity;
          } else {
            productSales[item.product] = item.quantity;
          }
        });
      });

      const mostSold = Object.entries(productSales).reduce((max, [productId, quantity]) => {
        return quantity > max.quantity ? { productId, quantity } : max;
      }, { productId: '', quantity: 0 });

      if (mostSold.productId) {
        const productResponse = await axios.get(`/products/getProducts/${mostSold.productId}`);
        setMostSoldProduct({ name: productResponse.data.partNumber, quantity: mostSold.quantity });
      }
    } catch (error) {
      console.error('Error fetching most sold product:', error);
    }
   
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <div className="pagetitle">
          <h1>Dashboard</h1>
          <nav>
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><a href="/dashboard">Home</a></li>
              <li className="breadcrumb-item active">Dashboard</li>
            </ol>
          </nav>
        </div>

        <section className="dashboard-cards">
          <div className="row">
            {/* Total Products Card */}
            <div className="col-xxl-4 col-md-6">
              <div className="card info-card">
                <div className="card-body">
                  <h5 className="card-title">Total Products</h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle">
                      <i className="bi bi-box-seam"></i>
                    </div>
                    <div className="stats">
                      <h6>{totalProducts}</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Invoice Amount Card */}
            <div className="col-xxl-4 col-md-6">
              <div className="card info-card">
                <div className="card-body">
                  <h5 className="card-title">Total Invoice Amount</h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle">
                      <i className="bi bi-receipt"></i>
                    </div>
                    <div className="stats">
                      <h6>${totalInvoiceAmount.toFixed(2)}</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Most Sold Product Card */}
            <div className="col-xxl-4 col-md-6">
              <div className="card info-card">
                <div className="card-body">
                  <h5 className="card-title">Most Sold Product</h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle">
                      <i className="bi bi-trophy"></i>
                    </div>
                    <div className="stats">
                      <h6>{mostSoldProduct.partCategory}</h6>
                      <span className="text-success">
                        {mostSoldProduct.quantity} units sold
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Sales Section */}
        <section className="recent-sales">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Recent Sales <span>| Today</span></h5>
              <table className="table table-borderless datatable">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Customer</th>
                    <th scope="col">Product</th>
                    <th scope="col">Price</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row"><a href="#">#2457</a></th>
                    <td>Brandon Jacob</td>
                    <td>At praesentium minu</td>
                    <td>$64</td>
                    <td><span className="badge bg-success">Approved</span></td>
                  </tr>
                  {/* Add more rows as needed */}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
