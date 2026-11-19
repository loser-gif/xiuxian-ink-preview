/* 大黎皇历：统一日期、按日推进、每日宜忌与当日旧事。 */
'use strict';
const Calendar = (() => {
  const MONTHS = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
  const SEASONS = ['春', '夏', '秋', '冬'];
  const ACTIONS = [
    { id: 'tuna', name: '吐纳' }, { id: 'biguan', name: '闭关' },
    { id: 'travel', name: '游历' }, { id: 'work', name: '差事' },
    { id: 'study', name: '研读' }, { id: 'people', name: '叙话' }
  ];
  const NOTES = [
    '宜把眼前小事做完，不必急着问远方。',
    '日色寻常，稳妥安排自有进益。',
    '宜出门走走，也宜记得归来。',
    '案头清爽，适合读完尚未读完的一页。',
    '人间事各有缓急，不必强求十全。',
    '今日宜留一点时间给家人与旧友。'
  ];
  function dayOf(s) { return Math.max(1, Math.min(30, (s && s.day | 0) || 1)); }
  function date(s) {
    const months = s && typeof s.months === 'number' ? s.months : 192;
    return {
      year: 3721 + Math.floor(months / 12) - 16,
      month: ((Math.floor(months) % 12) + 12) % 12 + 1,
      day: dayOf(s),
      age: Math.floor(months / 12)
    };
  }
  function daysInMonth(year, month) { return month % 2 ? 30 : 29; }
  function advance(s, days) {
    let d = Math.max(0, Math.floor(days));
    let carried = 0;
    let current = date(s);
    s.day = current.day + d;
    while (s.day > daysInMonth(current.year, current.month)) {
      s.day -= daysInMonth(current.year, current.month);
      s.months++;
      carried++;
      current = date(s);
    }
    return carried;
  }
  function stamp(s) { const d = date(s); return { year: d.year, month: d.month, day: d.day }; }
  function after(s, days) { const copy = { months: s.months, day: dayOf(s) }; advance(copy, days); return stamp(copy); }
  function absoluteAt(at) {
    let months = Math.max(0, (at.year - 3705) * 12 + at.month - 1), days = Math.max(0, at.day - 1);
    for (let i = 0; i < months; i++) days += daysInMonth(3705 + Math.floor(i / 12), i % 12 + 1);
    return days;
  }
  function absolute(s) { return absoluteAt(stamp(s)); }
  function owned(s) { return !!(s && s.flags && s.flags.almanac); }
  function hash(year, month, day) {
    let x = (year * 10000 + month * 100 + day) | 0;
    x = Math.imul(x ^ (x >>> 16), 2246822507);
    x = Math.imul(x ^ (x >>> 13), 3266489909);
    return (x ^ (x >>> 16)) >>> 0;
  }
  function ordered(year, month, day) {
    return ACTIONS.map((action, i) => ({ action, n: hash(year, month, day + i * 37) }))
      .sort((a, b) => a.n - b.n).map(x => x.action.id);
  }
  function info(s, at) {
    const d = at || date(s);
    const order = ordered(d.year, d.month, d.day);
    return {
      date: d,
      good: order.slice(0, 2),
      bad: order.slice(2, 4),
      note: NOTES[hash(d.year, d.month, d.day) % NOTES.length]
    };
  }
  function name(id) { const a = ACTIONS.find(x => x.id === id); return a ? a.name : id; }
  function modifier(s, id) {
    if (!owned(s)) return 1;
    const day = info(s);
    if (day.good.includes(id)) return 1.06;
    if (day.bad.includes(id)) return 0.94;
    return 1;
  }
  function tag(s, id) {
    if (!owned(s)) return null;
    const day = info(s);
    if (day.good.includes(id)) return { t: '皇历 · 宜' + name(id), c: 'up' };
    if (day.bad.includes(id)) return { t: '皇历 · 忌' + name(id), c: 'down' };
    return null;
  }
  function monthName(month) { return MONTHS[month - 1]; }
  function dayName(day) { return cn(day) + '日'; }
  function short(s) { const d = date(s); return `${cn(d.age)}岁 · ${monthName(d.month)}${dayName(d.day)}`; }
  function long(s) {
    const d = date(s);
    return `大黎历${d.year}年 · ${monthName(d.month)}${dayName(d.day)} · ${SEASONS[Math.floor((d.month - 1) / 3)]}`;
  }
  function same(a, b) { return a && b && a.year === b.year && a.month === b.month && a.day === b.day; }
  function make(tagName, text, className) {
    const el = document.createElement(tagName);
    if (text != null) el.textContent = text;
    if (className) el.className = className;
    return el;
  }
  function sheet(s) {
    const wrap = make('div', '', 'calendar-sheet');
    let view = date(s);
    let selected = stamp(s);
    const title = make('h3', '', 'calendar-month');
    const detail = make('div', '', 'calendar-detail');
    const grid = make('div', '', 'calendar-grid');
    const note = make('p', '大黎开国皇帝创制皇历，颁行州郡。农时、节气与人间宜忌，都写在这一册里。', 'calendar-lore');
    wrap.appendChild(note);
    if (!owned(s)) {
      wrap.appendChild(make('p', '尚未得到皇历。村塾先生知道这册历法的来历。', 'calendar-locked'));
      return wrap;
    }
    const nav = make('div', '', 'calendar-nav');
    const prev = make('button', '上一月');
    const next = make('button', '下一月');
    prev.type = next.type = 'button';
    nav.appendChild(prev); nav.appendChild(title); nav.appendChild(next); wrap.appendChild(nav);
    wrap.appendChild(grid); wrap.appendChild(detail);
    function drawDetail() {
      detail.innerHTML = '';
      const day = info(s, selected);
      const label = `${monthName(selected.month)}${dayName(selected.day)}`;
      detail.appendChild(make('h4', label, 'calendar-day-title'));
      detail.appendChild(make('p', `宜 ${day.good.map(name).join('、')}　忌 ${day.bad.map(name).join('、')}`, 'calendar-yiji'));
      detail.appendChild(make('p', day.note, 'calendar-note'));
      const promises = s.adult && Array.isArray(s.adult.promises) ? s.adult.promises.filter(p => absoluteAt(selected) === p.due) : [];
      if (promises.length) {
        detail.appendChild(make('h5', '此日之约'));
        promises.forEach(p => {
          const person = typeof Adulthood !== 'undefined' ? Adulthood.CONTACTS.find(c => c.id === p.id) : null;
          const place = typeof LOC !== 'undefined' && LOC[p.place] ? LOC[p.place].name : p.place;
          const status = p.done ? '已赴约' : p.missed ? '已失约' : '尚在约期';
          detail.appendChild(make('p', `${person ? person.name : '旧友'} · ${place} · ${status}`, 'calendar-promise'));
        });
      }
      const logs = (s.log || []).filter(e => same(e.cal, selected)).slice(-4);
      if (logs.length) {
        detail.appendChild(make('h5', '那日所记'));
        logs.forEach(e => detail.appendChild(make('p', (e.title ? e.title + ' · ' : '') + e.text, 'calendar-memory')));
      }
    }
    function draw() {
      title.textContent = `${view.year}年 · ${monthName(view.month)}`;
      grid.innerHTML = '';
      const count = daysInMonth(view.year, view.month);
      for (let day = 1; day <= count; day++) {
        const at = { year: view.year, month: view.month, day };
        const daily = info(s, at);
        const button = make('button', String(day), 'calendar-day');
        button.type = 'button';
        const hasPromise = !!(s.adult && Array.isArray(s.adult.promises) && s.adult.promises.some(p => absoluteAt(at) === p.due));
        button.title = `宜${daily.good.map(name).join('、')}；忌${daily.bad.map(name).join('、')}${hasPromise ? '；有约' : ''}`;
        button.setAttribute('aria-label', `${monthName(view.month)}${dayName(day)}，${button.title}`);
        if (same(at, stamp(s))) button.classList.add('today');
        if (same(at, selected)) button.classList.add('selected');
        if ((s.log || []).some(e => same(e.cal, at))) button.classList.add('has-log');
        if (hasPromise) button.classList.add('has-promise');
        button.onclick = () => { selected = at; draw(); };
        grid.appendChild(button);
      }
      drawDetail();
    }
    function turnMonth(step) {
      view.month += step;
      if (view.month < 1) { view.month = 12; view.year--; }
      if (view.month > 12) { view.month = 1; view.year++; }
      selected = { year: view.year, month: view.month, day: Math.min(selected.day, daysInMonth(view.year, view.month)) };
      draw();
    }
    prev.onclick = () => turnMonth(-1);
    next.onclick = () => turnMonth(1);
    draw();
    return wrap;
  }
  return { date, daysInMonth, advance, after, absolute, absoluteAt, stamp, owned, info, modifier, tag, short, long, monthName, dayName, sheet };
})();
