// app/components/DashboardLayout.tsx
"use client";

import { ReactNode, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaLaptop, FaUsers, FaBell, FaFileAlt, FaSignOutAlt, FaHome, FaUser, FaQuestionCircle } from "react-icons/fa";
import { logout, getToken } from "@/app/utils/auth";
import apiClient from "@/app/utils/api";

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
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        {/* Logo/Brand */}
        <div style={{ padding: "1.5rem 1.5rem", marginBottom: "2rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold" }}>AMS</h2>
          <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.75rem", opacity: 0.8 }}>Asset Management System </p>
        </div>

        {/* (Profile moved to bottom) */}

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

        {/* Profile area at bottom (compact) */}
        <div style={{ padding: "0 1.5rem", position: "relative", zIndex: 999 }}>
          <ProfileArea compact bottom />
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ marginLeft: "250px", width: "calc(100% - 250px)", padding: "2rem" }}>
        {children}
      </main>
    </div>
  );
}

function ProfileArea({ compact, bottom }: { compact?: boolean; bottom?: boolean } = {}) {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get("/profile/me");
        if (!mounted) return;
        const user = res.data;
        setUserName(user?.name || user?.fullName || null);
        setUserEmail(user?.email || null);
      } catch (err) {
        // ignore — profile may not be available on some routes
        // Try to recover name/email from stored JWT so initials show
        try {
          const token = getToken();
          if (token) {
            const payload = decodeJwt(token);
            if (payload) {
              if (mounted && !userName) setUserName(payload.name || payload.fullName || payload.email || null);
              if (mounted && !userEmail) setUserEmail(payload.email || null);
            }
          }
        } catch (e) {
          // swallow
        }
      }
    };
    fetchProfile();
    return () => {
      mounted = false;
    };
  }, []);

  // decode JWT payload (no verification) to extract name/email for initials fallback
  function decodeJwt(token: string | null) {
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1];
      // base64url -> base64
      const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(b64)
          .split("")
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(json);
    } catch (err) {
      return null;
    }
  }

  const initials = (() => {
    if (avatarDataUrl) return null; // if user uploaded image we don't show initials
    const name = userName || userEmail || "";
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  })();

  const onSelectImage = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      setAvatarDataUrl(data);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const measureAndOpen = () => {
    const el = avatarRef.current;
    console.log("measureAndOpen invoked", { el, open, nextOpen: !open });
    if (!el) {
      setOpen((s) => !s);
      console.log("measureAndOpen: avatar element not found, toggled open to", !open);
      return;
    }
    const rect = el.getBoundingClientRect();
    console.log("measureAndOpen: avatar rect", { top: rect.top, left: rect.left, bottom: rect.bottom, right: rect.right, width: rect.width, height: rect.height });
    const estimatedHeight = 180; // approximate dropdown height
    // prefer showing above the avatar for bottom compact mode
    if (bottom && compact) {
      const top = Math.max(8, Math.round(rect.top - estimatedHeight - 8));
      const left = Math.round(rect.left);
      setPopupStyle({ position: "fixed", left, top, width: 260, zIndex: 10000 });
      console.log("measureAndOpen: set popup above avatar for bottom/compact", { top, left, avatarSize, estimatedHeight });
    } else {
      // show below avatar
      const left = Math.round(rect.left);
      const top = Math.round(rect.bottom + 8);
      setPopupStyle({ position: "fixed", left, top, width: 260, zIndex: 10000 });
      console.log("measureAndOpen: set popup below avatar", { top, left });
    }
    setOpen((s) => !s);
    console.log("measureAndOpen: toggling open, was", open, "now will be", !open);
  };
  // smaller avatar and left-aligned when compact & bottom
  const avatarSize = compact && bottom ? 28 : compact ? 36 : 48;
  const fontSize = compact && bottom ? 12 : compact ? 14 : 16;
  const borderWidth = compact && bottom ? "1px" : compact ? "1px" : "2px";

  const containerStyle: React.CSSProperties = bottom && compact
    ? { position: "absolute", bottom: "1.5rem", left: "1.5rem", padding: 0, display: "flex", alignItems: "center", gap: "0.5rem" }
    : bottom
    ? { position: "absolute", bottom: "2rem", left: 0, right: 0, padding: "0 1.5rem", display: "flex", justifyContent: "center" }
    : compact
    ? { padding: "0", display: "flex", alignItems: "center", gap: "0.5rem" }
    : { position: "absolute", bottom: "2rem", left: 0, right: 0, padding: "0 1.5rem", display: "flex", justifyContent: "center" };

  const dropdownStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: 8,
    boxShadow: "0 6px 18px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
    overflow: "hidden",
    zIndex: 10000,
    ...(bottom && compact ? {
      position: "absolute",
      bottom: avatarSize + 12,
      left: 12,
      width: 260,
    } : {
      marginTop: 10,
      width: 260,
    })
  };

  // Prevent hydration mismatch: only render if client
  if (!isClient) {
    return (
      <div style={containerStyle}>
        <div style={compact ? { width: "auto", position: "relative" } : { width: "100%", maxWidth: 340, position: "relative" }}>
          {/* Placeholder on server - will be hydrated on client */}
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={compact ? { width: "auto", position: "relative" } : { width: "100%", maxWidth: 340, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            ref={avatarRef}
            onClick={measureAndOpen}
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: 999,
              backgroundColor: avatarDataUrl ? "transparent" : "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1e3a8a",
              fontWeight: 700,
              cursor: "pointer",
              overflow: "hidden",
              border: `${borderWidth} solid rgba(255,255,255,0.12)`,
            }}
            title={userName || userEmail || "User"}
          >
            {avatarDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarDataUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize }}>{initials}</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "rgba(255,255,255,0.95)", fontWeight: 600, fontSize: compact ? "0.9rem" : undefined }}>{userName || userEmail || "User"}</div>
            {/* hide email in very compact bottom mode to keep single-line layout */}
            {! (compact && bottom) && (
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: compact ? "0.75rem" : "0.85rem" }}>{userEmail || ""}</div>
            )}
          </div>
        </div>

        {/* Backdrop to close dropdown */}
        {isClient && open && <div style={{ position: "fixed", inset: 0, zIndex: 9999 }} onClick={() => setOpen(false)} />}

        {/* Dropdown using fixed positioning */}
        {isClient && open && popupStyle && (
          <div style={{...popupStyle, backgroundColor: "white", borderRadius: 8, boxShadow: "0 6px 18px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)", overflow: "hidden"}}>
            <div
              style={{ 
                padding: "0.75rem 1rem", 
                display: "flex", 
                alignItems: "center", 
                gap: "0.75rem", 
                cursor: "pointer",
                backgroundColor: "white",
                transition: "background-color 0.2s ease"
              }}
              onClick={() => {
                setOpen(false);
                if (typeof window !== "undefined") window.location.href = "/dashboard/profile";
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f5f5f5"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
            >
              <FaUser color="#1e3a8a" size={18} />
              <div>
                <div style={{ fontWeight: 600, color: "#1e3a8a" }}>Profile</div>
                <div style={{ fontSize: "0.85rem", color: "#666" }}>View your profile</div>
              </div>
            </div>

            <div
              style={{ 
                padding: "0.75rem 1rem", 
                display: "flex", 
                alignItems: "center", 
                gap: "0.75rem", 
                cursor: "default",
                backgroundColor: "white"
              }}
            >
              <FaQuestionCircle color="#1e3a8a" size={18} />
              <div>
                <div style={{ fontWeight: 600, color: "#1e3a8a" }}>Help</div>
                <div style={{ fontSize: "0.85rem", color: "#666" }}>Emergency: +1 (555) 123-4567</div>
              </div>
            </div>

            <div
              style={{ padding: "0.5rem 1rem", borderTop: "1px solid #eee", display: "flex", gap: 8, backgroundColor: "white" }}
            >
              <button
                onClick={handleUploadClick}
                style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: 6, border: "1px solid #e6e6e6", background: "white", cursor: "pointer" }}
              >
                Upload Photo
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onSelectImage(file);
                }}
              />
              <button
                onClick={() => {
                  setOpen(false);
                  if (confirm("Are you sure you want to logout?")) logout();
                }}
                style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: 6, border: "1px solid #ef4444", background: "#fff7f7", color: "#ef4444", cursor: "pointer" }}
              >
                <span style={{ display: "inline-flex", marginRight: 8 }}><FaSignOutAlt /></span> Logout
              </button>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
