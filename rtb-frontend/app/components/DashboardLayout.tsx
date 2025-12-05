// app/components/DashboardLayout.tsx
"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaLaptop, FaUsers, FaBell, FaFileAlt, FaSignOutAlt, FaHome } from "react-icons/fa";
import { logout } from "@/app/utils/auth";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  const navigationItems = [
    { label: "Dashboard", href: "/dashboard", icon: FaHome },
    { label: "Devices", href: "/dashboard/devices", icon: FaLaptop },
    { label: "Users", href: "/dashboard/users", icon: FaUsers },
    { label: "Notifications", href: "/dashboard/notifications", icon: FaBell },
    { label: "Reports", href: "/dashboard/reports", icon: FaFileAlt },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard" && pathname === "/dashboard") return true;
    if (href !== "/dashboard" && pathname.includes(href)) return true;
    return false;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {/* Vertical Sidebar */}
      <aside
        style={{
          width: "250px",
          backgroundColor: "#1e3a8a",
          color: "white",
          padding: "2rem 0",
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Logo/Brand */}
        <div style={{ padding: "1.5rem 1.5rem", marginBottom: "2rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold" }}>AMS</h2>
          <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.75rem", opacity: 0.8 }}>Asset Management</p>
        </div>

        {/* Navigation Items */}
        <nav>
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1rem 1.5rem",
                color: "white",
                textDecoration: "none",
                borderLeft: isActive(item.href) ? "4px solid #60a5fa" : "4px solid transparent",
                backgroundColor: isActive(item.href) ? "rgba(96, 165, 250, 0.1)" : "transparent",
                transition: "all 0.3s ease",
                fontSize: "0.95rem",
                fontWeight: isActive(item.href) ? "600" : "500",
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.href)) {
                  e.currentTarget.style.backgroundColor = "rgba(96, 165, 250, 0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.href)) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <item.icon size="1.25rem" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button at Bottom */}
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            left: 0,
            right: 0,
            padding: "0 1.5rem",
          }}
        >
          <button
            onClick={() => {
              if (confirm("Are you sure you want to logout?")) {
                logout();
              }
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: "#fca5a5",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: "500",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
            }}
          >
            <FaSignOutAlt size="1.25rem" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ marginLeft: "250px", width: "calc(100% - 250px)", padding: "2rem" }}>
        {children}
      </main>
    </div>
  );
}
