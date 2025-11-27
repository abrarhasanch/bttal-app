import React from 'react';

function Toast({ message, isVisible }) {
  if (!isVisible || !message) return null;
  return (
    <div className="fixed top-5 right-5 bg-indigo-600 text-white p-4 rounded-lg shadow-xl z-[100] animate-fade-in-down text-sm font-medium">
      {message}
    </div>
  );
}

export default Toast;
