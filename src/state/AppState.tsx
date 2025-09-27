import React, { useState } from 'react';
import type { Audience } from '../components/OnboardingModal';
import { supabase } from '../supabaseClient'; // Add this import
import { useAuth } from '../auth/AuthContext'; // Add this import

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
  updateProfile: (patch: Partial<Profile>) => Promise<void>; // Make async
  setMedications: (meds: Medication[]) => Promise<void>; // Make async
  setEmergencyContacts: (ecs: EmergencyContact[]) => Promise<void>; // Make async
  setInterests: (ints: string[]) => Promise<void>; // Make async
  setFamilyMembers: (members: FamilyMember[]) => Promise<void>; // Make async
  setNotifications: (prefs: Partial<NotificationsPrefs>) => Promise<void>; // Make async
  resetAll: () => Promise<void>; // Make async
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
  setAudience: () => Promise.resolve(), // Update to return Promise
  setPhone: () => Promise.resolve(), // Update to return Promise
  setView: () => Promise.resolve(), // Update to return Promise
  updateProfile: () => Promise.resolve(), // Update to return Promise
  setMedications: () => Promise.resolve(), // Update to return Promise
  setEmergencyContacts: () => Promise.resolve(), // Update to return Promise
  setInterests: () => Promise.resolve(), // Update to return Promise
  setFamilyMembers: () => Promise.resolve(), // Update to return Promise
  setNotifications: () => Promise.resolve(), // Update to return Promise
  setTopicsTone: () => Promise.resolve(), // Update to return Promise
  resetAll: () => Promise.resolve(), // Update to return Promise
};

const AppStateContext = React.createContext<AppStateShape>(defaultState);

