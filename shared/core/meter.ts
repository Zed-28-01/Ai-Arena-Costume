import { getItemById, getScoringConfig } from './dataLoader.ts';

/**
 * Đếm số lượng món đồ hiện đại trong bộ trang phục
 * Món hiện đại = món có loai === "hien_dai" (kể cả món gây lỗi is_fault)
 */
export function demSoMonHienDai(mon: string[]): number {
  let count = 0;
  for (const itemStr of mon) {
    if (!itemStr) continue;
    const [itemId] = itemStr.split(':');
    const item = getItemById(itemId);
    if (item && item.loai === 'hien_dai') {
      count++;
    }
  }
  return count;
}

/**
 * Xác định nhãn Culture Meter dựa trên số món hiện đại
 * Toàn bộ ngưỡng đọc từ scoring.json, không gõ cứng
 */
export function tinhCultureMeter(soMonHienDai: number): string {
  const config = getScoringConfig();
  const meter = config.culture_meter;

  if (
    soMonHienDai >= meter.chuan_lich_su.so_mon_hien_dai_min &&
    soMonHienDai <= meter.chuan_lich_su.so_mon_hien_dai_max
  ) {
    return meter.chuan_lich_su.nhan;
  }

  if (
    soMonHienDai >= meter.cach_tan.so_mon_hien_dai_min &&
    soMonHienDai <= meter.cach_tan.so_mon_hien_dai_max
  ) {
    return meter.cach_tan.nhan;
  }

  if (soMonHienDai >= meter.pha_cach.so_mon_hien_dai_min) {
    return meter.pha_cach.nhan;
  }

  return meter.pha_cach.nhan;
}
