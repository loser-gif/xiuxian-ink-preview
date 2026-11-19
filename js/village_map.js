/* 青石村近景：与世界地图共用纸卷，只把视线收进村中。 */
'use strict';
const VillageMap = (() => {
  const W = 1200, H = 560;
  const places = typeof Town !== 'undefined' ? Town.places : [
    { id: 'creek', name: '溪边', seal: '溪', x: 19, y: 73, lx: 19, ly: 35, text: '沿着浅水石滩走，不往深处去。春水有草，夏日有薄荷，秋日也能拾得野果。', items: ['青叶草', '薄荷', '野果', '枯枝'], action: '沿溪走一趟', route: 'M590 390 C480 402 410 442 310 430 S245 422 228 409' },
    { id: 'hill', name: '山脚', seal: '山', x: 78, y: 42, lx: 80, ly: 12, text: '只走熟悉的小径，看看石缝与背阴处。不往深山去，认得回来的路才最要紧。', items: ['青叶草', '青叶草', '野果', '枯枝'], action: '沿小径走走', route: 'M590 390 C700 350 744 310 804 296 S876 260 936 235' },
    { id: 'shrine', name: '祠堂后坡', seal: '祠', x: 62, y: 61, lx: 58, ly: 27, text: '旧纸、枯叶和风声都在后坡。祠堂前的路走熟了，屋后仍有值得细看的东西。', items: ['旧纸', '枯叶', '枯枝', '旧纸'], action: '去后坡看看', route: 'M590 390 C640 370 668 345 744 342' }
  ];
  let cache = null, generation = 0, selected = null, busy = false;
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const reduced = () => typeof FX !== 'undefined' && FX.reduced();
  function blob(cv) { return new Promise(resolve => cv.toBlob ? cv.toBlob(b => resolve(b ? URL.createObjectURL(b) : cv.toDataURL()), 'image/png') : resolve(cv.toDataURL())); }
  function stroke(c, points, color, width) {
    c.strokeStyle = color; c.lineWidth = width; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); points.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke();
  }
  function roof(c, x, y, w) {
    const ink = 'rgba(42,39,32,.68)';
    c.fillStyle = 'rgba(239,230,211,.7)'; c.fillRect(x - w * .34, y - w * .28, w * .68, w * .28);
    c.strokeStyle = ink; c.lineWidth = 1; c.strokeRect(x - w * .34, y - w * .28, w * .68, w * .28);
    c.beginPath(); c.moveTo(x - w * .55, y - w * .3); c.quadraticCurveTo(x, y - w * .65, x + w * .55, y - w * .3); c.quadraticCurveTo(x, y - w * .4, x - w * .55, y - w * .3); c.fillStyle = ink; c.fill();
    c.fillStyle = 'rgba(42,39,32,.45)'; c.fillRect(x - 2, y - w * .19, 4, w * .19);
  }
  function pine(c, x, y, h) {
    stroke(c, [[x, y], [x + 4, y - h]], 'rgba(40,42,34,.58)', 2);
    for (let i = 0; i < 6; i++) {
      const yy = y - h * (.35 + i * .1), ww = h * (.28 - i * .025);
      c.fillStyle = `rgba(45,52,42,${.18 + i * .025})`; c.beginPath(); c.ellipse(x, yy, ww, h * .045, -.08, 0, Math.PI * 2); c.fill();
    }
  }
  async function paint(season) {
    if (cache && cache.season === season) return cache.url;
    const scale = Math.min(1.5, Ink.DPR, 1800 / W), cv = document.createElement('canvas'), far = document.createElement('canvas');
    Ink.mountainLayer(far, { W: W * scale, H: H * scale, seed: 149, rgb: [63, 72, 70], alpha: .42, base: .58, amp: .33, peaks: 7, width: .055, sharp: 2.1, fade: .82, wash: .4, cun: .07, cunLen: .8, folds: 2, line: .75, dots: .025, trees: 12, treeSize: .6, bottomFade: true });
    Ink.mountainLayer(cv, { W, H, seed: 163, rgb: [54, 53, 45], alpha: .2, base: .8, amp: .19, peaks: 9, width: .04, sharp: 1.7, fade: .72, wash: .22, cun: .035, cunLen: .6, folds: 1, line: .45, dots: .02, trees: 7, treeSize: .5, bottomFade: true });
    const c = cv.getContext('2d'); c.drawImage(far, 0, 0, cv.width, cv.height); far.width = far.height = 0;
    const river = ['rgba(105,130,128,.045)', 'rgba(105,130,128,.075)', 'rgba(124,113,88,.045)', 'rgba(115,125,139,.04)'][season];
    stroke(c, [[0, 475], [130, 440], [260, 452], [390, 470], [540, 455], [700, 480], [900, 462], [1200, 492]], river, 74);
    for (let i = 0; i < 32; i++) {
      const x = (i * 83 + 31) % W, y = 435 + (i * 29 % 63);
      stroke(c, [[x, y], [x + 22 + i % 4 * 7, y - 1]], 'rgba(65,79,79,.16)', .8);
    }
    for (let i = 0; i < 5; i++) roof(c, 545 + i * 31, 400 - (i % 2) * 9, 28 + i % 3 * 3);
    roof(c, 408, 306, 54); roof(c, 756, 318, 48); roof(c, 864, 362, 45); roof(c, 516, 382, 42); roof(c, 624, 250, 48);
    roof(c, 738, 350, 48); roof(c, 775, 361, 25);
    pine(c, 564, 388, 178); pine(c, 505, 410, 112); pine(c, 860, 320, 70); pine(c, 905, 300, 83); pine(c, 990, 312, 64);
    stroke(c, [[74,302],[260,350],[408,330],[564,340],[756,342],[864,376]], 'rgba(79,75,60,.18)', 12);
    for (let i = 0; i < 6; i++) {
      c.fillStyle = 'rgba(66,65,55,.22)'; c.beginPath(); c.ellipse(180 + i * 21, 430 + (i % 2) * 6, 12, 4, -.15, 0, Math.PI * 2); c.fill();
    }
    c.font = '16px MoShu,MoWen,serif'; c.fillStyle = 'rgba(50,44,35,.48)'; c.textAlign = 'center'; c.fillText('青石镇', 605, 434);
    const url = await blob(cv); cv.width = cv.height = 0;
    if (cache) URL.revokeObjectURL(cache.url);
    cache = { season, url }; return url;
  }
  function vtext(text) { const span = document.createElement('span'); span.className = 'vt'; const col = document.createElement('span'); col.className = 'vcol'; [...text].forEach(ch => { const i = document.createElement('i'); i.textContent = ch; col.appendChild(i); }); span.appendChild(col); return span; }
  function close() {
    const token = ++generation, map = document.getElementById('map');
    map.classList.remove('open');
    if (typeof MoAudio !== 'undefined') { MoAudio.play('paper'); MoAudio.startAmbient('main'); }
    return new Promise(resolve => setTimeout(() => {
      if (token !== generation) { resolve(); return; }
      map.querySelectorAll('img').forEach(img => img.removeAttribute('src'));
      map.innerHTML = ''; map.hidden = true; map.classList.remove('ready', 'village-map'); busy = false; resolve();
    }, reduced() ? 30 : 280));
  }
  function drawRoute(map) {
    const path = map.querySelector('.road-go');
    if (!selected) { path.setAttribute('d', ''); return; }
    path.setAttribute('d', selected.route);
    const len = path.getTotalLength();
    path.style.transition = 'none'; path.style.strokeDasharray = String(len); path.style.strokeDashoffset = reduced() ? '0' : String(len);
    requestAnimationFrame(() => requestAnimationFrame(() => { path.style.transition = reduced() ? 'none' : 'stroke-dashoffset .65s ease'; path.style.strokeDashoffset = '0'; }));
  }
  function renderCard(map, s, onTravel, onPlace) {
    const card = map.querySelector('.map-card'); card.innerHTML = '';
    if (!selected) {
      const p = document.createElement('p'); p.className = 'village-map-empty'; p.textContent = '点一处地名，看看今日能去哪里。村里的路不远，确认之后才会启程。'; card.appendChild(p); return;
    }
    const head = document.createElement('div'); head.className = 'mc-head';
    const seal = document.createElement('span'); seal.className = 'mc-seal'; seal.textContent = selected.seal; head.appendChild(seal);
    const name = document.createElement('div'); name.className = 'mc-name'; name.textContent = selected.name; head.appendChild(name); card.appendChild(head);
    const desc = document.createElement('p'); desc.className = 'mc-desc'; desc.textContent = selected.text; card.appendChild(desc);
    const gathering = !!selected.items, season = Math.floor((s.months % 12) / 3);
    const meta = document.createElement('div'); meta.className = 'mc-meta';
    meta.textContent = gathering ? `当季可见 · ${selected.items[season]}　　路程 · 一日` : '镇中地点 · 人物与事情都在此处'; card.appendChild(meta);
    const go = document.createElement('button'); go.type = 'button'; go.className = 'village-map-go';
    const label = document.createElement('b'); label.textContent = selected.action; go.appendChild(label);
    const small = document.createElement('small'); small.textContent = gathering ? '一日 · 采集' : '进入地点'; go.appendChild(small); card.appendChild(go);
    go.onclick = async () => {
      if (busy) return; busy = true; go.disabled = true;
      drawRoute(map); await sleep(reduced() ? 20 : 680);
      if (gathering) { await onTravel(selected); await close(); }
      else { await close(); if (onPlace) onPlace(selected); }
    };
  }
  async function open(s, onTravel, onPlace, onArea) {
    const map = document.getElementById('map'), token = ++generation;
    selected = null; busy = false; map.className = 'map village-map'; map.innerHTML = '';
    const head = document.createElement('div'); head.className = 'map-head';
    const title = document.createElement('div'); title.className = 'map-ttl';
    const b = document.createElement('b'); b.textContent = '青石镇'; title.appendChild(b);
    const where = document.createElement('span'); where.textContent = `九州 · 青州 · 青石镇　${Calendar.long(s)}`; title.appendChild(where);
    const hint = document.createElement('span'); hint.textContent = '左右展卷 · 点地名择路'; title.appendChild(hint); head.appendChild(title);
    if(onArea){const area=document.createElement('button');area.type='button';area.className='map-area';area.textContent='返回区域图';area.onclick=async()=>{await close();onArea();};head.appendChild(area);}
    const closeButton = document.createElement('button'); closeButton.className = 'map-close'; closeButton.id = 'map-close'; closeButton.setAttribute('aria-label', '收卷');
    closeButton.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="6" y="6" width="88" height="88" rx="8" fill="#b3302a"/><text x="50" y="67" text-anchor="middle" font-size="46" fill="#f3ead6" class="seal-font">收</text></svg>';
    closeButton.onclick = close; head.appendChild(closeButton); map.appendChild(head);
    const wrap = document.createElement('div'); wrap.className = 'map-scroll-wrap';
    const scroll = document.createElement('div'); scroll.className = 'map-scroll'; scroll.tabIndex = 0; scroll.setAttribute('role','region'); scroll.setAttribute('aria-label','青石镇地图，可左右展卷');
    const canvas = document.createElement('div'); canvas.className = 'map-canvas';
    const img = document.createElement('img'); img.className = 'map-img'; img.alt = ''; canvas.appendChild(img);
    const roads = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); roads.setAttribute('class', 'map-road'); roads.setAttribute('viewBox', `0 0 ${W} ${H}`); roads.setAttribute('preserveAspectRatio', 'none');
    const base = document.createElementNS('http://www.w3.org/2000/svg', 'path'), go = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    base.setAttribute('class', 'road-all'); base.setAttribute('d', places.map(p => p.route).join(' ')); go.setAttribute('class', 'road-go'); roads.appendChild(base); roads.appendChild(go); canvas.appendChild(roads);
    const marks = document.createElement('div'); marks.className = 'map-marks'; canvas.appendChild(marks); scroll.appendChild(canvas); wrap.appendChild(scroll);
    const loading = document.createElement('div'); loading.className = 'map-loading'; loading.textContent = '研墨铺纸……'; wrap.appendChild(loading); map.appendChild(wrap);
    const card = document.createElement('div'); card.className = 'map-card village-map-card'; map.appendChild(card);
    map.hidden = false; renderCard(map, s, onTravel, onPlace); await sleep(20); map.classList.add('open');
    if (typeof MoAudio !== 'undefined') { MoAudio.play('paper'); MoAudio.startAmbient('map'); }
    scroll.addEventListener('wheel', e => { if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || e.ctrlKey) return; e.preventDefault(); scroll.scrollLeft += e.deltaY; }, { passive: false });
    const url = await paint(Math.floor((s.months % 12) / 3)); if (token !== generation) return;
    await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; img.src = url; }); if (token !== generation) return;
    map.classList.add('ready');
    places.forEach(place => {
      const tag = document.createElement('button'); tag.type = 'button'; tag.className = 'map-tag village-place'; tag.dataset.id = place.id;
      tag.style.left = place.lx + '%'; tag.style.top = place.ly + '%'; tag.setAttribute('aria-label', place.name);
      const slip = document.createElement('span'); slip.className = 'tag-slip'; slip.appendChild(vtext(place.name)); tag.appendChild(slip);
      const seal = document.createElement('span'); seal.className = 'tag-seal'; seal.textContent = place.seal; tag.appendChild(seal);
      tag.onclick = () => {
        if (busy) return; selected = place;
        marks.querySelectorAll('.map-tag').forEach(el => el.classList.toggle('sel', el.dataset.id === place.id));
        drawRoute(map); renderCard(map, s, onTravel, onPlace);
        const x = place.lx / 100 * canvas.offsetWidth - scroll.clientWidth / 2;
        scroll.scrollTo({ left: Math.max(0, x), behavior: reduced() ? 'auto' : 'smooth' });
      };
      marks.appendChild(tag);
    });
    scroll.scrollLeft = Math.max(0, canvas.offsetWidth * .43 - scroll.clientWidth / 2);
  }
  return { open, places };
})();
