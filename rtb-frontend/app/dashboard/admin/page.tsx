"use client";
import { useState, useEffect } from "react";
import axios from "axios";

// ------------------ Types ------------------
interface Stats {
  totalDevices: number;
  assignedDevices: number;
  availableDevices: number;
  totalSchools: number;
  pendingRequests: number;
  totalReports: number;
}

interface Device {
  _id: string;
  serialNumber: string;
  deviceType: string;
  brand: string;
  model: string;
  status: string;
  assignedTo?: {
    name: string;
    province: string;
    district: string;
  };
}

interface School {
  _id: string;
  name: string;
  province: string;
  district: string;
  sector: string;
  headteacher: {
    name: string;
    phone: string;
  };
}

interface Request {
  _id: string;
  deviceType: string;
  quantity: number;
  priority: string;
  status: string;
  school: {
    name: string;
    province: string;
    district: string;
  };
  createdAt: string;
}

interface User {
  _id?: string;
  username: string;
  email: string;
  role: string;
}

// ------------------ ProfileDropdown Component ------------------
interface ProfileDropdownProps {
  user: User;
  onLogout: () => void;
}

function ProfileDropdown({ user, onLogout }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0].toUpperCase())
      .join("");
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold"
      >
        {getInitials(user.username)}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <p className="font-semibold">{user.username}</p>
            <p className="text-sm text-gray-500">{user.role}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            onClick={() => alert("Help: Call +250 123 456 789")}
          >
            Help
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

// ------------------ AdminDashboard Component ------------------
export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock current user
  const [currentUser, setCurrentUser] = useState<User | null>({
    username: "Tuyizere Yvette",
    email: "yvette@example.com",
    role: "Admin",
  });

  const handleLogout = () => {
    console.log("Logging out...");
    setCurrentUser(null);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [devicesRes, schoolsRes, requestsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/devices"),
        axios.get("http://localhost:5000/api/schools"),
        axios.get("http://localhost:5000/api/requests"),
      ]);

      const devicesData = devicesRes.data;
      const schoolsData = schoolsRes.data;
      const requestsData = requestsRes.data;

      setDevices(devicesData);
      setSchools(schoolsData);
      setRequests(requestsData);

      const totalDevices = devicesData.length;
      const assignedDevices = devicesData.filter((d: Device) => d.status === "Assigned").length;
      const availableDevices = devicesData.filter((d: Device) => d.status === "Available").length;
      const pendingRequests = requestsData.filter((r: Request) => r.status === "Pending").length;

      setStats({
        totalDevices,
        assignedDevices,
        availableDevices,
        totalSchools: schoolsData.length,
        pendingRequests,
        totalReports: 0,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await axios.put(`http://localhost:5000/api/requests/${requestId}/status`, {
        status: "Approved",
        reviewedBy: currentUser?.username || "admin",
        reviewNotes: "Approved by admin",
      });
      fetchData();
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await axios.put(`http://localhost:5000/api/requests/${requestId}/status`, {
        status: "Rejected",
        reviewedBy: currentUser?.username || "admin",
        reviewNotes: "Rejected by admin",
      });
      fetchData();
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  if (!stats) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      {/* Header with profile */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        {currentUser && <ProfileDropdown user={currentUser} onLogout={handleLogout} />}
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="flex space-x-4 border-b">
          {["overview", "users", "devices", "schools", "requests"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- Tabs Content ---------------- */}

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Total Devices</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalDevices}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Assigned Devices</h3>
              <p className="text-3xl font-bold text-green-600">{stats.assignedDevices}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Available Devices</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.availableDevices}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Total Schools</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.totalSchools}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Pending Requests</h3>
              <p className="text-3xl font-bold text-red-600">{stats.pendingRequests}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Total Reports</h3>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalReports}</p>
            </div>
          </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Recent Requests</h3>
            </div>
            <div className="p-6">
              {requests.slice(0, 5).map((request) => (
                <div key={request._id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{request.deviceType} x{request.quantity}</p>
                    <p className="text-sm text-gray-600">{request.school.name}</p>
                    <p className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      request.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                      request.status === "Approved" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {request.status}
                    </span>
                    {request.status === "Pending" && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleApproveRequest(request._id)}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request._id)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Devices Tab */}
      {activeTab === "devices" && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">All Devices</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand/Model</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {devices.map((device) => (
                  <tr key={device._id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{device.serialNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{device.deviceType}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{device.brand} {device.model}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        device.status === "Available" ? "bg-green-100 text-green-800" :
                        device.status === "Assigned" ? "bg-blue-100 text-blue-800" :
                        device.status === "Damaged" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>{device.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {device.assignedTo ? `${device.assignedTo.name}, ${device.assignedTo.district}` : "Not assigned"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schools Tab */}
      {activeTab === "schools" && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">All Schools</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Headteacher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {schools.map((school) => (
                  <tr key={school._id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{school.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{school.sector}, {school.district}, {school.province}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{school.headteacher.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{school.headteacher.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === "requests" && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Device Requests</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{request.school.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{request.deviceType}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{request.quantity}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        request.priority === "High" ? "bg-red-100 text-red-800" :
                        request.priority === "Medium" ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      }`}>{request.priority}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        request.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                        request.status === "Approved" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      }`}>{request.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      {request.status === "Pending" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveRequest(request._id)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request._id)}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
