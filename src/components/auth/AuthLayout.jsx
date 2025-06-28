import React from "react";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-900 via-indigo-900 to-purple-900">
      <div className="bg-white/90 rounded-xl shadow-2xl px-8 py-10 w-full max-w-md relative">
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 rounded-full h-20 w-20 flex items-center justify-center shadow-xl border-4 border-white">
            <span className="text-4xl text-white font-bold">🤖</span>
          </div>
        </div>
        <div className="mt-14 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 mt-2 mb-6">{subtitle}</p>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}