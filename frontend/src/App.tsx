import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'

import AdminLogin from './pages/AdminLogin'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassowrd'
import VerifyEmail from './pages/VerifyEmail'
import AdminDashboard from './pages/AdminDashboard'
import ManageBases from './pages/ManageBases'
import ManageCheese from './pages/ManageCheese'
import ManageVeggies from './pages/ManageVeggies'
import ManageSauces from './pages/ManageSauces'
import ManagePizzas from './pages/ManagePizzas'
import ManageOrder from './pages/ManageOrder'
import CustomerDashboard from './pages/CustomerDashboard'
import CreatePizza from './pages/CreatePizza'
import CartPage from './pages/CartPage'
import MyOrders from './pages/MyOrders'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Customer Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/create-pizza" element={<CreatePizza />} />
        <Route path="/customer/cart" element={<CartPage />} />
        <Route path="/customer/orders" element={<MyOrders />} />

        {/* Admin Route */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/manage/bases" element={<ManageBases />} />
        <Route path="/admin/manage/sauces" element={<ManageSauces />} />
        <Route path="/admin/manage/cheese" element={<ManageCheese />} />
        <Route path="/admin/manage/veggies" element={<ManageVeggies />} />
        <Route path="/admin/manage/pizzas" element={<ManagePizzas/>}/>
        <Route path="/admin/orders" element={<ManageOrder/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
