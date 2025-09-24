import React from 'react';
import { X, FileText, Calendar, Clock } from 'lucide-react';

export interface TranscriptItem {
  id: string;
  // ISO string or any parsable date
  datetime: string;
  title?: string;
  summary: string;
  fullText: string;
}

interface TranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transcripts: TranscriptItem[];
}

const formatDateLabel = (d: Date) => {
  const today = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const diffDays = Math.floor((startOf(today).getTime() - startOf(d).getTime()) / dayMs);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

const TranscriptModal: React.FC<TranscriptModalProps> = ({ isOpen, onClose, transcripts }) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) setExpandedId(null);
  }, [isOpen]);

  if (!isOpen) return null;

  // Sort DESC by datetime
  const sorted = [...transcripts].sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
  const groups: Record<string, TranscriptItem[]> = {};
  sorted.forEach(t => {
    const dateKey = new Date(t.datetime).toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(t);
  });

  const groupEntries = Object.entries(groups).map(([key, items]) => ({ key, items, date: new Date(items[0].datetime) }));
  // Already sorted by sorted array order ensures group order is DESC

  return (
    <div className="fixed inset-0 z-[2147483648]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 overflow-y-auto">
        <div className="max-w-4xl mx-auto my-10 px-4">
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200">
            <button
              aria-label="Close"
              onClick={onClose}
              className="absolute right-3 top-3 p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <FileText className="h-5 w-5 text-[#F35E4A]" />
              <h2 className="text-xl font-bold text-gray-900">Conversation History</h2>
            </div>

            <div className="p-6 space-y-6">
              {groupEntries.map(({ key, items, date }) => (
                <div key={key}>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Calendar className="h-4 w-4 text-[#F35E4A]" />
                    <span>{formatDateLabel(date)}</span>
                  </div>
                  <div className="space-y-3">
                    {items.map(it => (
                      <div key={it.id} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedId(prev => (prev === it.id ? null : it.id))}
                          className="w-full p-4 flex items-start justify-between gap-3 hover:bg-gray-50 text-left"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatTime(new Date(it.datetime))}</span>
                            </div>
                            <div className="text-gray-900 font-medium">
                              {it.title || it.summary.slice(0, 90)}
                            </div>
                            <div className="text-gray-600 text-sm line-clamp-2">
                              {it.summary}
                            </div>
                          </div>
                          <div className="shrink-0 text-[#F35E4A] font-medium">{expandedId === it.id ? 'Hide' : 'Read full transcript'}</div>
                        </button>
                        {expandedId === it.id && (
                          <div className="px-4 pb-4 text-gray-700 whitespace-pre-wrap bg-white">
                            {it.fullText}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {sorted.length === 0 && (
                <div className="text-center text-gray-500 py-12">No conversations yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptModal;
