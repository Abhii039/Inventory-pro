import './App.css';
import SignUp from './Pages/sign-up/SignUp';
import SignIn from './Pages/sign-in/SignIn';
import {BrowserRouter as Router, Route,Switch, Routes} from 'react-router-dom';
import Dashboard from './Pages/dashboard/Dashboard';
import Products from './Pages/products/Products';
import AddProduct from './Pages/addProduct/AddProduct';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InvoiceList from './Pages/invoice/InvoiceList';
import InvoiceForm from './components/Invoice/InvoiceForm';
import Settings from './Pages/settings/Settings';
function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path='/' Component={SignUp} />
      <Route path='/signup' Component={SignUp}/>
      <Route path='/signin'Component={SignIn}/>
      <Route path='/dashboard' Component={Dashboard}/>
      <Route path='/product' Component={Products}/>
      <Route path='/addProduct' Component={AddProduct}/>
      <Route path='/invoice' Component={InvoiceList}/>
      <Route path='/InvoiceForm' Component={InvoiceForm}/>
      <Route path='/settings' Component={Settings}/>
      </Routes>
    </Router>
     <ToastContainer />
    </>
  );
}

export default App;
