import React from 'react'
import { Link } from 'react-router-dom'
import './Sidebar.css'  
export default function Sidebar() {
  return (
    <aside id="sidebar" className="sidebar dark-theme">
      <div className="logo-container">
        <i className="bi bi-box-seam"></i>
        <span>Inventory Pro</span>
      </div>
      
      <ul className="sidebar-nav">
        <li className="nav-item">
          <Link className="nav-link" to="/dashboard">
            <i className="bi bi-speedometer2"></i>
            <span>Dashboard</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/product">
            <i className="bi bi-box-seam"></i>
            <span>Products</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/invoice">
            <i className="bi bi-receipt"></i>
            <span>Invoice</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/settings">
            <i className="bi bi-gear"></i>
            <span>Settings</span>
          </Link>
        </li>
      </ul>
    </aside>
  )
}
