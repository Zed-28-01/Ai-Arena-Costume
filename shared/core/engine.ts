import { demSoMonHienDai, tinhCultureMeter } from './meter.ts';
import { kiemTraLuat } from './rules.ts';
import {
  tinhDiemVanHoa,
  tinhDiemSuKien,
  tinhDiemThamMy,
  apTranDiem,
  type ThamMyLevel,
} from './score.ts';
import { ganNhanPhongCach } from './label.ts';

export interface KetQuaDanhGia {
  luat_kich_hoat: string[];
  isTaboo: boolean;
  diem_van_hoa: number;
  diem_su_kien: number;
  diem_tham_my: number;
  so_mon_hien_dai: number;
  culture_meter: string;
  tong_diem: number;
  nhan: string;
}

/**
 * Hàm đánh giá trang phục cốt lõi (Core Evaluation Engine)
 * Hàm thuần (pure function) dùng chung cho cả client và server
 * @param suKien Mã sự kiện ("E1" | "E2")
 * @param mon Danh sách món đồ (áo có màu dạng "ma_mon:ma_mau", các món khác "ma_mon")
 * @param thamMy Mức thẩm mỹ ("tot" | "on" | "chua" | "du_phong")
 */
export function danhGia(
  suKien: string,
  mon: string[],
  thamMy: ThamMyLevel = 'on'
): KetQuaDanhGia {
  // 1. Phân tích món hiện đại và Culture Meter
  const so_mon_hien_dai = demSoMonHienDai(mon);
  const culture_meter = tinhCultureMeter(so_mon_hien_dai);
  const coMonHienDai = so_mon_hien_dai > 0;

  // 2. Quét bảng quy tắc luật
  const { luat_kich_hoat, isTaboo } = kiemTraLuat(mon);

  // 3. Tính điểm từng trụ cột
  const diem_van_hoa = tinhDiemVanHoa(luat_kich_hoat, isTaboo);
  const { diem_su_kien, isShirtLech } = tinhDiemSuKien(suKien, mon);
  const diem_tham_my = tinhDiemThamMy(thamMy);

  // 4. Tổng điểm thô và áp trần
  const diemTho = diem_van_hoa + diem_su_kien + diem_tham_my;
  const tong_diem = apTranDiem(diemTho, isTaboo, isShirtLech, coMonHienDai);

  // 5. Gắn nhãn phong cách theo thứ tự ưu tiên trên điểm sau trần
  const nhan = ganNhanPhongCach(tong_diem, isTaboo, isShirtLech, coMonHienDai);

  return {
    luat_kich_hoat,
    isTaboo,
    diem_van_hoa,
    diem_su_kien,
    diem_tham_my,
    so_mon_hien_dai,
    culture_meter,
    tong_diem,
    nhan,
  };
}
