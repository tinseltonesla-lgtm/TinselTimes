
import React, { useState } from 'react';
import { Performer } from '../types';
import { Music, ShieldCheck, Users, UserPlus, LogIn, AlertCircle, Lock } from 'lucide-react';

interface LandingProps {
  performers: Performer[];
  onLogin: (user: Performer | 'ADMIN') => void;
  onRegister: () => void;
}

const Landing: React.FC<LandingProps> = ({ performers, onLogin, onRegister }) => {
  // Separate states for Caroler Login
  const [cUsername, setCUsername] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [cError, setCError] = useState('');

  // Separate states for Admin Login
  const [aUsername, setAUsername] = useState('');
  const [aPassword, setAPassword] = useState('');
  const [aError, setAError] = useState('');

  const handleCarolerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setCError('');
    
    const user = performers.find(
      p => p.username === cUsername && p.password === cPassword
    );

    if (user) {
      // Allow even admins to login here, but they'll be treated as performers 
      // by default in the UI unless App logic switches them.
      onLogin(user);
    } else {
      setCError('Invalid caroler credentials.');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAError('');
    
    const user = performers.find(
      p => p.username === aUsername && p.password === aPassword
    );

    if (user && user.isAdmin) {
      onLogin(user);
    } else if (user && !user.isAdmin) {
      setAError('This account does not have admin privileges.');
    } else {
      setAError('Invalid admin credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center relative overflow-hidden">
      {/* Decorative Brand Circles */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-brandPink rounded-full opacity-5 blur-3xl"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-brandCobalt rounded-full opacity-5 blur-3xl"></div>

      <div className="max-w-6xl mx-auto px-4 w-full relative z-10 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-brandPink rounded-3xl mb-8 shadow-2xl shadow-brandPink/20">
            <Music className="text-white w-12 h-12" />
          </div>
          <h1 className="serif text-6xl md:text-8xl font-bold text-black mb-6">TinselTimes</h1>
          <p className="text-gray-600 text-xl md:text-2xl max-w-2xl mx-auto font-light mb-10 leading-relaxed tracking-wide">
            Tinseltones Portal for Caroler Information and Scheduling
          </p>
          <div className="flex justify-center">
            <button 
              onClick={onRegister}
              className="inline-flex items-center gap-3 bg-brandPink hover:bg-[#E60073] text-white font-bold py-5 px-12 rounded-2xl transition-all shadow-xl shadow-brandPink/20 text-xl group"
            >
              <UserPlus size={24} className="group-hover:scale-110 transition-transform" />
              Join the Roster
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch">
          
          {/* Caroler Login Column */}
          <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-pink-50 text-brandPink rounded-2xl">
                <Users size={28} />
              </div>
              <h2 className="text-3xl font-bold text-black serif">Caroler Portal</h2>
            </div>
            
            <form onSubmit={handleCarolerLogin} className="space-y-6 flex-grow">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Username</label>
                <input 
                  type="text"
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brandPink outline-none transition-all text-sm font-medium"
                  placeholder="Caroler username"
                  value={cUsername}
                  onChange={(e) => setCUsername(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                <input 
                  type="password"
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brandPink outline-none transition-all text-sm font-medium"
                  placeholder="••••••••"
                  value={cPassword}
                  onChange={(e) => setCPassword(e.target.value)}
                />
              </div>

              {cError && (
                <div className="flex items-center gap-2 text-brandPink text-xs font-bold bg-pink-50 p-3 rounded-lg border border-pink-100">
                  <AlertCircle size={14} />
                  {cError}
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-black text-white font-bold py-5 rounded-xl transition-all hover:bg-brandPink shadow-lg flex items-center justify-center gap-2"
              >
                <LogIn size={20} />
                Caroler Login
              </button>
            </form>
          </div>

          {/* Admin Login Column */}
          <div className="bg-gray-50/50 border border-gray-100 p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-brandCobalt/10 text-brandCobalt rounded-2xl">
                <ShieldCheck size={28} />
              </div>
              <h2 className="text-3xl font-bold text-black serif">Admin Access</h2>
            </div>
            
            <form onSubmit={handleAdminLogin} className="space-y-6 flex-grow">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin Username</label>
                <input 
                  type="text"
                  required
                  className="w-full p-4 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-brandCobalt outline-none transition-all text-sm font-medium"
                  placeholder="Administrator"
                  value={aUsername}
                  onChange={(e) => setAUsername(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin Password</label>
                <input 
                  type="password"
                  required
                  className="w-full p-4 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-brandCobalt outline-none transition-all text-sm font-medium"
                  placeholder="••••••••"
                  value={aPassword}
                  onChange={(e) => setAPassword(e.target.value)}
                />
              </div>

              {aError && (
                <div className="flex items-center gap-2 text-brandCobalt text-xs font-bold bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <AlertCircle size={14} />
                  {aError}
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-brandCobalt text-white font-bold py-5 rounded-xl transition-all hover:bg-black shadow-lg flex items-center justify-center gap-2"
              >
                <Lock size={20} />
                Admin Login
              </button>
            </form>
          </div>

        </div>
        <p className="mt-12 text-center text-xs text-gray-400 uppercase tracking-widest font-black flex items-center justify-center gap-2">
           <Lock size={12} /> Secure Multi-Role Portal
        </p>
      </div>
    </div>
  );
};

export default Landing;
