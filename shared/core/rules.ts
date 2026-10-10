import { getRules } from './dataLoader.ts';

export interface KetQuaKiemTraLuat {
  luat_kich_hoat: string[];
  isTaboo: boolean;
}

/**
 * Kiểm tra các luật văn hóa kích hoạt dựa trên danh sách món đồ
 * Quy ước:
 * - "co": Mọi món trong danh sách đều phải có mặt trong bộ đồ
 * - "va_mot_trong": Có ít nhất một món trong danh sách có mặt trong bộ đồ
 */
export function kiemTraLuat(mon: string[]): KetQuaKiemTraLuat {
  // Lấy tập hợp mã món đồ (loại bỏ phần màu sắc nếu có, ví dụ "top_tac:do_son" -> "top_tac")
  const itemIds = new Set<string>();
  for (const itemStr of mon) {
    if (!itemStr) continue;
    const [itemId] = itemStr.split(':');
    itemIds.add(itemId);
  }

  const rules = getRules();
  const luat_kich_hoat: string[] = [];
  let isTaboo = false;

  for (const rule of rules) {
    // 1. Kiểm tra điều kiện "co" (tất cả món bắt buộc)
    const dieuKienCoThoaMan = rule.dieu_kien.co.every((id) => itemIds.has(id));
    if (!dieuKienCoThoaMan) {
      continue;
    }

    // 2. Kiểm tra điều kiện "va_mot_trong" (nếu có khai báo)
    if (rule.dieu_kien.va_mot_trong && rule.dieu_kien.va_mot_trong.length > 0) {
      const coItNhatMotMon = rule.dieu_kien.va_mot_trong.some((id) => itemIds.has(id));
      if (!coItNhatMotMon) {
        continue;
      }
    }

    // Thỏa mãn toàn bộ điều kiện -> Luật kích hoạt
    luat_kich_hoat.push(rule.id);
    if (rule.loai === 'taboo') {
      isTaboo = true;
    }
  }

  return {
    luat_kich_hoat,
    isTaboo,
  };
}
