// 產生固定位置的松樹（同樣的 seed 每次結果相同），供 SVG 插畫使用。
export interface Tree { x: number; y: number; s: number }

export function makeTrees(count: number, seed: number, box: { x0: number; x1: number; y0: number; y1: number }, size: [number, number]): Tree[] {
  let t = seed;
  const rand = () => { t = (t * 9301 + 49297) % 233280; return t / 233280; };
  const out: Tree[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      x: box.x0 + rand() * (box.x1 - box.x0),
      y: box.y0 + rand() * (box.y1 - box.y0),
      s: size[0] + rand() * (size[1] - size[0]),
    });
  }
  // 後面的樹（y 小）先畫，前面的樹蓋在上面
  return out.sort((a, b) => a.y - b.y);
}

/** 兩層三角形的松樹，(x, y) 是樹根 */
export function pine({ x, y, s }: Tree): string {
  const w = s * 0.45;
  return `M${x},${y - s} L${x + w * 0.7},${y - s * 0.45} L${x + w * 0.35},${y - s * 0.45} L${x + w},${y - s * 0.05} L${x - w},${y - s * 0.05} L${x - w * 0.35},${y - s * 0.45} L${x - w * 0.7},${y - s * 0.45} Z`;
}
