import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import Payment from './components/Payment';
import ExtendTest from './components/ExtendTest';
import Certificate from './components/Certificate';
import Home from './components/Home';
import Layout from './components/Layout';
import Login from './components/Login';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; 
import Customer from './components/Customer';
import CustomerRegister from './components/CustomerRegister'; // Import the new component

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            {/* <Route path="/register" element={<ProtectedRoute><Register /></ProtectedRoute>} /> */}
            <Route path="/add-customer" element={<Customer />} />
            <Route path="/register" element={<Register />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/extend-test" element={<ProtectedRoute><ExtendTest /></ProtectedRoute>} />
            <Route path="/certificate" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
            <Route path="/customer-search-register" element={<CustomerRegister/>} />
            {/* Add more routes as needed */}
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;