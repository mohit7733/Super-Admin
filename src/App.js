

import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';


import Sidebar from './Components/Sidebar/Sidebar';

import Header from './Components/Pages/Header/Header'


import Login from './Components/Pages/Auth/login';
import ProtectedRoute from './Components/Pages/Auth/ProtectedRoute';
 import Register from './Components/Pages/Auth/Register';
 import Admin from './Components/Pages/Admin/Admin'


import Product from './Components/Pages/Product/Product';


import Customer from'./Components/Pages/Customer/Customer'
 import CustomerDetailPage from './Components/Pages/Customer/CustomerDetailPage';

import Vendor from './Components/Pages/Vendor/Vendor';
import Vendorproduct from './Components/Pages/Vendor/Vendorproduct';

import Doctor from './Components/Pages/Doctor/Doctor';
import DoctorDetail from './Components/Pages/Doctor/DoctorDetail';


import Patient from './Components/Pages/Patient/Patient';

import Order from './Components/Pages/Order/Order';

import History from './Components/Pages/History/History';
import Items from './Components/Pages/History/Items';

import Wellnesscenter from './Components/Pages/Wellnesscenter/Wellnesscenter';
import StarRating from './Components/Pages/Wellnesscenter/StarRating';

import Dashboard from './Components/Pages/Dashboard/Dashboard'
import Support from './Components/Pages/Support/Support';
import Auditlogs from './Components/Pages/AuditLogs/Auditlogs';
import ForgotPassword from './Components/Pages/Auth/ForgotPassword';
import VerifyOtp from './Components/Pages/Auth/VerifyOtp';
import ResetPassword from './Components/Pages/Auth/ResetPassword';





const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <>
      <Header
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className={`main-content ${sidebarCollapsed ? "collapsed" : "expanded"}`}>
        {children}
      </div>
    </>
  );
};


function App() {
  return (
    <Router>
      <Routes>

       
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} /> 

        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute permission="view_dashboard">
              <Layout>
                <Dashboard />
              </Layout>
             </ProtectedRoute>
          }
        />

       
        <Route
          path="/product"
          element={
             <ProtectedRoute>
              <Layout>
                <Product />
              </Layout>
             </ProtectedRoute>
          }
        />

 <Route
          path="/Admin"
          element={
             <ProtectedRoute>
              <Layout>
             <Admin/>
              </Layout>
             </ProtectedRoute>
          }
        />
    
           <Route
          path="/order"
          element={
             <ProtectedRoute >
              <Layout>
                <Order />
              </Layout>
             </ProtectedRoute>
          }
        />

       
        <Route
          path="/Doctor"
          element={
             <ProtectedRoute permission="view_doctors">
              <Layout>
                <Doctor />
              </Layout>
             </ProtectedRoute>
          }
        />

         <Route
          path="/customer"
          element={
            <ProtectedRoute  permission="view_customers" >
              <Layout>
                <Customer />
              </Layout>
             </ProtectedRoute>
          }
        />
<Route
  path="/vendor"
  element={
    <ProtectedRoute permission="view_vendors">
      <Layout>
        <Vendor />
      </Layout>
    </ProtectedRoute>
  }
/>

<Route
  path="/ForgotPassword"
  element={
   
      <ForgotPassword />
   
  }
/>
<Route
  path="/ResetPassword"
  element={
   
      <ResetPassword />
   
  }
/>

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <Layout>
                <History />
              </Layout>
          </ProtectedRoute>
          }
        />

         <Route
          path="/Patient"
          element={
            <ProtectedRoute>
              <Layout>
                <Patient/>
              </Layout>
          </ProtectedRoute>
          }
        />
      

       
      

       
        <Route
          path="/Wellnesscenter"
          element={
            <ProtectedRoute>
              <Layout>
                < Wellnesscenter/>
              </Layout>
             </ProtectedRoute>
          }
        />

       
       

       
        <Route
          path="/Support"
          element={
            <ProtectedRoute>
              <Layout>
                <Support />
              </Layout>
           </ProtectedRoute>
          }
        />

        
        <Route
          path="/vendorproduct/:vendorId"
          element={
            <ProtectedRoute>
              <Layout>
                <Vendorproduct />
              </Layout>
            </ProtectedRoute>
          }
        />
        
 <Route
          path="/CustomerDetailPage/:customerId"
          element={
            <ProtectedRoute>
              <Layout>
                <CustomerDetailPage />
              </Layout>
             </ProtectedRoute>
          }
        />

       
        <Route
          path="/StarRating"
          element={
            <ProtectedRoute>
              <Layout>
                <StarRating />
              </Layout>
             </ProtectedRoute>
          }
        />

      
       
        <Route
          path="/DoctorDetail/:DoctorId"
          element={

            
           <ProtectedRoute>
              <Layout>
                <DoctorDetail />
              </Layout>
           </ProtectedRoute>
          }
        />

      
        <Route
          path="/Items/:PaymentId"
          element={
             <ProtectedRoute>
              <Layout>
                <Items />
              </Layout>
             </ProtectedRoute>
          }
        />

   <Route
          path="VerifyOtp"
          element={
           
                <VerifyOtp />
           
          }
        />

         

      
        <Route
          path="/Auditlogs"
          element={
             <ProtectedRoute>
              <Layout>
                <Auditlogs />
              </Layout>
             </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;


