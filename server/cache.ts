export interface EvaluationResponse {
  tongDiem: number;
  nhan: string;
  diem: {
    vanHoa: number;
    suKien: number;
    thamMy: number;
  };
  isTaboo: boolean;
  cultureMeter: string;
  soMonHienDai: number;
  canhBao: Array<{
    rule_id: string;
    loai: string;
    tieu_de: string;
    ly_do: string;
    da_duyet: boolean;
    nguon_ids: string[];
  }>;
  feedback: string;
  can_cu_ids: string[];
  tamTinh: boolean;
}

// Bộ nhớ đệm trong RAM
const memoryCache = new Map<string, EvaluationResponse>();

export function getCacheKey(eventId: string, gender: string, items: string[]): string {
  const sortedItems = [...items].sort().join(',');
  return `${eventId}:${gender}:${sortedItems}`;
}

export function getCachedResult(
  eventId: string,
  gender: string,
  items: string[]
): EvaluationResponse | undefined {
  const key = getCacheKey(eventId, gender, items);
  return memoryCache.get(key);
}

export function setCachedResult(
  eventId: string,
  gender: string,
  items: string[],
  result: EvaluationResponse
): void {
  // Chỉ lưu cache khi kết quả chính thức (tamTinh === false)
  if (result.tamTinh) {
    return;
  }
  const key = getCacheKey(eventId, gender, items);
  memoryCache.set(key, result);
}
