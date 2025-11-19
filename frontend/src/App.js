import React from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layouts & Pages (public)
import MainLayout from "./components/MainLayout.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/Forgotpassword.jsx";
import MyAccount from "./pages/MyAccount";
import RoomTypeDetailPage from "./pages/RoomTypeDetailPage.jsx";
import BookingResultPage from "./pages/BookingResultPage.jsx";

// Admin
import AdminRoute from "./components/Admin/AdminRoute.jsx";
import AdminLayout from "./pages/Admin/AdminLayout.jsx";
import CustomerManagement from "./pages/Admin/CustomerManagement.jsx";
import EmployeeManagement from "./pages/Admin/EmployeeManagement.jsx";
import RoomListPage from "./pages/Admin/RoomListPage.jsx";
import RoomTypePage from "./pages/Admin/RoomTypePage.jsx";
import BookingManagement from "./pages/Admin/BookingManagement.jsx";

// Employee
import EmployeeRoute from "./routes/EmployeeRoute";
import EmployeeLayout from "./pages/Employee/EmployeeLayout";
import EmpDashboard from "./pages/Employee/EmpDashboard";
import EmpSupportHistory from "./pages/Employee/EmpSupportHistory";
import EmpBookings from "./pages/Employee/EmpBookings";  
import SupportHelp from "./pages/Employee/SupportHelp";       
import SupportChat from "./pages/Employee/SupportChat";
import SupportQueue from "./pages/Employee/SupportQueue";

function App() {
    const { loading } = useAuth();

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-lg">Đang tải ứng dụng...</div>;
    }

    return (
        <Router>
            <Toaster position="top-center" reverseOrder={false} />
            <Routes>
                {/* Public layout */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/room-type/:id" element={<RoomTypeDetailPage />} />
                </Route>

                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/my-account" element={<MyAccount />} />
                <Route path="/booking-result" element={<BookingResultPage />} />

                {/* Admin block */}
                <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="rooms" replace />} />
                        <Route path="customers" element={<CustomerManagement />} />
                        <Route path="employees" element={<EmployeeManagement />} />
                        <Route path="rooms" element={<RoomListPage />} />
                        <Route path="room-types" element={<RoomTypePage />} />
                        <Route path="bookings" element={<BookingManagement />} />
                    </Route>
                </Route>

                {/* Employee block */}
                <Route
                    path="/employee"
                    element={
                        <EmployeeRoute>
                        <EmployeeLayout />
                        </EmployeeRoute>
                    }
                    >
                    <Route index element={<EmpDashboard />} />
                    <Route path="support">
                        <Route index element={<Navigate to="queue" replace />} />
                        <Route path="help" element={<SupportHelp />} />
                        <Route path="queue" element={<SupportQueue />} />
                        <Route path="chat/:id" element={<SupportChat />} />
                        <Route path="history" element={<EmpSupportHistory />} />
                    </Route>
                    <Route path="bookings" element={<EmpBookings />} />
                </Route>
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
