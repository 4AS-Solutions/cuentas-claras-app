"use client";

export default function AuthBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">

      {/* gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-teal-500 to-blue-600 animate-gradient" />

      {/* blur circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/20 rounded-full blur-3xl animate-pulse" />

      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />

    </div>
  );
}