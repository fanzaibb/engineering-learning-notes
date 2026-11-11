// 縮寫 tooltip 的互動：滑鼠 hover、鍵盤 Tab 聚焦、手機點一下開、再點或點空白處關。
// 以事件委派掛在 document 上，v-html 產生的內容也適用。

const GAP = 8;

function place(wrap: Element) {
  const tip = wrap.querySelector<HTMLElement>('.abbr-tip');
  if (!tip) return;
  tip.style.setProperty('--shift', '0px');
  const r = tip.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  let shift = 0;
  if (r.right > vw - GAP) shift = vw - GAP - r.right;
  if (r.left + shift < GAP) shift = GAP - r.left;
  tip.style.setProperty('--shift', `${Math.round(shift)}px`);
}

function closeAll(except?: Element | null) {
  document.querySelectorAll('.abbr.open').forEach((el) => { if (el !== except) el.classList.remove('open'); });
}

export function installAbbrTooltips() {
  document.addEventListener('mouseover', (e) => {
    const wrap = (e.target as Element | null)?.closest?.('.abbr');
    if (wrap) place(wrap);
  });
  document.addEventListener('focusin', (e) => {
    const wrap = (e.target as Element | null)?.closest?.('.abbr');
    if (wrap) place(wrap);
  });
  document.addEventListener('click', (e) => {
    const btn = (e.target as Element | null)?.closest?.('.abbr-btn');
    if (!btn) { closeAll(); return; }
    const wrap = btn.parentElement!;
    closeAll(wrap);
    wrap.classList.toggle('open');
    if (wrap.classList.contains('open')) place(wrap);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAll();
      (document.activeElement as HTMLElement | null)?.classList.contains('abbr-btn') && (document.activeElement as HTMLElement).blur();
    }
  });
}
