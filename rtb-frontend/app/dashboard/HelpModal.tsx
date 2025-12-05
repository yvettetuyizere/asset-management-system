"use client";

interface Props { open: boolean; onClose: () => void; phone?: string; }

export default function HelpModal({ open, onClose, phone = "0784 000 000" }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded p-6 w-80">
        <h3 className="text-lg font-semibold mb-2">Help / Emergency</h3>
        <p className="text-sm mb-4">If you need urgent support call:</p>
        <p className="text-sm font-medium">{phone}</p>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-3 py-1 bg-blue-600 text-white rounded">Close</button>
        </div>
      </div>
    </div>
  );
}
