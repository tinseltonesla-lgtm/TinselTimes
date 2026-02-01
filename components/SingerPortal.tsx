
import React, { useState } from 'react';
import { Performer, Gig, Conflict, Role, Language, Fluency, AssignmentStatus } from '../types';
import { Calendar, Clock, MapPin, Plus, X, ListTodo, Star, AlertTriangle, ArrowRight, User, Settings, Save, Lock, Phone, Heart, Plane, Ruler, Globe, Mail, Instagram, CheckCircle, AlertCircle, Bell } from 'lucide-react';

interface SingerPortalProps {
  singer: Performer;
  gigs: Gig[];
  onUpdateConflicts: (conflicts: Conflict[]) => void;
  onUpdateProfile: (updatedSinger: Performer) => void;
  onUpdateGigAssignment?: (gigId: string, performerId: string, status: AssignmentStatus) => void;
}

const formatTime = (time: string) => {
  if (!time) return '';
  const [hour, min] = time.split(':');
  const h = parseInt(hour);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${min} ${ampm}`;
};

const SingerPortal: React.FC<SingerPortalProps> = ({ singer, gigs, onUpdateConflicts, onUpdateProfile, onUpdateGigAssignment }) => {
  const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'PROFILE'>('SCHEDULE');
  const [isRange, setIsRange] = useState(false);
  const [newConflict, setNewConflict] = useState<Partial<Conflict>>({
    date: '',
    endDate: '',
    startTime: '',
    endTime: '',
    allDay: false
  });

  // Profile Edit State
  const [editProfile, setEditProfile] = useState<Performer>({ ...singer });
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const assignedGigs = gigs.filter(g => 
    g.assignments.some(a => a.performerId === singer.id)
  ).sort((a,b) => a.date.localeCompare(b.date));

  const pendingGigs = assignedGigs.filter(g => 
    g.assignments.find(a => a.performerId === singer.id)?.status === 'Pending'
  );

  const handleAddConflict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConflict.date) return;
    if (isRange && !newConflict.endDate) return;
    
    const conflictToAdd: Conflict = {
      date: newConflict.date,
      endDate: isRange ? newConflict.endDate : undefined,
      allDay: !!newConflict.allDay,
      startTime: newConflict.allDay ? undefined : newConflict.startTime,
      endTime: newConflict.allDay ? undefined : newConflict.endTime,
    };

    onUpdateConflicts([...singer.conflicts, conflictToAdd]);
    setNewConflict({
      date: '',
      endDate: '',
      startTime: '',
      endTime: '',
      allDay: false
    });
    setIsRange(false);
  };

  const removeConflict = (index: number) => {
    onUpdateConflicts(singer.conflicts.filter((_, i) => i !== index));
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editProfile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const updateProfileField = (field: keyof Performer, value: any) => {
    setEditProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleRole = (role: Role) => {
    const currentRoles = editProfile.roles || [];
    if (currentRoles.includes(role)) {
      updateProfileField('roles', currentRoles.filter(r => r !== role));
    } else {
      updateProfileField('roles', [...currentRoles, role]);
    }
  };

  const handleAssignmentAction = (gigId: string, status: AssignmentStatus) => {
    if (status === 'CoverageRequested') {
      const confirm = window.confirm("URGENT: Requesting coverage is for extreme situations ONLY (family emergency, illness, etc). Are you sure you cannot make this gig?");
      if (!confirm) return;
    }
    if (onUpdateGigAssignment) {
      onUpdateGigAssignment(gigId, singer.id, status);
    }
  };

  const zoneLabels = {
    zone2: 'Zone 2: 16-35 miles (Malibu, Calabasas, Long Beach): $15',
    zone3: 'Zone 3: 36-55 miles (OC, Riverside, Ontario) Weekend: $30 | Weekday',
    zone4: 'Zone 4 (over 55 miles): Palm Springs, Las Vegas',
    zone5: 'Zone 5 (out of region): Northern California, Texas, Colorado'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      
      {/* Portal Tabs */}
      <div className="flex gap-10 border-b border-gray-100 mb-10">
        <button 
          onClick={() => setActiveTab('SCHEDULE')} 
          className={`pb-4 text-sm font-bold transition-all border-b-2 tracking-widest uppercase flex items-center gap-2 ${activeTab === 'SCHEDULE' ? 'border-brandPink text-brandPink' : 'border-transparent text-gray-400 hover:text-black'}`}
        >
          <Calendar size={18} /> Gigs & Availability
        </button>
        <button 
          onClick={() => setActiveTab('PROFILE')} 
          className={`pb-4 text-sm font-bold transition-all border-b-2 tracking-widest uppercase flex items-center gap-2 ${activeTab === 'PROFILE' ? 'border-brandPink text-brandPink' : 'border-transparent text-gray-400 hover:text-black'}`}
        >
          <User size={18} /> My Profile
        </button>
      </div>

      {activeTab === 'SCHEDULE' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: My Schedule */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h1 className="serif text-5xl font-bold text-black mb-4">Hello, {singer.firstName}</h1>
              <div className="flex flex-wrap gap-2.5 items-center">
                <p className="text-gray-500 font-medium mr-2">Your Profile Roles:</p>
                {singer.roles.map(r => (
                  <span key={r} className="bg-pink-50 text-brandPink text-[10px] font-black px-3 py-1 rounded-full border border-pink-100 uppercase tracking-widest">{r}</span>
                ))}
                {singer.isSubOnly && (
                  <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-3 py-1 rounded-full border border-amber-100 flex items-center gap-1.5 uppercase tracking-widest">
                    <Star size={12} fill="currentColor" /> Sub Only
                  </span>
                )}
              </div>
            </div>

            {/* Notifications / Action Required Section */}
            {pendingGigs.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-[2.5rem] p-8 shadow-xl shadow-amber-900/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-amber-400 text-white rounded-2xl animate-bounce">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-amber-900">Action Required</h2>
                    <p className="text-amber-700 text-sm">You have {pendingGigs.length} unconfirmed assignment{pendingGigs.length > 1 ? 's' : ''}.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {pendingGigs.map(gig => (
                    <div key={gig.id} className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-black">{gig.title}</div>
                        <div className="text-xs text-amber-800 font-medium flex items-center gap-2 mt-1">
                          <Calendar size={12} /> {gig.date} | <Clock size={12} /> {formatTime(gig.startTime)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAssignmentAction(gig.id, 'Confirmed')}
                          className="bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-200"
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => handleAssignmentAction(gig.id, 'CoverageRequested')}
                          className="bg-white border border-red-200 text-red-500 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-red-50 transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-black">
                <ListTodo className="text-brandPink" size={28} />
                Upcoming Gigs
              </h2>
              {assignedGigs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {assignedGigs.map(gig => {
                    const assignment = gig.assignments.find(a => a.performerId === singer.id);
                    const status = assignment?.status || 'Pending';
                    
                    return (
                      <div key={gig.id} className={`bg-white p-8 rounded-[2rem] border transition-all group relative overflow-hidden ${
                        status === 'Pending' ? 'border-amber-200 shadow-amber-100 shadow-xl ring-1 ring-amber-50 opacity-90' : 
                        status === 'CoverageRequested' ? 'border-red-100 opacity-60 grayscale' : 'border-gray-100 shadow-sm hover:shadow-xl hover:border-brandPink/10'
                      }`}>
                        
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="font-bold text-black text-xl mb-1">{gig.title}</h3>
                            <div className="text-[11px] text-brandPink font-black uppercase tracking-widest">
                              Assigned: {assignment?.role}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg ${
                              status === 'Confirmed' ? 'bg-emerald-500 text-white' : 
                              status === 'CoverageRequested' ? 'bg-red-500 text-white' : 
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {status === 'CoverageRequested' ? 'Coverage Requested' : status}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3 text-sm text-gray-500 font-medium mb-8">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-pink-50 transition-colors">
                              <Calendar size={16} className="text-brandPink" />
                            </div>
                            <span>{gig.date}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-pink-50 transition-colors">
                              <Clock size={16} className="text-brandPink" />
                            </div>
                            <span>{formatTime(gig.startTime)} - {formatTime(gig.endTime)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-pink-50 transition-colors">
                              <MapPin size={16} className="text-brandPink" />
                            </div>
                            <span className="truncate">{gig.location}</span>
                          </div>
                        </div>

                        {status === 'Confirmed' && (
                          <button 
                             onClick={() => handleAssignmentAction(gig.id, 'CoverageRequested')}
                             className="w-full mt-4 text-[10px] text-gray-400 hover:text-red-500 font-bold flex items-center justify-center gap-2 transition-colors uppercase tracking-widest"
                          >
                            <AlertTriangle size={12} /> Emergency Coverage Request
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gray-50/50 p-16 text-center rounded-[2.5rem] border border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold text-lg">Your schedule is currently clear.</p>
                  <p className="text-gray-400 text-sm mt-1 font-light">Gigs will appear here once assigned by the admin.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Conflicts/Availability */}
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-black/5">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-black">
                <Calendar className="text-brandPink" size={28} />
                Availability
              </h2>
              
              <div className="bg-pink-50 border border-pink-100 rounded-2xl p-5 mb-8 flex gap-4">
                <AlertTriangle className="text-brandPink shrink-0" size={24} />
                <p className="text-xs text-brandPink font-bold leading-relaxed">
                  Reminder: Please include buffer for travel and our 30-minute early arrival requirement in your conflicts.
                </p>
              </div>

              <div className="flex p-1.5 bg-gray-100/50 rounded-2xl mb-6">
                <button 
                  onClick={() => setIsRange(false)}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${!isRange ? 'bg-white text-black shadow-lg shadow-black/5' : 'text-gray-400'}`}
                >
                  Single
                </button>
                <button 
                  onClick={() => setIsRange(true)}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${isRange ? 'bg-white text-black shadow-lg shadow-black/5' : 'text-gray-400'}`}
                >
                  Range
                </button>
              </div>

              <form onSubmit={handleAddConflict} className="space-y-5 mb-10">
                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isRange ? 'Start Date' : 'Date'}</label>
                    <input 
                      type="date"
                      required
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-brandPink transition-all text-sm font-semibold"
                      value={newConflict.date}
                      onChange={e => setNewConflict({...newConflict, date: e.target.value})}
                    />
                  </div>

                  {isRange && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">End Date</label>
                      <input 
                        type="date"
                        required
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-brandPink transition-all text-sm font-semibold"
                        value={newConflict.endDate}
                        onChange={e => setNewConflict({...newConflict, endDate: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 py-1">
                  <input 
                    type="checkbox" 
                    id="allDay"
                    checked={newConflict.allDay}
                    onChange={e => setNewConflict({...newConflict, allDay: e.target.checked})}
                    className="w-5 h-5 accent-brandPink"
                  />
                  <label htmlFor="allDay" className="text-sm font-bold text-gray-700">Unavailable All Day</label>
                </div>

                {!newConflict.allDay && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">From</label>
                      <input 
                        type="time"
                        required
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold"
                        value={newConflict.startTime}
                        onChange={e => setNewConflict({...newConflict, startTime: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Until</label>
                      <input 
                        type="time"
                        required
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold"
                        value={newConflict.endTime}
                        onChange={e => setNewConflict({...newConflict, endTime: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-black text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-brandPink transition-all flex items-center justify-center gap-3 shadow-xl shadow-black/10"
                >
                  <Plus size={20} /> Add Conflict
                </button>
              </form>

              <div className="space-y-3 max-h-[30rem] overflow-y-auto pr-3 custom-scrollbar">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Saved Conflicts</h3>
                {singer.conflicts.map((conflict, index) => (
                  <div key={index} className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl group border border-transparent hover:border-brandPink/10 hover:bg-white transition-all">
                    <div className="overflow-hidden">
                      <div className="text-sm font-black text-gray-800 flex items-center gap-3 flex-wrap">
                        {conflict.date} 
                        {conflict.endDate && (
                          <>
                            <ArrowRight size={14} className="text-brandPink" /> 
                            {conflict.endDate}
                          </>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 font-bold flex items-center gap-2 mt-1">
                        <Clock size={12} className="text-brandCobalt" />
                        {conflict.allDay ? 'All Day' : `${formatTime(conflict.startTime || '')} - ${formatTime(conflict.endTime || '')}`}
                        {conflict.endDate && !conflict.allDay && <span className="opacity-50">(Daily)</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => removeConflict(index)}
                      className="p-2 text-gray-300 hover:text-brandPink hover:bg-pink-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
                {singer.conflicts.length === 0 && (
                  <div className="text-center py-10 text-gray-300 italic text-sm font-medium">
                    No conflicts on record.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-black/5 overflow-hidden">
            <div className="bg-gray-50/50 p-8 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold serif text-black">My Performer Profile</h2>
                <p className="text-gray-500 text-sm mt-1">Manage your professional information and account security.</p>
              </div>
              <div className="flex items-center gap-4">
                 {saveSuccess && (
                   <span className="text-emerald-500 font-bold text-sm flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                     <Save size={16}/> Profile Saved
                   </span>
                 )}
                 <button onClick={handleUpdateProfile} className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-brandPink transition-all flex items-center gap-2 shadow-lg">
                   <Save size={18} /> Save Changes
                 </button>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-10 space-y-12 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              {/* Account Security Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                  <div className="p-2 bg-blue-50 text-brandCobalt rounded-lg"><Lock size={20} /></div>
                  <h3 className="text-xl font-bold text-gray-900">Security & Sign In</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Username</label>
                    <input 
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brandCobalt" 
                      value={editProfile.username} 
                      onChange={e => updateProfileField('username', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sign-In Password</label>
                    <input 
                      type="password" 
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brandCobalt" 
                      value={editProfile.password} 
                      onChange={e => updateProfileField('password', e.target.value)} 
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
              </div>

              {/* Basic Info Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                  <div className="p-2 bg-pink-50 text-brandPink rounded-lg"><User size={20} /></div>
                  <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">First Name</label>
                    <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" value={editProfile.firstName} onChange={e => updateProfileField('firstName', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Name</label>
                    <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" value={editProfile.lastName} onChange={e => updateProfileField('lastName', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Mail size={12}/> Email Address</label>
                    <input type="email" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" value={editProfile.email} onChange={e => updateProfileField('email', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Phone size={12}/> Cell Phone</label>
                    <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" value={editProfile.cellNumber} onChange={e => updateProfileField('cellNumber', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Instagram size={12}/> Instagram</label>
                    <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" value={editProfile.instagramHandle || ''} onChange={e => updateProfileField('instagramHandle', e.target.value)} placeholder="@handle" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Address</label>
                    <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" value={editProfile.address} onChange={e => updateProfileField('address', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Roles Section */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vocal Parts</label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(Role).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleRole(r)}
                      className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                        editProfile.roles?.includes(r) 
                          ? 'bg-brandPink border-brandPink text-white shadow-lg' 
                          : 'bg-white border-gray-200 text-gray-500 hover:border-brandPink hover:text-brandPink'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Physical Sizing Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                  <div className="p-2 bg-gray-50 text-gray-600 rounded-lg"><Ruler size={20} /></div>
                  <h3 className="text-xl font-bold text-gray-900">Vital Stats & Sizing</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Height</label>
                    <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" value={editProfile.height} onChange={e => updateProfileField('height', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shirt</label>
                    <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" value={editProfile.shirtSize} onChange={e => updateProfileField('shirtSize', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shoe</label>
                    <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" value={editProfile.shoeSize} onChange={e => updateProfileField('shoeSize', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hat</label>
                    <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" value={editProfile.hatSize} onChange={e => updateProfileField('hatSize', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Travel Zones Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Plane size={20} /></div>
                  <h3 className="text-xl font-bold text-gray-900">Travel Preferences</h3>
                </div>
                <div className="space-y-3">
                   {Object.entries(zoneLabels).map(([zone, label]) => (
                      <label key={zone} className="flex items-center gap-4 cursor-pointer p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white transition-all">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 accent-brandPink" 
                          checked={!!editProfile.travelZones?.[zone as keyof typeof editProfile.travelZones]} 
                          onChange={e => updateProfileField('travelZones', { ...editProfile.travelZones, [zone]: e.target.checked })} 
                        />
                        <span className="text-xs font-bold text-gray-700">{label}</span>
                      </label>
                    ))}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                  <div className="p-2 bg-red-50 text-red-500 rounded-lg"><Heart size={20} /></div>
                  <h3 className="text-xl font-bold text-gray-900">Emergency Contact</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Name</label>
                    <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" value={editProfile.emergencyContactName} onChange={e => updateProfileField('emergencyContactName', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Cell</label>
                    <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" value={editProfile.emergencyContactCell} onChange={e => updateProfileField('emergencyContactCell', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Bio & Administrative */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                  <div className="p-2 bg-gray-50 text-gray-700 rounded-lg"><Settings size={20} /></div>
                  <h3 className="text-xl font-bold text-gray-900">Bio & Details</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bio (limit 100 words)</label>
                    <textarea 
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl h-32 text-sm leading-relaxed" 
                      value={editProfile.bio} 
                      onChange={e => updateProfileField('bio', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Favorite Holiday Song</label>
                    <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" value={editProfile.favoriteHolidaySong} onChange={e => updateProfileField('favoriteHolidaySong', e.target.value)} />
                  </div>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingerPortal;
