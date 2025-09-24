import React, { useState } from 'react';
import { X, ArrowLeft, User, Heart, Phone, Star, Shield, Users, Camera, Music, Book, Palette, Gamepad2, Utensils, Plane, Plus, Trash2, Zap, ChevronRight, ChevronDown, Sprout, Newspaper, Trophy, Cpu, Sparkles, Film } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

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
  };
}

const TestimonialsCarousel: React.FC = () => {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 2000 })
  ]);
  
  const testimonials = [
    {
      name: "SARAH",
      rating: 5,
      text: "Aasha has become my daily companion. The conversations feel so natural and caring. It's like having a friend who's always there."
    },
    {
      name: "MARIA",
      rating: 5,
      text: "The health reminders have been life-changing. I never miss my medications anymore, and my family feels more connected."
    },
    {
      name: "JAMES",
      rating: 5,
      text: "As someone living alone, Aasha provides the companionship I needed. The conversations are meaningful and uplifting."
    },
    {
      name: "PRIYA",
      rating: 5,
      text: "The wellness insights help me understand my patterns better. It's like having a personal health coach."
    },
    {
      name: "DAVID",
      rating: 5,
      text: "My elderly mother loves talking to Aasha. It gives our family peace of mind knowing she has constant support."
    },
    {
      name: "LINDA",
      rating: 5,
      text: "The voice conversations in my native language make me feel so comfortable. Aasha truly understands my cultural background."
    },
    {
      name: "ROBERT",
      rating: 5,
      text: "I was skeptical at first, but Aasha has genuinely improved my daily routine and mental wellbeing. Highly recommend!"
    },
    {
      name: "ANITA",
      rating: 5,
      text: "My father enjoys his daily chats with Aasha. It's wonderful to see him engaged and happy throughout the day."
    }
  ];

  return (
    <div className="text-center flex flex-col items-center justify-center h-full px-4">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Stories of Joy & Transformation
        </h3>
      </div>
      
      <div className="embla overflow-hidden mx-auto max-w-md" ref={emblaRef}>
        <div className="embla__container flex">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="embla__slide flex-[0_0_100%] min-w-0 px-2">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-[#F35E4A] fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  "{testimonial.text}"
                </p>
                <p className="font-semibold text-[#F35E4A] text-lg">
                  - {testimonial.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust badges under carousel */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-gray-700">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <span className="text-sm font-medium">HIPAA Compliant</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          <span className="text-sm font-medium">Always Available</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-[#F35E4A] fill-current" />
          <span className="text-sm font-medium">4.9/5 rating</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span className="text-sm font-medium">Trusted by 10k+</span>
        </div>
      </div>
    </div>
  );
};

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (audience: Audience) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(1);
  const [audience, setAudience] = useState<Audience | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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

  const countryCodes = [
    { code: '+1', country: 'US', flag: '🇺🇸' },
    { code: '+91', country: 'IN', flag: '🇮🇳' },
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
    }
  }, [isOpen]);

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
  };

  const handleNext = () => {
    if (step === 2 && isOtpSent && otp.length === 6 && agreedToTerms) {
      setStep(3); // Move to first onboarding step after OTP verification
    } else if (step > 2) {
      const maxSteps = audience === 'self' ? 7 : 8; // 5 onboarding steps + 2 initial steps
      if (step < maxSteps) {
        setStep((prev) => (prev + 1) as typeof step);
      } else {
        onClose(); // Complete onboarding
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as typeof step);
    }
  };

  const updateFormData = (updates: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const getStepTitle = () => {
    if (step === 2) return 'Enter your phone number';
    if (step === 3) return audience === 'self' ? 'Tell us about yourself' : 'Tell us about your loved one';
    if (step === 4) return 'Your preferences';
    if (step === 5) return audience === 'self' ? 'Medication management' : 'Their medication management';
    if (step === 6) return audience === 'self' ? 'Your interests' : 'Their interests';
    if (step === 7) return audience === 'self' ? 'Emergency contacts' : 'Your information';
    if (step === 8) return 'Emergency contacts';
    return '';
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[2147483646]" onClick={step === 1 ? onClose : undefined} />

      {/* Multi-step modal for steps 2-8 */}
      {step > 1 && (
        <div className="fixed inset-0 z-[2147483648] flex items-center justify-center min-h-screen p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-6xl h-[90vh] flex">
            
            {/* Left Side - Form Content */}
            <div className="flex-1 flex flex-col">
              <button
                aria-label="Close"
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Progress Bar */}
              <div className="px-8 pt-6 pb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#F35E4A] h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(step / (audience === 'self' ? 7 : 8)) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Header */}
              <div className="px-8 pb-6">
                <div className="flex items-center gap-3 mb-4">
                  {step > 2 && (
                    <button
                      onClick={handleBack}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                  )}
                  <h2 className="text-2xl font-bold text-gray-900">
                    {getStepTitle()}
                  </h2>
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 px-8 overflow-y-auto">
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
                          className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                        >
                          {countryCodes.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.flag} {country.code}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          placeholder="Phone number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                        />
                      </div>
                      
                      {!isOtpSent ? (
                        <button
                          onClick={() => setIsOtpSent(true)}
                          disabled={!phoneNumber}
                          className="w-full px-4 py-3 bg-[#F35E4A] text-white rounded-lg hover:bg-[#e54d37] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          Send Verification Code
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent text-center text-lg tracking-widest"
                          />
                          
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="terms"
                              checked={agreedToTerms}
                              onChange={(e) => setAgreedToTerms(e.target.checked)}
                              className="rounded border-gray-300 text-[#F35E4A] focus:ring-[#F35E4A]"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                              I agree to the Terms of Service and Privacy Policy
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Personal Information */}
                {step === 3 && (
                  <div className="max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input
                        type="text"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) => updateFormData({ firstName: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) => updateFormData({ lastName: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                      />
                      <input
                        type="date"
                        placeholder="Date of birth"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                      />
                      <select
                        value={formData.gender}
                        onChange={(e) => updateFormData({ gender: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                      <select
                        value={formData.language}
                        onChange={(e) => updateFormData({ language: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Italian">Italian</option>
                        <option value="Portuguese">Portuguese</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Korean">Korean</option>
                      </select>
                      <select
                        value={formData.maritalStatus}
                        onChange={(e) => updateFormData({ maritalStatus: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                      >
                        <option value="">Marital status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                        <option value="separated">Separated</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Step 4: Preferences */}
                {step === 4 && (
                  <div className="max-w-2xl space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        When should Aasha call {audience === 'self' ? 'you' : 'them'}?
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {['morning', 'afternoon', 'evening'].map((slot) => (
                          <button
                            key={slot}
                            onClick={() => updateFormData({ callSlot: slot as any })}
                            className={`p-4 border-2 rounded-lg text-center transition-all ${
                              formData.callSlot === slot
                                ? 'border-[#F35E4A] bg-[#F35E4A]/5 text-[#F35E4A]'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
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

                {/* Step 5: Medication Management */}
                {step === 5 && (
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
                          }}
                          className="px-6 py-3 bg-[#F35E4A] text-white rounded-lg hover:bg-[#e54d37] transition-colors"
                        >
                          Add First Medication
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.medications.map((medication, index) => {
                          const [isCollapsed, setIsCollapsed] = React.useState(index > 0);
                          
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
                                  {formData.medications.length > 1 && index === 0 && (
                                    <button
                                      onClick={() => setIsCollapsed(!isCollapsed)}
                                      className="p-2 text-gray-400 hover:text-gray-600"
                                    >
                                      {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </button>
                                  )}
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
                                    {/* Quantity */}
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
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
                                              className="rounded border-gray-300 text-[#F35E4A] focus:ring-[#F35E4A]"
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

                {/* Step 6: Interests */}
                {step === 6 && (
                  <div className="max-w-4xl">
                    <p className="text-gray-600 mb-6">
                      Select topics {audience === 'self' ? 'you' : 'they'} enjoy discussing with Aasha.
                    </p>
                    
                    <div className="overflow-x-auto">
                      <div className="flex gap-3 pb-4 min-w-max">
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
                              className={`flex items-center gap-3 px-4 py-3 rounded-full border-2 transition-all whitespace-nowrap ${
                                isSelected
                                  ? 'border-[#F35E4A] bg-[#F35E4A] text-white'
                                  : 'border-gray-200 hover:border-[#F35E4A] hover:bg-[#F35E4A]/5'
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                              <span className="font-medium">{interest.name}</span>
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

                {/* Step 7: Emergency Contacts */}
                {step === 7 && (
                  <div className="max-w-2xl space-y-6">
                    <p className="text-gray-600">
                      Add emergency contacts who can be reached if needed.
                    </p>
                    
                    {formData.emergencyContacts.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-gray-400 mb-4">
                          <Phone className="h-12 w-12 mx-auto" />
                        </div>
                        <p className="text-gray-500 mb-4">No emergency contacts added yet</p>
                        <button
                          onClick={() => {
                            const newContact = {
                              id: Date.now().toString(),
                              name: '',
                              relationship: '',
                              phone: ''
                            };
                            updateFormData({ emergencyContacts: [newContact] });
                          }}
                          className="px-6 py-3 bg-[#F35E4A] text-white rounded-lg hover:bg-[#e54d37] transition-colors"
                        >
                          Add Emergency Contact
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.emergencyContacts.map((contact, index) => (
                          <div key={contact.id} className="p-4 border border-gray-200 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <input
                                type="text"
                                placeholder="Full name"
                                value={contact.name}
                                onChange={(e) => {
                                  const updated = [...formData.emergencyContacts];
                                  updated[index].name = e.target.value;
                                  updateFormData({ emergencyContacts: updated });
                                }}
                                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                              />
                              <select
                                value={contact.relationship}
                                onChange={(e) => {
                                  const updated = [...formData.emergencyContacts];
                                  updated[index].relationship = e.target.value;
                                  updateFormData({ emergencyContacts: updated });
                                }}
                                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                              >
                                <option value="">Relationship</option>
                                <option value="spouse">Spouse</option>
                                <option value="child">Child</option>
                                <option value="parent">Parent</option>
                                <option value="sibling">Sibling</option>
                                <option value="friend">Friend</option>
                                <option value="other">Other</option>
                              </select>
                              <div className="flex space-x-2">
                                <input
                                  type="tel"
                                  placeholder="Phone number"
                                  value={contact.phone}
                                  onChange={(e) => {
                                    const updated = [...formData.emergencyContacts];
                                    updated[index].phone = e.target.value;
                                    updateFormData({ emergencyContacts: updated });
                                  }}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#F35E4A] focus:border-transparent"
                                />
                                <button
                                  onClick={() => {
                                    const updated = formData.emergencyContacts.filter((_, i) => i !== index);
                                    updateFormData({ emergencyContacts: updated });
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <button
                          onClick={() => {
                            const newContact = {
                              id: Date.now().toString(),
                              name: '',
                              relationship: '',
                              phone: ''
                            };
                            updateFormData({ emergencyContacts: [...formData.emergencyContacts, newContact] });
                          }}
                          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#F35E4A] hover:text-[#F35E4A] transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="h-5 w-5" />
                          Add Another Contact
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {step > 2 && (
                      <button
                        onClick={handleBack}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleNext}
                    disabled={step === 2 && (!isOtpSent || otp.length !== 6 || !agreedToTerms)}
                    className="px-6 py-3 bg-[#F35E4A] text-white rounded-lg hover:bg-[#e54d37] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {step === (audience === 'self' ? 7 : 8) ? 'Start using Aasha' : 'Continue'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Testimonials */}
            <div className="bg-[#F4F2EE] px-8 lg:px-12 py-12 relative overflow-hidden w-96">
              <div className="w-full max-w-xl mx-auto">
                <TestimonialsCarousel />
              </div>
            </div>
          </div>
        </div>
      )}

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
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div className="bg-[#F35E4A] h-2 rounded-full" style={{ width: '12.5%' }}></div>
              </div>
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
    </>
  );
};

export default OnboardingModal;
