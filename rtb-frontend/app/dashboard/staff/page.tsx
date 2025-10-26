"use client";
import { useState, useEffect } from "react";
import axios from "axios";

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

interface Request {
  _id: string;
  deviceType: string;
  quantity: number;
  priority: string;
  status: string;
  reason: string;
  school: {
    name: string;
    province: string;
    district: string;
  };
  createdAt: string;
}

interface Report {
  _id: string;
  issueType: string;
  description: string;
  severity: string;
  status: string;
  school: {
    name: string;
    province: string;
    district: string;
  };
  device: {
    serialNumber: string;
    deviceType: string;
    brand: string;
    model: string;
  };
  createdAt: string;
}

export default function StaffDashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [devicesRes, requestsRes, reportsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/devices"),
        axios.get("http://localhost:5000/api/requests"),
        axios.get("http://localhost:5000/api/reports")
      ]);

      setDevices(devicesRes.data);
      setRequests(requestsRes.data);
      setReports(reportsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await axios.put(`http://localhost:5000/api/requests/${requestId}/status`, {
        status: "Approved",
        reviewedBy: "staff", // In real app, get from auth context
        reviewNotes: "Approved by staff"
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await axios.put(`http://localhost:5000/api/requests/${requestId}/status`, {
        status: "Rejected",
        reviewedBy: "staff",
        reviewNotes: "Rejected by staff"
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const handleUpdateReportStatus = async (reportId: string, status: string) => {
    try {
      await axios.put(`http://localhost:5000/api/reports/${reportId}/status`, {
        status,
        assignedTo: "staff", // In real app, get from auth context
        resolution: status === "Resolved" ? "Issue resolved by staff" : ""
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error updating report status:", error);
    }
  };

  const stats = {
    totalDevices: devices.length,
    assignedDevices: devices.filter(d => d.status === "Assigned").length,
    availableDevices: devices.filter(d => d.status === "Available").length,
    pendingRequests: requests.filter(r => r.status === "Pending").length,
    totalReports: reports.length,
    openReports: reports.filter(r => r.status !== "Resolved" && r.status !== "Closed").length
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Staff Dashboard</h1>
      
      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="flex space-x-4 border-b">
          {["overview", "requests", "devices", "reports"].map((tab) => (
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

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div>
          {/* Stats Cards */}
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
              <h3 className="text-lg font-semibold text-gray-700">Pending Requests</h3>
              <p className="text-3xl font-bold text-red-600">{stats.pendingRequests}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Total Reports</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.totalReports}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Open Reports</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.openReports}</p>
            </div>
          </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-lg shadow mb-6">
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

          {/* Recent Reports */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Recent Issue Reports</h3>
            </div>
            <div className="p-6">
              {reports.slice(0, 5).map((report) => (
                <div key={report._id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{report.device.serialNumber} - {report.issueType}</p>
                    <p className="text-sm text-gray-600">{report.school.name}</p>
                    <p className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      report.status === "Reported" ? "bg-yellow-100 text-yellow-800" :
                      report.status === "Under Investigation" ? "bg-blue-100 text-blue-800" :
                      report.status === "In Progress" ? "bg-purple-100 text-purple-800" :
                      report.status === "Resolved" ? "bg-green-100 text-green-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {report.status}
                    </span>
                    {report.status !== "Resolved" && report.status !== "Closed" && (
                      <button
                        onClick={() => handleUpdateReportStatus(report._id, "In Progress")}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Assign to Me
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
                      }`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        request.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                        request.status === "Approved" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {request.status}
                      </span>
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
                      }`}>
                        {device.status}
                      </span>
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

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Issue Reports</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report._id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{report.device.serialNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{report.issueType}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        report.severity === "Critical" ? "bg-red-100 text-red-800" :
                        report.severity === "High" ? "bg-orange-100 text-orange-800" :
                        report.severity === "Medium" ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {report.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        report.status === "Reported" ? "bg-yellow-100 text-yellow-800" :
                        report.status === "Under Investigation" ? "bg-blue-100 text-blue-800" :
                        report.status === "In Progress" ? "bg-purple-100 text-purple-800" :
                        report.status === "Resolved" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{report.school.name}</td>
                    <td className="px-6 py-4">
                      {report.status !== "Resolved" && report.status !== "Closed" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateReportStatus(report._id, "In Progress")}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Assign
                          </button>
                          <button
                            onClick={() => handleUpdateReportStatus(report._id, "Resolved")}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Resolve
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
