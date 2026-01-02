import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import './App.css';
//pages
import MyMap from "./component/MyMap";
import ScrollToTop from './component/scrollTop';
import RegisterForm from "./account/RegisterForm";
import Login from "./account/LoginForm";
import Home from "./pages/home";
import Layout from './component/layout';
import Profile from './pages/Profile';
import Services from './pages/services';
import ServicePage from './pages/servicePage';
import ProductList from './pages/productList';
//owner pages
import OwnerNav from './dashboard/owner/OwnerNav';
import Create from './dashboard/owner/Create';
import ServiceDashboard from './dashboard/owner/serviceDashboard';
import ManageService from './dashboard/owner/manageService';
import Advertisement from './dashboard/owner/advertisement';
import Complain from './dashboard/owner/complain';
import Product from './dashboard/owner/product';
//admin pages
import AdminNav from './dashboard/admin/AdminNav';
import AdminDashboard from './dashboard/admin/AdminDashboard';
import UserList from './dashboard/admin/users_list';
import ServicesList from './dashboard/admin/services_list';
import Categories from './dashboard/admin/categories';
import ManageAdv from './dashboard/admin/manageAdv';

import "leaflet/dist/leaflet.css";

function App() {
    const [user, setUser] = useState(() => {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activeModal, setActiveModal] = useState(null);
  

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Shared layout for all public pages */}
          <Route element={<Layout user={user} setUser={setUser} activeModal={activeModal} setActiveModal={setActiveModal} />}>
            <Route path='/' element={<Home />} />
            <Route path='signup' element={<RegisterForm />} />
            <Route path='login' element={<Login />} />
            <Route path='create' element={<Create />} />
            <Route path='services' element={<Services />} />
            <Route path='/servicePage/:id' element={<ServicePage/>}/>
            <Route path='productList' element={<ProductList/>}/>
            <Route path="Userprofile" element={<Profile/>}/>
          </Route>
          {/* Admin section with its own layout */}
          <Route element={user?.user_type === "admin" ? <AdminNav user={user} setUser={setUser} />: <Navigate to="/" replace />}>
            <Route path='adminDashboard' element={<AdminDashboard/>}/>
            <Route path='userlist' element={<UserList />} />
            <Route path='serviceslist' element={<ServicesList />} />
            <Route path='categories' element={<Categories />} />
            <Route path="manageAdv" element={<ManageAdv/>}/>
            <Route path="Adminprofile" element={<Profile/>}/>
          </Route>
          {/* owner section with its own layout */}
          <Route element={user?.user_type === "owner" || user?.has_service ? <OwnerNav user={user} setUser={setUser} />: <Navigate to="/" replace />}>
            <Route path='serviceDashboard' element={<ServiceDashboard />} />
            <Route path="manageService" element={<ManageService/>}/>
            <Route path="advertisement" element={<Advertisement/>}/>
            <Route path="complain" element={<Complain/>}/>
            <Route path="product" element={<Product/>}/>
            <Route path="Ownerprofile" element={<Profile/>}/>
          </Route>
        </Routes>
      </Router>
    </LocalizationProvider>
  );
}

export default App;
