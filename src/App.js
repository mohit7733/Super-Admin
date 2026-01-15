

import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';


import Sidebar from './Components/Sidebar/Sidebar';
import Header from './Components/Sidebar/Header';


import Login from './Components/Pages/Auth/login';
import Dashboard from './Components/Pages/Dashboard';
import Product from './Components/Pages/Product';
import Order from './Components/Pages/Order';
import Customer from './Components/Pages/Customer';
import Vendors from './Components/Pages/Vendors';
import History from './Components/Pages/History';
import Doctor from './Components/Pages/Doctor';
import Vendorproduct from './Components/Pages/Vendorproduct';
import Orderlist from './Components/Pages/Orderlist';
import Center from './Components/Pages/Center';
import DoctorDetail from './Components/Pages/DoctorDetail';
import Allpatient from './Components/Pages/Allpatient';
import Items from './Components/Pages/Items';
import Support from './Components/Pages/Support';
import Auditlogs from './Components/Pages/Auditlogs';
import StarRating from './Components/Pages/StarRating';
import Wellnessdetail from './Components/Pages/Wellnessdetail';
import ProtectedRoute from "./Components/Pages/ProtectedRoute";


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

        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
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
          path="/order"
          element={
             <ProtectedRoute>
              <Layout>
                <Order />
              </Layout>
             </ProtectedRoute>
          }
        />

       
        <Route
          path="/Doctor"
          element={
             <ProtectedRoute>
              <Layout>
                <Doctor />
              </Layout>
             </ProtectedRoute>
          }
        />

         <Route
          path="/customer"
          element={
            <ProtectedRoute>
              <Layout>
                <Customer />
              </Layout>
             </ProtectedRoute>
          }
        />
<Route
          path="/vendors"
          element={
             <ProtectedRoute>
              <Layout>
                <Vendors />
              </Layout>
             </ProtectedRoute>
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
          path="/Allpatient"
          element={
            <ProtectedRoute>
              <Layout>
                <Allpatient />
              </Layout>
           </ProtectedRoute>
          }
        />

       
        <Route
          path="/Wellnessdetail"
          element={
            <ProtectedRoute>
              <Layout>
                <Wellnessdetail />
              </Layout>
             </ProtectedRoute>
          }
        />

       
        <Route
          path="/Center"
          element={
            <ProtectedRoute>
              <Layout>
                <Center />
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
          path="/Vendorproduct/:vendorId"
          element={
            <ProtectedRoute>
              <Layout>
                <Vendorproduct />
              </Layout>
            </ProtectedRoute>
          }
        />
 <Route
          path="/Orderlist/:customerId"
          element={
            <ProtectedRoute>
              <Layout>
                <Orderlist />
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