const STORAGE_KEY = 'aasha_app_state_v1';

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth(); // Use useAuth
  const [state, setState] = React.useState<AppStateShape>(() => {
    // Initialize from localStorage, but prioritize authenticated user
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return defaultState;
  });
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Effect to load data from Supabase when user changes
  React.useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(
            `
              *,
              medications(*),
              emergency_contacts(*),
              family_members(*),
              notification_preferences(*)
            `
          )
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is 'no rows found'
          console.error('Error fetching profile:', profileError);
          // Handle error, e.g., redirect to onboarding if no profile found
          setState(s => ({ ...s, view: 'marketing' })); // Or redirect to onboarding
          return;
        }

        if (profileData) {
          setState(s => ({
            ...s,
            audience: profileData.audience || null,
            phone: profileData.phone_number ? { countryCode: profileData.phone_number.substring(0, profileData.phone_number.length - 10), number: profileData.phone_number.slice(-10) } : null,
            view: profileData.audience === 'elder' ? 'elder' : profileData.audience === 'family' ? 'family' : 'marketing',
            profile: {
              firstName: profileData.first_name || '',
              lastName: profileData.last_name || '',
              dateOfBirth: profileData.date_of_birth || '',
              gender: profileData.gender || '',
              location: profileData.location || '',
              maritalStatus: profileData.marital_status || '',
              preferredName: profileData.preferred_name || '',
              language: profileData.language || 'English',
              readingTime: profileData.reading_time || '',
              callingTime: profileData.calling_time || '',
              callSlot: profileData.call_slot || '',
              customFrom: profileData.custom_from || '',
              customTo: profileData.custom_to || '',
              medications: profileData.medications || [],
              interests: profileData.interests || [],
              emergencyContacts: profileData.emergency_contacts || [],
              careGoals: profileData.care_goals || [],
              // lovedOneDetails not directly in profile, handled by family_members relation
            },
            familyMembers: profileData.family_members || [],
            notifications: profileData.notification_preferences?.[0] ? {
              missedDose: profileData.notification_preferences[0].missed_dose,
              noChat: profileData.notification_preferences[0].no_chat,
            } : { missedDose: true, noChat: true },
            topicsTone: profileData.topics_tone || 'Warm',
          }));
        } else {
          // User is authenticated but no profile found, redirect to onboarding
          setState(s => ({ ...s, view: 'marketing', audience: null }));
        }
      } else if (!authLoading) {
        // No user and auth not loading, reset state to default marketing view
        setState(defaultState);
      }
      setIsDataLoaded(true);
    };

    if (!authLoading) {
      fetchUserData();
    }
  }, [user, authLoading]);

  // Keep localStorage sync for non-sensitive data or if no Supabase data available yet
  React.useEffect(() => {
    if (isDataLoaded && !authLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
    }
  }, [state, isDataLoaded, authLoading]);

  const api: AppStateShape = {
    ...state,
    setAudience: (a) => setState(s => ({ ...s, audience: a })),
    setPhone: (p) => setState(s => ({ ...s, phone: p })),
    setView: (v) => setState(s => ({ ...s, view: v })),
    updateProfile: async (patch) => {
      if (!user) return;
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: patch.firstName,
          last_name: patch.lastName,
          date_of_birth: patch.dateOfBirth,
          gender: patch.gender,
          location: patch.location,
          marital_status: patch.maritalStatus,
          preferred_name: patch.preferredName,
          language: patch.language,
          reading_time: patch.readingTime,
          calling_time: patch.callingTime,
          call_slot: patch.callSlot === '' ? null : patch.callSlot,
          custom_from: patch.customFrom,
          custom_to: patch.customTo,
          interests: patch.interests,
          care_goals: patch.careGoals,
          // audience and phone_number are set during onboarding/login, not updated here
        })
        .eq('id', user.id);
      if (error) console.error('Error updating profile:', error);
      setState(s => ({ ...s, profile: { ...s.profile, ...patch } }));
    },
    setMedications: async (meds) => {
      if (!user) return;
      const oldMeds = state.profile.medications;

      // Delete removed medications
      const medsToDelete = oldMeds.filter(oldMed => !meds.some(newMed => newMed.id === oldMed.id));
      if (medsToDelete.length > 0) {
        const { error } = await supabase.from('medications').delete().in('id', medsToDelete.map(m => m.id));
        if (error) console.error('Error deleting medications:', error);
      }

      // Upsert (insert/update) existing and new medications
      const medsToUpsert = meds.map(med => ({
        id: med.id.startsWith('temp-') ? undefined : med.id, // Only provide ID if it's not a temp ID
        profile_id: user.id,
        name: med.name,
        quantity: med.quantity,
        morning: med.morning,
        afternoon: med.afternoon,
        evening: med.evening,
        night: med.night,
      }));
      if (medsToUpsert.length > 0) {
        const { error } = await supabase.from('medications').upsert(medsToUpsert, { onConflict: 'id' });
        if (error) console.error('Error upserting medications:', error);
      }
      setState(s => ({ ...s, profile: { ...s.profile, medications: meds } }));
    },
    setEmergencyContacts: async (ecs) => {
      if (!user) return;
      const oldEcs = state.profile.emergencyContacts;

      // Delete removed contacts
      const ecsToDelete = oldEcs.filter(oldEc => !ecs.some(newEc => newEc.id === oldEc.id));
      if (ecsToDelete.length > 0) {
        const { error } = await supabase.from('emergency_contacts').delete().in('id', ecsToDelete.map(ec => ec.id));
        if (error) console.error('Error deleting emergency contacts:', error);
      }

      // Upsert (insert/update) existing and new contacts
      const ecsToUpsert = ecs.map(ec => ({
        id: ec.id.startsWith('temp-') ? undefined : ec.id, // Only provide ID if it's not a temp ID
        profile_id: user.id,
        name: ec.name,
        relationship: ec.relationship,
        phone: ec.phone,
      }));
      if (ecsToUpsert.length > 0) {
        const { error } = await supabase.from('emergency_contacts').upsert(ecsToUpsert, { onConflict: 'id' });
        if (error) console.error('Error upserting emergency contacts:', error);
      }
      setState(s => ({ ...s, profile: { ...s.profile, emergencyContacts: ecs } }));
    },
    setInterests: async (ints) => {
      if (!user) return;
      // Interests are part of the profile table, so update the profile directly
      const { error } = await supabase
        .from('profiles')
        .update({ interests: ints })
        .eq('id', user.id);
      if (error) console.error('Error updating interests:', error);
      setState(s => ({ ...s, profile: { ...s.profile, interests: ints } }));
    },
    setFamilyMembers: async (members) => {
        if (!user) return;
        const oldMembers = state.familyMembers;

        // Delete removed family members
        const membersToDelete = oldMembers.filter(oldMember => !members.some(newMember => newMember.id === oldMember.id));
        if (membersToDelete.length > 0) {
          const { error } = await supabase.from('family_members').delete().in('id', membersToDelete.map(m => m.id));
          if (error) console.error('Error deleting family members:', error);
        }

        // Upsert (insert/update) existing and new family members
        const membersToUpsert = members.map(member => ({
          id: member.id.startsWith('temp-') ? undefined : member.id, // Only provide ID if it's not a temp ID
          family_profile_id: user.id,
          elder_profile_id: member.elder_profile_id, // Assuming this is set elsewhere or can be null
          first_name: member.name, // Assuming name maps to first_name
          relationship: member.relationship,
          phone: member.phone,
        }));
        if (membersToUpsert.length > 0) {
          const { error } = await supabase.from('family_members').upsert(membersToUpsert, { onConflict: 'id' });
          if (error) console.error('Error upserting family members:', error);
        }
        setState(s => ({ ...s, familyMembers: members }));
    },
    setNotifications: async (prefs) => {
      if (!user) return;
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({ profile_id: user.id, ...prefs }, { onConflict: 'profile_id' });
      if (error) console.error('Error updating notification preferences:', error);
      setState(s => ({ ...s, notifications: { ...s.notifications, ...prefs } }));
    },
    setTopicsTone: async (tone) => {
        if (!user) return;
        const { error } = await supabase
            .from('profiles')
            .update({ topics_tone: tone })
            .eq('id', user.id);
        if (error) console.error('Error updating topics tone:', error);
        setState(s => ({ ...s, topicsTone: tone }));
    },
    resetAll: async () => {
      // For now, simply reset local state. Full Supabase data clear would be more complex.
      setState(defaultState);
      if (user) {
        // Optionally, you might want to delete user data from Supabase here.
        console.warn('resetAll called for authenticated user. Consider clearing Supabase data.');
      }
    },
  };

  // Show loading spinner or placeholder until auth and data are loaded
  if (authLoading || (user && !isDataLoaded)) {
    return <div className="flex items-center justify-center min-h-screen">Loading application...</div>; // Replace with a proper loading spinner
  }

  return (
    <AppStateContext.Provider value={api}>{children}</AppStateContext.Provider>
  );
};

export const useAppState = () => React.useContext(AppStateContext);
