"use client";

import React from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  name?: string;
  email?: string;
}

export default function ProfileModal({ open, onClose, name, email }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded p-6 w-80">
        <h3 className="text-lg font-semibold mb-2">Profile</h3>
        <p className="text-sm"><strong>Name:</strong> {name ?? "User"}</p>
        <p className="text-sm"><strong>Email:</strong> {email ?? "—"}</p>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-3 py-1 bg-blue-600 text-white rounded">Close</button>
        </div>
      </div>
    </div>
  );
}
