

import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';


import Sidebar from './Components/Sidebar/Sidebar';

import Header from './Components/Pages/Header/Header'


import Login from './Components/Pages/Auth/login';
import ProtectedRoute from './Components/Pages/Auth/ProtectedRoute';
import Register from './Components/Pages/Auth/Register';
import Admin from './Components/Pages/Admin/Admin'


import Product from './Components/Pages/Product/Product';


import Customer from './Components/Pages/Customer/Customer'
import CustomerDetailPage from './Components/Pages/Customer/CustomerDetailPage';

import Vendor from './Components/Pages/Vendor/Vendor';


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

import ResetPassword from './Components/Pages/Auth/ResetPassword';
import Question from './Components/Question/Question';
import Prakriti from './Components/Question/Prakirti';
import Medical from './Components/Question/Medical';
import Diet from './Components/Pages/Diet/Diet'
import Testing from './Components/Pages/Customer/testing';

import Presceptions from './Components/Pages/Customer/Presceptions';
import ConsultationOrder from './Components/Pages/Customer/ConsultationOrder'
import ActivityLog from './Components/Pages/Customer/ActivityLog';
import Paymenthistory from './Components/Pages/Customer/Paymenthistory';
import Prakiritianalysis from './Components/Question/Prakiritianalysis';
import Disease from './Components/Pages/Disease/Disease';
import Category from './Components/Pages/Category/Category';
import VendorDetail from './Components/Pages/Vendor/VendorDetail';

import Productcategory from './Components/Pages/Category/Productcategory';
import Brand from './Components/Pages/Product/Brand';
import Banner from './Components/Pages/Banner/Banner'
import SubProductCategory from './Components/Pages/Category/SubProductCategory';
import Healthcategory from './Components/Pages/Category/Healthcategory';
import ProductDetail from './Components/Pages/Product/ProductDetail';
import Review from './Components/Pages/Review/Review';
import Doctorreview from './Components/Pages/Review/Doctorreview';
import YogaCategory from './Components/Pages/Yoga/YogaCategory';
import YogaSession from './Components/Pages/Yoga/YogaSession';
import PatientDetails from './Components/Pages/Patient/PatientDetails';
import Management from './Components/Pages/Mangement/Management';
import AddRoles from './Components/Pages/Admin/AddRoles';
import Unicommerece from './Components/Pages/Unicomerece/Unicommerece';




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
        <Route path="/testing" element={<Testing />} />

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
          path="/question"
          element={
            <ProtectedRoute permission="view_question">
              <Layout>
                <Question />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/main/category"
          element={
            <ProtectedRoute permission="view_category">
              <Layout>
                <Category />
              </Layout>
            </ProtectedRoute>
          }
        />

           <Route
          path="/admin/role"
          element={
            <ProtectedRoute permission="view_role">
              <Layout>
                <AddRoles />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/main/subcategory"
          element={
            <ProtectedRoute permission="view_product_category">
              <Layout>
                <SubProductCategory />
              </Layout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/dietplans"
          element={
            <ProtectedRoute permission="view_dietplans">
              <Layout>
                <Diet />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/question/prakriti"
          element={
            <ProtectedRoute permission="view_question">
              <Layout>
                <Prakriti />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/Review/Product"
          element={
            <ProtectedRoute permission="view_Product_review">
              <Layout>
                <Review />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/Review/doctor"
          element={
            <ProtectedRoute permission="view_doctor_review">
              <Layout>
                <Doctorreview />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/disease"
          element={
            <ProtectedRoute permission="view_disease">
              <Layout>
                <Disease />
              </Layout>
            </ProtectedRoute>
          }
        />
 <Route
          path="/yoga/category"
          element={
            <ProtectedRoute permission="view_yoga_category">
              <Layout>
                <YogaCategory />
              </Layout>
            </ProtectedRoute>
          }
        />
         <Route
          path="/yoga/sessions"
          element={
            <ProtectedRoute permission="view_yoga_sessions">
              <Layout>
                <YogaSession />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/content/banner"
          element={
            <ProtectedRoute permission="manage_banner">
              <Layout>
                <Banner />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/question/medical"
          element={
            <ProtectedRoute permission="view_question">
              <Layout>
                <Medical />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/category/healthcategory"
          element={
            <ProtectedRoute permission="view_health_category">
              <Layout>
                <Healthcategory />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/product"
          element={
            <ProtectedRoute permission="view_products">
              <Layout>
                <Product />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/Admin"
          element={
            <ProtectedRoute permission="manage-admin">
              <Layout>
                <Admin />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/main/productcategory"
          element={
            <ProtectedRoute permission="view_product_category" >
              <Layout>
                <Productcategory />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/order"
          element={
            <ProtectedRoute permission="view_orders" >
              <Layout>
                <Order />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/order"
          element={
            <ProtectedRoute permission="view_orders" >
              <Layout>
                <Order />
              </Layout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/Productdetail/:productId"
          element={
            <ProtectedRoute permission="view_productdetail" >
              <Layout>
                <ProductDetail />
              </Layout>
            </ProtectedRoute>

          }
        />
        <Route
          path="/VendorDetail/:vendorId"
          element={
            <ProtectedRoute permission="view_vendordetail" >
              <Layout>
                <VendorDetail />
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
            <ProtectedRoute permission="view_customers" >
              <Layout>
                <Customer />
              </Layout>
            </ProtectedRoute>
          }
        />
          <Route
          path="/tax-class"
          element={
            <ProtectedRoute permission="manage_tax_class" >
              <Layout>
                <Unicommerece/>
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
          path="/prakirti"
          element={

            <ProtectedRoute permission="view_prakirti">
              <Layout>
                <Prakiritianalysis />
              </Layout>
            </ProtectedRoute>

          }
        />

        <Route
          path="/product/brandname"
          element={
            <ProtectedRoute permission="view_brand_name">
              <Layout>
                <Brand />
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
            <ProtectedRoute permission="view_order_history">
              <Layout>
                <History />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/Patient"
          element={
            <ProtectedRoute permission="view_patients">
              <Layout>
                <Patient />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/Wellnesscenter"
          element={
            <ProtectedRoute>
              <Layout>
                < Wellnesscenter />
              </Layout>
            </ProtectedRoute>
          }
        />



        <Route
          path="/Prescription"
          element={
            <ProtectedRoute>
              <Layout>
                <Presceptions />
              </Layout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/consultationorder"
          element={
            <ProtectedRoute>
              <Layout>
                <ConsultationOrder />
              </Layout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/Activitylogs"
          element={
            <ProtectedRoute>
              <Layout>
                <ActivityLog />
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
          path="/CustomerDetailPage/:customerId"
          element={
            <ProtectedRoute>
              <Layout>
              
              </Layout>
            </ProtectedRoute>
          }
        />


   <Route
          path="/Magement/Appointment"
          element={
            <ProtectedRoute permission="view_cancellation_request">
              <Layout>
                <Management/>
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
          path="/Patientdetail/:PatientId"
          element={


            <ProtectedRoute>
              <Layout>
                <PatientDetails />
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
          path="/paymemthistory"
          element={
            <ProtectedRoute>
              <Layout>
                <Paymenthistory />
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


