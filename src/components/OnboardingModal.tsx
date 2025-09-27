import React, { useState } from 'react';
import { X, User, Heart, Camera, Music, Book, Palette, Gamepad2, Utensils, Plane, Plus, Trash2, ChevronRight, ChevronDown, Sprout, Newspaper, Trophy, Cpu, Sparkles, Film, Sunrise, Sun, Moon } from 'lucide-react';
import { useAppState } from '../state/AppState';
import { supabase } from '../supabaseClient'; // Add this import
import { useAuth } from '../auth/AuthContext'; // Add this import

export type Audience = 'self' | 'lovedOne';

interface OnboardingData {
  // Personal Info
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  location: string;
  maritalStatus: string;
  
  // Preferences
  preferredName: string;
  language: string;
  readingTime: string;
  callingTime: string;
  callSlot: '' | 'morning' | 'afternoon' | 'evening' | 'custom';
  customFrom: string;
  customTo: string;
  
  // Medications
  medications: Array<{
    id: string;
    name: string;
    quantity: number;
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  }>;
  
  // Interests
  interests: string[];
  
  // Contacts
  emergencyContacts: Array<{
    id: string;
    name: string;
    relationship: string;
    phone: string;
  }>;
  
  // For loved one path
  careGoals: string[];
  lovedOneDetails?: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    relationship: string;
    language?: string; // Add this
    maritalStatus?: string; // Add this
  };
}

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (audience: Audience) => void;
  onComplete: (audience: Audience) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onSelect, onComplete }) => {
  const app = useAppState();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>(1);
  const [audience, setAudience] = useState<Audience | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof OnboardingData | 'relationship' | 'otp' | 'general', string>>>({}); // Add 'otp' and 'general'
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [lovedOnePhone, setLovedOnePhone] = useState('');
  const [useSamePhone, setUseSamePhone] = useState(false);
  const [lovedOneOtp, setLovedOneOtp] = useState('');
  const [isLovedOneOtpSent, setIsLovedOneOtpSent] = useState(false);
  const [isVerifyingLovedOne, setIsVerifyingLovedOne] = useState(false);
  const { user } = useAuth(); // Get the authenticated user

  // Test OTP bypass
  const TEST_OTP_CODE = (import.meta.env as any).VITE_TEST_OTP_CODE || '123456';
  const BYPASS_OTP = ((import.meta.env as any).VITE_BYPASS_OTP === '1');

  const [formData, setFormData] = useState<OnboardingData>({
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
    lovedOneDetails: undefined
  });
  const [collapsedMeds, setCollapsedMeds] = useState<Record<string, boolean>>({});

  const countryCodes = [
    { code: '+1', country: 'US', flag: '🇺🇸', digits: 10 },
    { code: '+91', country: 'IN', flag: '🇮🇳', digits: 10 },
  ];

  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setAudience(null);
      setPhoneNumber('');
      setOtp('');
      setIsOtpSent(false);
      setIsVerifying(false);
      setAgreedToTerms(false);
      setResendCooldown(0);
      setFormErrors({});
    }
  }, [isOpen]);

  // Persist phone to AppState while typing
  React.useEffect(() => {
    if (!isOpen) return;
    if (phoneNumber) {
      app.setPhone({ countryCode, number: phoneNumber });
    } else {
      app.setPhone(null);
    }
  }, [countryCode, phoneNumber]);

  // Prevent background scroll when modal is open
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Prevent background scroll when modal is open
  React.useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (value: Audience) => {
    setAudience(value);
    setStep(2);
    onSelect(value);
    app.setAudience(value);
  };

  const validateStep3 = () => {
    const errors: Partial<Record<keyof OnboardingData | 'relationship', string>> = {};
    if (!formData.firstName) errors.firstName = 'First name is required.';
    if (!formData.lastName) errors.lastName = 'Last name is required.';
    
    if (audience === 'lovedOne') {
      // For loved one flow, step 3 is family member info
      if (!formData.lovedOneDetails?.relationship) errors.relationship = 'Relationship is required.';
    } else {
      // For self flow, step 3 is personal info
      if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required.';
      if (!formData.gender) errors.gender = 'Gender is required.';
      if (!formData.language) errors.language = 'Language is required.';
      if (!formData.maritalStatus) errors.maritalStatus = 'Marital status is required.';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => { // Make handleNext async
    if (step === 2 && isOtpSent && otp.length === 6 && agreedToTerms) {
      // This branch is now handled by handleVerifyOtp
      await handleVerifyOtp(countryCode + phoneNumber, otp);
    } else if (step === 3) {
      if (validateStep3()) {
        setStep(4);
      }
    } else if (step > 3) {
      const maxSteps = audience === 'self' ? 7 : 9;
      if (step < maxSteps) {
        setStep((prev) => (prev + 1) as typeof step);
      } else {
        // Finalize: persist data and navigate
        await finalizeAndPersist();
        app.updateProfile(formData as any);
        if (audience) {
          onComplete(audience);
        } else {
          onClose();
        }
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as typeof step);
    }
  };

  const updateFormData = (updates: Partial<OnboardingData>) => {
    // Compute friendly callingTime label when call window changes
    let patch: Partial<OnboardingData> = { ...updates };
    const slot = updates.callSlot ?? formData.callSlot;
    const from = updates.customFrom ?? formData.customFrom;
    const to = updates.customTo ?? formData.customTo;
    if (updates.callSlot !== undefined || updates.customFrom !== undefined || updates.customTo !== undefined) {
      let callingTime = '';
      if (slot === 'morning') callingTime = '8:00 AM – 12:00 PM';
      else if (slot === 'afternoon') callingTime = '12:00 PM – 5:00 PM';
      else if (slot === 'evening') callingTime = '5:00 PM – 9:00 PM';
      else if (slot === 'custom' && from && to) callingTime = `${from} – ${to}`;
      patch.callingTime = callingTime;
    }
    setFormData(prev => ({ ...prev, ...patch }));
    // Persist to global AppState
    app.updateProfile(patch as any);
  };

  const getStepTitle = () => {
    if (step === 2) return 'Enter your phone number';
    if (step === 3) return audience === 'self' ? 'Tell us about yourself' : 'Tell us about yourself';
    if (step === 4) return audience === 'self' ? `When should Aasha call you?` : 'Tell us about your loved one';
    if (step === 5) return audience === 'self' ? 'Share your Medication Details' : 'Where should Aasha call your loved one?';
    if (step === 6) return audience === 'self' ? 'What interests you?' : `When should Aasha call them?`;
    if (step === 7) return audience === 'self' ? 'Emergency contacts' : 'Share their Medication Details';
    if (step === 8) return audience === 'self' ? '' : 'What interests them?';
    if (step === 9) return 'Emergency contacts';
    return '';
  };
  const totalSegments = audience === 'self' ? 6 : 8;
  const completedSegments = Math.min(totalSegments, Math.max(0, step - 1));
  
  // Get current country's required digits
  const currentCountry = countryCodes.find(c => c.code === countryCode);
  const requiredDigits = currentCountry?.digits || 10;
  const isPhoneValid = phoneNumber.length === requiredDigits && /^\d+$/.test(phoneNumber);

  const handleSendOtp = async (targetPhone: string, forLovedOne: boolean = false) => {
    setFormErrors({});
    if (!forLovedOne) setIsVerifying(true);
    else setIsVerifyingLovedOne(true);

    try {
      if (BYPASS_OTP) {
        setIsOtpSent(true);
        setResendCooldown(30);
        return;
      }
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: targetPhone,
        options: { channel: 'sms' }
      });

      if (otpError) {
        setFormErrors(prev => ({ ...prev, phone: otpError.message }));
        if (!forLovedOne) setIsOtpSent(false);
        else setIsLovedOneOtpSent(false);
      } else {
        if (!forLovedOne) setIsOtpSent(true);
        else setIsLovedOneOtpSent(true);
        setResendCooldown(30);
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      setFormErrors(prev => ({ ...prev, phone: 'An unexpected error occurred.' }));
    } finally {
      if (!forLovedOne) setIsVerifying(false);
      else setIsVerifyingLovedOne(false);
    }
  };

  const handleVerifyOtp = async (targetPhone: string, otpCode: string, forLovedOne: boolean = false) => {
    setFormErrors({});
    if (!forLovedOne) setIsVerifying(true);
    else setIsVerifyingLovedOne(true);

    try {
      if (BYPASS_OTP) {
        if (otpCode === TEST_OTP_CODE) {
          if (!forLovedOne) {
            setStep(3);
          } else {
            setStep((prev) => (prev + 1) as typeof step);
          }
        } else {
          setFormErrors(prev => ({ ...prev, otp: 'Invalid verification code.' }));
        }
        return;
      }
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: targetPhone,
        token: otpCode,
        type: 'sms' as const, // Supabase often treats WhatsApp as SMS for verification type
      });

      if (verifyError) {
        setFormErrors(prev => ({ ...prev, otp: verifyError.message }));
      } else if (data.user) {
        // Only advance the flow; profile persistence happens at completion
        if (!forLovedOne) {
          setStep(3);
        } else {
          setStep((prev) => (prev + 1) as typeof step);
        }
      } else {
        setFormErrors(prev => ({ ...prev, otp: 'Verification failed. User data not returned.' }));
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setFormErrors(prev => ({ ...prev, otp: 'An unexpected error occurred.' }));
    } finally {
      if (!forLovedOne) setIsVerifying(false);
      else setIsVerifyingLovedOne(false);
    }
  };

  const handleProfileCreation = async (params: {
    authUserId?: string | null;
    phoneNumber: string;
    audienceRole: 'elder' | 'family';
    profileFields: Partial<OnboardingData> & { lovedOneDetails?: any };
  }) => {
    const { authUserId, phoneNumber, audienceRole, profileFields } = params;

    const profilePayload: any = {
      auth_user_id: authUserId || null,
      phone_number: phoneNumber,
      audience: audienceRole,
      first_name: audienceRole === 'elder' && profileFields.lovedOneDetails ? (profileFields.lovedOneDetails.firstName || '') : (profileFields.firstName || ''),
      last_name: audienceRole === 'elder' && profileFields.lovedOneDetails ? (profileFields.lovedOneDetails.lastName || '') : (profileFields.lastName || ''),
      date_of_birth: audienceRole === 'elder' && profileFields.lovedOneDetails ? (profileFields.lovedOneDetails.dateOfBirth || null) : (profileFields.dateOfBirth || null),
      gender: audienceRole === 'elder' && profileFields.lovedOneDetails ? (profileFields.lovedOneDetails.gender || '') : (profileFields.gender || ''),
      location: profileFields.location || '',
      marital_status: audienceRole === 'elder' && profileFields.lovedOneDetails ? (profileFields.lovedOneDetails.maritalStatus || '') : (profileFields.maritalStatus || ''),
      preferred_name: profileFields.preferredName || '',
      language: audienceRole === 'elder' && profileFields.lovedOneDetails ? (profileFields.lovedOneDetails.language || 'English') : (profileFields.language || 'English'),
      reading_time: profileFields.readingTime || '',
      calling_time: profileFields.callingTime || '',
      call_slot: (profileFields.callSlot || '') as any,
      custom_from: profileFields.customFrom || '',
      custom_to: profileFields.customTo || '',
      interests: profileFields.interests || [],
      care_goals: profileFields.careGoals || [],
    };

    const { data: upserted, error: profileError } = await supabase
      .from('profiles')
      .upsert([profilePayload], { onConflict: 'phone_number' })
      .select('id')
      .single();

    if (profileError) {
      console.error('Error upserting profile:', profileError);
      setFormErrors(prev => ({ ...prev, general: profileError.message }));
      throw new Error('Failed to save profile data.');
    }

    return upserted.id as string;
  };

  const saveChildTables = async (profileId: string) => {
    // Medications
    if (formData.medications.length > 0) {
      const medsToInsert = formData.medications.map(med => ({
        profile_id: profileId,
        name: med.name,
        quantity: med.quantity,
        morning: med.morning,
        afternoon: med.afternoon,
        evening: med.evening,
        night: med.night,
      }));
      const { error: medsError } = await supabase.from('medications').insert(medsToInsert);
      if (medsError) {
        console.error('Error inserting medications:', medsError);
        setFormErrors(prev => ({ ...prev, general: medsError.message }));
      }
    }

    // Emergency Contacts
    if (formData.emergencyContacts.length > 0) {
      const contactsToInsert = formData.emergencyContacts.map(contact => ({
        profile_id: profileId,
        name: contact.name,
        relationship: contact.relationship,
        phone: contact.phone,
      }));
      const { error: contactsError } = await supabase.from('emergency_contacts').insert(contactsToInsert);
      if (contactsError) {
        console.error('Error inserting emergency contacts:', contactsError);
        setFormErrors(prev => ({ ...prev, general: contactsError.message }));
      }
    }

    // Notification Preferences (upsert by profile_id)
    const { missedDose, noChat } = app.notifications;
    const { error: notifError } = await supabase.from('notification_preferences').upsert({
      profile_id: profileId,
      missed_dose: missedDose,
      no_chat: noChat,
    }, { onConflict: 'profile_id' });
    if (notifError) {
      console.error('Error inserting notification preferences:', notifError);
      setFormErrors(prev => ({ ...prev, general: notifError.message }));
    }
  };

  const finalizeAndPersist = async () => {
    try {
      const authUserId = user ? user.id : null;
      const primaryPhone = countryCode + phoneNumber;
      const mapAudience = (a: Audience | null): 'elder' | 'family' => (a === 'self' ? 'elder' : 'family');

      if (audience === 'self') {
        // Create or update a single elder profile tied to the primary phone
        const profileId = await handleProfileCreation({
          authUserId,
          phoneNumber: primaryPhone,
          audienceRole: 'elder',
          profileFields: formData
        });
        await saveChildTables(profileId);
      } else if (audience === 'lovedOne') {
        // Create/update family profile for the user
        const familyProfileId = await handleProfileCreation({
          authUserId,
          phoneNumber: primaryPhone,
          audienceRole: 'family',
          profileFields: formData
        });
        // Create/update elder profile for the loved one
        const elderPhone = lovedOnePhone ? countryCode + lovedOnePhone : primaryPhone;
        const elderProfileId = await handleProfileCreation({
          authUserId: null, // loved one is not necessarily an authenticated user
          phoneNumber: elderPhone,
          audienceRole: 'elder',
          profileFields: { ...formData, lovedOneDetails: formData.lovedOneDetails }
        });
        // Save child tables against elder (the person receiving care)
        await saveChildTables(elderProfileId);
        // Link family -> elder
        const { error: fmErr } = await supabase.from('family_members').upsert({
          id: undefined,
          family_profile_id: familyProfileId,
          elder_profile_id: elderProfileId,
          first_name: formData.lovedOneDetails?.firstName || '',
          last_name: formData.lovedOneDetails?.lastName || '',
          date_of_birth: formData.lovedOneDetails?.dateOfBirth || null,
          gender: formData.lovedOneDetails?.gender || null,
          relationship: formData.lovedOneDetails?.relationship || '',
          phone: elderPhone,
        });
        if (fmErr) {
          console.error('Error linking family member:', fmErr);
          setFormErrors(prev => ({ ...prev, general: fmErr.message }));
        }
      }
    } catch (e) {
      // swallow to allow UI completion; errors already surfaced above
    }
  };

  return (
    <>
      {step === 1 && (
        <div className="fixed inset-0 z-[2147483648] flex items-center justify-center min-h-screen p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden max-w-xl w-full">
            <button
              aria-label="Close"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-8 pt-6 text-center">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  I want Aasha for...
                </h2>
                <p className="text-gray-600">
                  Choose who will be using Aasha's companionship
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <button
                  onClick={() => handleSelect('self')}
                  className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-[#F35E4A] hover:bg-[#F35E4A]/5 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center space-x-4">
                    <User className="h-8 w-8 text-gray-600 group-hover:text-[#F35E4A]" />
                    <span className="text-xl font-semibold text-gray-800 group-hover:text-[#F35E4A]">Myself</span>
                  </div>
                </button>
                <button
                  onClick={() => handleSelect('lovedOne')}
                  className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-[#F35E4A] hover:bg-[#F35E4A]/5 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center space-x-4">
                    <Heart className="h-8 w-8 text-gray-600 group-hover:text-[#F35E4A]" />
                    <span className="text-xl font-semibold text-gray-800 group-hover:text-[#F35E4A]">A Loved One</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-step modal for steps 2-8 */}
      {step > 1 && (
        <div className="fixed inset-0 z-[2147483648] flex flex-col bg-white overflow-hidden">
          <div className="relative flex-1 flex flex-col overflow-hidden">
            
            {/* Left Side - Form Content */}
            <div className="flex-1 flex flex-col">
              <button
                aria-label="Close"
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Top bar spacing only (close button stays top-right). Content header below. */}
              <div className="pt-2" />

              {/* Header removed; we render a content header near the form below. */}
              <div />

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="w-full max-w-2xl mx-auto px-6 pt-[50px] pb-10">
                  {/* Content Header: Segmented progress + Title */}
                  <div className="mb-4">
                    <div className="mt-3 flex gap-1">
                      {Array.from({ length: totalSegments }).map((_, i) => (
                        <div key={i} className={`h-2 flex-1 rounded-full ${i < completedSegments ? 'bg-[#F35E4A]' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <h2 className="mt-8 text-2xl font-bold text-gray-900">{getStepTitle()}</h2>
                  </div>
                {/* Step 2: Phone Verification */}
                {step === 2 && (
                  <div className="max-w-md">
                    <p className="text-gray-600 mb-6">
                      We'll send you a verification code to ensure your account security.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                        >
                          {countryCodes.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.flag} {country.code}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Phone number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, requiredDigits))}
                          maxLength={requiredDigits}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                        />
                      </div>
                      {phoneNumber && !isPhoneValid && (
                        <p className="text-sm text-red-600">Please enter exactly {requiredDigits} digits for {currentCountry?.country}.</p>
                      )}
                      
                      {!isOtpSent ? (
                        <button
                          onClick={() => handleSendOtp(countryCode + phoneNumber)}
                          disabled={!isPhoneValid || isVerifying}
                          className="w-full px-4 py-3 bg-[#F35E4A] text-white rounded-lg hover:bg-[#e54d37] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          {isVerifying ? 'Sending...' : 'Send Verification Code'}
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent text-center text-lg tracking-widest"
                          />

                          <div className="text-center text-sm text-gray-500">
                            {resendCooldown > 0 ? (
                              <span>Resend OTP in {resendCooldown}s</span>
                            ) : (
                              <button onClick={() => handleSendOtp(countryCode + phoneNumber)} className="text-[#F35E4A] hover:underline" disabled={isVerifying}>
                                Resend OTP
                              </button>
                            )}
                          </div>
                          
                          {formErrors.otp && <p className="text-sm text-red-600">{formErrors.otp}</p>}

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="terms"
                              checked={agreedToTerms}
                              onChange={(e) => setAgreedToTerms(e.target.checked)}
                              className="h-5 w-5 rounded border-gray-300 text-[#F35E4A] focus:ring-[#F35E4A] accent-[#F35E4A]"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                              I agree to the{' '}
                              <a href="#/terms" target="_blank" className="text-[#F35E4A] hover:underline">
                                Terms of Service
                              </a>{' '}
                              and{' '}
                              <a href="#/privacy" target="_blank" className="text-[#F35E4A] hover:underline">
                                Privacy Policy
                              </a>
                            </label>
                          </div>
                          <div>
                            <button
                              onClick={() => handleVerifyOtp(countryCode + phoneNumber, otp)}
                              disabled={!(isOtpSent && otp.length === 6 && agreedToTerms) || isVerifying}
                              className="w-full px-4 py-3 bg-[#F35E4A] text-white rounded-lg hover:bg-[#e54d37] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                              {isVerifying ? 'Verifying...' : 'Verify & Continue'}
                            </button>
                          </div>
                          {formErrors.general && <p className="text-sm text-red-600 mt-2">{formErrors.general}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Family Member Information (for lovedOne flow) or Personal Information (for self flow) */}
                {step === 3 && (
                  <div className="max-w-2xl">
                    {audience === 'lovedOne' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                          <input
                            type="text"
                            placeholder="Your first name"
                            value={formData.firstName}
                            onChange={(e) => updateFormData({ firstName: e.target.value })}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                            required
                          />
                          {formErrors.firstName && <p className="text-xs text-red-600 mt-1">{formErrors.firstName}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                          <input
                            type="text"
                            placeholder="Your last name"
                            value={formData.lastName}
                            onChange={(e) => updateFormData({ lastName: e.target.value })}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                            required
                          />
                          {formErrors.lastName && <p className="text-xs text-red-600 mt-1">{formErrors.lastName}</p>}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Relationship with your loved one</label>
                          <select
                            value={formData.lovedOneDetails?.relationship || ''}
                            onChange={(e) => updateFormData({ 
                              lovedOneDetails: { 
                                ...formData.lovedOneDetails, 
                                relationship: e.target.value 
                              } as any 
                            })}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent ${formErrors.relationship ? 'border-red-500' : 'border-gray-300'}`}
                            required
                          >
                            <option value="">Select relationship</option>
                            <option value="child">Child</option>
                            <option value="spouse">Spouse</option>
                            <option value="parent">Parent</option>
                            <option value="sibling">Sibling</option>
                            <option value="grandchild">Grandchild</option>
                            <option value="other">Other</option>
                          </select>
                          {formErrors.relationship && <p className="text-xs text-red-600 mt-1">{formErrors.relationship}</p>}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                          <input
                            type="text"
                            placeholder="First name"
                            value={formData.firstName}
                            onChange={(e) => updateFormData({ firstName: e.target.value })}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                            required
                          />
                          {formErrors.firstName && <p className="text-xs text-red-600 mt-1">{formErrors.firstName}</p>}
                        </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                        <input
                          type="text"
                          placeholder="Last name"
                          value={formData.lastName}
                          onChange={(e) => updateFormData({ lastName: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                          required
                        />
                        {formErrors.lastName && <p className="text-xs text-red-600 mt-1">{formErrors.lastName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
                        <input
                          type="date"
                          placeholder="Date of birth"
                          value={formData.dateOfBirth}
                          onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent ${formErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
                          required
                        />
                        {formErrors.dateOfBirth && <p className="text-xs text-red-600 mt-1">{formErrors.dateOfBirth}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select
                          value={formData.gender}
                          onChange={(e) => updateFormData({ gender: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent ${formErrors.gender ? 'border-red-500' : 'border-gray-300'}`}
                          required
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                        {formErrors.gender && <p className="text-xs text-red-600 mt-1">{formErrors.gender}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                        <select
                          value={formData.language}
                          onChange={(e) => updateFormData({ language: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent ${formErrors.language ? 'border-red-500' : 'border-gray-300'}`}
                          required
                        >
                          <option value="English">English</option>
                          <option value="Hindi">Hindi</option>
                        </select>
                        {formErrors.language && <p className="text-xs text-red-600 mt-1">{formErrors.language}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Marital status</label>
                        <select
                          value={formData.maritalStatus}
                          onChange={(e) => updateFormData({ maritalStatus: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent ${formErrors.maritalStatus ? 'border-red-500' : 'border-gray-300'}`}
                          required
                        >
                          <option value="">Marital status</option>
                          <option value="single">Single</option>
                          <option value="married">Married</option>
                          <option value="divorced">Divorced</option>
                          <option value="widowed">Widowed</option>
                          <option value="separated">Separated</option>
                        </select>
                        {formErrors.maritalStatus && <p className="text-xs text-red-600 mt-1">{formErrors.maritalStatus}</p>}
                      </div>
                    </div>
                      )}
                  </div>
                )}

                {/* Step 4: Loved One Details (for lovedOne flow) or Preferences (for self flow) */}
                {step === 4 && audience === 'lovedOne' && (
                  <div className="max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                        <input
                          type="text"
                          placeholder="Their first name"
                          value={formData.lovedOneDetails?.firstName || ''}
                          onChange={(e) => updateFormData({ 
                            lovedOneDetails: { 
                              ...formData.lovedOneDetails, 
                              firstName: e.target.value 
                            } as any 
                          })}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                          required
                        />
                        {formErrors.firstName && <p className="text-xs text-red-600 mt-1">{formErrors.firstName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                        <input
                          type="text"
                          placeholder="Their last name"
                          value={formData.lovedOneDetails?.lastName || ''}
                          onChange={(e) => updateFormData({ 
                            lovedOneDetails: { 
                              ...formData.lovedOneDetails, 
                              lastName: e.target.value 
                            } as any 
                          })}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                          required
                        />
                        {formErrors.lastName && <p className="text-xs text-red-600 mt-1">{formErrors.lastName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
                        <input
                          type="date"
                          placeholder="Date of birth"
                          value={formData.lovedOneDetails?.dateOfBirth || ''}
                          onChange={(e) => updateFormData({ 
                            lovedOneDetails: { 
                              ...formData.lovedOneDetails, 
                              dateOfBirth: e.target.value 
                            } as any 
                          })}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent ${formErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
                          required
                        />
                        {formErrors.dateOfBirth && <p className="text-xs text-red-600 mt-1">{formErrors.dateOfBirth}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select
                          value={formData.lovedOneDetails?.gender || ''}
                          onChange={(e) => updateFormData({ 
                            lovedOneDetails: { 
                              ...formData.lovedOneDetails, 
                              gender: e.target.value 
                            } as any 
                          })}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent ${formErrors.gender ? 'border-red-500' : 'border-gray-300'}`}
                          required
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                        {formErrors.gender && <p className="text-xs text-red-600 mt-1">{formErrors.gender}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                        <select
                          value={formData.lovedOneDetails?.language || ''}
                          onChange={(e) => updateFormData({ 
                            lovedOneDetails: { 
                              ...formData.lovedOneDetails, 
                              language: e.target.value 
                            } as any 
                          })}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent ${formErrors.language ? 'border-red-500' : 'border-gray-300'}`}
                          required
                        >
                          <option value="English">English</option>
                          <option value="Hindi">Hindi</option>
                        </select>
                        {formErrors.language && <p className="text-xs text-red-600 mt-1">{formErrors.language}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Marital status</label>
                        <select
                          value={formData.lovedOneDetails?.maritalStatus || ''}
                          onChange={(e) => updateFormData({ 
                            lovedOneDetails: { 
                              ...formData.lovedOneDetails, 
                              maritalStatus: e.target.value 
                            } as any 
                          })}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent ${formErrors.maritalStatus ? 'border-red-500' : 'border-gray-300'}`}
                          required
                        >
                          <option value="">Marital status</option>
                          <option value="single">Single</option>
                          <option value="married">Married</option>
                          <option value="divorced">Divorced</option>
                          <option value="widowed">Widowed</option>
                          <option value="separated">Separated</option>
                        </select>
                        {formErrors.maritalStatus && <p className="text-xs text-red-600 mt-1">{formErrors.maritalStatus}</p>}
                      </div>
                    </div>

                  </div>
                )}

                {/* Step 5: Where should Aasha call your loved one? (for lovedOne flow) */}
                {step === 5 && audience === 'lovedOne' && (
                  <div className="max-w-2xl space-y-6">
                    <p className="text-gray-600">
                      Aasha will call them on this number
                    </p>
                    
                    <div className="space-y-4">
                      {/* Phone number input field */}
                      <div className="flex gap-2">
                        <div className="relative">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-3 pr-8 focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                          >
                            {countryCodes.map((country) => (
                              <option key={country.code} value={country.code}>
                                {country.flag} {country.code}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                        <input
                          type="tel"
                          placeholder="Enter phone number"
                          value={lovedOnePhone}
                          onChange={(e) => {
                            setLovedOnePhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                            setUseSamePhone(false);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                        />
                        <button
                          onClick={() => handleSendOtp(countryCode + lovedOnePhone, true)}
                          disabled={((useSamePhone ? phoneNumber.length < 10 : lovedOnePhone.length < 10) || isLovedOneOtpSent) || isVerifyingLovedOne}
                          className="px-4 py-2 bg-[#F35E4A] text-white rounded-lg hover:bg-[#e54d37] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {isVerifyingLovedOne ? 'Sending...' : (isLovedOneOtpSent ? 'OTP Sent' : 'Send OTP')}
                        </button>
                      </div>

                      {/* Checkbox for same phone */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="samePhone"
                          checked={useSamePhone}
                          onChange={(e) => {
                            setUseSamePhone(e.target.checked);
                            if (e.target.checked) {
                              setLovedOnePhone(phoneNumber);
                            } else {
                              setLovedOnePhone('');
                            }
                          }}
                          className="h-4 w-4 text-[#F35E4A] focus:ring-[#F35E4A] border-gray-300 rounded"
                        />
                        <label htmlFor="samePhone" className="ml-2 text-sm text-gray-700">
                          Same as signup phone number ({countryCode} {phoneNumber})
                        </label>
                      </div>

                      {/* OTP verification input */}
                      {isLovedOneOtpSent && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="6-digit OTP"
                              value={lovedOneOtp}
                              onChange={(e) => setLovedOneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              maxLength={6}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                            />
                            <button
                              onClick={() => handleVerifyOtp(countryCode + lovedOnePhone, lovedOneOtp, true)}
                              disabled={lovedOneOtp.length !== 6 || isVerifyingLovedOne}
                              className="px-4 py-2 bg-[#F35E4A] text-white rounded-lg hover:bg-[#e54d37] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              {isVerifyingLovedOne ? 'Verifying...' : 'Verify'}
                            </button>
                          </div>
                          {formErrors.otp && <p className="text-sm text-red-600 mt-1">{formErrors.otp}</p>}
                          {formErrors.general && <p className="text-sm text-red-600 mt-1">{formErrors.general}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 6: When should Aasha call them? (for lovedOne flow) */}
                {step === 6 && audience === 'lovedOne' && (
                  <div className="max-w-2xl space-y-6">
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { id: 'morning', label: 'Morning', time: '8AM - 12PM', icon: <Sunrise size={24} /> },
                          { id: 'afternoon', label: 'Afternoon', time: '12PM - 5PM', icon: <Sun size={24} /> },
                          { id: 'evening', label: 'Evening', time: '5PM - 9PM', icon: <Moon size={24} /> },
                        ].map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => updateFormData({ callSlot: slot.id as any })}
                            className={`flex flex-col items-center gap-3 px-6 py-8 rounded-xl border-2 transition-all ${
                              formData.callSlot === slot.id
                                ? 'border-[#F35E4A] bg-[#F35E4A] text-white shadow-lg'
                                : 'border-gray-200 hover:border-[#F35E4A] hover:bg-[#F35E4A]/5'
                            }`}
                          >
                            <div className={`p-3 rounded-full ${
                              formData.callSlot === slot.id ? 'bg-white/20' : 'bg-gray-100'
                            }`}>
                              {slot.icon}
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-lg">{slot.label}</div>
                              <div className="text-sm opacity-80">{slot.time}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => updateFormData({ callSlot: 'custom' })}
                        className={`w-full mt-4 flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all ${
                          formData.callSlot === 'custom'
                            ? 'border-[#F35E4A] bg-[#F35E4A] text-white'
                            : 'border-gray-200 hover:border-[#F35E4A] hover:bg-[#F35E4A]/5'
                        }`}
                      >
                        <Sun size={20} />
                        <span className="font-medium">Custom Time Range</span>
                      </button>
                      
                      {formData.callSlot === 'custom' && (
                        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                              <input
                                type="time"
                                value={formData.customFrom || ''}
                                onChange={(e) => updateFormData({ customFrom: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                              <input
                                type="time"
                                value={formData.customTo || ''}
                                onChange={(e) => updateFormData({ customTo: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Preferences (for self flow) */}
                {step === 4 && audience === 'self' && (
                  <div className="max-w-2xl space-y-6">
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { id: 'morning', label: 'Morning', time: '8AM - 12PM', icon: <Sunrise size={24} /> },
                          { id: 'afternoon', label: 'Afternoon', time: '12PM - 5PM', icon: <Sun size={24} /> },
                          { id: 'evening', label: 'Evening', time: '5PM - 9PM', icon: <Moon size={24} /> },
                        ].map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => updateFormData({ callSlot: slot.id as any })}
                            className={`p-4 border-2 rounded-lg text-center transition-all flex flex-col items-center justify-center gap-2 ${formData.callSlot === slot.id ? 'border-[#F35E4A] bg-[#F35E4A]/5 text-[#F35E4A]' : 'border-gray-200 hover:border-gray-300'}`}
                          >
                            {slot.icon}
                            <div className="font-medium capitalize">{slot.label}</div>
                            <div className="text-sm text-gray-500">{slot.time}</div>
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => updateFormData({ callSlot: 'custom' })}
                        className={`mt-3 w-full p-4 border-2 rounded-lg text-center transition-all ${
                          formData.callSlot === 'custom'
                            ? 'border-[#F35E4A] bg-[#F35E4A]/5 text-[#F35E4A]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        Custom Time Range
                      </button>
                      
                      {formData.callSlot === 'custom' && (
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                            <input
                              type="time"
                              value={formData.customFrom}
                              onChange={(e) => updateFormData({ customFrom: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                            <input
                              type="time"
                              value={formData.customTo}
                              onChange={(e) => updateFormData({ customTo: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}


                {/* Step 5: Medication Management (for self flow) */}
                {step === 5 && audience === 'self' && (
                  <div className="max-w-2xl space-y-6">
                    <p className="text-gray-600">
                      Help Aasha remind {audience === 'self' ? 'you' : 'them'} about medications at the right times.
                    </p>
                    
                    {formData.medications.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-gray-400 mb-4">
                          <Plus className="h-12 w-12 mx-auto" />
                        </div>
                        <p className="text-gray-500 mb-4">No medications added yet</p>
                        <button
                          onClick={() => {
                            const newMedication = {
                              id: Date.now().toString(),
                              name: '',
                              quantity: 1,
                              morning: false,
                              afternoon: false,
                              evening: false,
                              night: false
                            };
                            updateFormData({ medications: [newMedication] });
                            setCollapsedMeds({ [newMedication.id]: false });
                          }}
                          className="px-6 py-3 bg-[#F35E4A] text-white rounded-lg hover:bg-[#e54d37] transition-colors"
                        >
                          Add First Medication
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.medications.map((medication, index) => {
                          const isCollapsed = (collapsedMeds[medication.id] ?? false);
                          return (
                            <div key={medication.id} className="border border-gray-200 rounded-lg">
                              {/* Medication Header */}
                              <div className="p-4 flex items-center justify-between">
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    placeholder="Medication name"
                                    value={medication.name}
                                    onChange={(e) => {
                                      const updated = [...formData.medications];
                                      updated[index].name = e.target.value;
                                      updateFormData({ medications: updated });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                                  />
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                  <button
                                    onClick={() => setCollapsedMeds(prev => ({ ...prev, [medication.id]: !isCollapsed }))}
                                    className="p-2 text-gray-400 hover:text-gray-600"
                                    aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                                  >
                                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  </button>
                                  <button
                                    onClick={() => {
                                      const updated = formData.medications.filter((_, i) => i !== index);
                                      updateFormData({ medications: updated });
                                      setCollapsedMeds(prev => {
                                        const { [medication.id]: _removed, ...rest } = prev;
                                        return rest;
                                      });
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Medication Details */}
                              {!isCollapsed && (
                                <div className="px-4 pb-4 border-t border-gray-100">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    {/* Dosage Quantity */}
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">Dosage quantity</label>
                                      <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                          onClick={() => {
                                            const updated = [...formData.medications];
                                            updated[index].quantity = Math.max(1, updated[index].quantity - 1);
                                            updateFormData({ medications: updated });
                                          }}
                                          className="p-2 text-gray-600 hover:bg-gray-100"
                                        >
                                          -
                                        </button>
                                        <input
                                          type="number"
                                          min="1"
                                          value={medication.quantity}
                                          onChange={(e) => {
                                            const updated = [...formData.medications];
                                            updated[index].quantity = Math.max(1, parseInt(e.target.value) || 1);
                                            updateFormData({ medications: updated });
                                          }}
                                          className="flex-1 px-3 py-2 text-center border-0 focus:ring-0"
                                        />
                                        <button
                                          onClick={() => {
                                            const updated = [...formData.medications];
                                            updated[index].quantity = updated[index].quantity + 1;
                                            updateFormData({ medications: updated });
                                          }}
                                          className="p-2 text-gray-600 hover:bg-gray-100"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>

                                    {/* Times of Day */}
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">Times of Day</label>
                                      <div className="grid grid-cols-2 gap-2">
                                        {[
                                          { key: 'morning', label: 'Morning' },
                                          { key: 'afternoon', label: 'Afternoon' },
                                          { key: 'evening', label: 'Evening' },
                                          { key: 'night', label: 'Night' }
                                        ].map((time) => (
                                          <label key={time.key} className="flex items-center gap-2">
                                            <input
                                              type="checkbox"
                                              checked={medication[time.key as keyof typeof medication] as boolean}
                                              onChange={(e) => {
                                                const updated = [...formData.medications];
                                                (updated[index] as any)[time.key] = e.target.checked;
                                                updateFormData({ medications: updated });
                                              }}
                                              className="h-5 w-5 rounded border-gray-300 text-[#F35E4A] focus:ring-[#F35E4A] accent-[#F35E4A]"
                                            />
                                            <span className="text-sm">{time.label}</span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        <button
                          onClick={() => {
                            const newMedication = {
                              id: Date.now().toString(),
                              name: '',
                              quantity: 1,
                              morning: false,
                              afternoon: false,
                              evening: false,
                              night: false
                            };
                            updateFormData({ medications: [...formData.medications, newMedication] });
                            // collapse existing and expand the new one
                            setCollapsedMeds(() => {
                              const collapsedAll: Record<string, boolean> = {};
                              for (const m of formData.medications) collapsedAll[m.id] = true;
                              collapsedAll[newMedication.id] = false;
                              return collapsedAll;
                            });
                          }}
                          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#F35E4A] hover:text-[#F35E4A] transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="h-5 w-5" />
                          Add Another Medication
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 7: Medication Management (for lovedOne flow) */}
                {step === 7 && audience === 'lovedOne' && (
                  <div className="max-w-2xl space-y-6">
                    <p className="text-gray-600">
                      Help Aasha remind them about medications at the right times.
                    </p>
                    
                    {formData.medications.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-gray-400 mb-4">
                          <Plus className="h-12 w-12 mx-auto" />
                        </div>
                        <p className="text-gray-500 mb-4">No medications added yet</p>
                        <button
                          onClick={() => {
                            const newMedication = {
                              id: Date.now().toString(),
                              name: '',
                              quantity: 1,
                              morning: false,
                              afternoon: false,
                              evening: false,
                              night: false
                            };
                            updateFormData({ medications: [newMedication] });
                          }}
                          className="px-6 py-3 bg-[#F35E4A] text-white rounded-lg hover:bg-[#e54d37] transition-colors"
                        >
                          Add Medication
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.medications.map((medication, index) => {
                          const isCollapsed = (collapsedMeds[medication.id] ?? false);
                          return (
                            <div key={medication.id} className="border border-gray-200 rounded-lg">
                              {/* Medication Header */}
                              <div className="p-4 flex items-center justify-between">
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    placeholder="Medication name"
                                    value={medication.name}
                                    onChange={(e) => {
                                      const updated = [...formData.medications];
                                      updated[index].name = e.target.value;
                                      updateFormData({ medications: updated });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                                  />
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                  <button
                                    onClick={() => setCollapsedMeds(prev => ({ ...prev, [medication.id]: !isCollapsed }))}
                                    className="p-2 text-gray-400 hover:text-gray-600"
                                    aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                                  >
                                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  </button>
                                  <button
                                    onClick={() => {
                                      const updated = formData.medications.filter((_, i) => i !== index);
                                      updateFormData({ medications: updated });
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Medication Details */}
                              {!isCollapsed && (
                                <div className="px-4 pb-4 border-t border-gray-100">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    {/* Dosage Quantity */}
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">Dosage quantity</label>
                                      <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                          onClick={() => {
                                            const updated = [...formData.medications];
                                            updated[index].quantity = Math.max(1, updated[index].quantity - 1);
                                            updateFormData({ medications: updated });
                                          }}
                                          className="p-2 text-gray-600 hover:bg-gray-100"
                                        >
                                          -
                                        </button>
                                        <input
                                          type="number"
                                          min="1"
                                          value={medication.quantity}
                                          onChange={(e) => {
                                            const updated = [...formData.medications];
                                            updated[index].quantity = Math.max(1, parseInt(e.target.value) || 1);
                                            updateFormData({ medications: updated });
                                          }}
                                          className="flex-1 px-3 py-2 text-center border-0 focus:ring-0"
                                        />
                                        <button
                                          onClick={() => {
                                            const updated = [...formData.medications];
                                            updated[index].quantity = updated[index].quantity + 1;
                                            updateFormData({ medications: updated });
                                          }}
                                          className="p-2 text-gray-600 hover:bg-gray-100"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>

                                    {/* Times of Day */}
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">Times of Day</label>
                                      <div className="grid grid-cols-2 gap-2">
                                        {[
                                          { key: 'morning', label: 'Morning' },
                                          { key: 'afternoon', label: 'Afternoon' },
                                          { key: 'evening', label: 'Evening' },
                                          { key: 'night', label: 'Night' }
                                        ].map((time) => (
                                          <label key={time.key} className="flex items-center gap-2">
                                            <input
                                              type="checkbox"
                                              checked={medication[time.key as keyof typeof medication] as boolean}
                                              onChange={(e) => {
                                                const updated = [...formData.medications];
                                                (updated[index] as any)[time.key] = e.target.checked;
                                                updateFormData({ medications: updated });
                                              }}
                                              className="h-5 w-5 rounded border-gray-300 text-[#F35E4A] focus:ring-[#F35E4A] accent-[#F35E4A]"
                                            />
                                            <span className="text-sm">{time.label}</span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        <button
                          onClick={() => {
                            const newMedication = {
                              id: Date.now().toString(),
                              name: '',
                              quantity: 1,
                              morning: false,
                              afternoon: false,
                              evening: false,
                              night: false
                            };
                            updateFormData({ medications: [...formData.medications, newMedication] });
                            // collapse existing and expand the new one
                            setCollapsedMeds(() => {
                              const collapsedAll: Record<string, boolean> = {};
                              for (const m of formData.medications) collapsedAll[m.id] = true;
                              collapsedAll[newMedication.id] = false;
                              return collapsedAll;
                            });
                          }}
                          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#F35E4A] hover:text-[#F35E4A] transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="h-5 w-5" />
                          Add Another Medication
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 6: Interests (for self flow) */}
                {step === 6 && audience === 'self' && (
                  <div className="max-w-4xl">
                    <p className="text-gray-600 mb-6">
                      Select topics {audience === 'self' ? 'you' : 'they'} enjoy discussing with Aasha.
                    </p>
                    <div className="max-h-80 overflow-y-auto pr-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
                          { id: 'gaming', name: 'Gaming', icon: Gamepad2 }
                        ].map((interest) => {
                          const Icon = interest.icon;
                          const isSelected = formData.interests.includes(interest.id);
                          
                          return (
                            <button
                              key={interest.id}
                              onClick={() => {
                                const updated = isSelected
                                  ? formData.interests.filter(id => id !== interest.id)
                                  : [...formData.interests, interest.id];
                                updateFormData({ interests: updated });
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
                    
                    {formData.interests.length > 0 && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Selected interests:</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.interests.map((interestId) => {
                            const interest = [
                              { id: 'reading', name: 'Reading' },
                              { id: 'music', name: 'Music' },
                              { id: 'cooking', name: 'Cooking' },
                              { id: 'travel', name: 'Travel' },
                              { id: 'photography', name: 'Photography' },
                              { id: 'art', name: 'Art & Crafts' },
                              { id: 'gardening', name: 'Gardening' },
                              { id: 'news', name: 'News & Current Affairs' },
                              { id: 'wellness', name: 'Health & Wellness' },
                              { id: 'devotional', name: 'Devotional' },
                              { id: 'movies', name: 'Movies' },
                              { id: 'sports', name: 'Sports' },
                              { id: 'technology', name: 'Technology' },
                              { id: 'gaming', name: 'Gaming' }
                            ].find(i => i.id === interestId);
                            
                            return (
                              <span key={interestId} className="px-3 py-1 bg-[#F35E4A] text-white text-sm rounded-full">
                                {interest?.name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 8: Interests (for lovedOne flow) */}
                {step === 8 && audience === 'lovedOne' && (
                  <div className="max-w-4xl">
                    <p className="text-gray-600 mb-6">
                      Select topics they enjoy discussing with Aasha.
                    </p>
                    <div className="max-h-80 overflow-y-auto pr-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
                          { id: 'gaming', name: 'Gaming', icon: Gamepad2 }
                        ].map((interest) => {
                          const Icon = interest.icon;
                          const isSelected = formData.interests.includes(interest.id);
                          
                          return (
                            <button
                              key={interest.id}
                              onClick={() => {
                                const updated = isSelected 
                                  ? formData.interests.filter(i => i !== interest.id)
                                  : [...formData.interests, interest.id];
                                updateFormData({ interests: updated });
                              }}
                              className={`p-4 border-2 rounded-lg text-center transition-all flex flex-col items-center justify-center gap-2 ${
                                isSelected 
                                  ? 'border-[#F35E4A] bg-[#F35E4A]/5 text-[#F35E4A]' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <Icon size={24} />
                              <span className="text-sm font-medium">{interest.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 9: Emergency Contacts (for lovedOne flow) */}
                {step === 9 && audience === 'lovedOne' && (
                  <div className="max-w-2xl space-y-6">
                    <p className="text-gray-600">
                      Add an emergency contact who can be reached if needed.
                    </p>
                    
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                          <input
                            type="text"
                            placeholder="Full name"
                            value={formData.emergencyContacts[0]?.name || ''}
                            onChange={(e) => {
                              const contact = formData.emergencyContacts[0] || { id: '1', name: '', relationship: '', phone: '' };
                              const updated = [{ ...contact, name: e.target.value }];
                              updateFormData({ emergencyContacts: updated });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                          <select
                            value={formData.emergencyContacts[0]?.relationship || ''}
                            onChange={(e) => {
                              const contact = formData.emergencyContacts[0] || { id: '1', name: '', relationship: '', phone: '' };
                              const updated = [{ ...contact, relationship: e.target.value }];
                              updateFormData({ emergencyContacts: updated });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                          >
                            <option value="">Select relationship</option>
                            <option value="spouse">Spouse</option>
                            <option value="child">Child</option>
                            <option value="parent">Parent</option>
                            <option value="sibling">Sibling</option>
                            <option value="friend">Friend</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                          <input
                            type="tel"
                            placeholder="Phone number"
                            value={formData.emergencyContacts[0]?.phone || ''}
                            onChange={(e) => {
                              const contact = formData.emergencyContacts[0] || { id: '1', name: '', relationship: '', phone: '' };
                              const updated = [{ ...contact, phone: e.target.value }];
                              updateFormData({ emergencyContacts: updated });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 7: Emergency Contacts (for self flow) */}
                {step === 7 && audience === 'self' && (
                  <div className="max-w-2xl space-y-6">
                    <p className="text-gray-600">
                      Add an emergency contact who can be reached if needed.
                    </p>
                    
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                          <input
                            type="text"
                            placeholder="Full name"
                            value={formData.emergencyContacts[0]?.name || ''}
                            onChange={(e) => {
                              const contact = formData.emergencyContacts[0] || { id: '1', name: '', relationship: '', phone: '' };
                              const updated = [{ ...contact, name: e.target.value }];
                              updateFormData({ emergencyContacts: updated });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                          <select
                            value={formData.emergencyContacts[0]?.relationship || ''}
                            onChange={(e) => {
                              const contact = formData.emergencyContacts[0] || { id: '1', name: '', relationship: '', phone: '' };
                              const updated = [{ ...contact, relationship: e.target.value }];
                              updateFormData({ emergencyContacts: updated });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                          >
                            <option value="">Select relationship</option>
                            <option value="spouse">Spouse</option>
                            <option value="child">Child</option>
                            <option value="parent">Parent</option>
                            <option value="sibling">Sibling</option>
                            <option value="friend">Friend</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                          <input
                            type="tel"
                            placeholder="Phone number"
                            value={formData.emergencyContacts[0]?.phone || ''}
                            onChange={(e) => {
                              const contact = formData.emergencyContacts[0] || { id: '1', name: '', relationship: '', phone: '' };
                              const updated = [{ ...contact, phone: e.target.value }];
                              updateFormData({ emergencyContacts: updated });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Inline CTAs for steps > 2 */}
                {step > 2 && (
                  <div className="mt-8 flex items-center justify-between">
                    <button
                      onClick={handleBack}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNext}
                      className="px-6 py-2.5 bg-[#F35E4A] text-white rounded-lg hover:bg-[#e54d37] transition-colors"
                    >
                      {step === (audience === 'self' ? 7 : 9) ? 'Complete Setup' : 'Continue'}
                    </button>
                  </div>
                )}
                </div>
              </div>
            </div>

            
          </div>
        </div>
      )}
    </>
  );
};

export default OnboardingModal;
