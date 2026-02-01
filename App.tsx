
import React, { useState, useEffect } from 'react';
import { View, Performer, Gig, Conflict, AssignmentStatus } from './types';
import { INITIAL_PERFORMERS, INITIAL_GIGS } from './constants';
import AdminPortal from './components/AdminPortal';
import CarolerPortal from './components/CarolerPortal'; // Updated import
import RegistrationForm from './components/RegistrationForm';
import Landing from './components/Landing';
import { Music, User, LogOut, Shield } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<View>('LANDING');
  const [performers, setPerformers] = useState<Performer[]>(INITIAL_PERFORMERS);
  const [gigs, setGigs] = useState<Gig[]>(INITIAL_GIGS);
  const [currentUser, setCurrentUser] = useState<Performer | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    const savedPerformers = localStorage.getItem('carolsync_v3_performers');
    const savedGigs = localStorage.getItem('carolsync_v3_gigs');
    if (savedPerformers) setPerformers(JSON.parse(savedPerformers));
    if (savedGigs) setGigs(JSON.parse(savedGigs));
  }, []);

  useEffect(() => {
    localStorage.setItem('carolsync_v3_performers', JSON.stringify(performers));
    localStorage.setItem('carolsync_v3_gigs', JSON.stringify(gigs));
  }, [performers, gigs]);

  const handleLogin = (user: Performer | 'ADMIN') => {
    if (typeof user === 'string') return; 

    setCurrentUser(user);
    if (user.isAdmin) {
      setView('ADMIN_PORTAL');
      setIsAdminView(true);
    } else {
      setView('SINGER_PORTAL');
      setIsAdminView(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdminView(false);
    setView('LANDING');
  };

  const togglePortal = () => {
    if (currentUser?.isAdmin) {
      setView(view === 'ADMIN_PORTAL' ? 'SINGER_PORTAL' : 'ADMIN_PORTAL');
    }
  };

  const handleRegister = (newPerformer: Performer) => {
    setPerformers(prev => [...prev, newPerformer]);
    setCurrentUser(newPerformer);
    // Registration is only for carolers now
    setView('SINGER_PORTAL');
    setIsAdminView(false);
  };

  const updatePerformerConflicts = (id: string, conflicts: Conflict[]) => {
    setPerformers(prev => prev.map(p => p.id === id ? { ...p, conflicts } : p));
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, conflicts } : null);
    }
  };

  const updatePerformer = (updatedPerformer: Performer) => {
    setPerformers(prev => prev.map(p => p.id === updatedPerformer.id ? updatedPerformer : p));
    if (currentUser?.id === updatedPerformer.id) {
      setCurrentUser(updatedPerformer);
    }
  };

  const deletePerformer = (id: string) => {
    setPerformers(prev => prev.filter(p => p.id !== id));
    setGigs(prevGigs => prevGigs.map(gig => ({
      ...gig,
      assignments: gig.assignments.map(a => a.performerId === id ? { ...a, performerId: null } : a)
    })));
  };

  const updateGig = (updatedGig: Gig) => {
    setGigs(prev => prev.map(g => g.id === updatedGig.id ? updatedGig : g));
  };

  const addGig = (newGig: Gig) => {
    setGigs(prev => [...prev, newGig]);
  };

  const deleteGig = (id: string) => {
    setGigs(prev => prev.filter(g => g.id !== id));
  };

  const handleUpdateGigAssignment = (gigId: string, performerId: string, status: AssignmentStatus) => {
    setGigs(prev => prev.map(gig => {
      if (gig.id === gigId) {
        return {
          ...gig,
          assignments: gig.assignments.map(a => 
            a.performerId === performerId ? { ...a, status } : a
          )
        };
      }
      return gig;
    }));
  };

  // Only show Switch if the admin actually has vocal roles (Dual user)
  const canSwitchToSinger = currentUser?.isAdmin && currentUser.roles.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {view !== 'LANDING' && view !== 'REGISTRATION' && (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2">
                <Music className="text-brandPink w-8 h-8" />
                <span className="serif text-2xl font-bold tracking-tight text-black">TinselTimes</span>
              </div>
              <div className="flex items-center gap-4">
                {canSwitchToSinger && (
                  <button 
                    onClick={togglePortal}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-xs font-black uppercase tracking-widest hover:bg-brandCobalt hover:text-white transition-all"
                  >
                    <Shield size={14} />
                    {view === 'ADMIN_PORTAL' ? 'Caroler View' : 'Admin View'}
                  </button>
                )}
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full text-sm font-medium text-gray-600">
                  <User size={16} />
                  {currentUser?.firstName} {currentUser?.roles.length > 0 ? `(${currentUser.roles[0]})` : (currentUser?.isAdmin ? '(Admin)' : '')}
                </div>
                <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-brandPink hover:bg-pink-50 rounded-full transition-colors"><LogOut size={20} /></button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className="flex-grow">
        {view === 'LANDING' && (
          <Landing performers={performers} onLogin={handleLogin} onRegister={() => setView('REGISTRATION')} />
        )}
        
        {view === 'REGISTRATION' && (
          <RegistrationForm onSave={handleRegister} onCancel={() => setView('LANDING')} />
        )}
        
        {view === 'ADMIN_PORTAL' && (
          <AdminPortal 
            gigs={gigs} 
            performers={performers} 
            onUpdateGig={updateGig} 
            onAddGig={addGig} 
            onDeleteGig={deleteGig}
            onUpdatePerformer={updatePerformer}
            onDeletePerformer={deletePerformer}
          />
        )}
        
        {view === 'SINGER_PORTAL' && currentUser && (
          <CarolerPortal 
            singer={currentUser} 
            gigs={gigs} 
            onUpdateConflicts={(conflicts) => updatePerformerConflicts(currentUser.id, conflicts)} 
            onUpdateProfile={updatePerformer}
            onUpdateGigAssignment={handleUpdateGigAssignment}
          />
        )}
      </main>

      {view !== 'LANDING' && view !== 'REGISTRATION' && (
        <footer className="bg-white border-t border-gray-100 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
            &copy; 2024 TinselTimes Availability Platform. All rights reserved.
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
