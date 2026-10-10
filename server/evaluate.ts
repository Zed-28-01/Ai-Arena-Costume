import type { Request, Response } from 'express';
import {
  getEventById,
  getItemById,
  getAppConfig,
  getRuleById,
  getGeminiConfig,
} from '../shared/core/dataLoader.ts';
import { danhGia } from '../shared/core/engine.ts';
import {
  getCachedResult,
  setCachedResult,
  type EvaluationResponse,
} from './cache.ts';

export function handleEvaluate(req: Request, res: Response) {
  const { event_id, gender, items } = req.body || {};

  // 1. Kiểm tra event_id
  if (!event_id || typeof event_id !== 'string') {
    res.status(400).json({ error: 'Mã sự kiện (event_id) là bắt buộc.' });
    return;
  }
  const event = getEventById(event_id);
  if (!event) {
    res.status(400).json({ error: `Sự kiện "${event_id}" không tồn tại trong hệ thống.` });
    return;
  }

  // 2. Kiểm tra gender
  if (!gender || (gender !== 'nu' && gender !== 'nam')) {
    res.status(400).json({ error: 'Giới tính (gender) không hợp lệ (phải là "nu" hoặc "nam").' });
    return;
  }

  // 3. Kiểm tra items
  if (!Array.isArray(items)) {
    res.status(400).json({ error: 'Danh sách món đồ (items) phải là một mảng.' });
    return;
  }

  const appConfig = getAppConfig();
  const seenLayers = new Set<string>();

  for (const itemStr of items) {
    if (typeof itemStr !== 'string' || !itemStr.trim()) {
      res.status(400).json({ error: 'Mỗi món đồ trong danh sách phải là chuỗi ký tự hợp lệ.' });
      return;
    }

    const parts = itemStr.split(':');
    const itemId = parts[0];
    const colorId = parts[1];

    if (parts.length > 2) {
      res.status(400).json({ error: `Định dạng món đồ "${itemStr}" không hợp lệ.` });
      return;
    }

    const itemData = getItemById(itemId);
    if (!itemData) {
      res.status(400).json({ error: `Món đồ "${itemId}" không tồn tại trong danh mục.` });
      return;
    }

    // Mỗi tầng tối đa một món
    if (seenLayers.has(itemData.tang)) {
      res.status(400).json({
        error: `Mỗi tầng chỉ được chọn tối đa một món (tầng "${itemData.tang}" bị trùng lặp món "${itemId}").`,
      });
      return;
    }
    seenLayers.add(itemData.tang);

    // Quy định màu sắc
    if (itemData.tang === 'ao') {
      if (!colorId) {
        res.status(400).json({
          error: `Áo "${itemId}" bắt buộc phải có mã màu đi kèm (định dạng: ma_ao:ma_mau).`,
        });
        return;
      }
      if (!itemData.mau.includes(colorId)) {
        res.status(400).json({
          error: `Màu "${colorId}" không hợp lệ cho áo "${itemData.ten}" (chỉ chấp nhận: ${itemData.mau.join(', ')}).`,
        });
        return;
      }
    } else {
      if (colorId !== undefined) {
        res.status(400).json({
          error: `Món "${itemId}" thuộc tầng "${itemData.tang}" không được có mã màu đi kèm.`,
        });
        return;
      }
    }
  }

  // Kiểm tra đủ các tầng bắt buộc theo app-config.json
  for (const reqLayer of appConfig.tang_bat_buoc) {
    if (!seenLayers.has(reqLayer)) {
      res.status(400).json({
        error: `Thiếu món thuộc tầng bắt buộc "${reqLayer}".`,
      });
      return;
    }
  }

  // 4. Kiểm tra cache
  const cached = getCachedResult(event_id, gender, items);
  if (cached) {
    res.json(cached);
    return;
  }

  // 5. Tính toán bằng danhGia với thamMy 'du_phong'
  const evalResult = danhGia(event_id, items, 'du_phong');

  // Lấy câu feedback từ gemini.json theo tình huống
  const geminiConfig = getGeminiConfig();
  let feedbackText = geminiConfig.fallback_feedback.chuan_le;
  if (evalResult.isTaboo) {
    feedbackText = geminiConfig.fallback_feedback.co_taboo;
  } else if (evalResult.so_mon_hien_dai > 0) {
    feedbackText = geminiConfig.fallback_feedback.co_mon_hien_dai;
  }

  const responseData: EvaluationResponse = {
    tongDiem: evalResult.tong_diem,
    nhan: evalResult.nhan,
    diem: {
      vanHoa: evalResult.diem_van_hoa,
      suKien: evalResult.diem_su_kien,
      thamMy: evalResult.diem_tham_my,
    },
    isTaboo: evalResult.isTaboo,
    cultureMeter: evalResult.culture_meter,
    soMonHienDai: evalResult.so_mon_hien_dai,
    canhBao: evalResult.luat_kich_hoat.map((ruleId) => {
      const r = getRuleById(ruleId);
      return {
        rule_id: ruleId,
        loai: r?.loai || '',
        tieu_de: r?.tieu_de || '',
        ly_do: r?.ly_do || '',
        da_duyet: r?.da_duyet ?? false,
        nguon_ids: r?.nguon_ids || [],
      };
    }),
    feedback: feedbackText,
    can_cu_ids: [],
    tamTinh: true,
  };

  // Cố gắng lưu cache (hàm setCachedResult sẽ tự bỏ qua nếu tamTinh === true)
  setCachedResult(event_id, gender, items, responseData);

  res.json(responseData);
}
