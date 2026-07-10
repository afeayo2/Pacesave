import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ClientDashboard from "./pages/client/ClientDashboard";
import ClientLoans from "./pages/client/ClientLoans";
import ClientSavings from "./pages/client/ClientSavings";
import ClientWithdraw from "./pages/client/ClientWithdraw";
import ClientProfile from "./pages/client/ClientProfile";

import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffClients from "./pages/staff/StaffClients";
import StaffOnboard from "./pages/staff/StaffOnboard";
import StaffCollect from "./pages/staff/StaffCollect";
import StaffLoans from "./pages/staff/StaffLoans";

import FrontdeskDashboard from "./pages/frontdesk/FrontdeskDashboard";
import FrontdeskSearch from "./pages/frontdesk/FrontdeskSearch";
import FrontdeskComplaints from "./pages/frontdesk/FrontdeskComplaints";
import FrontdeskCalls from "./pages/frontdesk/FrontdeskCalls";

import IctDashboard from "./pages/ict/IctDashboard";
import IctStaff from "./pages/ict/IctStaff";
import IctInventory from "./pages/ict/IctInventory";
import IctComplaints from "./pages/ict/IctComplaints";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClients from "./pages/admin/AdminClients";
import AdminLoans from "./pages/admin/AdminLoans";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import AdminStaff from "./pages/admin/AdminStaff";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/client" element={<ProtectedRoute roles={["client"]}><ClientDashboard /></ProtectedRoute>} />
      <Route path="/client/loans" element={<ProtectedRoute roles={["client"]}><ClientLoans /></ProtectedRoute>} />
      <Route path="/client/savings" element={<ProtectedRoute roles={["client"]}><ClientSavings /></ProtectedRoute>} />
      <Route path="/client/withdraw" element={<ProtectedRoute roles={["client"]}><ClientWithdraw /></ProtectedRoute>} />
      <Route path="/client/profile" element={<ProtectedRoute roles={["client"]}><ClientProfile /></ProtectedRoute>} />

      <Route path="/staff" element={<ProtectedRoute roles={["staff"]}><StaffDashboard /></ProtectedRoute>} />
      <Route path="/staff/clients" element={<ProtectedRoute roles={["staff"]}><StaffClients /></ProtectedRoute>} />
      <Route path="/staff/onboard" element={<ProtectedRoute roles={["staff"]}><StaffOnboard /></ProtectedRoute>} />
      <Route path="/staff/collect" element={<ProtectedRoute roles={["staff"]}><StaffCollect /></ProtectedRoute>} />
      <Route path="/staff/loans" element={<ProtectedRoute roles={["staff"]}><StaffLoans /></ProtectedRoute>} />

      <Route path="/frontdesk" element={<ProtectedRoute roles={["frontdesk"]}><FrontdeskDashboard /></ProtectedRoute>} />
      <Route path="/frontdesk/search" element={<ProtectedRoute roles={["frontdesk"]}><FrontdeskSearch /></ProtectedRoute>} />
      <Route path="/frontdesk/complaints" element={<ProtectedRoute roles={["frontdesk"]}><FrontdeskComplaints /></ProtectedRoute>} />
      <Route path="/frontdesk/calls" element={<ProtectedRoute roles={["frontdesk"]}><FrontdeskCalls /></ProtectedRoute>} />

      <Route path="/ict" element={<ProtectedRoute roles={["ict"]}><IctDashboard /></ProtectedRoute>} />
      <Route path="/ict/staff" element={<ProtectedRoute roles={["ict"]}><IctStaff /></ProtectedRoute>} />
      <Route path="/ict/inventory" element={<ProtectedRoute roles={["ict"]}><IctInventory /></ProtectedRoute>} />
      <Route path="/ict/complaints" element={<ProtectedRoute roles={["ict"]}><IctComplaints /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/clients" element={<ProtectedRoute roles={["admin"]}><AdminClients /></ProtectedRoute>} />
      <Route path="/admin/loans" element={<ProtectedRoute roles={["admin"]}><AdminLoans /></ProtectedRoute>} />
      <Route path="/admin/withdrawals" element={<ProtectedRoute roles={["admin"]}><AdminWithdrawals /></ProtectedRoute>} />
      <Route path="/admin/staff" element={<ProtectedRoute roles={["admin"]}><AdminStaff /></ProtectedRoute>} />

      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
