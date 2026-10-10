import testCases from './bo-phoi-thu.json';
import { danhGia, type KetQuaDanhGia } from '../engine.ts';
import type { ThamMyLevel } from '../score.ts';

interface TestCase {
  id: string;
  mo_ta: string;
  su_kien: string;
  mon: string[];
  tham_my_gia_dinh: string;
  ky_vong: KetQuaDanhGia;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
}

console.log('='.repeat(70));
console.log('  CHẠY BỘ KIỂM THỬ TỰ ĐỘNG LÕI LUẬT VIỆT PHỤC REMIX (TASK G1.1)');
console.log('='.repeat(70));

let passCount = 0;
let failCount = 0;

(testCases as TestCase[]).forEach((tc) => {
  const result = danhGia(tc.su_kien, tc.mon, tc.tham_my_gia_dinh as ThamMyLevel);
  const kyVong = tc.ky_vong;

  const mismatches: string[] = [];

  if (!arraysEqual(result.luat_kich_hoat, kyVong.luat_kich_hoat)) {
    mismatches.push(
      `luat_kich_hoat: kỳ vọng [${kyVong.luat_kich_hoat.join(', ')}], thực tế [${result.luat_kich_hoat.join(', ')}]`
    );
  }

  if (result.isTaboo !== kyVong.isTaboo) {
    mismatches.push(
      `isTaboo: kỳ vọng ${kyVong.isTaboo}, thực tế ${result.isTaboo}`
    );
  }

  if (result.diem_van_hoa !== kyVong.diem_van_hoa) {
    mismatches.push(
      `diem_van_hoa: kỳ vọng ${kyVong.diem_van_hoa}, thực tế ${result.diem_van_hoa}`
    );
  }

  if (result.diem_su_kien !== kyVong.diem_su_kien) {
    mismatches.push(
      `diem_su_kien: kỳ vọng ${kyVong.diem_su_kien}, thực tế ${result.diem_su_kien}`
    );
  }

  if (result.diem_tham_my !== kyVong.diem_tham_my) {
    mismatches.push(
      `diem_tham_my: kỳ vọng ${kyVong.diem_tham_my}, thực tế ${result.diem_tham_my}`
    );
  }

  if (result.so_mon_hien_dai !== kyVong.so_mon_hien_dai) {
    mismatches.push(
      `so_mon_hien_dai: kỳ vọng ${kyVong.so_mon_hien_dai}, thực tế ${result.so_mon_hien_dai}`
    );
  }

  if (result.culture_meter !== kyVong.culture_meter) {
    mismatches.push(
      `culture_meter: kỳ vọng "${kyVong.culture_meter}", thực tế "${result.culture_meter}"`
    );
  }

  if (result.tong_diem !== kyVong.tong_diem) {
    mismatches.push(
      `tong_diem: kỳ vọng ${kyVong.tong_diem}, thực tế ${result.tong_diem}`
    );
  }

  if (result.nhan !== kyVong.nhan) {
    mismatches.push(
      `nhan: kỳ vọng "${kyVong.nhan}", thực tế "${result.nhan}"`
    );
  }

  if (mismatches.length === 0) {
    passCount++;
    console.log(`[PASS] ${tc.id}: ${tc.mo_ta} -> Điểm: ${result.tong_diem}, Nhãn: "${result.nhan}"`);
  } else {
    failCount++;
    console.error(`[FAIL] ${tc.id}: ${tc.mo_ta}`);
    mismatches.forEach((msg) => console.error(`       - ${msg}`));
  }
});

console.log('-'.repeat(70));
console.log(`KẾT QUẢ: ${passCount}/${(testCases as TestCase[]).length} BỘ PHỐI THỬ ĐẠT (PASS)`);
console.log('='.repeat(70));

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
