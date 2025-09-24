import React, { useState } from 'react';
import { X, ArrowLeft, User, Heart, Phone, Star, Shield, Users, Camera, Music, Book, Palette, Gamepad2, Utensils, Plane, Plus, Trash2, Zap, ChevronRight, ChevronDown, Calendar } from 'lucide-react';
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
    dosage: string;
    timesPerDay: number;
    times?: string[];
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

  const interests = [
                      <Phone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No emergency contacts added yet</p>
                      <p className="text-sm">Add at least one emergency contact</p>
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
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer with navigation */}
            <div className="border-t border-gray-200 py-6">
              <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  {audience === 'self' && (step === 5 || step === 6) && (
                    <button
                      onClick={handleNext}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Add Later
                    </button>
                  )}
                </div>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-[#F35E4A] text-white rounded-lg hover:bg-[#e54d37] transition-colors"
                >
                  {step === (audience === 'self' ? 7 : 8) ? 'Start using Aasha' : 'Continue'}
                </button>
              </div>
            </div>
            
            {/* Right Side - Testimonials */}
            <div className="bg-[#F4F2EE] px-8 lg:px-12 py-12 relative overflow-hidden">
              <div className="w-full max-w-xl mx-auto">
                <TestimonialsCarousel />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OnboardingModal;
