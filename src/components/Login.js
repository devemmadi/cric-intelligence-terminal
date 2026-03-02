import React from 'react';

const Login = ({ onLogin }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a] text-white">
      <div className="bg-[#1e293b]/50 p-10 rounded-[40px] w-full max-w-md shadow-2xl border border-white/10 backdrop-blur-md">
        <h2 className="text-3xl font-black mb-8 text-center tracking-tight">
          Login to <span className="text-blue-500">UltraPredict</span>
        </h2>
        <div className="space-y-6">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-4 bg-[#0f172a] rounded-2xl border border-white/5 focus:border-blue-500 outline-none transition-all"
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-4 bg-[#0f172a] rounded-2xl border border-white/5 focus:border-blue-500 outline-none transition-all"
          />
          <button 
            onClick={onLogin} 
            className="w-full bg-blue-600 p-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            Enter Platform
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;