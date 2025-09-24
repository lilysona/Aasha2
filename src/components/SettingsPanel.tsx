import React from 'react';
import { X, Settings, Languages, Bell, Clock, Users, Shield, ChevronRight, Pill, Wand2, Plus, Trash2, Camera, Music, Book, Palette, Gamepad2, Utensils, Plane, Sprout, Newspaper, Trophy, Cpu, Sparkles, Film, Heart, ChevronDown, Target } from 'lucide-react';
import { useAppState } from '../state/AppState';

export type SettingsVariant = 'elder' | 'family';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  variant: SettingsVariant;
  initialSection?: 'profile' | 'language' | 'reminders' | 'medicines' | 'family' | 'contacts' | 'topics' | 'notifications' | 'goals';
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, variant, initialSection }) => {
  const app = useAppState();
  const [section, setSection] = React.useState<SettingsPanelProps['initialSection']>(initialSection);
  const [collapsedMeds, setCollapsedMeds] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (isOpen) {
      setSection(initialSection);
      const map: Record<string, boolean> = {};
      app.profile.medications.forEach((m, i) => (map[m.id] = i > 0));
      setCollapsedMeds(map);
    }
  }, [isOpen, initialSection]);

  if (!isOpen) return null;

  const ListItem: React.FC<{ icon: React.ReactNode; title: string; desc?: string; onClick: () => void; }>
    = ({ icon, title, desc, onClick }) => (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 text-left border border-gray-200"
    >
      <div className="mt-0.5 text-[#F35E4A]">{icon}</div>
      <div className="flex-1">
        <div className="font-medium text-gray-900">{title}</div>
        {desc && <div className="text-sm text-gray-600">{desc}</div>}
      </div>
      <ChevronRight className="h-4 w-4 text-gray-400" />
    </button>
  );

  return (
    <div className="fixed inset-0 z-[2147483648]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] md:w-[480px] bg-white shadow-2xl border-l border-gray-200 flex flex-col">
        <div className="relative p-4 border-b border-gray-100 flex items-center gap-3">
          <Settings className="h-5 w-5 text-[#F35E4A]" />
          <h2 className="text-lg font-bold text-gray-900">Settings</h2>
          <button onClick={onClose} className="absolute right-2 top-2 p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!section && (
            <div className="space-y-3">
              {variant === 'elder' ? (
                <>
                  <ListItem icon={<Users className="h-4 w-4" />} title="Profile information" desc="Name, gender, DOB, address" onClick={() => setSection('profile')} />
                  <ListItem icon={<Languages className="h-4 w-4" />} title="Change language" desc={`Current: ${app.profile.language || 'Not set'}`} onClick={() => setSection('language')} />
                  <ListItem icon={<Clock className="h-4 w-4" />} title="Reminder window" desc={app.profile.callingTime || 'Not set'} onClick={() => setSection('reminders')} />
                  <ListItem icon={<Pill className="h-4 w-4" />} title="Manage medicines" desc="Add or edit your medications" onClick={() => setSection('medicines')} />
                  <ListItem icon={<Wand2 className="h-4 w-4" />} title="Topics & tone" desc={app.topicsTone} onClick={() => setSection('topics')} />
                  <ListItem icon={<Shield className="h-4 w-4" />} title="Emergency contacts" desc={`${app.profile.emergencyContacts.length} saved`} onClick={() => setSection('contacts')} />
                  <ListItem icon={<Bell className="h-4 w-4" />} title="Notifications" desc={`${app.notifications.missedDose || app.notifications.noChat ? 'Alerts enabled' : 'Off'}`} onClick={() => setSection('notifications')} />
                </>
              ) : (
                <>
                  <ListItem icon={<Users className="h-4 w-4" />} title="Family members" desc={`${app.familyMembers.length} members`} onClick={() => setSection('family')} />
                  <ListItem icon={<Shield className="h-4 w-4" />} title="Emergency contacts" desc={`${app.profile.emergencyContacts.length} saved`} onClick={() => setSection('contacts')} />
                  <ListItem icon={<Users className="h-4 w-4" />} title="Elder profile" desc="Name, gender, DOB" onClick={() => setSection('profile')} />
                  <ListItem icon={<Target className="h-4 w-4" />} title="Care goals" desc={`${app.profile.careGoals?.length || 0} set`} onClick={() => setSection('goals')} />
                  <ListItem icon={<Wand2 className="h-4 w-4" />} title="Topics & tone" desc={app.topicsTone} onClick={() => setSection('topics')} />
                  <ListItem icon={<Bell className="h-4 w-4" />} title="Notifications" desc={`${app.notifications.missedDose || app.notifications.noChat ? 'Alerts enabled' : 'Off'}`} onClick={() => setSection('notifications')} />
                </>
              )}
            </div>
          )}

          {section === 'profile' && (
            <div className="space-y-4">
              <div className="font-semibold text-gray-900">{variant === 'elder' ? 'Your profile' : 'Elder profile'}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={app.profile.firstName} onChange={e => app.updateProfile({ firstName: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" placeholder="First name" />
                <input value={app.profile.lastName} onChange={e => app.updateProfile({ lastName: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" placeholder="Last name" />
                <input type="date" value={app.profile.dateOfBirth} onChange={e => app.updateProfile({ dateOfBirth: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" />
                <select value={app.profile.gender} onChange={e => app.updateProfile({ gender: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
                <input value={app.profile.location} onChange={e => app.updateProfile({ location: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg md:col-span-2" placeholder="Location" />
                <select value={app.profile.maritalStatus} onChange={e => app.updateProfile({ maritalStatus: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">Marital status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="separated">Separated</option>
                </select>
                <input value={app.profile.preferredName} onChange={e => app.updateProfile({ preferredName: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" placeholder="Preferred name" />
              </div>
            </div>
          )}

          {section === 'language' && (
            <div className="space-y-4">
              <div className="font-semibold text-gray-900">Language</div>
              <select value={app.profile.language} onChange={e => app.updateProfile({ language: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>English</option>
                <option>Hindi</option>
              </select>
              <div className="text-sm text-gray-600">Aasha will converse in your selected language.</div>
            </div>
          )}

          {section === 'reminders' && (
            <div className="space-y-4">
              <div className="font-semibold text-gray-900">Reminder window</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['morning','afternoon','evening'] as const).map(slot => (
                  <button
                    key={slot}
                    onClick={() => app.updateProfile({ callSlot: slot, callingTime: slot === 'morning' ? '8:00 AM – 12:00 PM' : slot === 'afternoon' ? '12:00 PM – 5:00 PM' : '5:00 PM – 9:00 PM', customFrom: '', customTo: '' })}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${app.profile.callSlot === slot ? 'border-[#F35E4A] bg-[#F35E4A]/5 text-[#F35E4A]' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="font-medium capitalize">{slot}</div>
                    <div className="text-sm text-gray-500">
                      {slot === 'morning' && '8:00 AM - 12:00 PM'}
                      {slot === 'afternoon' && '12:00 PM - 5:00 PM'}
                      {slot === 'evening' && '5:00 PM - 9:00 PM'}
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => app.updateProfile({ callSlot: 'custom' })}
                className={`mt-3 w-full p-4 border-2 rounded-lg text-center transition-all ${app.profile.callSlot === 'custom' ? 'border-[#F35E4A] bg-[#F35E4A]/5 text-[#F35E4A]' : 'border-gray-200 hover:border-gray-300'}`}
              >
                Custom Time Range
              </button>
              {app.profile.callSlot === 'custom' && (
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">From</label>
                    <input type="time" value={app.profile.customFrom} onChange={e => app.updateProfile({ customFrom: e.target.value, callingTime: e.target.value && app.profile.customTo ? `${e.target.value} – ${app.profile.customTo}` : app.profile.callingTime })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">To</label>
                    <input type="time" value={app.profile.customTo} onChange={e => app.updateProfile({ customTo: e.target.value, callingTime: app.profile.customFrom && e.target.value ? `${app.profile.customFrom} – ${e.target.value}` : app.profile.callingTime })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                </div>
              )}
            </div>
          )}

          {section === 'medicines' && (
            <div className="space-y-4">
              <div className="text-gray-900 font-semibold">Manage medicines</div>
              {app.profile.medications.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-gray-500 mb-4">No medications added yet</div>
                  <button
                    onClick={() => {
                      const m = { id: Date.now().toString(), name: '', quantity: 1, morning: false, afternoon: false, evening: false, night: false };
                      app.setMedications([m]);
                      setCollapsedMeds({ [m.id]: false });
                    }}
                    className="px-5 py-2 bg-[#F35E4A] text-white rounded-lg hover:bg-[#e54d37]"
                  >
                    Add first medication
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {app.profile.medications.map((med, idx) => (
                    <div key={med.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-3 flex items-center gap-2">
                        <input value={med.name} onChange={e => {
                          const list = [...app.profile.medications];
                          list[idx] = { ...list[idx], name: e.target.value };
                          app.setMedications(list);
                        }} className="flex-1 px-3 py-2 border border-gray-300 rounded" placeholder="Medication name" />
                        <button onClick={() => setCollapsedMeds(prev => ({ ...prev, [med.id]: !(prev[med.id] ?? (idx > 0)) }))} className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded" aria-label="Toggle">
                          {(collapsedMeds[med.id] ?? (idx > 0)) ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        <button onClick={() => { app.setMedications(app.profile.medications.filter((_, i) => i !== idx)); setCollapsedMeds(prev => { const { [med.id]: _omit, ...rest } = prev; return rest; }); }} className="p-2 text-red-600 hover:bg-red-50 rounded" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                      {!(collapsedMeds[med.id] ?? (idx > 0)) && (
                        <div className="px-3 pb-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Dosage quantity</label>
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button onClick={() => { const list = [...app.profile.medications]; list[idx] = { ...list[idx], quantity: Math.max(1, list[idx].quantity - 1) }; app.setMedications(list); }} className="px-3 py-2">-</button>
                              <input type="number" min={1} value={med.quantity} onChange={e => { const list = [...app.profile.medications]; list[idx] = { ...list[idx], quantity: Math.max(1, parseInt(e.target.value) || 1) }; app.setMedications(list); }} className="w-20 text-center border-0" />
                              <button onClick={() => { const list = [...app.profile.medications]; list[idx] = { ...list[idx], quantity: list[idx].quantity + 1 }; app.setMedications(list); }} className="px-3 py-2">+</button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Times of day</label>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {(['morning','afternoon','evening','night'] as const).map(k => (
                                <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={Boolean((med as any)[k])} onChange={e => { const list = [...app.profile.medications]; (list[idx] as any)[k] = e.target.checked; app.setMedications(list); }} className="h-5 w-5 rounded border-gray-300 text-[#F35E4A] focus:ring-[#F35E4A]" /><span className="capitalize">{k}</span></label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <button onClick={() => { const nm = { id: Date.now().toString(), name: '', quantity: 1, morning: false, afternoon: false, evening: false, night: false }; app.setMedications([...app.profile.medications, nm]); setCollapsedMeds(prev => { const next = { ...prev }; app.profile.medications.forEach(m => next[m.id] = true); next[nm.id] = false; return next; }); }} className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#F35E4A] hover:text-[#F35E4A] flex items-center justify-center gap-2"><Plus className="h-4 w-4" /> Add medication</button>
                </div>
              )}
            </div>
          )}

          {section === 'family' && (
            <div className="space-y-3 text-sm text-gray-700">
              <div className="text-gray-900 font-semibold">Family members</div>
              {app.familyMembers.length === 0 && <div className="text-gray-500">No members added yet</div>}
              <div className="space-y-2">
                {app.familyMembers.map((m, i) => (
                  <div key={m.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center border border-gray-200 rounded-lg p-2">
                    <input value={m.name} onChange={e => { const list = [...app.familyMembers]; list[i] = { ...list[i], name: e.target.value }; app.setFamilyMembers(list); }} className="px-2 py-2 border border-gray-300 rounded" placeholder="Full name" />
                    <input value={m.relationship} onChange={e => { const list = [...app.familyMembers]; list[i] = { ...list[i], relationship: e.target.value }; app.setFamilyMembers(list); }} className="px-2 py-2 border border-gray-300 rounded" placeholder="Relationship" />
                    <div className="flex items-center gap-2">
                      <input value={m.phone || ''} onChange={e => { const list = [...app.familyMembers]; list[i] = { ...list[i], phone: e.target.value }; app.setFamilyMembers(list); }} className="flex-1 px-2 py-2 border border-gray-300 rounded" placeholder="Phone" />
                      <button onClick={() => app.setFamilyMembers(app.familyMembers.filter((_, idx) => idx !== i))} className="p-2 text-red-600 hover:bg-red-50 rounded" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => app.setFamilyMembers([...app.familyMembers, { id: Date.now().toString(), name: '', relationship: '', phone: '' }])} className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#F35E4A] hover:text-[#F35E4A] flex items-center justify-center gap-2"><Plus className="h-4 w-4" /> Add member</button>
            </div>
          )}

          {section === 'contacts' && (
            <div className="space-y-3 text-sm text-gray-700">
              <div className="text-gray-900 font-semibold">Emergency contacts</div>
              {app.profile.emergencyContacts.length === 0 && <div className="text-gray-500">No contacts added yet</div>}
              <div className="space-y-2">
                {app.profile.emergencyContacts.map((c, i) => (
                  <div key={c.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center border border-gray-200 rounded-lg p-2">
                    <input value={c.name} onChange={e => { const list = [...app.profile.emergencyContacts]; list[i] = { ...list[i], name: e.target.value }; app.setEmergencyContacts(list); }} className="px-2 py-2 border border-gray-300 rounded" placeholder="Full name" />
                    <input value={c.relationship} onChange={e => { const list = [...app.profile.emergencyContacts]; list[i] = { ...list[i], relationship: e.target.value }; app.setEmergencyContacts(list); }} className="px-2 py-2 border border-gray-300 rounded" placeholder="Relationship" />
                    <div className="flex items-center gap-2">
                      <input value={c.phone} onChange={e => { const list = [...app.profile.emergencyContacts]; list[i] = { ...list[i], phone: e.target.value }; app.setEmergencyContacts(list); }} className="flex-1 px-2 py-2 border border-gray-300 rounded" placeholder="Phone" />
                      <button onClick={() => app.setEmergencyContacts(app.profile.emergencyContacts.filter((_, idx) => idx !== i))} className="p-2 text-red-600 hover:bg-red-50 rounded" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => app.setEmergencyContacts([...(app.profile.emergencyContacts || []), { id: Date.now().toString(), name: '', relationship: '', phone: '' }])} className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#F35E4A] hover:text-[#F35E4A] flex items-center justify-center gap-2"><Plus className="h-4 w-4" /> Add contact</button>
            </div>
          )}

          {section === 'goals' && (
            <div className="space-y-3 text-sm text-gray-700">
              <div className="text-gray-900 font-semibold">Care goals</div>
              <div className="flex flex-wrap gap-2">
                {(app.profile.careGoals || []).map((g, i) => (
                  <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                    {g}
                    <button onClick={() => app.updateProfile({ careGoals: (app.profile.careGoals || []).filter((_, idx) => idx !== i) })} className="text-gray-500 hover:text-gray-800">×</button>
                  </span>
                ))}
              </div>
              <GoalInput onAdd={(val) => app.updateProfile({ careGoals: [...(app.profile.careGoals || []), val] })} />
              <div className="text-xs text-gray-500">Examples: Improve diet, 30-min walk daily, socialize twice a week</div>
            </div>
          )}

          {section === 'topics' && (
            <div className="space-y-4">
              <div className="font-semibold text-gray-900">Topics & tone</div>
              <label className="block text-sm text-gray-700 mb-1">Tone</label>
              <select value={app.topicsTone} onChange={e => app.setTopicsTone(e.target.value as any)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>Warm</option>
                <option>Formal</option>
                <option>Playful</option>
              </select>
              <div className="text-sm text-gray-600">This affects how Aasha phrases messages and suggestions.</div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'reading', name: 'Reading', icon: Book },
                  { id: 'music', name: 'Music', icon: Music },
                  { id: 'cooking', name: 'Cooking', icon: Utensils },
                  { id: 'travel', name: 'Travel', icon: Plane },
                  { id: 'photography', name: 'Photography', icon: Camera },
                  { id: 'art', name: 'Art & Crafts', icon: Palette },
                  { id: 'gardening', name: 'Gardening', icon: Sprout },
                  { id: 'news', name: 'News & Current Affairs', icon: Newspaper },
                  { id: 'wellness', name: 'Health & Wellness', icon: Heart },
                  { id: 'devotional', name: 'Devotional', icon: Sparkles },
                  { id: 'movies', name: 'Movies', icon: Film },
                  { id: 'sports', name: 'Sports', icon: Trophy },
                  { id: 'technology', name: 'Technology', icon: Cpu },
                  { id: 'gaming', name: 'Gaming', icon: Gamepad2 },
                ].map((interest) => {
                  const Icon = interest.icon as any;
                  const isSelected = app.profile.interests.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      onClick={() => {
                        const updated = isSelected
                          ? app.profile.interests.filter(id => id !== interest.id)
                          : [...app.profile.interests, interest.id];
                        app.setInterests(updated);
                      }}
                      className={`flex flex-col items-center gap-2 px-4 py-5 rounded-xl border-2 transition-all text-center ${
                        isSelected
                          ? 'border-[#F35E4A] bg-[#F35E4A] text-white shadow'
                          : 'border-gray-200 hover:border-[#F35E4A] hover:bg-[#F35E4A]/5'
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="font-medium text-sm">{interest.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {section === 'notifications' && (
            <div className="space-y-4">
              <div className="font-semibold text-gray-900">Notifications</div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={app.notifications.missedDose} onChange={e => app.setNotifications({ missedDose: e.target.checked })} className="h-5 w-5 rounded border-gray-300 text-[#F35E4A] focus:ring-[#F35E4A]" />
                <span className="text-sm">Missed medicine alerts</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={app.notifications.noChat} onChange={e => app.setNotifications({ noChat: e.target.checked })} className="h-5 w-5 rounded border-gray-300 text-[#F35E4A] focus:ring-[#F35E4A]" />
                <span className="text-sm">No chat in 24 hours</span>
              </label>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            {section && (
              <button onClick={() => setSection(undefined)} className="text-gray-600 hover:text-gray-900">
                &larr; All settings
              </button>
            )}
          </div>
          <button onClick={onClose} className="px-4 py-2 bg-[#F35E4A] text-white rounded-lg hover:bg-[#e54d37]">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const GoalInput: React.FC<{ onAdd: (val: string) => void }> = ({ onAdd }) => {
  const [val, setVal] = React.useState('');
  return (
    <div className="flex gap-2">
      <input value={val} onChange={e => setVal(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" placeholder="Add a goal..." />
      <button onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(''); } }} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Add</button>
    </div>
  );
};

export default SettingsPanel;
