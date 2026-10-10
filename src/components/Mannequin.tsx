import React, { useEffect, useState } from 'react';
import { getItemById, getColorById } from '../../shared/core/dataLoader.ts';
import type { ItemLayer } from '../../shared/core/types.ts';

interface MannequinProps {
  items: string[]; // Danh sách món, ví dụ ["top_tac:do_son", "bot_lua_trang", ...]
  gender: 'nu' | 'nam';
  className?: string;
}

// Bộ nhớ cache tạm trong bộ nhớ cho nội dung file SVG để render tức thì không giật
const svgCache = new Map<string, string>();

async function fetchSvgContent(url: string): Promise<string> {
  if (svgCache.has(url)) {
    return svgCache.get(url)!;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Lỗi tải SVG: ${url} (${res.status})`);
    const text = await res.text();
    svgCache.set(url, text);
    return text;
  } catch (err) {
    console.error(`Không thể nạp SVG từ ${url}:`, err);
    return '';
  }
}

export const Mannequin: React.FC<MannequinProps> = ({ items, gender, className = '' }) => {
  const [svgMap, setSvgMap] = useState<Record<string, string>>({});

  // 1. Phân tích danh sách món theo từng tầng
  const layers: Partial<Record<ItemLayer, { id: string; colorHex?: string; svgUrl: string }>> = {};

  for (const itemStr of items) {
    if (!itemStr) continue;
    const [itemId, colorId] = itemStr.split(':');
    const itemData = getItemById(itemId);
    if (!itemData) continue;

    const svgUrl = itemData.hinh[gender] || '';
    let colorHex: string | undefined;

    if (itemData.tang === 'ao') {
      const activeColorId = colorId || itemData.mau[0];
      const colorData = getColorById(activeColorId);
      colorHex = colorData?.hex;
    }

    if (svgUrl) {
      layers[itemData.tang] = {
        id: itemId,
        colorHex,
        svgUrl,
      };
    }
  }

  const mannequinUrl = `/assets/svg/mannequin/${gender}.svg`;

  // 2. Thu thập toàn bộ URL cần nạp cho các lớp hiện tại
  useEffect(() => {
    let isMounted = true;
    const urlsToFetch = [mannequinUrl];

    if (layers.quan?.svgUrl) urlsToFetch.push(layers.quan.svgUrl);
    if (layers.giay?.svgUrl) urlsToFetch.push(layers.giay.svgUrl);
    if (layers.ao?.svgUrl) urlsToFetch.push(layers.ao.svgUrl);
    if (layers.doi_dau?.svgUrl) urlsToFetch.push(layers.doi_dau.svgUrl);
    if (layers.phu_kien?.svgUrl) urlsToFetch.push(layers.phu_kien.svgUrl);

    Promise.all(
      urlsToFetch.map(async (url) => {
        const content = await fetchSvgContent(url);
        return { url, content };
      })
    ).then((results) => {
      if (!isMounted) return;
      setSvgMap((prev) => {
        const next = { ...prev };
        results.forEach(({ url, content }) => {
          next[url] = content;
        });
        return next;
      });
    });

    return () => {
      isMounted = false;
    };
  }, [mannequinUrl, layers.quan?.svgUrl, layers.giay?.svgUrl, layers.ao?.svgUrl, layers.doi_dau?.svgUrl, layers.phu_kien?.svgUrl]);

  // Thứ tự xếp lớp từ dưới lên theo đúng đặc tả:
  // 1. mannequin -> 2. quần -> 3. giày -> 4. áo (đè lên quần và giày) -> 5. đội đầu -> 6. phụ kiện
  return (
    <div
      className={`relative w-full max-w-[340px] aspect-[1/2] mx-auto select-none overflow-hidden rounded-2xl bg-gradient-to-b from-stone-50 via-stone-100/60 to-stone-200/50 shadow-inner border border-stone-200/80 ${className}`}
    >
      {/* Lớp 1: Mannequin cơ thể */}
      {svgMap[mannequinUrl] && (
        <div
          className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: svgMap[mannequinUrl] }}
        />
      )}

      {/* Lớp 2: Quần (dưới áo) */}
      {layers.quan && svgMap[layers.quan.svgUrl] && (
        <div
          className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: svgMap[layers.quan.svgUrl] }}
        />
      )}

      {/* Lớp 3: Giày dép */}
      {layers.giay && svgMap[layers.giay.svgUrl] && (
        <div
          className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: svgMap[layers.giay.svgUrl] }}
        />
      )}

      {/* Lớp 4: Áo (đè lên quần & giày) - truyền màu trực tiếp qua currentColor */}
      {layers.ao && svgMap[layers.ao.svgUrl] && (
        <div
          className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center [&>svg]:w-full [&>svg]:h-full transition-colors duration-200"
          style={{ color: layers.ao.colorHex || 'currentColor' }}
          dangerouslySetInnerHTML={{ __html: svgMap[layers.ao.svgUrl] }}
        />
      )}

      {/* Lớp 5: Đội đầu */}
      {layers.doi_dau && svgMap[layers.doi_dau.svgUrl] && (
        <div
          className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: svgMap[layers.doi_dau.svgUrl] }}
        />
      )}

      {/* Lớp 6: Phụ kiện */}
      {layers.phu_kien && svgMap[layers.phu_kien.svgUrl] && (
        <div
          className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: svgMap[layers.phu_kien.svgUrl] }}
        />
      )}
    </div>
  );
};
