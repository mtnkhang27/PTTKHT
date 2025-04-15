import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import Payment from './components/Payment';
import ExtendTest from './components/ExtendTest';
import Certificate from './components/Certificate';
import Home from './components/Home';
import Layout from './components/Layout';
import './App.css'; // Import the main CSS file

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/extend-test" element={<ExtendTest />} />
          <Route path="/certificate" element={<Certificate />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;