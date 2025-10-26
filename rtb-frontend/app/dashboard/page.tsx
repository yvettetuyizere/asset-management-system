"use client";

import { useEffect, useState } from "react";
import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBRow,
  MDBCol,
} from "mdb-react-ui-kit";
import { IconType } from "react-icons";
import { FaLaptop, FaVideo, FaUsers, FaUserCog, FaSchool, FaBell, FaFileAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios";

interface IconProps {
  icon: IconType;
  color?: string;
  size?: string;
}

const Icon = ({ icon: IconComponent, color = "#000", size = "1.5rem" }: IconProps) => {
  return <IconComponent color={color} size={size} />;
};

const DashboardPage = () => {
  const router = useRouter();

  const [laptopCount, setLaptopCount] = useState(0);
  const [projectorCount, setProjectorCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [technicianCount, setTechnicianCount] = useState(0);
  const [schoolCount, setSchoolCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [laptopRegistered, setLaptopRegistered] = useState(0);
  const [laptopAssigned, setLaptopAssigned] = useState(0);
  const [projectorRegistered, setProjectorRegistered] = useState(0);
  const [projectorAssigned, setProjectorAssigned] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await axios.get("http://localhost:5000/api/users/count");
        const devicesRes = await axios.get("http://localhost:5000/api/devices/count");

        const userData = usersRes.data;
        const devicesData = devicesRes.data;

        setStaffCount(userData.staffUsers);
        setTechnicianCount(userData.techUsers);
        setSchoolCount(userData.schoolUsers);

        setLaptopCount(devicesData.totalLaptops);
        setProjectorCount(devicesData.totalProjectors);

        setLaptopRegistered(devicesData.laptopsUnassigned);
        setLaptopAssigned(devicesData.laptopsAssigned);
        setProjectorRegistered(devicesData.projectorsUnassigned);
        setProjectorAssigned(devicesData.projectorsAssigned);

        setNotificationCount(5);
        setReportCount(2);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  const cardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "15px",
    border: "1px solid #e0e0e0",
    minHeight: "200px",
  };

  const subCardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    padding: "1rem",
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
  };

  return (
    <div className="container mt-4">
      <h5 className="mb-3 fw-bold">📦 Devices</h5>

      <MDBRow className="d-flex justify-content-between mb-3">
        <MDBCol md="5" sm="12" className="mb-3">
          <MDBCard className="shadow-3 text-center text-dark" style={cardStyle}>
            <MDBCardBody>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Icon icon={FaLaptop} color="#007bff" />
                <MDBCardTitle className="fs-6">Laptop</MDBCardTitle>
              </div>
              <h4>{laptopCount} Total</h4>

              <MDBRow className="mt-3">
                <MDBCol md="6">
                  <MDBCard style={subCardStyle}>
                    <MDBCardBody>
                      <MDBCardTitle className="fs-6">Unassigned: {laptopRegistered}</MDBCardTitle>
                    </MDBCardBody>
                  </MDBCard>
                </MDBCol>
                <MDBCol md="6">
                  <MDBCard style={subCardStyle}>
                    <MDBCardBody>
                      <MDBCardTitle className="fs-6">Assigned: {laptopAssigned}</MDBCardTitle>
                    </MDBCardBody>
                  </MDBCard>
                </MDBCol>
              </MDBRow>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>

        <MDBCol md="5" sm="12" className="mb-3">
          <MDBCard className="shadow-3 text-center text-dark" style={cardStyle}>
            <MDBCardBody>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Icon icon={FaVideo} color="#28a745" />
                <MDBCardTitle className="fs-6">Projector</MDBCardTitle>
              </div>
              <h4>{projectorCount} Total</h4>

              <MDBRow className="mt-3">
                <MDBCol md="6">
                  <MDBCard style={subCardStyle}>
                    <MDBCardBody>
                      <MDBCardTitle className="fs-6">Unassigned: {projectorRegistered}</MDBCardTitle>
                    </MDBCardBody>
                  </MDBCard>
                </MDBCol>
                <MDBCol md="6">
                  <MDBCard style={subCardStyle}>
                    <MDBCardBody>
                      <MDBCardTitle className="fs-6">Assigned: {projectorAssigned}</MDBCardTitle>
                    </MDBCardBody>
                  </MDBCard>
                </MDBCol>
              </MDBRow>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>

      <h5 className="mb-3 fw-bold">👥 Users</h5>
      <MDBRow className="d-flex justify-content-between mb-3">
        <MDBCol md="3" sm="12" className="mb-3">
          <MDBCard style={{ ...cardStyle, height: 120 }} className="text-center shadow-3">
            <MDBCardBody>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Icon icon={FaUsers} color="#ffc107" />
                <MDBCardTitle className="fs-6">Staff</MDBCardTitle>
              </div>
              <h4>{staffCount}</h4>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>

        <MDBCol md="3" sm="12" className="mb-3">
          <MDBCard style={{ ...cardStyle, height: 120 }} className="text-center shadow-3">
            <MDBCardBody>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Icon icon={FaUserCog} color="#17a2b8" />
                <MDBCardTitle className="fs-6">Technicians</MDBCardTitle>
              </div>
              <h4>{technicianCount}</h4>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>

        <MDBCol md="3" sm="12" className="mb-3">
          <MDBCard style={{ ...cardStyle, height: 120 }} className="text-center shadow-3">
            <MDBCardBody>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Icon icon={FaSchool} color="#6f42c1" />
                <MDBCardTitle className="fs-6">Schools</MDBCardTitle>
              </div>
              <h4>{schoolCount}</h4>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>

      <h5 className="mb-3 fw-bold">📢 Notifications & Reports</h5>
      <MDBRow className="d-flex justify-content-between mb-3">
        <MDBCol md="3" sm="12" className="mb-3">
          <MDBCard style={{ ...cardStyle, height: 120 }} className="text-center shadow-3">
            <MDBCardBody>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Icon icon={FaBell} color="#007bff" />
                <MDBCardTitle className="fs-6">Notifications</MDBCardTitle>
              </div>
              <h4>{notificationCount}</h4>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>

        <MDBCol md="3" sm="12" className="mb-3">
          <MDBCard style={{ ...cardStyle, height: 120 }} className="text-center shadow-3">
            <MDBCardBody>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Icon icon={FaFileAlt} color="#28a745" />
                <MDBCardTitle className="fs-6">Reports</MDBCardTitle>
              </div>
              <h4>{reportCount}</h4>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </div>
  );
};

export default DashboardPage;
