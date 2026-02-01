
import React, { useState } from 'react';
import { Performer, Role, Language, Fluency } from '../types';
import { ArrowLeft, Save, User, Shield, Ruler, MapPin, Phone, Check, Globe, Plus, Trash2, Heart, Calendar, Plane, Lock } from 'lucide-react';

interface SectionProps {
  title: string;
  icon: any;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-6">
    <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
      <div className="p-2 bg-pink-50 text-brandPink rounded-lg"><Icon size={20} /></div>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  </div>
);

interface RegistrationFormProps {
  onSave: (performer: Performer) => void;
  onCancel: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Performer>>({
    username: '',
    password: '',
    isAdmin: false, // Default to false, toggle removed
    roles: [],
    isSubOnly: false,
    languages: [{ name: 'English', fluency: 'Native/Near-Native' }],
    travelZones: { zone2: true, zone3: false, zone4: false, zone5: false },
    inTownThanksgiving: true,
    inTownChristmasEve: true,
    inTownChristmas: true,
    inTownNYE: true,
    inTownNewYears: true,
    isSagAftra: false,
    canBeatbox: false,
    conflicts: []
  });

  const toggleRole = (role: Role) => {
    const currentRoles = formData.roles || [];
    if (currentRoles.includes(role)) {
      setFormData({ ...formData, roles: currentRoles.filter(r => r !== role) });
    } else {
      setFormData({ ...formData, roles: [...currentRoles, role] });
    }
  };

  const addLanguage = () => {
    const currentLanguages = formData.languages || [];
    setFormData({
      ...formData,
      languages: [...currentLanguages, { name: '', fluency: 'Beginner' }]
    });
  };

  const removeLanguage = (index: number) => {
    const currentLanguages = formData.languages || [];
    setFormData({
      ...formData,
      languages: currentLanguages.filter((_, i) => i !== index)
    });
  };

  const updateLanguage = (index: number, field: keyof Language, value: string) => {
    const currentLanguages = [...(formData.languages || [])];
    currentLanguages[index] = { ...currentLanguages[index], [field]: value };
    setFormData({ ...formData, languages: currentLanguages });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPerformer: Performer = {
      ...formData,
      id: `p-${Date.now()}`,
      username: formData.username || '',
      password: formData.password || '',
      isAdmin: false, // Force false on registration
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      roles: formData.roles || [],
      isSubOnly: formData.isSubOnly || false,
      email: formData.email || '',
      cellNumber: formData.cellNumber || '',
      address: formData.address || '',
      fullLegalName: formData.fullLegalName || '',
      ssn: formData.ssn || '',
      bio: formData.bio || '',
      favoriteHolidaySong: formData.favoriteHolidaySong || '',
      height: formData.height || '',
      shirtSize: formData.shirtSize || '',
      shoeSize: formData.shoeSize || '',
      pantSize: formData.pantSize || '',
      hatSize: formData.hatSize || '',
      emergencyContactName: formData.emergencyContactName || '',
      emergencyContactCell: formData.emergencyContactCell || '',
      languages: formData.languages || [],
      travelZones: formData.travelZones || { zone2: true, zone3: false, zone4: false, zone5: false },
    } as Performer;
    onSave(newPerformer);
  };

  const fluencyLevels: Fluency[] = ['Beginner', 'Conversational', 'Fluent', 'Native/Near-Native'];

