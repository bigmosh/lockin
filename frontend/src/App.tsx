import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Rooms from './pages/Rooms';
import RoomCreate from './pages/RoomCreate';
import RoomDetail from './pages/RoomDetail';
import MyRooms from './pages/MyRooms';
import Calendar from './pages/Calendar';
import NotFound from './pages/NotFound';
import { getToken } from './api';
import Navbar from './components/layout/Navbar';
import PageContainer from './components/layout/PageContainer';


function AuthRoute({ children }: { children?: any }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children as any;
}

function Shell({ children }: { children?: any }) {
  return (
    <>
      <Navbar />
      <PageContainer>{children}</PageContainer>
    </>
  );
}

function App() {
  return (
    <>
      <Routes>
        {/* Auth routes without header */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* App routes with header */}
        <Route path="/" element={<Shell><Rooms /></Shell>} />
        <Route path="/dashboard" element={<Shell><AuthRoute><DashboardPage /></AuthRoute></Shell>} />
        <Route path="/rooms" element={<Shell><Rooms /></Shell>} />
        <Route path="/rooms/new" element={<Shell><AuthRoute><RoomCreate /></AuthRoute></Shell>} />
        <Route path="/rooms/:id" element={<Shell><AuthRoute><RoomDetail /></AuthRoute></Shell>} />
        <Route path="/me/rooms" element={<Shell><AuthRoute><MyRooms /></AuthRoute></Shell>} />
        <Route path="/calendar" element={<Shell><AuthRoute><Calendar /></AuthRoute></Shell>} />
        <Route path="*" element={<Shell><NotFound /></Shell>} />
      </Routes>
    </>
  );
}

function RootApp() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default RootApp;
