import React, { useState } from 'react'; // Added useState
import { MessageCircle, Clock, Pill, Smile, Play, Sparkles, Settings, Music, Sprout, CheckCircle2, Hourglass, Meh, Frown } from 'lucide-react'; // Added Meh, Frown
import TranscriptModal, { TranscriptItem } from './TranscriptModal';
import SettingsPanel from './SettingsPanel';
import { useAppState } from '../state/AppState';
import { supabase } from '../supabaseClient'; // Add this import
import { useAuth } from '../auth/AuthContext'; // Add this import

const ElderDashboard: React.FC = () => {
  const app = useAppState();
  const { user } = useAuth(); // Get the authenticated user
  const [isTranscriptOpen, setIsTranscriptOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [settingsSection, setSettingsSection] = React.useState<
    'language' | 'reminders' | 'medicines' | 'family' | 'contacts' | 'topics' | 'notifications' | undefined
  >(undefined);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]); // State for transcripts
  const [lastConversation, setLastConversation] = useState<TranscriptItem | null>(null); // State for last conversation

  // Fetch conversations from Supabase
  React.useEffect(() => {
    const fetchConversations = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('conversations')
          .select('id, datetime, title, summary, full_text, mood')
          .eq('profile_id', user.id)
          .order('datetime', { ascending: false });

        if (error) {
          console.error('Error fetching conversations:', error);
        } else if (data) {
          // Map Supabase data to TranscriptItem type
          const mappedTranscripts: TranscriptItem[] = data.map(conv => ({
            id: conv.id,
            datetime: conv.datetime,
            title: conv.title || '',
            summary: conv.summary || '',
            fullText: conv.full_text || '',
            mood: conv.mood || 'unknown',
          }));
          setTranscripts(mappedTranscripts);
          if (mappedTranscripts.length > 0) {
            setLastConversation(mappedTranscripts[0]);
          }
        }
      }
    };

    fetchConversations();
  }, [user]);

  const getMoodDetails = (currentMood: string | undefined) => {
    switch (currentMood) {
      case 'happy':
        return {
          text: 'Feeling good',
          icon: <Smile className="h-4 w-4" />,
          className: 'bg-green-100 text-green-800',
        };
      case 'neutral':
        return {
          text: 'Feeling okay',
          icon: <Meh className="h-4 w-4" />,
          className: 'bg-yellow-100 text-yellow-800',
        };
      case 'sad':
        return {
          text: 'Feeling down',
          icon: <Frown className="h-4 w-4" />,
          className: 'bg-red-100 text-red-800',
        };
      default:
        return {
          text: 'Unknown mood',
          icon: <Smile className="h-4 w-4" />,
          className: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const moodDetails = getMoodDetails(lastConversation?.mood);

  return (
    <div className="min-h-screen bg-[#F4F2EE]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-[#F35E4A]" />
            <span className="font-bold">Aasha</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setSettingsSection(undefined); setIsSettingsOpen(true); }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-800"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => app.setView('marketing')}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50"
            >
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Welcome Tile */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Good Evening, {app.profile.preferredName || app.profile.firstName || 'Friend'}</h1>
              <p className="text-gray-600">Aasha is here for you.</p>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="h-5 w-5 text-[#F35E4A]" />
              <span>Preferred window: {app.profile.callingTime || 'Set in Settings'}</span>
            </div>
          </div>
        </section>

        {/* Medication Reminders Summary */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
            <Pill className="h-5 w-5 text-[#F35E4A]" />
            Today’s Medicines
          </div>
          <div className="space-y-3">
            {app.profile.medications.length > 0 ? (
              app.profile.medications.map(med => (
                <div key={med.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{med.name} {med.quantity} mg</span>
                  <span className="flex items-center gap-2">
                    {med.morning && <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Morning</span>}
                    {med.afternoon && <span className="text-yellow-600 font-medium flex items-center gap-1"><Hourglass className="h-4 w-4" /> Afternoon</span>}
                    {med.evening && <span className="text-yellow-600 font-medium flex items-center gap-1"><Hourglass className="h-4 w-4" /> Evening</span>}
                    {med.night && <span className="text-yellow-600 font-medium flex items-center gap-1"><Hourglass className="h-4 w-4" /> Night</span>}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-sm">No medications set. Add them in settings.</p>
            )}
          </div>
          <button onClick={() => { setSettingsSection('medicines'); setIsSettingsOpen(true); }} className="mt-4 text-[#F35E4A] font-medium hover:underline">Manage medicines</button>
        </section>

        {/* Daily Check-In Status */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {lastConversation ? (
              <>
                {moodDetails.icon}
                <div>
                  <p className="text-gray-800">You chatted with Aasha {new Date(lastConversation.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} today.</p>
                  <p className="text-gray-600 text-sm">{moodDetails.text}</p>
                </div>
              </>
            ) : (
              <>
                <Smile className="h-6 w-6 text-gray-400" />
                <div>
                  <p className="text-gray-800">No recent chat with Aasha.</p>
                  <p className="text-gray-600 text-sm">Start a conversation to see your check-in status.</p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-[#F35E4A] text-white rounded-lg hover:bg-[#e54d37]">Start Chat Now</button>
            <button onClick={() => setIsTranscriptOpen(true)} className="px-4 py-2 border-2 border-[#F35E4A] text-[#F35E4A] rounded-lg hover:bg-[#F35E4A]/5">All Conversations</button>
          </div>
        </section>

        {/* Interests & Activities */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
            <Play className="h-5 w-5 text-[#F35E4A]" />
            For You
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-[#F35E4A] hover:bg-[#F35E4A]/5 text-left transition">
              <Music className="h-5 w-5 text-[#F35E4A] mb-2" />
              <div className="font-semibold">Evening Bhajan</div>
              <div className="text-sm text-gray-600">“Here’s a bhajan for your evening”</div>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-[#F35E4A] hover:bg-[#F35E4A]/5 text-left transition">
              <Sprout className="h-5 w-5 text-[#F35E4A] mb-2" />
              <div className="font-semibold">Gardening Tips</div>
              <div className="text-sm text-gray-600">“Tips for growing tulsi at home”</div>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-[#F35E4A] hover:bg-[#F35E4A]/5 text-left transition">
              <Sparkles className="h-5 w-5 text-[#F35E4A] mb-2" />
              <div className="font-semibold">Mindful Breathing</div>
              <div className="text-sm text-gray-600">A gentle 3-minute practice</div>
            </button>
          </div>
          <button className="mt-4 text-[#F35E4A] font-medium hover:underline">See more</button>
        </section>

        {/* Settings - polished list with slide-over panel */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-gray-900 font-semibold">
              <Settings className="h-5 w-5 text-[#F35E4A]" />
              Quick Settings
            </div>
            <button
              onClick={() => { setSettingsSection(undefined); setIsSettingsOpen(true); }}
              className="text-sm text-[#F35E4A] hover:underline"
            >
              Open all
            </button>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => { setSettingsSection('language'); setIsSettingsOpen(true); }}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              <span className="text-gray-800">Change language</span>
              <span className="text-sm text-gray-500">{app.profile.language || 'Not set'}</span>
            </button>
            <button
              onClick={() => { setSettingsSection('reminders'); setIsSettingsOpen(true); }}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              <span className="text-gray-800">Reminder window</span>
              <span className="text-sm text-gray-500">{app.profile.callingTime || 'Not set'}</span>
            </button>
            <button
              onClick={() => { setSettingsSection('medicines'); setIsSettingsOpen(true); }}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              <span className="text-gray-800">Manage medicines</span>
              <span className="text-sm text-gray-500">{app.profile.medications.length} item{app.profile.medications.length === 1 ? '' : 's'}</span>
            </button>
          </div>
        </section>
      </main>
      {/* Transcript Modal */}
      <TranscriptModal
        isOpen={isTranscriptOpen}
        onClose={() => setIsTranscriptOpen(false)}
        transcripts={transcripts}
      />
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        variant="elder"
        initialSection={settingsSection}
      />
    </div>
  );
};

export default ElderDashboard;
