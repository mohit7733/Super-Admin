
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Components/Sidebar/Sidebar';
import Product from './Components/Pages/Product';
import Order from './Components/Pages/Order';
import Dashboard from './Components/Pages/Dashboard';
import Customer from './Components/Pages/Customer';
import Vendors from './Components/Pages/Vendors';
import History from './Components/Pages/History';
import Header from './Components/Sidebar/Header';
import Login from './Components/Pages/Auth/login';
import Doctor from './Components/Pages/Doctor';
import Vendorproduct from './Components/Pages/Vendorproduct';
import Orderlist from './Components/Pages/Orderlist';
import Patient from './Components/Pages/Patient';
import Center from './Components/Pages/Center';
import DoctorDetail from './Components/Pages/DoctorDetail';
import Booking from './Components/Pages/Booking';
import Allpatient from './Components/Pages/Allpatient';
import Items from './Components/Pages/Items';
import Support from './Components/Pages/Support';


const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className={`main-content ${sidebarCollapsed ? "collapsed" : "expanded"}`}>{children}</div>
    </>
  )
}


function App() {
  return (
    <Router>
      <Routes>
 
        <Route path="/" element={<Login />} />
           { <Route path="/login" element={<Login />} /> }
         <Route path="/customer/OTP" element={<Login />} />
      
     
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/product"
          element={
            <Layout>
              <Product />
            </Layout>
          }
        />
        <Route
          path="/order"
          element={
            <Layout>
              <Order />
            </Layout>
          }
        />

         <Route
          path="/Doctor"
          element={
            <Layout>
              <Doctor />
            </Layout>
          }
        />
        <Route
          path="/customer"
          element={
            <Layout>
              <Customer />
            </Layout>
          }
        />
        <Route
          path="/vendors"
          element={
            <Layout>
              <Vendors />
            </Layout>
          }
        />

        
        <Route
          path="/history"
          element={
            <Layout>
              <History />
            </Layout>
          }
        />

 
        <Route
          path="/Allpatient"
          element={
            <Layout>
              <Allpatient/>
            </Layout>
          }
        />


  <Route
          path="/Center"
          element={
            <Layout>
              <Center />
            </Layout>
          }
        />

 <Route
          path="/Booking"
          element={
            <Layout>
              <Booking />
            </Layout>
          }
        />

<Route
          path="/Support"
          element={
            <Layout>
              <Support />
            </Layout>
          }
        />

        
         <Route
          path="/Vendorproduct/:vendorId"
          element={
            <Layout>
              <Vendorproduct />
            </Layout>
          }
        />
<Route
          path="/Orderlist/:customerId"
          element={
            <Layout>
              <Orderlist />
            </Layout>
          }
        />

        <Route
          path="/Patient/:PatientId"
          element={
            <Layout>
              <Patient />
            </Layout>
          }
        />
        <Route
          path="/DoctorDetail/:DoctorId"
          element={
            <Layout>
              <DoctorDetail />
            </Layout>
          }
        />
            <Route
          path="/Items/:PaymentId"
          element={
            <Layout>
              <Items />
            </Layout>
          }
        />
        


         
        
      </Routes>
    </Router>
  );
}

export default App;

