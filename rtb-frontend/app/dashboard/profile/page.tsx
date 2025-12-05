"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import apiClient from "@/app/utils/api";
import { logout } from "@/app/utils/auth";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiClient.get("/profile/me");
        if (!mounted) return;
        setUser(res.data || null);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onFile = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = (e) => setAvatarPreview(e.target?.result as string);
    r.readAsDataURL(f);
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 900 }}>
        <h1 style={{ color: "#1e3a8a" }}>Profile</h1>
        {!user && <p>Loading...</p>}
        {user && (
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            <div style={{ width: 200 }}>
              <div style={{ width: 160, height: 160, borderRadius: 12, overflow: "hidden", background: "#fff" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarPreview || user.avatar || `/api/avatars/${user.id}`}
                  alt="avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <p><strong>Name:</strong> {user.name || user.fullName || "-"}</p>
              <p><strong>Email:</strong> {user.email || "-"}</p>
              <p><strong>Role:</strong> {user.role || "-"}</p>

              <div style={{ marginTop: 20 }}>
                <button onClick={() => logout()} style={{ padding: "8px 12px", background: "#ef4444", color: "white", border: "none", borderRadius: 6 }}>Logout</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
