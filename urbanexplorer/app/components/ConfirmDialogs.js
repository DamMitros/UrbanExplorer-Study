"use client";

export default function ConfirmDialog({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6 max-w-md w-full">
        <p className="text-lg text-slate-800 mb-6">{message}</p>  
        <div className="flex justify-end gap-4">
          <button onClick={onCancel} className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors duration-200">Anuluj</button>
          <button onClick={onConfirm} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200">Potwierdź</button>
        </div>
      </div>
    </div>
  );
}