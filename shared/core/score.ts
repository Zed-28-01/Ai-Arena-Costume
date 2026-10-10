import {
  getScoringConfig,
  getRuleById,
  getItemById,
  getShirtCompatibility,
} from './dataLoader.ts';

export type ThamMyLevel = 'tot' | 'on' | 'chua' | 'du_phong';

/**
 * Tính điểm văn hóa:
 * - Có taboo -> về 0 (theo scoring.json)
 * - Mỗi luật loại warn trừ theo scoring.json, trừ dồn, thấp nhất điểm tối thiểu
 * - Luật loại note không trừ điểm
 */
export function tinhDiemVanHoa(luatKichHoat: string[], isTaboo: boolean): number {
  const config = getScoringConfig();
  const vhConfig = config.cot_diem.van_hoa;

  if (isTaboo && vhConfig.taboo_ve_0) {
    return vhConfig.diem_toi_thieu;
  }

  let diem = vhConfig.diem_khoi_tao;

  for (const ruleId of luatKichHoat) {
    const rule = getRuleById(ruleId);
    if (rule && rule.loai === 'warn') {
      diem -= vhConfig.tru_canh_bao_mem_moi_cai;
    }
  }

  return Math.max(vhConfig.diem_toi_thieu, diem);
}

/**
 * Tính điểm sự kiện và xác định áo có bị lệch bối cảnh hay không
 * Đọc độ tương thích từ compatibility.json
 */
export function tinhDiemSuKien(
  suKien: string,
  mon: string[]
): { diem_su_kien: number; isShirtLech: boolean } {
  const config = getScoringConfig();
  const skConfig = config.cot_diem.su_kien;

  // Tìm áo trong danh sách món
  let shirtId = '';
  for (const itemStr of mon) {
    if (!itemStr) continue;
    const [id] = itemStr.split(':');
    const item = getItemById(id);
    if (item && item.tang === 'ao') {
      shirtId = id;
      break;
    }
  }

  const compat = getShirtCompatibility(shirtId, suKien);
  const isShirtLech = compat === 'lech';
  const diem_su_kien = isShirtLech ? skConfig.ao_lech : skConfig.ao_hop;

  return {
    diem_su_kien,
    isShirtLech,
  };
}

/**
 * Tính điểm thẩm mỹ theo mức đánh giá
 * Đọc từ scoring.json
 */
export function tinhDiemThamMy(thamMy: ThamMyLevel): number {
  const config = getScoringConfig();
  const tmConfig = config.cot_diem.tham_my;

  switch (thamMy) {
    case 'tot':
      return tmConfig.tot;
    case 'on':
      return tmConfig.on;
    case 'chua':
      return tmConfig.chua;
    case 'du_phong':
      return tmConfig.du_phong_tam_tinh;
    default:
      return tmConfig.du_phong_tam_tinh;
  }
}

/**
 * Áp dụng trần điểm:
 * - Áp TẤT CẢ các trần thỏa điều kiện (lấy giá trị nhỏ nhất)
 * - Trần chỉ hạ điểm (Math.min), không bao giờ nâng điểm
 */
export function apTranDiem(
  diemTho: number,
  isTaboo: boolean,
  isShirtLech: boolean,
  coMonHienDai: boolean
): number {
  const config = getScoringConfig();
  const tranDiemList = config.tran_diem;

  let minTran: number | null = null;

  for (const tran of tranDiemList) {
    let thoaDieuKien = false;

    if (tran.dieu_kien === 'isTaboo' && isTaboo) {
      thoaDieuKien = true;
    } else if (tran.dieu_kien === 'ao_lech_su_kien' && isShirtLech) {
      thoaDieuKien = true;
    } else if (tran.dieu_kien === 'co_mon_hien_dai' && coMonHienDai) {
      thoaDieuKien = true;
    }

    if (thoaDieuKien) {
      if (minTran === null || tran.muc_tran < minTran) {
        minTran = tran.muc_tran;
      }
    }
  }

  if (minTran !== null) {
    return Math.min(diemTho, minTran);
  }

  return diemTho;
}
