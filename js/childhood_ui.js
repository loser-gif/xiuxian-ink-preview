/* 小舟入村、村塾名册与可玩的童年卷页。 */
'use strict';
const ChildhoodUI = (() => {
  const reduced = () => document.documentElement.dataset.motion === 'lite' || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  function host() { return document.getElementById('childhood-host'); }
  function make(tag, text, className) { const el = document.createElement(tag); if (text != null) el.textContent = text; if (className) el.className = className; return el; }
  function button(parent, text, fn, className) { const b = make('button', text, className || 'childhood-button'); b.type = 'button'; b.onclick = fn; parent.appendChild(b); return b; }
  function randomName() { return NAMES_XING[Math.floor(Math.random() * NAMES_XING.length)] + NAMES_MING[Math.floor(Math.random() * NAMES_MING.length)]; }
  function arrival() {
    return new Promise(resolve => {
      const h = host(); h.innerHTML = '';
      const scene = make('section', '', 'arrival-scene arrive-water');
      scene.setAttribute('aria-label', '小舟划入青石村');
      const copy = make('div', '', 'arrival-copy');
      copy.appendChild(make('p', '大黎年间，青石村，又是春水初涨。', 'arrival-line-main'));
      copy.appendChild(make('small', '小舟离岸，村塾的晨钟就在前面。', 'arrival-line-sub'));
      scene.appendChild(copy);
      const village = make('div', '', 'arrival-village');
      village.innerHTML = '<i class="arrival-tree"></i><i class="arrival-house h1"></i><i class="arrival-house h2"></i><i class="arrival-house h3"></i>';
      scene.appendChild(village);
      const desk = make('div', '', 'arrival-desk');
      desk.innerHTML = '<div class="arrival-book"><i></i><b>村塾</b><span>名册</span></div><div class="arrival-brush"></div>';
      scene.appendChild(desk);
      const source = document.querySelector('.boat svg');
      if (source) {
        const boat = source.cloneNode(true); boat.classList.add('arrival-boat'); scene.appendChild(boat);
      }
      let done = false;
      const timers = [];
      const finish = () => { if (done) return; done = true; timers.forEach(clearTimeout); resolve(); };
      button(scene, '略过视觉过场', finish, 'arrival-skip');
      h.appendChild(scene);
      timers.push(setTimeout(() => {
        scene.classList.remove('arrive-water'); scene.classList.add('arrive-village');
        copy.querySelector('.arrival-line-main').textContent = '木桥、老树、几缕炊烟。这里便是你长大的地方。';
      }, reduced() ? 20 : 1500));
      timers.push(setTimeout(() => {
        scene.classList.remove('arrive-village'); scene.classList.add('arrive-school');
        copy.querySelector('.arrival-line-main').textContent = '晨钟响了。先生已经把名册摊在案上。';
      }, reduced() ? 40 : 3100));
      timers.push(setTimeout(finish, reduced() ? 80 : 4700));
    });
  }
  function roster() {
    return new Promise(resolve => {
      const h = host(); h.innerHTML = '';
      const section = make('section', '', 'roster-paper roster-enter');
      section.setAttribute('aria-labelledby', 'roster-title');
      const meta = make('div', '', 'roster-meta');
      meta.innerHTML = '<span>青石村塾 · 造册</span><span>大黎历三七一一年 · 初春</span><span>名帖 第壹号</span>';
      section.appendChild(meta);
      section.appendChild(make('p', '六岁 · 初春 · 村塾', 'roster-kicker'));
      section.appendChild(make('h2', '村塾名册', 'roster-title'));
      section.appendChild(make('p', '“门口的孩子，到窗下来。”先生把名册推近，“先告诉我，你叫什么？”', 'roster-lead'));
      const form = make('div', '', 'roster-form');
      const label = make('label', '名讳');
      label.htmlFor = 'childhood-name';
      const input = make('input'); input.id = 'childhood-name'; input.maxLength = 8; input.autocomplete = 'off'; input.placeholder = '写下这一世的名字';
      label.appendChild(input); form.appendChild(label);
      const sexRow = make('div', '', 'roster-sex'); let selected = '';
      const sexNote = make('p', '家中孩子如何记名？只改日常称谓，不妨碍往后选择。', 'roster-note'); sexRow.appendChild(sexNote);
      const choices = make('div', '', 'roster-sex-buttons');
      [['f', '女娃'], ['m', '男娃']].forEach(pair => {
        const b = button(choices, pair[1], () => {
          selected = pair[0];
          choices.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === b)));
        });
        b.setAttribute('aria-pressed', 'false');
      });
      sexRow.appendChild(choices); form.appendChild(sexRow); section.appendChild(form);
      section.appendChild(make('p', '此帖存于囊中。往后读书、出门，皆以此为名。', 'roster-footnote'));
      const actions = make('div', '', 'roster-actions');
      button(actions, '随缘题名', () => { input.value = randomName(); input.focus(); });
      button(actions, '写入名册', () => {
        const name = input.value.trim().replace(/\s+/g, '') || randomName();
        if (!selected) { sexNote.textContent = '请先选择家中称谓，再落印。'; return; }
        resolve({ ok: true, name, sex: selected, root: Childhood.root() });
      }, 'childhood-primary');
      button(actions, '返回卷首', () => resolve({ ok: false }));
      section.appendChild(actions); h.appendChild(section); input.focus();
    });
  }
  async function begin() {
    await arrival();
    return roster();
  }
  function calendarOverlay(s) {
    const h = host();
    const old = h.querySelector('.childhood-calendar'); if (old) { old.remove(); return; }
    const overlay = make('section', '', 'childhood-calendar');
    overlay.appendChild(Calendar.sheet(s));
    button(overlay, '收起皇历', () => overlay.remove(), 'childhood-calendar-close');
    h.appendChild(overlay);
  }
  function enter(s) {
    const h = host(); h.innerHTML = '';
    const page = make('section', '', 'childhood-page');
    page.setAttribute('aria-label', '村中童年生活');
    const head = make('header', '', 'childhood-head');
    head.appendChild(make('p', `${s.name} · ${Calendar.long(s)}`, 'childhood-date'));
    const nav = make('nav', '', 'childhood-nav');
    const calendarButton = button(nav, '皇历', () => calendarOverlay(s));
    calendarButton.dataset.calendar = '1';
    button(nav, '保存并回卷首', () => { if (window.__moxian) window.__moxian.save(); if (window.__childhoodExit) window.__childhoodExit(); });
    head.appendChild(nav); page.appendChild(head);
    const intro = make('div', '', 'childhood-intro');
    intro.appendChild(make('h2', s.age < 9 ? '村中初春' : s.age < 12 ? '书与手艺' : s.age < 16 ? '山外有消息' : '十六岁 · 自择去向'));
    intro.appendChild(make('p', s.age < 12 ? '日子由一件件小事写成。今日读几页书，或帮家里做一件事，都由你安排。' : s.age < 16 ? '你已经开始知道，山外有仙门，人间也有许多值得过好的日子。' : '没有人替你决定此生。仙缘、谋生与留乡，都是真正的道路。'));
    page.appendChild(intro);
    const summary = make('p', '', 'childhood-summary'); page.appendChild(summary);
    const actions = make('div', '', 'childhood-actions'); page.appendChild(actions);
    const recent = make('div', '', 'childhood-recent'); page.appendChild(recent);
    function draw() {
      head.querySelector('.childhood-date').textContent = `${s.name} · ${Calendar.long(s)}`;
      const c = s.childhood;
      calendarButton.hidden = !Calendar.owned(s);
      summary.textContent = `识字 ${Math.floor(c.skills.read)} · 手艺 ${Math.floor(c.skills.craft)} · 采集 ${Math.floor(c.skills.gather)} · 人情 ${Math.floor(c.relations.family + c.relations.teacher + c.relations.craftsman)} · 仙缘线索 ${Math.floor(c.clues)} · 灵石 ${s.ls}`;
      actions.innerHTML = '';
      if (s.age < 16) {
        Childhood.available(s).forEach(action => {
          const b = button(actions, `${action.name} · ${action.days}日`, () => {
            if (b.disabled || page.dataset.busy) return;
            page.dataset.busy = '1';
            actions.querySelectorAll('button').forEach(item => item.disabled = true);
            const result = Childhood.act(s, action.id);
            if (result.err) { delete page.dataset.busy; draw(); return; }
            if (window.__moxian) {
              window.__moxian.pushLog({ title: '童年记事', text: result.text, tags: result.tags });
              window.__moxian.save();
            }
            draw();
            setTimeout(() => { delete page.dataset.busy; }, reduced() ? 60 : 350);
            if (s.dead && window.__childhoodEnter) window.__childhoodEnter('dead');
          });
          b.title = action.text;
        });
      } else {
        Childhood.choices(s).forEach(choice => {
          const b = button(actions, choice.name, () => { if (window.__childhoodEnter) window.__childhoodEnter(choice.id); });
          b.disabled = !choice.enabled;
          if (choice.id === 'self' && !choice.enabled) b.title = '需要先读出吐纳残篇';
          if (choice.id === 'sect' && !choice.enabled) b.title = '需要至少两条仙缘线索';
        });
      }
      recent.innerHTML = '';
      (s.log || []).slice(-2).forEach(e => recent.appendChild(make('p', (e.title ? e.title + ' · ' : '') + e.text)));
    }
    page.appendChild(actions); page.appendChild(recent); h.appendChild(page); draw();
  }
  return { begin, enter };
})();
