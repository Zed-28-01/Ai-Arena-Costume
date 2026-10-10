import React from 'react';
import { getEvents } from '../../shared/core/dataLoader.ts';
import { ArrowLeft, Sparkles, GraduationCap } from 'lucide-react';

interface EventScreenProps {
  onSelectEvent: (eventId: string) => void;
  onBackToGender: () => void;
  currentEventId?: string | null;
  gender: 'nu' | 'nam';
}

export const EventScreen: React.FC<EventScreenProps> = ({
  onSelectEvent,
  onBackToGender,
  currentEventId,
  gender,
}) => {
  const events = getEvents();

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
        {/* Nút quay lại */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onBackToGender}
            className="inline-flex items-center space-x-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors font-medium px-2 py-1 rounded-lg hover:bg-stone-100"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Đổi dáng ({gender === 'nu' ? 'Nữ' : 'Nam'})</span>
          </button>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
            Bước 2 / 3: Chọn bối cảnh
          </span>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-stone-800">
            Chọn Sự Kiện Tham Dự
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5 leading-relaxed">
            Mỗi sự kiện có tính chất văn hóa riêng. Chọn để hệ thống chuẩn bị sẵn bộ phối mẫu chuẩn lễ.
          </p>
        </div>

        {/* Danh sách sự kiện đọc từ data/events.json */}
        <div className="space-y-3.5 mb-6">
          {events.map((ev) => {
            const isSelected = currentEventId === ev.id;
            const isE1 = ev.id === 'E1';

            return (
              <button
                key={ev.id}
                type="button"
                onClick={() => onSelectEvent(ev.id)}
                className={`w-full p-4 sm:p-5 rounded-2xl border-2 text-left transition-all flex items-start space-x-4 group hover:shadow-md ${
                  isSelected
                    ? 'border-amber-600 bg-amber-50/40 ring-2 ring-amber-600/20 shadow-sm'
                    : 'border-stone-200 bg-stone-50/50 hover:bg-white hover:border-stone-300'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isE1 ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {isE1 ? <GraduationCap className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-stone-900 text-sm sm:text-base">
                      {ev.ten}
                    </span>
                    <span className="text-xs font-mono font-semibold text-stone-500 px-2 py-0.5 rounded bg-stone-100 border border-stone-200">
                      {ev.id}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-amber-800 mb-1">
                    Tinh thần: {ev.tinh_than}
                  </div>

                  <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                    {ev.mo_ta}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center text-[11px] text-stone-400 font-medium">
          Dữ liệu nguồn sự thật từ <code className="font-mono text-stone-600">data/events.json</code>
        </div>
      </div>
    </div>
  );
};
