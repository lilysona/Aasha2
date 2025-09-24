import React from 'react';
import { MessageCircle, HeartHandshake, Activity, Pill, AlertTriangle, FileText, ImagePlus, Smile, Meh, Frown, Settings, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Hourglass } from 'lucide-react';
import TranscriptModal, { TranscriptItem } from './TranscriptModal';
import SettingsPanel from './SettingsPanel';
import AlertsModal, { AlertItem } from './AlertsModal';
import { useAppState } from '../state/AppState';

const FamilyDashboard: React.FC = () => {
  const app = useAppState();
  const [isTranscriptOpen, setIsTranscriptOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = React.useState(false);
  const [settingsSection, setSettingsSection] = React.useState<'family' | 'contacts' | 'topics' | 'notifications' | undefined>(undefined);
  const [weekOffset, setWeekOffset] = React.useState(0); // 0 = current week, -1 = previous, +1 = next

  const startOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = (date.getDay() + 6) % 7; // Monday=0
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);
    return date;
  };
  const getWeekDates = () => {
    const base = new Date();
    base.setDate(base.getDate() + weekOffset * 7);
    const start = startOfWeek(base);
    return Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  };
  const weekDates = getWeekDates();
  const weekLabel = `${weekDates[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${weekDates[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  // Mock conversation list; replace with API when available
  const transcripts: TranscriptItem[] = [
    {
      id: 'f6',
      datetime: new Date().toISOString(),
      title: 'Afternoon well-being check',
      summary: 'Discussed mood and reminded about evening medicine.',
      fullText: 'Aasha asked how Dad was feeling; he reported feeling good. Reminder set for evening dose of Amlodipine.'
    },
    {
      id: 'f5',
      datetime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      summary: 'Chat about garden and family news (Riya’s promotion).',
      fullText: 'Dad shared excitement about Riya’s promotion. He also talked about pruning the rose plant and watering schedule.'
    },
    {
      id: 'f4',
      datetime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      summary: 'Morning check-in; practiced English with AI.',
      fullText: 'Short practice session with common phrases. Dad was cheerful and engaged.'
    },
    {
      id: 'f3',
      datetime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      summary: 'Reminders and hydration tips.',
      fullText: 'Aasha encouraged regular sips of water and confirmed medicine adherence for morning dose.'
    },
    {
      id: 'f2',
      datetime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      summary: 'Shared devotional songs and breathing practice.',
      fullText: 'Dad listened to a bhajan and tried a short mindful breathing routine.'
    },
    {
      id: 'f1',
      datetime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      summary: 'Family updates and encouraging message for walk.',
      fullText: 'Aasha suggested a 10-minute evening walk; Dad agreed. Mentioned Rahul’s travel plans.'
    }
  ];

  const allAlerts: AlertItem[] = [
    { id: '1', type: 'missedDose', message: 'Dad missed evening dose of Amlodipine at 8:00 PM.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: '2', type: 'noChat', message: 'Mom hasn’t chatted with Aasha since yesterday.', timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString() },
    { id: '3', type: 'refill', message: 'Refill reminder for Metformin in 3 days.', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '4', type: 'missedDose', message: 'Dad missed morning dose of Metformin at 9:00 AM.', timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString() },
  ];

  const mood: 'happy' | 'neutral' | 'sad' = 'happy'; // Mock mood state

  const getMoodDetails = (currentMood: typeof mood) => {
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
          text: 'Feeling good',
          icon: <Smile className="h-4 w-4" />,
          className: 'bg-green-100 text-green-800',
        };
    }
  };

  const moodDetails = getMoodDetails(mood);

  return (
    <div className="min-h-screen bg-[#F4F2EE]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
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

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Elder Snapshot */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <HeartHandshake className="h-12 w-12 text-gray-400" />
              <div>
                <div className="text-xl font-bold text-gray-900">{app.profile.lovedOneDetails ? `${app.profile.lovedOneDetails.relationship || 'Loved one'} • ${app.profile.lovedOneDetails.firstName || ''} ${app.profile.lovedOneDetails.lastName || ''}`.trim() : 'Elder Snapshot'}</div>
                <div className="text-sm text-gray-600 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Activity className="h-4 w-4 text-green-600" /> Last spoke to Aasha 2 hrs ago</span>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <span className={`flex items-center gap-2 font-semibold px-3 py-1 rounded-full text-sm ${moodDetails.className}`}>
                    {moodDetails.icon}
                    <span>{moodDetails.text}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-gray-800 text-sm whitespace-nowrap">Medicines taken today</span>
                <span className="font-bold text-lg text-[#F35E4A]">2 / 3</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-[#F35E4A]" style={{ width: '67%' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Alerts & Notifications */}
        <section className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Alerts
              </div>
              <button onClick={() => setIsAlertsOpen(true)} className="text-sm text-[#F35E4A] hover:underline">See All</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="p-3 border border-red-100 bg-red-50 rounded-lg">
                🚨 Dad missed evening dose of Amlodipine at 8:00 PM.
              </div>
              <div className="p-3 border border-orange-100 bg-orange-50 rounded-lg">
                🔔 Mom hasn’t chatted with Aasha since yesterday.
              </div>
              <div className="p-3 border border-blue-100 bg-blue-50 rounded-lg">
                🔵 Refill reminder for Metformin in 3 days.
              </div>
            </div>
          </div>

          {/* Medication Tracking */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <Pill className="h-5 w-5 text-[#F35E4A]" />
                <span>Medication Tracking</span>
                <span className="text-gray-500 font-normal">Week of {weekLabel}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 rounded hover:bg-gray-100" aria-label="Previous week">
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <button onClick={() => setWeekOffset(0)} className="px-2 py-1 text-sm text-gray-700 border border-gray-200 rounded hover:bg-gray-50">This week</button>
                <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded hover:bg-gray-100" aria-label="Next week">
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-left">
                    <th className="py-2 font-medium">Medicine</th>
                    {weekDates.map((d) => (
                      <th key={d.toISOString()} className="py-2 px-2 whitespace-nowrap text-center">
                        {d.toLocaleDateString(undefined, { weekday: 'short' })}
                        <div className="text-xs text-gray-400">{d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Metformin', data: ['✔️','✔️','✔️','✔️','✔️','✔️','⏳'] },
                    { name: 'Amlodipine', data: ['✔️','✔️','❌','✔️','✔️','❌','⏳'] },
                  ].map(row => (
                    <tr key={row.name} className="border-t border-gray-100">
                      <td className="py-2 font-medium text-gray-800">{row.name}</td>
                      {row.data.map((v, i) => {
                        let content;
                        if (v === '✔️') {
                          content = <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />;
                        } else if (v === '❌') {
                          content = <XCircle className="h-5 w-5 text-red-500 mx-auto" />;
                        } else if (v === '⏳') {
                          content = <Hourglass className="h-5 w-5 text-gray-400 mx-auto" />;
                        } else {
                          content = v;
                        }
                        return (<td key={i} className="py-2 px-2 text-center">{content}</td>);
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Conversation Summaries */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 font-semibold text-gray-900">
              <FileText className="h-5 w-5 text-[#F35E4A]" />
              Conversation Summaries
            </div>
            <button onClick={() => setIsTranscriptOpen(true)} className="text-sm text-[#F35E4A] hover:underline">All Conversations</button>
          </div>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="p-4 rounded-lg border border-gray-200">
              Mom spoke about feeling energetic today. She enjoyed talking about her garden.
              <button onClick={() => setIsTranscriptOpen(true)} className="ml-3 text-[#F35E4A] font-medium hover:underline">Read full transcript</button>
            </div>
          </div>
        </section>

        {/* Family News Upload */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-3 font-semibold text-gray-900">
            <ImagePlus className="h-5 w-5 text-[#F35E4A]" />
            Share Family News
          </div>
          <form className="space-y-3">
            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Title" />
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} placeholder="Write a short update..." />
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">These updates may appear in elder conversations.</div>
              <button type="button" className="px-4 py-2 bg-[#F35E4A] text-white rounded-lg hover:bg-[#e54d37]">Post</button>
            </div>
          </form>
        </section>

        {/* Settings & Management - polished list with slide-over */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-semibold text-gray-900">
              <Settings className="h-5 w-5 text-[#F35E4A]" />
              Settings & Management
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
              onClick={() => { setSettingsSection('family'); setIsSettingsOpen(true); }}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              <span className="text-gray-800">Manage family members</span>
              <span className="text-sm text-gray-500">{app.familyMembers.length} member{app.familyMembers.length === 1 ? '' : 's'}</span>
            </button>
            <button
              onClick={() => { setSettingsSection('contacts'); setIsSettingsOpen(true); }}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              <span className="text-gray-800">Emergency contacts</span>
              <span className="text-sm text-gray-500">{app.profile.emergencyContacts.length} saved</span>
            </button>
            <button
              onClick={() => { setSettingsSection('topics'); setIsSettingsOpen(true); }}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              <span className="text-gray-800">Customize topics & tone</span>
              <span className="text-sm text-gray-500">{app.topicsTone}</span>
            </button>
            <button
              onClick={() => { setSettingsSection('notifications'); setIsSettingsOpen(true); }}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              <span className="text-gray-800">Notifications</span>
              <span className="text-sm text-gray-500">{(app.notifications.missedDose || app.notifications.noChat) ? 'Alerts enabled' : 'Off'}</span>
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
        variant="family"
        initialSection={settingsSection}
      />
      <AlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={allAlerts}
      />
    </div>
  );
};

export default FamilyDashboard;
