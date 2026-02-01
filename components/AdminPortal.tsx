
import React, { useState } from 'react';
import { Gig, Performer, Role, Conflict, Language, Fluency, AssignmentStatus } from '../types';
import { suggestScheduling } from '../services/geminiService';
import { Plus, Sparkles, MapPin, Calendar, Clock, Download, Phone, Shield, AlertCircle, Edit, Trash2, X, Save, Globe, Heart, Plane, User, Ruler, Send, CheckCircle, Clock3, Users, AlertTriangle } from 'lucide-react';

interface AdminPortalProps {
  gigs: Gig[];
  performers: Performer[];
  onUpdateGig: (gig: Gig) => void;
  onAddGig: (gig: Gig) => void;
  onDeleteGig: (id: string) => void;
  onUpdatePerformer: (performer: Performer) => void;
  onDeletePerformer: (id: string) => void;
}

const formatTime = (time: string) => {
  if (!time) return '';
  const [hour, min] = time.split(':');
  const h = parseInt(hour);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${min} ${ampm}`;
};

const AdminPortal: React.FC<AdminPortalProps> = ({ gigs, performers, onUpdateGig, onAddGig, onDeleteGig, onUpdatePerformer, onDeletePerformer }) => {
  const [activeTab, setActiveTab] = useState<'GIGS' | 'ROSTER'>('GIGS');
  const [isAddingGig, setIsAddingGig] = useState(false);
  const [editingGig, setEditingGig] = useState<Gig | null>(null);
  const [editingPerformer, setEditingPerformer] = useState<Performer | null>(null);
  const [loadingAi, setLoadingAi] = useState<string | null>(null);
  const [notifying, setNotifying] = useState<string | null>(null);
  
  // Only Carolers appear in the roster and for scheduling
  const carolerRoster = performers.filter(p => !p.isAdmin);

  const [newGig, setNewGig] = useState<Partial<Gig>>({
    title: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    status: 'Draft',
    assignments: Object.values(Role).map(role => ({ role, performerId: null, status: 'Pending' }))
  });

  const checkAvailability = (performer: Performer, gig: Gig): boolean => {
    return !performer.conflicts.some(conflict => {
      const isWithinDate = gig.date >= conflict.date && (!conflict.endDate || gig.date <= conflict.endDate);
      if (!isWithinDate) return false;
      if (conflict.allDay) return true;
      const gigStart = gig.startTime;
      const gigEnd = gig.endTime;
      const confStart = conflict.startTime!;
      const confEnd = conflict.endTime!;
      return (gigStart < confEnd) && (gigEnd > confStart);
    });
  };

  const handleAiSuggest = async (gig: Gig) => {
    setLoadingAi(gig.id);
    const result = await suggestScheduling(gig, carolerRoster);
    if (result && result.assignments) {
      const updatedGig = {
        ...gig,
        assignments: gig.assignments.map(a => {
          const suggestion = result.assignments.find((s: any) => s.role === a.role);
          return suggestion ? { ...a, performerId: suggestion.performerId, status: 'Pending' as AssignmentStatus } : a;
        })
      };
      onUpdateGig(updatedGig);
    }
    setLoadingAi(null);
  };

  const handleNotifyCarolers = (gig: Gig) => {
    const assignedCount = gig.assignments.filter(a => !!a.performerId).length;
    if (assignedCount === 0) {
      alert("Please assign at least one performer before notifying.");
      return;
    }
    setNotifying(gig.id);
    setTimeout(() => {
      setNotifying(null);
      alert(`Notifications (Email & SMS) triggered for ${assignedCount} carolers for "${gig.title}".`);
    }, 1500);
  };

  const handleCreateGig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGig.title || !newGig.date) return;
    onAddGig({...newGig, id: `g-${Date.now()}`} as Gig);
    setIsAddingGig(false);
    setNewGig({
      title: '', location: '', date: '', startTime: '', endTime: '', status: 'Draft',
      assignments: Object.values(Role).map(role => ({ role, performerId: null, status: 'Pending' }))
    });
  };

  const handleUpdateGig = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGig) {
      onUpdateGig(editingGig);
      setEditingGig(null);
    }
  };

  const confirmDeleteGig = (id: string) => {
    if (window.confirm("Are you sure you want to delete this event? This cannot be undone.")) {
      onDeleteGig(id);
    }
  };

  const handleEditPerformer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPerformer) {
      onUpdatePerformer(editingPerformer);
      setEditingPerformer(null);
    }
  };

  const confirmDelete = (p: Performer) => {
    if (window.confirm(`Are you sure you want to delete ${p.firstName} ${p.lastName} entirely?`)) {
      onDeletePerformer(p.id);
    }
  };

  const updateEditingLanguage = (index: number, field: keyof Language, value: string) => {
    if (!editingPerformer) return;
    const langs = [...editingPerformer.languages];
    langs[index] = { ...langs[index], [field]: value };
    setEditingPerformer({ ...editingPerformer, languages: langs });
  };

  const addEditingLanguage = () => {
    if (!editingPerformer) return;
    setEditingPerformer({
      ...editingPerformer,
      languages: [...editingPerformer.languages, { name: '', fluency: 'Beginner' }]
    });
  };

  const removeEditingLanguage = (index: number) => {
    if (!editingPerformer) return;
    setEditingPerformer({
      ...editingPerformer,
      languages: editingPerformer.languages.filter((_, i) => i !== index)
    });
  };

  const fluencyLevels: Fluency[] = ['Beginner', 'Conversational', 'Fluent', 'Native/Near-Native'];

  const zoneLabels = {
    zone2: 'Zone 2: 16-35 miles (Malibu, Calabasas, Long Beach): $15',
    zone3: 'Zone 3: 36-55 miles (OC, Riverside, Ontario) Weekend: $30 | Weekday',
    zone4: 'Zone 4 (over 55 miles): Palm Springs, Las Vegas',
    zone5: 'Zone 5 (out of region): Northern California, Texas, Colorado'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-10 border-b border-gray-100 mb-10">
        <button onClick={() => setActiveTab('GIGS')} 
          className={`pb-4 text-sm font-bold transition-all border-b-2 tracking-widest uppercase ${activeTab === 'GIGS' ? 'border-brandPink text-brandPink' : 'border-transparent text-gray-400 hover:text-black'}`}>
          Gigs
        </button>
        <button onClick={() => setActiveTab('ROSTER')} 
          className={`pb-4 text-sm font-bold transition-all border-b-2 tracking-widest uppercase ${activeTab === 'ROSTER' ? 'border-brandPink text-brandPink' : 'border-transparent text-gray-400 hover:text-black'}`}>
          Caroler Roster
        </button>
      </div>

      {activeTab === 'GIGS' ? (
        <>
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="serif text-4xl font-bold text-black mb-2">Gig Management</h1>
              <p className="text-gray-500 font-light">Craft the perfect holiday ensemble lineups.</p>
            </div>
            <button onClick={() => setIsAddingGig(true)} className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-brandPink transition-all"><Plus size={20}/> New Gig</button>
          </div>

          {(isAddingGig || editingGig) && (
            <div className="bg-white p-10 rounded-[2rem] shadow-2xl shadow-black/5 mb-10 border border-gray-50">
               <h3 className="text-xl font-bold mb-6 serif">{editingGig ? 'Edit Gig' : 'Create New Gig'}</h3>
               <form onSubmit={editingGig ? handleUpdateGig : handleCreateGig} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Title</label>
                  <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl" 
                    value={editingGig ? editingGig.title : newGig.title} 
                    onChange={e => editingGig ? setEditingGig({...editingGig, title: e.target.value}) : setNewGig({...newGig, title:e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</label>
                  <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl" 
                    value={editingGig ? editingGig.location : newGig.location} 
                    onChange={e => editingGig ? setEditingGig({...editingGig, location: e.target.value}) : setNewGig({...newGig, location:e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</label>
                  <input type="date" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl" 
                    value={editingGig ? editingGig.date : newGig.date} 
                    onChange={e => editingGig ? setEditingGig({...editingGig, date: e.target.value}) : setNewGig({...newGig, date:e.target.value})} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Start Time</label>
                    <input type="time" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl" 
                      value={editingGig ? editingGig.startTime : newGig.startTime} 
                      onChange={e => editingGig ? setEditingGig({...editingGig, startTime: e.target.value}) : setNewGig({...newGig, startTime:e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End Time</label>
                    <input type="time" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl" 
                      value={editingGig ? editingGig.endTime : newGig.endTime} 
                      onChange={e => editingGig ? setEditingGig({...editingGig, endTime: e.target.value}) : setNewGig({...newGig, endTime:e.target.value})} 
                    />
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                  <button type="button" onClick={() => editingGig ? setEditingGig(null) : setIsAddingGig(false)} className="px-8 py-3 text-gray-400 font-bold hover:text-black">Cancel</button>
                  <button type="submit" className="bg-brandCobalt text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-brandCobalt/20">
                    {editingGig ? 'Save Changes' : 'Create Gig'}
                  </button>
                </div>
               </form>
            </div>
          )}

          <div className="space-y-6">
            {gigs.map(gig => {
               const confirmedCount = gig.assignments.filter(a => a.performerId && a.status === 'Confirmed').length;
               const totalAssigned = gig.assignments.filter(a => !!a.performerId).length;
               const coverageRequestedCount = gig.assignments.filter(a => a.status === 'CoverageRequested').length;

               return (
                <div key={gig.id} className={`bg-white rounded-[2rem] p-8 border transition-all group ${coverageRequestedCount > 0 ? 'border-red-200 shadow-lg shadow-red-50' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-black">{gig.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <p className="text-sm text-gray-400 flex items-center gap-2 font-medium">
                          <Calendar size={16} className="text-brandPink"/> {gig.date} 
                        </p>
                        <span className="text-gray-200">|</span> 
                        <p className="text-sm text-gray-400 flex items-center gap-2 font-medium">
                          <Clock size={16} className="text-brandPink"/> {formatTime(gig.startTime)} - {formatTime(gig.endTime)} 
                        </p>
                        <span className="text-gray-200">|</span> 
                        <p className="text-sm text-gray-400 flex items-center gap-2 font-medium">
                          <MapPin size={16} className="text-brandPink"/> {gig.location}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                         <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${confirmedCount === totalAssigned && totalAssigned > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                           <Users size={12}/> {confirmedCount} of {totalAssigned} Confirmed
                         </div>
                         {coverageRequestedCount > 0 && (
                           <div className="bg-red-50 text-red-600 border border-red-100 flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                             <AlertCircle size={12}/> {coverageRequestedCount} Coverage Request
                           </div>
                         )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingGig(gig)} className="p-3 bg-gray-50 text-gray-400 hover:text-brandCobalt hover:bg-blue-50 rounded-xl transition-all">
                        <Edit size={18}/>
                      </button>
                      <button onClick={() => confirmDeleteGig(gig.id)} className="p-3 bg-gray-50 text-gray-400 hover:text-brandPink hover:bg-pink-50 rounded-xl transition-all">
                        <Trash2 size={18}/>
                      </button>
                      <button onClick={() => handleAiSuggest(gig)} disabled={!!loadingAi} className="flex items-center gap-2 bg-pink-50 text-brandPink px-5 py-3 rounded-2xl text-xs font-black tracking-widest uppercase hover:bg-pink-100 transition-all ml-2">
                        <Sparkles size={16} className={loadingAi === gig.id ? 'animate-spin' : ''}/> AI Schedule
                      </button>
                      <button 
                        onClick={() => handleNotifyCarolers(gig)} 
                        disabled={!!notifying}
                        className="flex items-center gap-2 bg-brandCobalt text-white px-5 py-3 rounded-2xl text-xs font-black tracking-widest uppercase hover:bg-black transition-all ml-2"
                      >
                        <Send size={16} className={notifying === gig.id ? 'animate-pulse' : ''} /> 
                        {notifying === gig.id ? 'Sending...' : 'Notify All'}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
                    {gig.assignments.map(a => {
                      const selectedPerformer = carolerRoster.find(p => p.id === a.performerId);
                      const isAvailable = selectedPerformer ? checkAvailability(selectedPerformer, gig) : true;
                      const status = a.status || 'Pending';

                      return (
                        <div key={a.role} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-black text-gray-300 tracking-widest">{a.role}</span>
                            {a.performerId && (
                              <span title={status}>
                                {status === 'Confirmed' && <CheckCircle size={14} className="text-emerald-500" />}
                                {status === 'Pending' && <Clock3 size={14} className="text-amber-500" />}
                                {status === 'CoverageRequested' && <AlertCircle size={14} className="text-red-500 animate-pulse" />}
                              </span>
                            )}
                          </div>
                          <select className={`w-full p-3 border rounded-xl text-sm font-semibold transition-all ${
                              !isAvailable ? 'bg-red-50 border-red-200 text-red-600' : 
                              status === 'CoverageRequested' ? 'bg-red-50 border-red-300 text-red-700' :
                              'bg-gray-50 border-gray-50 text-gray-700'
                            }`} 
                            value={a.performerId || ''} 
                            onChange={e => onUpdateGig({...gig, assignments: gig.assignments.map(as => as.role === a.role ? {...as, performerId: e.target.value, status: 'Pending'} : as)})}>
                            <option value="">Choose Caroler</option>
                            {carolerRoster.filter(p => p.roles.includes(a.role)).map(p => {
                              const available = checkAvailability(p, gig);
                              return (
                                <option key={p.id} value={p.id}>
                                  {p.firstName} {p.lastName} {p.isSubOnly ? '(SUB)' : ''} {!available ? '⚠️ Conflict' : ''}
                                </option>
                              );
                            })}
                          </select>
                          {!isAvailable && (
                            <div className="text-[10px] text-red-500 font-black flex items-center gap-1 mt-1 uppercase">
                              <AlertCircle size={10} /> Schedule Overlap
                            </div>
                          )}
                          {status === 'CoverageRequested' && (
                            <div className="text-[9px] text-red-600 font-black flex items-center gap-1 mt-1 uppercase animate-pulse">
                              <AlertTriangle size={10} /> Needs Coverage
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
               );
            })}
            {gigs.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-bold">No gigs found. Click "New Gig" to create one.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="serif text-4xl font-bold text-black mb-2">Performance Roster</h1>
              <p className="text-gray-500 font-light">Global management of ensemble performers and talent data.</p>
            </div>
            <button className="flex items-center gap-3 bg-brandCobalt text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-brandCobalt/20 transition-all hover:bg-brandCobalt/90"><Download size={20}/> Contact Sheet</button>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-50">
                  <tr>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Caroler</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vital Stats</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Legal</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Holiday Avail</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {carolerRoster.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="font-bold text-black text-lg">{p.firstName} {p.lastName}</div>
                           {p.isSubOnly && (
                             <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-2 py-0.5 rounded-lg border border-amber-100 uppercase tracking-tighter">SUB</span>
                           )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {p.roles.map(r => (
                            <span key={r} className="text-[9px] text-brandPink font-black uppercase tracking-widest bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">{r}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="text-sm flex flex-col gap-1.5">
                          <span className="flex items-center gap-2 font-bold text-gray-700"><Phone size={14} className="text-brandCobalt"/> {p.cellNumber}</span>
                          <span className="text-xs text-gray-400 font-medium">{p.email}</span>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs font-bold">
                          <span className="text-gray-300 uppercase text-[9px]">Height:</span> <span className="text-gray-700">{p.height}</span>
                          <span className="text-gray-300 uppercase text-[9px]">Shirt:</span> <span className="text-gray-700">{p.shirtSize}</span>
                          <span className="text-gray-300 uppercase text-[9px]">Shoe:</span> <span className="text-gray-700">{p.shoeSize}</span>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="text-xs space-y-2">
                          <div className="font-bold text-gray-800">{p.fullLegalName}</div>
                          <div className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-black tracking-widest uppercase border ${p.isSagAftra ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                            {p.isSagAftra ? 'SAG-AFTRA' : 'Non-Union'}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { val: p.inTownThanksgiving, label: 'Th' },
                            { val: p.inTownChristmasEve, label: 'CE' },
                            { val: p.inTownChristmas, label: 'Xm' },
                            { val: p.inTownNYE, label: 'NY' },
                            { val: p.inTownNewYears, label: 'ND' },
                          ].map((d, i) => (
                            <span key={i} className={`text-[10px] font-black px-2 py-1 rounded-lg border ${d.val ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-300 border-red-50'}`}>
                              {d.label}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setEditingPerformer(p)}
                            className="p-2 bg-gray-50 text-gray-400 hover:text-brandCobalt hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit Performer"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => confirmDelete(p)}
                            className="p-2 bg-gray-50 text-gray-400 hover:text-brandPink hover:bg-pink-50 rounded-lg transition-all"
                            title="Delete Performer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {carolerRoster.length === 0 && (
                <div className="py-20 text-center text-gray-400 font-bold">
                  No carolers registered yet.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Edit Performer Modal */}
      {editingPerformer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-bold serif">Edit Performer: {editingPerformer.firstName}</h2>
              <button onClick={() => setEditingPerformer(null)} className="p-2 hover:bg-white rounded-full transition-all text-gray-400 hover:text-black">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditPerformer} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
              
              {/* Account Security */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-brandPink uppercase tracking-[0.2em] flex items-center gap-2">
                  <Shield size={14}/> Account & Roles
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Username</label>
                    <input required className="w-full p-3 bg-gray-50 border rounded-xl" value={editingPerformer.username} onChange={e=>setEditingPerformer({...editingPerformer, username: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                    <input type="password" required className="w-full p-3 bg-gray-50 border rounded-xl" value={editingPerformer.password} onChange={e=>setEditingPerformer({...editingPerformer, password: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-brandPink" checked={editingPerformer.isAdmin} onChange={e=>setEditingPerformer({...editingPerformer, isAdmin: e.target.checked})} />
                    <span className="text-xs font-bold">Admin Privileges</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-brandPink" checked={editingPerformer.isSubOnly} onChange={e=>setEditingPerformer({...editingPerformer, isSubOnly: e.target.checked})} />
                    <span className="text-xs font-bold">Sub Only</span>
                  </label>
                </div>
              </div>

              {/* Profile Basics */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-brandPink uppercase tracking-[0.2em] flex items-center gap-2">
                  <User size={14}/> Profile Basics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">First Name</label>
                    <input required className="w-full p-3 bg-gray-50 border rounded-xl" value={editingPerformer.firstName} onChange={e=>setEditingPerformer({...editingPerformer, firstName: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Name</label>
                    <input required className="w-full p-3 bg-gray-50 border rounded-xl" value={editingPerformer.lastName} onChange={e=>setEditingPerformer({...editingPerformer, lastName: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Instagram</label>
                  <input className="w-full p-3 bg-gray-50 border rounded-xl" placeholder="@handle" value={editingPerformer.instagramHandle || ''} onChange={e=>setEditingPerformer({...editingPerformer, instagramHandle: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mailing Address</label>
                  <input required className="w-full p-3 bg-gray-50 border rounded-xl" value={editingPerformer.address} onChange={e=>setEditingPerformer({...editingPerformer, address: e.target.value})} />
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-brandPink uppercase tracking-[0.2em] flex items-center gap-2">
                  <Globe size={14}/> Languages
                </h3>
                <div className="space-y-2">
                  {editingPerformer.languages.map((lang, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg">
                      <input 
                        className="flex-grow p-2 text-xs border rounded-md" 
                        value={lang.name} 
                        onChange={e => updateEditingLanguage(idx, 'name', e.target.value)}
                        placeholder="Language"
                      />
                      <select 
                        className="p-2 text-xs border rounded-md w-32"
                        value={lang.fluency}
                        onChange={e => updateEditingLanguage(idx, 'fluency', e.target.value)}
                      >
                        {fluencyLevels.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <button type="button" onClick={() => removeEditingLanguage(idx)} className="text-gray-400 hover:text-brandPink"><X size={14}/></button>
                    </div>
                  ))}
                  <button type="button" onClick={addEditingLanguage} className="text-[10px] font-bold text-brandPink flex items-center gap-1 hover:opacity-70"><Plus size={12}/> Add Language</button>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-brandPink uppercase tracking-[0.2em] flex items-center gap-2">
                  <Heart size={14}/> Emergency Contact
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</label>
                    <input className="w-full p-3 bg-gray-50 border rounded-xl" value={editingPerformer.emergencyContactName} onChange={e=>setEditingPerformer({...editingPerformer, emergencyContactName: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cell</label>
                    <input className="w-full p-3 bg-gray-50 border rounded-xl" value={editingPerformer.emergencyContactCell} onChange={e=>setEditingPerformer({...editingPerformer, emergencyContactCell: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Holiday Availability */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-brandPink uppercase tracking-[0.2em] flex items-center gap-2">
                  <Calendar size={14}/> Holiday availability
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { field: 'inTownThanksgiving', label: 'Thanksgiving' },
                    { field: 'inTownChristmasEve', label: 'Christmas Eve' },
                    { field: 'inTownChristmas', label: 'Christmas' },
                    { field: 'inTownNYE', label: 'New Year\'s Eve' },
                    { field: 'inTownNewYears', label: 'New Year\'s Day' },
                  ].map(item => (
                    <label key={item.field} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 accent-brandPink" 
                        checked={!!editingPerformer[item.field as keyof Performer]} 
                        onChange={e => setEditingPerformer({...editingPerformer, [item.field]: e.target.checked})} 
                      />
                      <span className="text-[10px] font-bold text-gray-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Skills & Travel */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-brandPink uppercase tracking-[0.2em] flex items-center gap-2">
                  <Plane size={14}/> Skills & Travel
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer p-2 bg-gray-50 rounded-lg">
                      <input type="checkbox" className="w-4 h-4 accent-brandPink" checked={editingPerformer.canBeatbox} onChange={e=>setEditingPerformer({...editingPerformer, canBeatbox: e.target.checked})} />
                      <span className="text-[10px] font-bold">Can Beatbox</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 bg-gray-50 rounded-lg">
                      <input type="checkbox" className="w-4 h-4 accent-brandPink" checked={editingPerformer.isSagAftra} onChange={e=>setEditingPerformer({...editingPerformer, isSagAftra: e.target.checked})} />
                      <span className="text-[10px] font-bold">SAG-AFTRA</span>
                    </label>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Travel Zones</label>
                    <div className="flex flex-col gap-1">
                      {Object.entries(zoneLabels).map(([zone, label]) => (
                        <label key={zone} className="flex items-center gap-2 p-1.5 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="w-3 h-3 accent-brandPink" 
                            checked={!!editingPerformer.travelZones?.[zone as keyof typeof editingPerformer.travelZones]} 
                            onChange={e => setEditingPerformer({...editingPerformer, travelZones: {...editingPerformer.travelZones!, [zone]: e.target.checked}})} 
                          />
                          <span className="text-[9px] font-bold uppercase">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal & Bio */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-brandPink uppercase tracking-[0.2em] flex items-center gap-2">
                  <Shield size={14}/> Legal & bio
                </h3>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Legal Name</label>
                  <input className="w-full p-3 bg-gray-50 border rounded-xl" value={editingPerformer.fullLegalName} onChange={e=>setEditingPerformer({...editingPerformer, fullLegalName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">First 5 Digits of SSN</label>
                  <input type="password" placeholder="XXXXX" maxLength={5} className="w-full p-3 bg-gray-50 border rounded-xl" value={editingPerformer.ssn} onChange={e=>setEditingPerformer({...editingPerformer, ssn: e.target.value})} />
                  <p className="text-[9px] text-brandPink font-bold mt-1">Reminder: Joey needs the last 4 digits verbally at first rehearsal.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bio</label>
                  <textarea className="w-full p-3 bg-gray-50 border rounded-xl h-24 text-xs" value={editingPerformer.bio} onChange={e=>setEditingPerformer({...editingPerformer, bio: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Favorite Song</label>
                  <input className="w-full p-3 bg-gray-50 border rounded-xl" value={editingPerformer.favoriteHolidaySong} onChange={e=>setEditingPerformer({...editingPerformer, favoriteHolidaySong: e.target.value})} />
                </div>
              </div>

              {/* Physical Sizing */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-brandPink uppercase tracking-[0.2em] flex items-center gap-2">
                  <Ruler size={14}/> Physical Sizing
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Height</label>
                    <input className="w-full p-3 bg-gray-50 border rounded-xl" value={editingPerformer.height} onChange={e=>setEditingPerformer({...editingPerformer, height: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shirt</label>
                    <input className="w-full p-3 bg-gray-50 border rounded-xl" value={editingPerformer.shirtSize} onChange={e=>setEditingPerformer({...editingPerformer, shirtSize: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shoe</label>
                    <input className="w-full p-3 bg-gray-50 border rounded-xl" value={editingPerformer.shoeSize} onChange={e=>setEditingPerformer({...editingPerformer, shoeSize: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dress</label>
                    <input className="w-full p-3 bg-gray-50 border rounded-xl" value={editingPerformer.dressSize || ''} onChange={e=>setEditingPerformer({...editingPerformer, dressSize: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pant</label>
                    <input className="w-full p-3 bg-gray-50 border rounded-xl" value={editingPerformer.pantSize} onChange={e=>setEditingPerformer({...editingPerformer, pantSize: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hat</label>
                    <input className="w-full p-3 bg-gray-50 border rounded-xl" value={editingPerformer.hatSize} onChange={e=>setEditingPerformer({...editingPerformer, hatSize: e.target.value})} />
                  </div>
                </div>
              </div>

            </form>
            <div className="p-8 border-t border-gray-100 flex justify-end gap-4 bg-gray-50/50">
              <button onClick={() => setEditingPerformer(null)} className="px-6 py-3 font-bold text-gray-400 hover:text-black">Cancel</button>
              <button onClick={handleEditPerformer} className="bg-black text-white px-10 py-3 rounded-xl font-bold shadow-xl flex items-center gap-2 hover:bg-brandPink transition-all">
                <Save size={18} /> Save All Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
