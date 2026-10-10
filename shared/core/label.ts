import { getScoringConfig } from './dataLoader.ts';

/**
 * Gắn nhãn phong cách dựa trên điểm số đã áp trần và các điều kiện văn hóa
 * - Xét nhan_phong_cach theo thu_tu_xet từ scoring.json, lấy nhãn đầu tiên thỏa mãn
 * - Trường null = không xét
 * - diem_tu là "lớn hơn hoặc bằng" (>=)
 * - diem_duoi là "nhỏ hơn hẳn" (<)
 */
export function ganNhanPhongCach(
  tongDiem: number,
  isTaboo: boolean,
  isShirtLech: boolean,
  coMonHienDai: boolean
): string {
  const config = getScoringConfig();
  const danhSachNhan = [...config.nhan_phong_cach].sort(
    (a, b) => a.thu_tu_xet - b.thu_tu_xet
  );

  for (const nhan of danhSachNhan) {
    if (nhan.khi_taboo !== null && nhan.khi_taboo !== isTaboo) {
      continue;
    }

    if (nhan.khi_ao_lech !== null && nhan.khi_ao_lech !== isShirtLech) {
      continue;
    }

    if (nhan.co_mon_hien_dai !== null && nhan.co_mon_hien_dai !== coMonHienDai) {
      continue;
    }

    if (nhan.diem_tu !== null && tongDiem < nhan.diem_tu) {
      continue;
    }

    if (nhan.diem_duoi !== null && tongDiem >= nhan.diem_duoi) {
      continue;
    }

    // Thỏa mãn toàn bộ điều kiện của nhãn
    return nhan.ten;
  }

  // Fallback an toàn (trả về nhãn đầu tiên nếu không khớp)
  return danhSachNhan[0]?.ten || 'Cổ phong Cơ bản';
}
