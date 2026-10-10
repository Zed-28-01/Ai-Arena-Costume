import React from 'react';
import { User } from 'lucide-react';

interface GenderScreenProps {
  onSelectGender: (gender: 'nu' | 'nam') => void;
  currentGender?: 'nu' | 'nam' | null;
}

export const GenderScreen: React.FC<GenderScreenProps> = ({ onSelectGender, currentGender }) => {
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60 mb-3">
            Bước 1 / 3: Dáng trang phục
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-stone-800">
            Chọn Dáng Mannequin
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5 leading-relaxed">
            Hệ thống sẽ điều chỉnh tỉ lệ vai và phom tà áo phù hợp với dáng bạn chọn.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Lựa chọn Nữ */}
          <button
            type="button"
            onClick={() => onSelectGender('nu')}
            className={`p-5 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-between group hover:border-amber-600 hover:shadow-md ${
              currentGender === 'nu'
                ? 'border-amber-600 bg-amber-50/40 ring-2 ring-amber-600/20 shadow-sm'
                : 'border-stone-200 bg-stone-50/60 hover:bg-white'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="font-bold text-stone-800 text-base mb-1">Dáng Nữ</div>
              <div className="text-[11px] text-stone-500 leading-tight">
                Eo thon mềm, tà áo thướt tha
              </div>
            </div>
          </button>

          {/* Lựa chọn Nam */}
          <button
            type="button"
            onClick={() => onSelectGender('nam')}
            className={`p-5 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-between group hover:border-stone-800 hover:shadow-md ${
              currentGender === 'nam'
                ? 'border-stone-800 bg-stone-100 ring-2 ring-stone-800/20 shadow-sm'
                : 'border-stone-200 bg-stone-50/60 hover:bg-white'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-stone-200 text-stone-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="font-bold text-stone-800 text-base mb-1">Dáng Nam</div>
              <div className="text-[11px] text-stone-500 leading-tight">
                Vai rộng bề thế, dáng đứng đĩnh đạc
              </div>
            </div>
          </button>
        </div>

        <div className="text-center text-[11px] text-stone-400 font-medium">
          Dữ liệu lưu theo phiên (sessionStorage) • Có thể đổi lại bất cứ lúc nào
        </div>
      </div>
    </div>
  );
};
