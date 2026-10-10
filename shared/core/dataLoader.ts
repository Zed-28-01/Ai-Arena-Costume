import eventsData from '../../data/events.json';
import itemsData from '../../data/items.json';
import colorsData from '../../data/colors.json';
import rulesData from '../../data/rules.json';
import presetsData from '../../data/presets.json';
import scoringData from '../../data/scoring.json';
import compatibilityData from '../../data/compatibility.json';
import geminiData from '../../data/gemini.json';
import appConfigData from '../../data/app-config.json';

import type {
  EventItem,
  ClothingItem,
  ColorItem,
  RuleItem,
  PresetItem,
  ScoringConfig,
  CompatibilityMap,
  ItemLayer,
  GeminiConfig,
  AppConfig,
} from './types.ts';

/**
 * Lấy toàn bộ danh sách sự kiện
 */
export const getEvents = (): EventItem[] => eventsData as EventItem[];

/**
 * Tìm sự kiện theo mã ID
 */
export const getEventById = (id: string): EventItem | undefined =>
  getEvents().find((e) => e.id === id);

/**
 * Lấy toàn bộ danh mục 12 món trang phục (nguồn sự thật duy nhất)
 */
export const getItems = (): ClothingItem[] => itemsData as ClothingItem[];

/**
 * Tìm món trang phục theo mã ID
 */
export const getItemById = (id: string): ClothingItem | undefined =>
  getItems().find((item) => item.id === id);

/**
 * Lấy danh sách món trang phục theo tầng (ao, quan, doi_dau, giay, phu_kien)
 */
export const getItemsByLayer = (layer: ItemLayer): ClothingItem[] =>
  getItems().filter((item) => item.tang === layer);

/**
 * Lấy danh sách bảng màu
 */
export const getColors = (): ColorItem[] => colorsData as ColorItem[];

/**
 * Tìm màu sắc theo mã ID
 */
export const getColorById = (id: string): ColorItem | undefined =>
  getColors().find((color) => color.id === id);

/**
 * Lấy toàn bộ danh sách luật
 */
export const getRules = (): RuleItem[] => rulesData as RuleItem[];

/**
 * Tìm luật theo mã ID
 */
export const getRuleById = (id: string): RuleItem | undefined =>
  getRules().find((rule) => rule.id === id);

/**
 * Lấy toàn bộ presets
 */
export const getPresets = (): PresetItem[] => presetsData as PresetItem[];

/**
 * Lấy presets theo mã sự kiện
 */
export const getPresetsByEvent = (eventId: string): PresetItem[] =>
  getPresets().filter((preset) => preset.su_kien === eventId);

/**
 * Lấy preset theo mã ID
 */
export const getPresetById = (id: string): PresetItem | undefined =>
  getPresets().find((preset) => preset.id === id);

/**
 * Lấy cấu hình chấm điểm và trần điểm
 */
export const getScoringConfig = (): ScoringConfig => scoringData as unknown as ScoringConfig;

/**
 * Lấy bảng độ tương thích giữa áo và sự kiện
 */
export const getCompatibility = (): CompatibilityMap => compatibilityData as CompatibilityMap;

/**
 * Kiểm tra áo hợp hay lệch sự kiện
 */
export const getShirtCompatibility = (shirtId: string, eventId: string): 'hop' | 'lech' => {
  const compat = getCompatibility();
  return compat[shirtId]?.[eventId] ?? 'lech';
};

/**
 * Lấy cấu hình prompt và rubric cho Gemini AI
 */
export const getGeminiConfig = (): GeminiConfig => geminiData as GeminiConfig;

/**
 * Lấy cấu hình chung của ứng dụng
 */
export const getAppConfig = (): AppConfig => appConfigData as AppConfig;
