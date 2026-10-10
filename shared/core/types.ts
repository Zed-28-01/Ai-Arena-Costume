/**
 * Định nghĩa kiểu dữ liệu nền tảng cho dự án Việt phục Remix
 * Single Source of Truth: các file JSON trong data/
 */

export interface Source {
  id: string;
  ten: string;
  tac_gia?: string;
  nam?: string;
  link?: string;
  mo_ta: string;
}

export type ItemLayer = 'ao' | 'quan' | 'doi_dau' | 'giay' | 'phu_kien';
export type ItemType = 'truyen_thong' | 'hien_dai';

export interface ClothingItem {
  id: string;
  ten: string;
  tang: ItemLayer;
  loai: ItemType;
  is_fault?: boolean; // Món gây lỗi văn hóa/trang nghiêm (quần short, dép lê)
  mau: string[]; // Danh sách mã màu (chỉ áo đổi màu, món khác 1 màu cố định)
  mo_ta: string;
  tu_khoa: string[];
  nguon_goc_2_dong: [string, string] | string[];
  nguon_ids: string[];
  hinh: {
    nam?: string;
    nu?: string;
    chung?: string;
  };
}

export interface ColorItem {
  id: string;
  ten: string;
  hex: string;
  nhom: 'truyen_thong' | 'hien_dai';
}

export interface EventItem {
  id: string;
  ten: string;
  tinh_than: string;
  mo_ta: string;
  preset_chuan_id: string;
}

export type RuleType = 'taboo' | 'warn' | 'note';

export interface RuleItem {
  id: string;
  loai: RuleType;
  dieu_kien: {
    co: string[];
    va_mot_trong?: string[];
  };
  tieu_de: string;
  ly_do: string;
  da_duyet: boolean;
  nguon_ids: string[];
}

export interface PresetItem {
  id: string;
  su_kien: string;
  loai: 'chuan' | 'remix';
  ten: string;
  mon: string[]; // Áo dạng ma_mon:ma_mau, các món khác dạng ma_mon
  y_nghia: string;
  nhan_xet_da_duyet: string;
  nguon_ids: string[];
}

export interface ScoringConfig {
  cot_diem: {
    van_hoa: {
      diem_toi_da: number;
      diem_khoi_tao: number;
      taboo_ve_0: boolean;
      tru_canh_bao_mem_moi_cai: number;
      tru_don: boolean;
      diem_toi_thieu: number;
    };
    su_kien: {
      diem_toi_da: number;
      ao_hop: number;
      ao_lech: number;
    };
    tham_my: {
      diem_toi_da: number;
      tot: number;
      on: number;
      chua: number;
      du_phong_tam_tinh: number;
    };
  };
  tran_diem: Array<{
    dieu_kien: string;
    muc_tran: number;
    thu_tu_uu_tien: number;
  }>;
  culture_meter: {
    chuan_lich_su: {
      so_mon_hien_dai_min: number;
      so_mon_hien_dai_max: number;
      nhan: string;
    };
    cach_tan: {
      so_mon_hien_dai_min: number;
      so_mon_hien_dai_max: number;
      nhan: string;
    };
    pha_cach: {
      so_mon_hien_dai_min: number;
      so_mon_hien_dai_max: number;
      nhan: string;
    };
  };
  nhan_phong_cach: Array<{
    id: string;
    ten: string;
    thu_tu_xet: number;
    khi_taboo: boolean | null;
    khi_ao_lech: boolean | null;
    co_mon_hien_dai: boolean | null;
    diem_tu: number | null;
    diem_duoi: number | null;
    dieu_kien: string;
    mo_ta: string;
  }>;
}

export type CompatibilityMap = Record<string, Record<string, 'hop' | 'lech'>>;

export interface GeminiConfig {
  system_instruction: string;
  rubric: {
    tot: string;
    on: string;
    chua: string;
  };
  fallback_feedback: {
    co_taboo: string;
    co_mon_hien_dai: string;
    chuan_le: string;
  };
}

export interface AppConfig {
  report_form_url: string;
  gemini_timeout_ms: number;
  nhan_minh_bach: {
    ai_review: string;
    poc_disclaimer: string;
  };
  tang_bat_buoc: ItemLayer[];
  tang_tuy_chon: ItemLayer[];
}
