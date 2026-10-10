import React from 'react';
import type { ClothingItem } from '../../shared/core/types.ts';
import { X, BookOpen, Tag } from 'lucide-react';

interface ItemDetailModalProps {
  item: ClothingItem | null;
  onClose: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-stone-200 relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          aria-label="Đóng popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề & Loại */}
        <div className="mb-4 pr-8">
          <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                item.loai === 'truyen_thong'
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : 'bg-sky-50 text-sky-900 border-sky-200'
              }`}
            >
              {item.loai === 'truyen_thong' ? 'Truyền thống' : 'Hiện đại'}
            </span>

            {item.is_fault && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                Món gây lỗi văn hóa
              </span>
            )}

            <span className="text-[11px] font-mono text-stone-400">#{item.id}</span>
          </div>

          <h3 className="text-xl font-bold text-stone-900 tracking-tight">{item.ten}</h3>
        </div>

        {/* 2 dòng nguồn gốc */}
        <div className="mb-4 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
          <div className="text-xs font-semibold text-stone-700 mb-1.5 flex items-center space-x-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>Nguồn gốc & Lịch sử:</span>
          </div>
          <div className="text-xs text-stone-600 leading-relaxed space-y-1">
            {item.nguon_goc_2_dong && item.nguon_goc_2_dong.length > 0 ? (
              item.nguon_goc_2_dong.map((line, idx) => (
                <p key={idx} className="italic">
                  • {line}
                </p>
              ))
            ) : (
              <p className="italic text-stone-400">[CHỜ BỔ SUNG]</p>
            )}
          </div>
        </div>

        {/* Mô tả chi tiết */}
        <div className="mb-4 text-xs text-stone-600 leading-relaxed">
          <span className="font-semibold text-stone-700 block mb-1">Mô tả:</span>
          <p className="bg-white p-2.5 rounded-xl border border-stone-100 text-stone-600">
            {item.mo_ta || '[CHỜ BỔ SUNG]'}
          </p>
        </div>

        {/* Từ khóa & Nguồn trích dẫn */}
        <div className="pt-3 border-t border-stone-100 flex flex-col gap-2 text-[11px] text-stone-500">
          {item.tu_khoa && item.tu_khoa.length > 0 && (
            <div className="flex items-center space-x-1.5 flex-wrap gap-1">
              <Tag className="w-3 h-3 text-stone-400" />
              {item.tu_khoa.map((tk) => (
                <span
                  key={tk}
                  className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 text-[10px]"
                >
                  {tk}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-stone-400">
            <span>
              Nguồn trích dẫn:{' '}
              <strong className="text-stone-600 font-mono">
                {item.nguon_ids && item.nguon_ids.length > 0
                  ? item.nguon_ids.join(', ')
                  : 'Chưa có nguồn'}
              </strong>
            </span>
            <span className="text-[10px] text-amber-700 font-medium">Dữ liệu minh họa POC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
