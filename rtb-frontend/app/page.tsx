"use client";

import { useEffect, useState } from "react";
import { MDBBtn, MDBCard, MDBCardBody, MDBCardTitle, MDBCardText } from "mdb-react-ui-kit";

type Device = {
  id: number;
  nameTag: string;
  category: string;
  status: string;
};

export default function Home() {
  const [devices, setDevices] = useState<Device[]>([]);

  // Fetch devices from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/devices")
      .then(res => res.json())
      .then(data => setDevices(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <h1 className="text-3xl font-bold mb-6 text-black dark:text-zinc-50">RTB Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {devices.map((device) => (
          <MDBCard key={device.id}>
            <MDBCardBody>
              <MDBCardTitle>{device.nameTag}</MDBCardTitle>
              <MDBCardText>
                Category: {device.category} <br />
                Status: {device.status}
              </MDBCardText>
              <MDBBtn color="primary">View Details</MDBBtn>
            </MDBCardBody>
          </MDBCard>
        ))}
      </div>
    </div>
  );
}
