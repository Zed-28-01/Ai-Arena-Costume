import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import {
  getEvents,
  getEventById,
  getItemsByLayer,
  getItemById,
  getColorById,
  getPresetById,
  getAppConfig,
  getRuleById,
  getGeminiConfig,
} from '../shared/core/dataLoader.ts';
import { danhGia } from '../shared/core/engine.ts';
import type { ItemLayer, ClothingItem } from '../shared/core/types.ts';
import type { EvaluationResponse } from '../server/cache.ts';
import { Mannequin } from './components/Mannequin.tsx';
import { GenderScreen } from './components/GenderScreen.tsx';
import { EventScreen } from './components/EventScreen.tsx';
import { ItemDetailModal } from './components/ItemDetailModal.tsx';
import { EvaluationScreen } from './components/EvaluationScreen.tsx';
import {
  RefreshCw,
  Download,
  Shirt,
  Info,
  AlertOctagon,
  AlertTriangle,
  Info as InfoIcon,
  CheckCircle2,
  Sparkles,
  Loader2,
} from 'lucide-react';

const TAB_CONFIG: { key: ItemLayer; label: string }[] = [
  { key: 'ao', label: 'Áo' },
  { key: 'quan', label: 'Quần' },
  { key: 'doi_dau', label: 'Đội đầu' },
  { key: 'giay', label: 'Giày dép' },
  { key: 'phu_kien', label: 'Phụ kiện' },
];

type AppStep = 'gender' | 'event' | 'remix' | 'evaluation';

// Nạp bộ đồ từ preset chuẩn của sự kiện
function loadOutfitFromPreset(eventId: string): Record<ItemLayer, string | null> {
  const outfit: Record<ItemLayer, string | null> = {
    ao: null,
    quan: null,
    doi_dau: null,
    giay: null,
    phu_kien: null,
  };

  const event = getEventById(eventId);
  if (event?.preset_chuan_id) {
    const preset = getPresetById(event.preset_chuan_id);
    if (preset?.mon) {
      preset.mon.forEach((m) => {
        const [id] = m.split(':');
        const item = getItemById(id);
        if (item) {
          outfit[item.tang] = m;
        }
      });
    }
  }

  return outfit;
}

