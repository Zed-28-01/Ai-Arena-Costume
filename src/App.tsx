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
} from '../shared/core/dataLoader.ts';
import type { ItemLayer } from '../shared/core/types.ts';
import { Mannequin } from './components/Mannequin.tsx';
import { GenderScreen } from './components/GenderScreen.tsx';
import { EventScreen } from './components/EventScreen.tsx';
import { RefreshCw, Download, ArrowLeft, Shirt } from 'lucide-react';

const TAB_CONFIG: { key: ItemLayer; label: string }[] = [
  { key: 'ao', label: 'Áo' },
  { key: 'quan', label: 'Quần' },
  { key: 'doi_dau', label: 'Đội đầu' },
  { key: 'giay', label: 'Giày dép' },
  { key: 'phu_kien', label: 'Phụ kiện' },
];

type AppStep = 'gender' | 'event' | 'remix';

// Hàm nạp bộ đồ từ preset chuẩn của sự kiện
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

  // Sự kiện hiện tại
  const currentEvent = getEventById(eventId) || getEvents()[0];

  // 1. Xử lý chọn giới tính (Bước 1)
  const handleSelectGender = (selectedGender: 'nu' | 'nam') => {
    sessionStorage.setItem('vietphuc_gender', selectedGender);
    setGender(selectedGender);
    if (sessionStorage.getItem('vietphuc_event')) {
      // Đã có sự kiện từ trước, quay lại Remix
      setStep('remix');
    } else {
      // Chưa có sự kiện, sang Bước 2
      setStep('event');
    }
  };

  // 2. Xử lý chọn sự kiện (Bước 2)
  const handleSelectEvent = (selectedEventId: string) => {
    sessionStorage.setItem('vietphuc_event', selectedEventId);
    setEventId(selectedEventId);
    // Nạp lại preset chuẩn của sự kiện mới
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

  // Danh sách các món đưa cho Mannequin
  const wearingItemsList = Object.values(currentOutfit).filter(Boolean) as string[];
  const itemsInCurrentTab = getItemsByLayer(activeTab);

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

  // Bước 3: Màn hình Remix
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans flex flex-col justify-between">
      {/* Header động liên kết dữ liệu thật */}
      <header className="border-b border-stone-200/80 bg-white/85 backdrop-blur sticky top-0 z-20 px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            <span className="font-bold text-stone-900 tracking-tight text-base sm:text-lg">
              Việt phục Remix
            </span>
            <span className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full border border-stone-200">
              G0.5 + G0.6
            </span>
          </div>

          {/* Thông tin sự kiện và giới tính thật + Nút chuyển đổi */}
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
        {/* Cột trái: Vùng Mannequin & Thử nghiệm xuất ảnh */}
        <section className="w-full lg:w-5/12 flex flex-col items-center justify-center">
          {/* Khu vực chụp DOM bằng html-to-image */}
          <div
            ref={captureRef}
            className="w-full max-w-[340px] bg-white p-4 rounded-3xl border border-stone-200 shadow-sm flex flex-col items-center"
          >
            <Mannequin items={wearingItemsList} gender={gender} />

            {/* Dòng chữ tiếng Việt có dấu trong vùng xuất ảnh */}
            <div className="mt-3 text-center w-full px-2">
              <div className="font-bold text-sm text-stone-800 tracking-tight">
                Thử tải thẻ {currentEvent.id} - {selectedShirt?.ten || 'Cổ phục Việt'}
              </div>
              <div className="text-xs text-stone-500 font-medium mt-0.5">
                {currentEvent.ten} • Dáng {gender === 'nu' ? 'Nữ' : 'Nam'}
              </div>
            </div>
          </div>

          {/* Nút tạm: Thử nghiệm xuất ảnh (Task G0.6) */}
          <div className="mt-3.5 w-full max-w-[340px] flex items-center justify-center">
            <button
              type="button"
              onClick={handleExportImage}
              disabled={isExporting}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 active:scale-95 transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Đang xuất ảnh test...' : 'Thử nghiệm xuất ảnh (G0.6)'}</span>
            </button>
          </div>
        </section>

        {/* Cột phải: Thẻ thông tin bộ đồ + Bảng chọn 5 tab */}
        <section className="w-full lg:w-7/12 flex flex-col gap-5">
          {/* Thẻ thông tin bộ đồ */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div>
                <h2 className="text-sm font-bold text-stone-800">
                  {currentEvent.ten} ({currentEvent.id})
                </h2>
                <div className="text-xs text-amber-800 font-medium">
                  Tinh thần: {currentEvent.tinh_than}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep('event')}
                className="text-xs text-stone-500 hover:text-stone-800 underline font-medium"
              >
                Đổi sự kiện khác
              </button>
            </div>

            {/* Chi tiết từng món đang mặc */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-500 font-medium">Áo (bắt buộc):</span>
                <span className="font-semibold text-stone-800">
                  {selectedShirt?.ten || '(Chưa chọn)'}{' '}
                  {selectedShirtColor ? `• ${selectedShirtColor.ten}` : ''}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-500 font-medium">Quần (bắt buộc):</span>
                <span className="font-semibold text-stone-800">
                  {currentOutfit.quan ? getItemById(currentOutfit.quan)?.ten : '(Chưa chọn)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-500 font-medium">Giày dép (bắt buộc):</span>
                <span className="font-semibold text-stone-800">
                  {currentOutfit.giay ? getItemById(currentOutfit.giay)?.ten : '(Chưa chọn)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-500 font-medium">Đội đầu (tùy chọn):</span>
                <span className="font-semibold text-stone-700">
                  {currentOutfit.doi_dau ? (
                    getItemById(currentOutfit.doi_dau)?.ten
                  ) : (
                    <span className="text-stone-400 italic">Không đội</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100 sm:col-span-2">
                <span className="text-stone-500 font-medium">Phụ kiện (tùy chọn):</span>
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
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col">
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
              <div className="mb-4 p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
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
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectItem(item.id, activeTab)}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isCurrentActive
                        ? 'border-stone-900 bg-stone-50/70 shadow-sm ring-1 ring-stone-900/10'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/40 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <span className="font-semibold text-xs text-stone-900">{item.ten}</span>
                      <div className="flex items-center space-x-1">
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
                  </button>
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
    </div>
  );
}
