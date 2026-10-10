import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import type { EventItem } from '../../shared/core/types.ts';
import type { EvaluationResponse } from '../../server/cache.ts';
import { getAppConfig } from '../../shared/core/dataLoader.ts';
import { Mannequin } from './Mannequin.tsx';
import {
  ArrowLeft,
  AlertOctagon,
  AlertTriangle,
  Info as InfoIcon,
  CheckCircle2,
  ExternalLink,
  Download,
  WifiOff,
  Sparkles,
} from 'lucide-react';

interface EvaluationScreenProps {
  evaluation: EvaluationResponse;
  isClientFallback: boolean;
  onBackToRemix: () => void;
  wearingItemsList: string[];
  gender: 'nu' | 'nam';
  currentEvent: EventItem;
  selectedShirtName?: string;
}

export const EvaluationScreen: React.FC<EvaluationScreenProps> = ({
  evaluation,
  isClientFallback,
  onBackToRemix,
  wearingItemsList,
  gender,
  currentEvent,
  selectedShirtName,
}) => {
  const appConfig = getAppConfig();
  const captureRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const reportUrl = appConfig.report_form_url;
  const hasValidReportUrl = Boolean(reportUrl && reportUrl !== '[CHỜ BỔ SUNG]');

  const handleExportImage = async () => {
    if (!captureRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true,
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
      });
      const link = document.createElement('a');
      link.download = `ket-qua-${currentEvent.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Lỗi xuất ảnh kết quả:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-stone-200/80 bg-white/85 backdrop-blur sticky top-0 z-20 px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToRemix}
            className="inline-flex items-center space-x-1.5 text-xs text-stone-600 hover:text-stone-900 font-semibold px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại phối đồ</span>
          </button>

          <div className="text-xs font-semibold text-stone-700">
            Kết quả thẩm định: <span className="text-stone-900 font-bold">{currentEvent.ten}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Cột trái: Mannequin kết quả */}
        <section className="w-full lg:w-5/12 flex flex-col items-center justify-center">
          <div
            ref={captureRef}
            className="w-full max-w-[340px] bg-white p-4 rounded-3xl border border-stone-200 shadow-sm flex flex-col items-center"
          >
            <Mannequin items={wearingItemsList} gender={gender} />

            <div className="mt-3 text-center w-full px-2">
              <div className="font-bold text-sm text-stone-800 tracking-tight">
                {evaluation.nhan} • {evaluation.tongDiem} điểm
              </div>
              <div className="text-xs text-stone-500 font-medium mt-0.5">
                {currentEvent.ten} ({currentEvent.id}) • Dáng {gender === 'nu' ? 'Nữ' : 'Nam'}
              </div>
            </div>
          </div>

          <div className="mt-3.5 w-full max-w-[340px] flex items-center justify-center">
            <button
              type="button"
              onClick={handleExportImage}
              disabled={isExporting}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 active:scale-95 transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Đang xuất ảnh...' : 'Tải ảnh kết quả'}</span>
            </button>
          </div>
        </section>

        {/* Cột phải: Bảng kết quả thẩm định */}
        <section className="w-full lg:w-7/12 flex flex-col gap-5">
          {/* Cảnh báo lỗi kết nối nếu đang dùng client fallback */}
          {isClientFallback && (
            <div className="flex items-center space-x-2.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
              <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Không kết nối được máy chủ, kết quả tính tạm trên thiết bị.</span>
            </div>
          )}

          {/* Thẻ Điểm tổng & Nhãn phong cách */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm flex flex-col gap-4">
            {/* Header thẻ: Nhãn & Điểm số */}
            <div className="flex items-start justify-between pb-4 border-b border-stone-100 flex-wrap gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Nhãn phong cách
                </span>
                <h2 className="text-2xl font-black text-stone-900 tracking-tight flex items-center space-x-2">
                  <span>{evaluation.nhan}</span>
                </h2>
                <div className="text-xs text-stone-500 mt-1">
                  Mức cách tân: <strong className="text-stone-800">{evaluation.cultureMeter}</strong> ({evaluation.soMonHienDai} món hiện đại)
                </div>
              </div>

              <div className="text-right bg-stone-50 px-4 py-2.5 rounded-2xl border border-stone-200/80">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Tổng điểm
                </span>
                <div className="text-3xl font-black text-stone-900 tracking-tight leading-none mt-0.5">
                  {evaluation.tongDiem}
                  <span className="text-xs font-medium text-stone-400">/100</span>
                </div>
              </div>
            </div>

            {/* Điểm 3 trụ cột */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
                <span className="text-stone-500 block text-[11px] mb-1">Đúng mực văn hóa</span>
                <span className="text-base font-bold text-stone-800">
                  {evaluation.diem.vanHoa}
                  <span className="text-[10px] font-normal text-stone-400">/40</span>
                </span>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
                <span className="text-stone-500 block text-[11px] mb-1">Phù hợp sự kiện</span>
                <span className="text-base font-bold text-stone-800">
                  {evaluation.diem.suKien}
                  <span className="text-[10px] font-normal text-stone-400">/30</span>
                </span>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/60">
                <span className="text-amber-800 block text-[11px] mb-1">Thẩm mỹ & Remix</span>
                <span className="text-base font-bold text-amber-900">
                  {evaluation.diem.thamMy}
                  <span className="text-[10px] font-normal text-amber-600">/30</span>
                </span>
                {evaluation.tamTinh && (
                  <span className="text-[9px] text-amber-700 italic block mt-0.5 font-medium">
                    Điểm thẩm mỹ tạm tính
                  </span>
                )}
              </div>
            </div>

            {/* Nhận xét / Feedback */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-stone-700 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Nhận định văn hóa:</span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed italic bg-white p-3 rounded-xl border border-stone-100">
                "{evaluation.feedback || '[CHỜ BỔ SUNG]'}"
              </p>

              {/* Nguồn căn cứ trích dẫn */}
              <div className="mt-2 text-[11px] text-stone-400 flex items-center justify-between">
                <span>
                  Căn cứ trích dẫn:{' '}
                  <strong className="text-stone-600 font-mono">
                    {evaluation.can_cu_ids && evaluation.can_cu_ids.length > 0
                      ? evaluation.can_cu_ids.join(', ')
                      : 'Chưa có căn cứ trích dẫn'}
                  </strong>
                </span>

                {/* Nhãn AI review: Chỉ hiện khi tamTinh === false */}
                {!evaluation.tamTinh && (
                  <span className="text-[10px] text-emerald-700 font-medium">
                    {appConfig.nhan_minh_bach.ai_review}
                  </span>
                )}
              </div>
            </div>

            {/* Cảnh báo luật văn hóa (cùng kiểu hiển thị như màn Remix) */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Quy tắc & Cảnh báo:
              </span>

              {evaluation.canhBao.length === 0 ? (
                <div className="flex items-center space-x-2 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-800 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Bộ trang phục đạt chuẩn, không vi phạm quy tắc cấm kỵ hay cảnh báo nào.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {evaluation.canhBao.map((cb) => {
                    const isTaboo = cb.loai === 'taboo';
                    const isWarn = cb.loai === 'warn';

                    return (
                      <div
                        key={cb.rule_id}
                        className={`p-3 rounded-2xl border text-xs leading-relaxed ${
                          isTaboo
                            ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                            : isWarn
                            ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                            : 'bg-stone-50 border-stone-200 text-stone-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <div className="flex items-center space-x-1.5 font-bold">
                            {isTaboo && <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />}
                            {isWarn && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                            {!isTaboo && !isWarn && <InfoIcon className="w-4 h-4 text-stone-500 shrink-0" />}
                            <span>
                              [{cb.rule_id}] {cb.tieu_de}
                            </span>
                          </div>

                          {!cb.da_duyet && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/70 border border-black/10 text-stone-500 font-normal shrink-0">
                              Nội dung nháp, chờ thẩm định
                            </span>
                          )}
                        </div>

                        <p className="pl-5 text-stone-700">{cb.ly_do}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Chân trang thẻ: Nút Báo sai & Nhãn minh bạch */}
            <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2.5">
              <span className="text-[11px] text-stone-400">
                {appConfig.nhan_minh_bach.poc_disclaimer}
              </span>

              <div className="flex items-center space-x-2">
                {hasValidReportUrl ? (
                  <a
                    href={reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-stone-300 text-stone-700 hover:text-stone-900 hover:bg-stone-50 text-xs font-medium transition-all"
                  >
                    <span>Báo sai</span>
                    <ExternalLink className="w-3 h-3 text-stone-400" />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-stone-200 text-stone-400 bg-stone-50 text-xs font-medium opacity-60 cursor-not-allowed"
                  >
                    <span>Báo sai (Chưa có link)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onBackToRemix}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-xs font-semibold transition-all shadow-xs"
                >
                  Tiếp tục phối đồ
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-3 text-xs text-stone-400 border-t border-stone-200/80 bg-white">
        Việt phục Remix POC • Dữ liệu minh họa POC, cần thẩm định
      </footer>
    </div>
  );
};