  const zoneLabels = {
    zone2: 'Zone 2: 16-35 miles (Malibu, Calabasas, Long Beach): $15',
    zone3: 'Zone 3: 36-55 miles (OC, Riverside, Ontario) Weekend: $30 | Weekday',
    zone4: 'Zone 4 (over 55 miles): Palm Springs, Las Vegas',
    zone5: 'Zone 5 (out of region): Northern California, Texas, Colorado'
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <button onClick={onCancel} className="flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-colors">
        <ArrowLeft size={20} /> Back to Home
      </button>
      
      <div className="mb-12">
        <h1 className="serif text-6xl font-bold text-black mb-4">Caroler Registration</h1>
        <p className="text-gray-500 text-lg font-light">Join the TinselTimes roster as a holiday performer.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Section title="Account Credentials" icon={Lock}>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Username</label>
            <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brandPink outline-none transition-all" 
              value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
            <input required type="password" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brandPink outline-none transition-all" 
              value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
        </Section>

        <Section title="Basic Information" icon={User}>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">First Name</label>
            <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brandPink outline-none transition-all" 
              value={formData.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last Name</label>
            <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brandPink outline-none transition-all" 
              value={formData.lastName || ''} onChange={e => setFormData({...formData, lastName: e.target.value})} />
          </div>
          <div className="md:col-span-2 space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vocal Part(s)</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(Role).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRole(r)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                    formData.roles?.includes(r) 
                      ? 'bg-brandPink border-brandPink text-white shadow-lg shadow-brandPink/20' 
                      : 'bg-white border-gray-200 text-gray-500 hover:border-brandPink hover:text-brandPink'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Role Status</label>
            <div className="flex items-center gap-4 h-14">
              <label className="flex items-center gap-3 cursor-pointer bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 w-full hover:bg-white transition-all">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-brandPink rounded"
                  checked={formData.isSubOnly} 
                  onChange={e => setFormData({...formData, isSubOnly: e.target.checked})} 
                />
                <span className="text-sm font-bold text-gray-700">Sub-Only Member</span>
              </label>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
            <input type="email" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" 
              value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cell Number</label>
            <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" 
              value={formData.cellNumber || ''} onChange={e => setFormData({...formData, cellNumber: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Instagram Handle</label>
            <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" placeholder="@handle"
              value={formData.instagramHandle || ''} onChange={e => setFormData({...formData, instagramHandle: e.target.value})} />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mailing Address</label>
            <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" 
              value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
        </Section>

        <Section title="Languages" icon={Globe}>
          <div className="md:col-span-3 space-y-4">
            {formData.languages?.map((lang, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 items-end bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex-grow space-y-1 w-full">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Language</label>
                  <input 
                    required 
                    className="w-full p-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-brandPink" 
                    placeholder="e.g. Spanish"
                    value={lang.name} 
                    onChange={e => updateLanguage(index, 'name', e.target.value)} 
                  />
                </div>
                <div className="w-full md:w-64 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fluency</label>
                  <select 
                    className="w-full p-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-brandPink"
                    value={lang.fluency}
                    onChange={e => updateLanguage(index, 'fluency', e.target.value)}
                  >
                    {fluencyLevels.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeLanguage(index)}
                  className="p-3 text-gray-400 hover:text-brandPink transition-colors mb-0.5"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            <button 
              type="button" 
              onClick={addLanguage}
              className="flex items-center gap-2 text-brandPink font-bold text-sm hover:opacity-80 transition-opacity px-2 py-1"
            >
              <Plus size={18} /> Add Language
            </button>
          </div>
        </Section>

        <Section title="Emergency Contact" icon={Heart}>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Name</label>
            <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" 
              value={formData.emergencyContactName || ''} onChange={e => setFormData({...formData, emergencyContactName: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contact cell</label>
            <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" 
              value={formData.emergencyContactCell || ''} onChange={e => setFormData({...formData, emergencyContactCell: e.target.value})} />
          </div>
        </Section>

        <Section title="Holiday Availability" icon={Calendar}>
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             {[
               { field: 'inTownThanksgiving', label: 'In town for Thanksgiving?' },
               { field: 'inTownChristmasEve', label: 'In town for Christmas Eve?' },
               { field: 'inTownChristmas', label: 'In town for Christmas?' },
               { field: 'inTownNYE', label: 'In town for New Year\'s Eve?' },
               { field: 'inTownNewYears', label: 'In town for New Year\'s Day?' },
             ].map(item => (
               <label key={item.field} className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white transition-all">
                 <input 
                   type="checkbox" 
                   className="w-5 h-5 accent-brandPink" 
                   checked={!!formData[item.field as keyof Performer]} 
                   onChange={e => setFormData({...formData, [item.field]: e.target.checked})} 
                 />
                 <span className="text-sm font-bold text-gray-700">{item.label}</span>
               </label>
             ))}
          </div>
        </Section>

        <Section title="Administrative Details" icon={Shield}>
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Legal Name</label>
            <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" 
              value={formData.fullLegalName || ''} onChange={e => setFormData({...formData, fullLegalName: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">First 5 Digits of SSN</label>
            <input type="password" required maxLength={5} placeholder="XXXXX" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" 
              value={formData.ssn || ''} onChange={e => setFormData({...formData, ssn: e.target.value})} />
            <p className="text-[10px] text-brandPink font-bold mt-1">Reminder: Give Joey the last 4 digits verbally & privately at first rehearsal.</p>
          </div>
          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bio (approx 100 words)</label>
            <textarea className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl h-24" 
              value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Favorite Holiday Song</label>
            <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" 
              value={formData.favoriteHolidaySong || ''} onChange={e => setFormData({...formData, favoriteHolidaySong: e.target.value})} />
          </div>
        </Section>

        <Section title="Skills & Travel" icon={Plane}>
           <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Special Skills</label>
                 <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white transition-all">
                   <input type="checkbox" className="w-5 h-5 accent-brandPink" checked={formData.canBeatbox} onChange={e => setFormData({...formData, canBeatbox: e.target.checked})} />
                   <span className="text-sm font-bold text-gray-700">Can you Beatbox?</span>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white transition-all">
                   <input type="checkbox" className="w-5 h-5 accent-brandPink" checked={formData.isSagAftra} onChange={e => setFormData({...formData, isSagAftra: e.target.checked})} />
                   <span className="text-sm font-bold text-gray-700">SAG/AFTRA Member?</span>
                 </label>
              </div>
              <div className="space-y-4">
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Travel Zones (select all that apply)</label>
                 <div className="flex flex-col gap-2">
                    {Object.entries(zoneLabels).map(([zone, label]) => (
                      <label key={zone} className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white transition-all capitalize">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 accent-brandPink" 
                          checked={!!formData.travelZones?.[zone as keyof typeof formData.travelZones]} 
                          onChange={e => setFormData({...formData, travelZones: {...formData.travelZones!, [zone]: e.target.checked}})} 
                        />
                        <span className="text-[10px] font-bold text-gray-700">{label}</span>
                      </label>
                    ))}
                 </div>
              </div>
           </div>
        </Section>

        <Section title="Sizing & Physicals" icon={Ruler}>
          <div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Height</label>
            <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" placeholder="e.g. 5'10\" 
              value={formData.height || ''} onChange={e => setFormData({...formData, height: e.target.value})} /></div>
          <div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Shirt Size</label>
            <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" 
              value={formData.shirtSize || ''} onChange={e => setFormData({...formData, shirtSize: e.target.value})} /></div>
          <div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Shoe Size</label>
            <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" placeholder="e.g. 8.5"
              value={formData.shoeSize || ''} onChange={e => setFormData({...formData, shoeSize: e.target.value})} /></div>
          <div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dress Size</label>
            <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" 
              value={formData.dressSize || ''} onChange={e => setFormData({...formData, dressSize: e.target.value})} /></div>
          <div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pant Size</label>
            <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" 
              value={formData.pantSize || ''} onChange={e => setFormData({...formData, pantSize: e.target.value})} /></div>
          <div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hat Size</label>
            <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" 
              value={formData.hatSize || ''} onChange={e => setFormData({...formData, hatSize: e.target.value})} /></div>
        </Section>

        <div className="flex justify-end gap-6 mt-16 pb-24">
          <button type="button" onClick={onCancel} className="px-10 py-5 text-gray-400 font-bold hover:text-black transition-colors">Cancel</button>
          <button type="submit" className="bg-black text-white px-14 py-5 rounded-[1.5rem] font-bold shadow-2xl hover:bg-brandPink transition-all flex items-center gap-3">
            <Save size={20} /> Register Performance Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
