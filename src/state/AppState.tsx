import React from 'react';
import type { Audience } from '../components/OnboardingModal';

export type Medication = {
  id: string;
  name: string;
  quantity: number;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
};

export type EmergencyContact = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
};

export type FamilyMember = {
  id: string;
  name: string;
  relationship: string;
  phone?: string;
};

export type LovedOneDetails = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  relationship: string;
};

export type Profile = {
  // Personal
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  location: string;
  maritalStatus: string;
  preferredName: string;
  language: string;

  // Preferences
  readingTime: string;
  callingTime: string; // derived from slot or custom
  callSlot: '' | 'morning' | 'afternoon' | 'evening' | 'custom';
  customFrom: string;
  customTo: string;

  // Data
  medications: Medication[];
  interests: string[];
  emergencyContacts: EmergencyContact[];
  careGoals: string[];
  lovedOneDetails?: LovedOneDetails;
};

export type NotificationsPrefs = {
  missedDose: boolean;
  noChat: boolean;
};

export type View = 'marketing' | 'elder' | 'family';

export type AppStateShape = {
  audience: Audience | null;
  phone: { countryCode: string; number: string } | null;
  view: View;
  profile: Profile;
  familyMembers: FamilyMember[];
  notifications: NotificationsPrefs;
  topicsTone: 'Warm' | 'Formal' | 'Playful';

  // Mutators
  setAudience: (a: Audience | null) => void;
  setPhone: (p: { countryCode: string; number: string } | null) => void;
  setView: (v: View) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  setMedications: (meds: Medication[]) => void;
  setEmergencyContacts: (ecs: EmergencyContact[]) => void;
  setInterests: (ints: string[]) => void;
  setFamilyMembers: (members: FamilyMember[]) => void;
  setNotifications: (prefs: Partial<NotificationsPrefs>) => void;
  setTopicsTone: (tone: 'Warm' | 'Formal' | 'Playful') => void;
  resetAll: () => void;
};

const defaultProfile: Profile = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  location: '',
  maritalStatus: '',
  preferredName: '',
  language: 'English',
  readingTime: '',
  callingTime: '',
  callSlot: '',
  customFrom: '',
  customTo: '',
  medications: [],
  interests: [],
  emergencyContacts: [],
  careGoals: [],
};

const defaultState: AppStateShape = {
  audience: null,
  phone: null,
  view: 'marketing',
  profile: defaultProfile,
  familyMembers: [],
  notifications: { missedDose: true, noChat: true },
  topicsTone: 'Warm',
  setAudience: () => {},
  setPhone: () => {},
  setView: () => {},
  updateProfile: () => {},
  setMedications: () => {},
  setEmergencyContacts: () => {},
  setInterests: () => {},
  setFamilyMembers: () => {},
  setNotifications: () => {},
  setTopicsTone: () => {},
  resetAll: () => {},
};

const AppStateContext = React.createContext<AppStateShape>(defaultState);

const STORAGE_KEY = 'aasha_app_state_v1';

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = React.useState<AppStateShape>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return defaultState;
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const api: AppStateShape = {
    ...state,
    setAudience: (a) => setState(s => ({ ...s, audience: a })),
    setPhone: (p) => setState(s => ({ ...s, phone: p })),
    setView: (v) => setState(s => ({ ...s, view: v })),
    updateProfile: (patch) => setState(s => ({ ...s, profile: { ...s.profile, ...patch } })),
    setMedications: (meds) => setState(s => ({ ...s, profile: { ...s.profile, medications: meds } })),
    setEmergencyContacts: (ecs) => setState(s => ({ ...s, profile: { ...s.profile, emergencyContacts: ecs } })),
    setInterests: (ints) => setState(s => ({ ...s, profile: { ...s.profile, interests: ints } })),
    setFamilyMembers: (members) => setState(s => ({ ...s, familyMembers: members })),
    setNotifications: (prefs) => setState(s => ({ ...s, notifications: { ...s.notifications, ...prefs } })),
    setTopicsTone: (tone) => setState(s => ({ ...s, topicsTone: tone })),
    resetAll: () => setState(defaultState),
  };

  return (
    <AppStateContext.Provider value={api}>{children}</AppStateContext.Provider>
  );
};

export const useAppState = () => React.useContext(AppStateContext);