export default function App() {
  const appConfig = getAppConfig();
  const captureRef = useRef<HTMLDivElement>(null);

  // Đọc trạng thái khởi tạo từ sessionStorage (F5 giữ phiên)
  const savedGender = sessionStorage.getItem('vietphuc_gender') as ('nu' | 'nam' | null);
  const savedEventId = sessionStorage.getItem('vietphuc_event');

  let initialStep: AppStep = 'gender';
  if (savedGender && savedEventId) {
    initialStep = 'remix';
  } else if (savedGender) {
    initialStep = 'event';
  }

  const [step, setStep] = useState<AppStep>(initialStep);
  const [gender, setGender] = useState<'nu' | 'nam'>(savedGender || 'nu');
  const [eventId, setEventId] = useState<string>(savedEventId || 'E1');

  // Bộ đồ chỉ nạp từ preset (không gõ cứng)
  const [currentOutfit, setCurrentOutfit] = useState<Record<ItemLayer, string | null>>(() => {
    return loadOutfitFromPreset(savedEventId || 'E1');
  });

  const [activeTab, setActiveTab] = useState<ItemLayer>('ao');
  const [isExporting, setIsExporting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState<ClothingItem | null>(null);

  // Kết quả đánh giá cho màn Evaluation
  const [evaluationData, setEvaluationData] = useState<EvaluationResponse | null>(null);
  const [isClientFallback, setIsClientFallback] = useState(false);

  // Sự kiện hiện tại
  const currentEvent = getEventById(eventId) || getEvents()[0];

  // 1. Xử lý chọn giới tính (Bước 1)
  const handleSelectGender = (selectedGender: 'nu' | 'nam') => {
    sessionStorage.setItem('vietphuc_gender', selectedGender);
    setGender(selectedGender);
    if (sessionStorage.getItem('vietphuc_event')) {
      setStep('remix');
    } else {
      setStep('event');
    }
  };

  // 2. Xử lý chọn sự kiện (Bước 2)
  const handleSelectEvent = (selectedEventId: string) => {
    sessionStorage.setItem('vietphuc_event', selectedEventId);
    setEventId(selectedEventId);
    const newOutfit = loadOutfitFromPreset(selectedEventId);
    setCurrentOutfit(newOutfit);
    setStep('remix');
  };

  // 3. Đổi giới tính ở màn Remix: GIỮ NGUYÊN bộ đồ đang mặc, chỉ đổi dáng
  const handleToggleGender = () => {
    const nextGender = gender === 'nu' ? 'nam' : 'nu';
    sessionStorage.setItem('vietphuc_gender', nextGender);
    setGender(nextGender);
  };

  // 4. Phân tích áo đang chọn và màu áo
  const shirtRaw = currentOutfit.ao || '';
  const [shirtId, shirtColorId] = shirtRaw.split(':');
  const selectedShirt = getItemById(shirtId);
  const selectedShirtColor = getColorById(shirtColorId);

  // 5. Xử lý chọn món trang phục
  const handleSelectItem = (itemId: string, layer: ItemLayer) => {
    const isRequired = appConfig.tang_bat_buoc.includes(layer);
    const currentLayerValue = currentOutfit[layer];

    if (layer === 'ao') {
      const itemData = getItemById(itemId);
      if (!itemData) return;

      if (shirtId === itemId) return;

      let newColor = shirtColorId;
      if (!itemData.mau.includes(newColor)) {
        newColor = itemData.mau[0];
      }

      setCurrentOutfit((prev) => ({
        ...prev,
        ao: `${itemId}:${newColor}`,
      }));
      return;
    }

    if (currentLayerValue === itemId) {
      if (isRequired) {
        return;
      } else {
        setCurrentOutfit((prev) => ({
          ...prev,
          [layer]: null,
        }));
      }
    } else {
      setCurrentOutfit((prev) => ({
        ...prev,
        [layer]: itemId,
      }));
    }
  };

  // 6. Xử lý đổi màu áo
  const handleSelectColor = (colorId: string) => {
    if (!shirtId) return;
    setCurrentOutfit((prev) => ({
      ...prev,
      ao: `${shirtId}:${colorId}`,
    }));
  };

  // 7. Thử nghiệm xuất ảnh (G0.6) bằng html-to-image
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
      link.download = 'test.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Lỗi xuất ảnh DOM:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Danh sách các món đưa cho Mannequin và Lõi luật
  const wearingItemsList = Object.values(currentOutfit).filter(Boolean) as string[];
  const itemsInCurrentTab = getItemsByLayer(activeTab);

  // GỌI LÕI LUẬT PHẢN HỒI TỨC THÌ (G1.2)
  const danhGiaResult = danhGia(eventId, wearingItemsList, 'on');
  const diemTam = danhGiaResult.diem_van_hoa + danhGiaResult.diem_su_kien;

  // 8. Chuyển sang màn Đánh giá (Task G2.1 + G2.3)
  const handleGoToEvaluation = async () => {
    setIsEvaluating(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // Timeout 12 giây

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          gender,
          items: wearingItemsList,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data: EvaluationResponse = await res.json();
      setEvaluationData(data);
      setIsClientFallback(false);
      setStep('evaluation');
    } catch (err) {
      console.warn('Lỗi kết nối máy chủ hoặc quá 12 giây, chuyển sang dự phòng client:', err);
      // Dự phòng phía client: tự tính bằng danhGia(..., 'du_phong')
      const fallbackResult = danhGia(eventId, wearingItemsList, 'du_phong');
      const geminiConfig = getGeminiConfig();

      let fallbackFeedback = geminiConfig.fallback_feedback.chuan_le;
      if (fallbackResult.isTaboo) {
        fallbackFeedback = geminiConfig.fallback_feedback.co_taboo;
      } else if (fallbackResult.so_mon_hien_dai > 0) {
        fallbackFeedback = geminiConfig.fallback_feedback.co_mon_hien_dai;
      }

      const fallbackData: EvaluationResponse = {
        tongDiem: fallbackResult.tong_diem,
        nhan: fallbackResult.nhan,
        diem: {
          vanHoa: fallbackResult.diem_van_hoa,
          suKien: fallbackResult.diem_su_kien,
          thamMy: fallbackResult.diem_tham_my,
        },
        isTaboo: fallbackResult.isTaboo,
        cultureMeter: fallbackResult.culture_meter,
        soMonHienDai: fallbackResult.so_mon_hien_dai,
        canhBao: fallbackResult.luat_kich_hoat.map((ruleId) => {
          const r = getRuleById(ruleId);
          return {
            rule_id: ruleId,
            loai: r?.loai || '',
            tieu_de: r?.tieu_de || '',
            ly_do: r?.ly_do || '',
            da_duyet: r?.da_duyet ?? false,
            nguon_ids: r?.nguon_ids || [],
          };
        }),
        feedback: fallbackFeedback,
        can_cu_ids: [],
        tamTinh: true,
      };

      setEvaluationData(fallbackData);
      setIsClientFallback(true);
      setStep('evaluation');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Điều hướng màn hình
  if (step === 'gender') {
    return <GenderScreen onSelectGender={handleSelectGender} currentGender={gender} />;
  }

  if (step === 'event') {
    return (
      <EventScreen
        onSelectEvent={handleSelectEvent}
        onBackToGender={() => setStep('gender')}
        currentEventId={eventId}
        gender={gender}
      />
    );
  }

  if (step === 'evaluation' && evaluationData) {
    return (
      <EvaluationScreen
        evaluation={evaluationData}
        isClientFallback={isClientFallback}
        onBackToRemix={() => setStep('remix')}
        wearingItemsList={wearingItemsList}
        gender={gender}
        currentEvent={currentEvent}
        selectedShirtName={selectedShirt?.ten}
      />
    );
  }

  // Màn hình Remix
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans flex flex-col justify-between">
      {/* Header động */}
      <header className="border-b border-stone-200/80 bg-white/85 backdrop-blur sticky top-0 z-20 px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            <span className="font-bold text-stone-900 tracking-tight text-base sm:text-lg">
              Việt phục Remix
            </span>
            <span className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full border border-stone-200">
              G2.1 + G2.3
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
            {/* Đổi sự kiện */}
            <button
              type="button"
              onClick={() => setStep('event')}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-medium transition-all"
              title="Đổi sự kiện (nạp lại preset chuẩn)"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
              <span>
                Sự kiện: <strong className="text-stone-900">{currentEvent.ten}</strong>
              </span>
            </button>

            {/* Đổi dáng */}
            <button
              type="button"
              onClick={handleToggleGender}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-medium transition-all"
              title="Bấm để đổi dáng Nam/Nữ (giữ nguyên đồ đang mặc)"
            >
              <Shirt className="w-3.5 h-3.5 text-stone-700" />
              <span>
                Dáng: <strong className="text-stone-900">{gender === 'nu' ? 'Nữ' : 'Nam'}</strong>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Cột trái: Vùng Mannequin & Các nút hành động */}
        <section className="w-full lg:w-5/12 flex flex-col items-center justify-center">
          <div
            ref={captureRef}
            className="w-full max-w-[340px] bg-white p-4 rounded-3xl border border-stone-200 shadow-sm flex flex-col items-center"
          >
            <Mannequin items={wearingItemsList} gender={gender} />

            <div className="mt-3 text-center w-full px-2">
              <div className="font-bold text-sm text-stone-800 tracking-tight">
                Thử tải thẻ {currentEvent.id} - {selectedShirt?.ten || 'Cổ phục Việt'}
              </div>
              <div className="text-xs text-stone-500 font-medium mt-0.5">
                {currentEvent.ten} • Dáng {gender === 'nu' ? 'Nữ' : 'Nam'}
              </div>
            </div>
          </div>

          {/* Các nút hành động */}
          <div className="mt-3.5 w-full max-w-[340px] flex flex-col gap-2">
            {/* Nút Xem đánh giá (G2.1 + G2.3) */}
            <button
              type="button"
              onClick={handleGoToEvaluation}
              disabled={isEvaluating}
              className="w-full py-3 px-4 rounded-2xl text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white active:scale-98 transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang thẩm định kết quả...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Xem đánh giá & Thẩm định</span>
                </>
              )}
            </button>

            {/* Nút Thử nghiệm xuất ảnh (G0.6) */}
            <button
              type="button"
              onClick={handleExportImage}
              disabled={isExporting}
              className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-stone-400" />
              <span>{isExporting ? 'Đang xuất ảnh...' : 'Thử tải ảnh thẻ (G0.6)'}</span>
            </button>
          </div>
        </section>

        {/* Cột phải: Thẻ thông tin thời gian thực + Bảng chọn 5 tab */}
        <section className="w-full lg:w-7/12 flex flex-col gap-5">
          {/* Thẻ thông tin văn hóa & Lõi luật phản hồi tức thì */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm flex flex-col gap-4">
            {/* Tiêu đề sự kiện & Nhãn minh bạch */}
            <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-stone-100">
              <div>
                <h2 className="text-base font-bold text-stone-900 tracking-tight">
                  {currentEvent.ten} ({currentEvent.id})
                </h2>
                <div className="text-xs text-amber-800 font-medium mt-0.5">
                  Tinh thần: {currentEvent.tinh_than}
                </div>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 border border-stone-200/80 font-medium">
                {appConfig.nhan_minh_bach.poc_disclaimer}
              </span>
            </div>

            {/* CULTURE METER */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Culture Meter (Mức cách tân)
                </span>
                <span className="text-xs font-bold text-stone-800 px-2 py-0.5 rounded bg-white border border-stone-200 shadow-2xs">
                  {danhGiaResult.culture_meter}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] font-medium">
                <div
                  className={`py-1.5 px-1 rounded-lg transition-all ${
                    danhGiaResult.culture_meter === 'Chuẩn lịch sử'
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'bg-stone-200/60 text-stone-400'
                  }`}
                >
                  Chuẩn lịch sử
                </div>
                <div
                  className={`py-1.5 px-1 rounded-lg transition-all ${
                    danhGiaResult.culture_meter === 'Cách tân'
                      ? 'bg-sky-600 text-white font-semibold shadow-xs'
                      : 'bg-stone-200/60 text-stone-400'
                  }`}
                >
                  Cách tân
                </div>
                <div
                  className={`py-1.5 px-1 rounded-lg transition-all ${
                    danhGiaResult.culture_meter === 'Phá cách'
                      ? 'bg-purple-600 text-white font-semibold shadow-xs'
                      : 'bg-stone-200/60 text-stone-400'
                  }`}
                >
                  Phá cách
                </div>
              </div>

              <div className="text-[11px] text-stone-500 mt-2 flex items-center justify-between">
                <span>
                  Số món hiện đại: <strong>{danhGiaResult.so_mon_hien_dai}</strong>
                </span>
                <span className="text-[10px] text-stone-400">0: Chuẩn • 1–2: Cách tân • 3–4: Phá cách</span>
              </div>
            </div>

            {/* ĐIỂM TẠM THỜI */}
            <div className="flex items-center justify-between p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/70">
              <div>
                <span className="text-xs font-semibold text-stone-600 block">
                  Điểm tạm thời (phần code tính):
                </span>
                <span className="text-[11px] text-stone-400">
                  Văn hóa: {danhGiaResult.diem_van_hoa}/40 • Sự kiện: {danhGiaResult.diem_su_kien}/30
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-amber-900 tracking-tight leading-none">
                  {diemTam}
                  <span className="text-xs font-normal text-stone-500">/70</span>
                </div>
                <span className="text-[10px] text-stone-500 italic block mt-0.5">
                  Điểm tạm, chưa gồm thẩm mỹ
                </span>
              </div>
            </div>

            {/* CẢNH BÁO LUẬT VĂN HÓA */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Cảnh báo văn hóa & Phản hồi tức thì:
              </span>

              {danhGiaResult.luat_kich_hoat.length === 0 ? (
                <div className="flex items-center space-x-2 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-800 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Bộ trang phục hài hòa, chưa phát hiện xung đột theo bộ quy tắc hiện có.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {danhGiaResult.luat_kich_hoat.map((ruleId) => {
                    const rule = getRuleById(ruleId);
                    if (!rule) return null;

                    const isTaboo = rule.loai === 'taboo';
                    const isWarn = rule.loai === 'warn';

                    return (
                      <div
                        key={rule.id}
                        className={`p-3 rounded-2xl border text-xs leading-relaxed transition-all ${
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
                              [{rule.id}] {rule.tieu_de}
                            </span>
                          </div>

                          {!rule.da_duyet && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/70 border border-black/10 text-stone-500 font-normal shrink-0">
                              Nội dung nháp, chờ thẩm định
                            </span>
                          )}
                        </div>

                        <p className="pl-5 text-stone-700">{rule.ly_do}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Chi tiết từng món đang mặc */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-500 font-medium">Áo:</span>
                <span className="font-semibold text-stone-800">
                  {selectedShirt?.ten || '(Chưa chọn)'}{' '}
                  {selectedShirtColor ? `• ${selectedShirtColor.ten}` : ''}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-500 font-medium">Quần:</span>
                <span className="font-semibold text-stone-800">
                  {currentOutfit.quan ? getItemById(currentOutfit.quan)?.ten : '(Chưa chọn)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-500 font-medium">Giày dép:</span>
                <span className="font-semibold text-stone-800">
                  {currentOutfit.giay ? getItemById(currentOutfit.giay)?.ten : '(Chưa chọn)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-500 font-medium">Đội đầu:</span>
                <span className="font-semibold text-stone-700">
                  {currentOutfit.doi_dau ? (
                    getItemById(currentOutfit.doi_dau)?.ten
                  ) : (
                    <span className="text-stone-400 italic">Không đội</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100 sm:col-span-2">
                <span className="text-stone-500 font-medium">Phụ kiện:</span>
                <span className="font-semibold text-stone-700">
                  {currentOutfit.phu_kien ? (
                    getItemById(currentOutfit.phu_kien)?.ten
                  ) : (
                    <span className="text-stone-400 italic">Không mang</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Bảng chọn đồ 5 Tab */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm flex flex-col">
            <div className="flex items-center space-x-1 border-b border-stone-200 pb-2 mb-4 overflow-x-auto">
              {TAB_CONFIG.map((tab) => {
                const isSelected = activeTab === tab.key;
                const isRequired = appConfig.tang_bat_buoc.includes(tab.key);
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    {tab.label} {isRequired ? '*' : ''}
                  </button>
                );
              })}
            </div>

            {/* Bảng màu áo */}
            {activeTab === 'ao' && selectedShirt && (
              <div className="mb-4 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
                <div className="text-xs font-semibold text-stone-600 mb-2">
                  Bảng màu của {selectedShirt.ten}:
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedShirt.mau.map((cId) => {
                    const colorData = getColorById(cId);
                    if (!colorData) return null;
                    const isColorActive = shirtColorId === cId;
                    return (
                      <button
                        key={cId}
                        type="button"
                        onClick={() => handleSelectColor(cId)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isColorActive
                            ? 'border-stone-900 bg-white ring-2 ring-stone-900/10 shadow-sm'
                            : 'border-stone-200 bg-white hover:border-stone-400'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-inner"
                          style={{ backgroundColor: colorData.hex }}
                        />
                        <span>{colorData.ten}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Danh sách các món trong Tab */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {itemsInCurrentTab.map((item) => {
                const isCurrentActive =
                  activeTab === 'ao'
                    ? shirtId === item.id
                    : currentOutfit[activeTab] === item.id;

                const isFault = item.is_fault;
                const isRequired = appConfig.tang_bat_buoc.includes(activeTab);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item.id, activeTab)}
                    className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer group ${
                      isCurrentActive
                        ? 'border-stone-900 bg-stone-50/70 shadow-sm ring-1 ring-stone-900/10'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/40 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <span className="font-semibold text-xs text-stone-900 pr-1">{item.ten}</span>
                      <div className="flex items-center space-x-1 shrink-0">
                        {isFault && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-medium">
                            Món gây lỗi
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            item.loai === 'truyen_thong'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-sky-50 text-sky-800 border border-sky-200'
                          }`}
                        >
                          {item.loai === 'truyen_thong' ? 'Truyền thống' : 'Hiện đại'}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItemForModal(item);
                          }}
                          className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/80 transition-colors ml-1"
                          title="Xem nguồn gốc & ý nghĩa văn hóa"
                          aria-label={`Xem chi tiết văn hóa của ${item.ten}`}
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2">
                      <span className="font-mono">{item.id}</span>
                      <span className="font-medium text-stone-600">
                        {isCurrentActive
                          ? isRequired
                            ? '● Đang chọn'
                            : '● Bấm để gỡ'
                          : '+ Chọn'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-3 text-xs text-stone-400 border-t border-stone-200/80 bg-white">
        Việt phục Remix POC • Dữ liệu minh họa POC, cần thẩm định
      </footer>

      {/* Popup chi tiết văn hóa */}
      <ItemDetailModal
        item={selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
      />
    </div>
  );
}
