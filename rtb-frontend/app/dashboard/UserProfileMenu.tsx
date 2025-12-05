"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  // optional: pass name/email from parent; otherwise component will try to read from localStorage
  name?: string;
  email?: string;
  onLogout: () => void;
  onOpenProfile?: () => void;
  onOpenHelp?: () => void;
}

export default function UserProfileMenu({
  name: propName,
  email: propEmail,
  onLogout,
  onOpenProfile,
  onOpenHelp,
}: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState<string | undefined>(propName);
  const [email, setEmail] = useState<string | undefined>(propEmail);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // derive initials
  const initials = (name ?? "User")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // click outside to close
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // if parent didn't pass user info, try to read from localStorage (example token or user)
  useEffect(() => {
    if (!propName || !propEmail) {
      try {
        const rawUser = localStorage.getItem("user"); // if you store user object
        if (rawUser) {
          const u = JSON.parse(rawUser);
          setName(u.name || u.username || u.fullName);
          setEmail(u.email);
          return;
        }
        // alternatively, decode JWT if you store token:
        const token = localStorage.getItem("token");
        if (token) {
          // optionally decode here manually or with jwt-decode (see README below)
          // naive decode: split token and base64 decode payload (no verification here)
          const payload = token.split(".")[1];
          if (payload) {
            const json = JSON.parse(atob(payload));
            setName(json.name || json.username || json.fullName);
            setEmail(json.email);
          }
        }
      } catch (err) {
        // ignore if parsing fails
      }
    }
  }, [propName, propEmail]);

  return (
    <div ref={menuRef} className="relative">
      <button
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-semibold focus:outline-none"
        title={name ?? "User"}
      >
        {initials}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-md border z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-semibold text-gray-800">{name ?? "User"}</p>
            <p className="text-xs text-gray-500 truncate">{email ?? "no-email@example.com"}</p>
          </div>

          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onOpenProfile?.();
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-50"
          >
            Profile
          </button>

          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onOpenHelp?.();
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-50"
          >
            Help (Emergency)
          </button>

          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
