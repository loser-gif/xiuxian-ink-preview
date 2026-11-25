/* 成年人间卷：职业、见闻、仙缘与一小群各自生活的村人。 */
'use strict';
const Adulthood = (() => {
  const CONTACTS = [
    { id: 'village_teacher', name: '周先生', seal: '周', title: '青石村塾 · 教书先生', sex: 'm', wish: '让村里的孩子有书可读', age: 30, life: 86, place: 'qingshi', goal: '村塾的屋顶又该修了' },
    { id: 'village_craftsman', name: '鲁师傅', seal: '鲁', title: '青石村 · 木匠', sex: 'm', wish: '把一件旧物修到能再用十年', age: 22, life: 84, place: 'qingshi', goal: '镇上催着交一批木器' },
    { id: 'village_friend', name: '阿禾', seal: '禾', title: '青石村 · 同龄旧友', sex: 'n', wish: '去镇上看看，再决定往哪里走', age: 0, life: 86, place: 'qingshi', goal: '想给镇上的旧识捎一句话' },
    { id: 'village_mother', name: '母亲', seal: '家', title: '青石村 · 家中', sex: 'f', wish: '日子安稳，远行的人记得回家', age: 25, life: 86, place: 'qingshi', goal: '家里一切如常，只问你吃得好不好' }
  ];
  const CAREERS = [
    { id: 'teach', name: '村塾教书', skill: 'read', text: '替先生带一日课。你把认识的字写得慢一些，孩子们便跟得上。' },
    { id: 'craft', name: '随匠人作活', skill: 'craft', text: '量木、下锯、收口。一件普通木器也有自己的规矩。' },
    { id: 'heal', name: '采药行医', skill: 'gather', text: '你认草、晒药，也学着先问人哪里难受。' },
    { id: 'exam', name: '读书备考', skill: 'read', text: '你把时文与旧书分开读。功名还远，文章先要有自己的意思。' }
  ];
  const TALKS = {
    village_teacher: [
      '周先生让你把新认的字读给他听，错处只说一遍，叫你下次自己想。',
      '他说村塾的孩子各有快慢，教书先要记住谁没跟上。',
      '他提起旧皇历时只说，日子不是写在纸上就定了，要一天天做过。'
    ],
    village_craftsman: [
      '鲁师傅给你看一条刨花，说好木料也要顺着纹路，急不得。',
      '他正修一把旧椅，舍不得换掉还能用的榫头。',
      '他问你书读得如何，又说手艺不比文章低，做稳了都能养家。'
    ],
    village_friend: [
      '阿禾问你镇上的渡口人多不多，听说商队来时，什么样的货都有。',
      '阿禾把镇上的旧信又看了一遍，问起山外的路，也问起你近来的打算。',
      '阿禾笑说村中也没什么不好，只是想亲眼看一次河对岸。'
    ],
    village_mother: [
      '母亲把你袖口磨破的地方补了两针，问过吃饱穿暖，又催你趁天亮做事。',
      '她把干粮分成小份，嘱咐远路不要硬撑，回家不必带什么。',
      '她说邻家小孩又来借书，笑着说村里近来热闹了些。'
    ]
  };
  function registerPeople() {
    if (typeof People === 'undefined' || typeof NPCS === 'undefined') return;
    CONTACTS.forEach(c => {
      if (!NPCS[c.id]) {
        NPCS[c.id] = { name: c.name, seal: c.seal, title: c.title, a0: 0, sex: c.sex, trait: c.wish, bio: c.wish + '。', style: 'wen', rel: .7 };
        People.newcomers[c.id] = [c.name, c.seal, c.title, c.sex, c.wish, c.place, '', c.age, c.life];
        People.biographies[c.id] = NPCS[c.id].bio;
        if (typeof Samsara !== 'undefined' && !Samsara.PERSON_IDS.includes(c.id)) Samsara.PERSON_IDS.push(c.id);
      }
    });
  }
  registerPeople();
  function absolute(s) { return typeof Calendar !== 'undefined' && Calendar.absolute ? Calendar.absolute(s) : Math.floor(s.months) * 30 + (s.day | 0); }
  function career(id) { return CAREERS.find(c => c.id === id); }
  function ensure(s) {
    if (!s || !s.childhood) return null;
    const a = s.adult = s.adult || {};
    a.started = a.started ? 1 : 0;
    a.career = a.career || '';
    a.work = a.work || 0;
    a.careerHistory = a.careerHistory || {};
    if (typeof a.careerWork !== 'number') a.careerWork = a.career ? (a.careerHistory[a.career] || a.work) : 0;
    a.projects = a.projects || {};
    a.links = a.links || {};
    a.promises = Array.isArray(a.promises) ? a.promises : [];
    if (typeof People !== 'undefined') {
      People.ensure(s);
      CONTACTS.forEach(c => {
        const n = s.npc[c.id];
        if (n.met == null) n.met = true;
        if (n.life && !n.life.line) n.life.line = c.goal;
      });
    }
    return a;
  }
  function begin(s, route) {
    const a = ensure(s); a.started = 1; a.startedAt = absolute(s);
    a.projects.school = a.projects.school || { stage: 0, due: absolute(s) + 90, introduced: false, materials: false };
    if (a.started && !(s.items['干粮'] > 0)) s.items['干粮'] = 7;
    s.found = { qingshi: 1 };
    s.loc = 'qingshi';
    CONTACTS.forEach(c => { if (s.npc && s.npc[c.id]) s.npc[c.id].met = true; });
    const line = route === 'travel'
      ? '你背起行囊走到镇口。童年卷在这里合上，往后的日子先由谋生、远行与旧友写起。仙缘不必急于一时。'
      : '你留在熟悉的村中。童年卷在这里合上，柴米、手艺与人情接着往下写。仙缘并非人人都得，也并非今日便要寻得。';
    const growthText = typeof Growth !== 'undefined' ? Growth.enterAdult(s) : '';
    const echoes=[];
    if(s.flags.childhoodFriend==='speak')echoes.push('阿禾仍记得你当年替她解围，特意来问你要走哪条路。');
    if(s.flags.childhoodFriend==='study')echoes.push('阿禾在门外停了一会儿，没有怪你那日只顾功课，只说以后记得回信。');
    if(s.flags.childhoodSchool==='repair')echoes.push('鲁师傅认得你递瓦搬木的手势，愿意让你先从匠作做起。');
    if(s.flags.childhoodSchool==='ledger')echoes.push('先生还留着你当年整理的书册，说你能把一笔账记清。');
    return line + echoes.join('') + '家中替你包了七份干粮。' + (growthText ? growthText : '');
  }
  function nextLine(s) {
    const a = ensure(s);
    if (!a || !a.started) return '';
    const c = career(a.career);
    const project = a.projects.school;
    if (s.childhood.fragment) return '吐纳残篇已得 · 生计页可尝试入道';
    if (project && project.stage === 0) return '村塾修缮 · 人情页可问先生与匠人';
    return c ? `${c.name} · 也可随时另择生计` : '尚未择业 · 生计页先找一件能做的事';
  }
  function discover(s, id, text, days) {
    const a = ensure(s); if (!a || !a.started) return { err: '十六岁以后，再安排这条路' };
    if (!LOC[id]) return { err: '这条路尚未写进山河' };
    Core.passDays(s, days); s.found[id] = 1;
    return { title: '新路 · ' + LOC[id].name, text, tags: [{ t: '地图已添 · ' + LOC[id].name, c: 'gold' }] };
  }
  function discoveries(s) {
    const a = ensure(s);
    if (!a || !a.started) return [];
    return [
      { id: 'creekRoad', name: '替邻屋送一封平安信', days: 2, done: !!s.found.taohua, enabled: true, run: () => discover(s, 'taohua', '你沿溪把信送到。回程时，桃花溪的渡口与岔路都已认得，地图上多了一段可走的路。', 2) },
      { id: 'marketRoad', name: '随商队认一段山路', days: 4, done: !!s.found.yunyue, enabled: !!s.found.taohua, run: () => discover(s, 'yunyue', '你替商队看货，也跟着认路。云岳坊不只有仙家买卖，也有脚夫、药铺和讨生活的人。', 4) },
      { id: 'capitalRoad', name: '问清进京与科考规矩', days: 3, done: !!s.found.jingcheng, enabled: !!s.found.yunyue && (s.childhood.skills.read >= 8 || (s.court && s.court.rank >= 0)), run: () => discover(s, 'jingcheng', '书吏把沿路驿所、入京文引与贡院规矩一一说清。京城不再只是书上的名字。', 3) }
    ];
  }
  function chooseCareer(s, id) {
    const a = ensure(s), c = career(id);
    if (!a || !a.started || !c) return { err: '此刻还不能择业' };
    if (a.career === id) return { err: '眼下正在做这份生计' };
    Core.passDays(s, 2); a.career = id; a.careerWork = a.careerHistory[id] || 0;
    if (id === 'exam') {
      s.court = s.court || emptyCourt(); if (s.court.rank < 0) s.court.rank = 0;
      s.court.entry = 'mortal';
    }
    return { title: '成年生计', text: c.text + (id === 'exam' ? '你已在乡试名册上落笔。知道进京的路以后，可去京城贡院应试。' : '这不是一生不可改的契约，只是你眼下认真做的事。'), tags: [{ t: '生计 · ' + c.name, c: 'gold' }] };
  }
  function careerEvent(s) {
    const a = ensure(s); if (!a) return '';
    if (a.career === 'teach' && Core.npcAlive(s, 'village_teacher')) {
      const p = a.projects.teach = a.projects.teach || { stage: 0 };
      if (p.stage < 1 && a.careerWork >= 2) return 'adult_teach_first';
      if (p.stage < 2 && a.careerWork >= 6) return 'adult_teach_paper';
      if (p.stage < 3 && a.careerWork >= 12) return 'adult_teach_lesson';
    }
    if (a.career === 'craft' && Core.npcAlive(s, 'village_craftsman')) {
      const p = a.projects.craftwork = a.projects.craftwork || { stage: 0 };
      if (p.stage < 1 && a.careerWork >= 2) return 'adult_craft_measure';
      if (p.stage < 2 && a.careerWork >= 6) return 'adult_craft_joint';
      if (p.stage < 3 && a.careerWork >= 12) return 'adult_craft_delivery';
    }
    return '';
  }
  function work(s) {
    const a = ensure(s), c = career(a && a.career);
    if (!c) return { err: '先选一件眼下要做的生计' };
    if (s.dead) return { err: '此生已经收卷' };
    Core.passDays(s, 3);
    if (s.dead) return { title: c.name, text: '这一日的工作还没有做完，灯便先熄了。', tags: [] };
    a.work++; a.careerWork++;
    a.careerHistory[c.id] = a.careerWork;
    const key = c.skill; s.childhood.skills[key] += .5;
    let pay = c.id === 'exam' ? 0 : 2 + Math.min(2, Math.floor(a.careerWork / 4)); s.ls += pay;
    const firstInsight = !s.flags.insightReady && a.work >= 5;
    if (firstInsight) s.flags.insightReady = 1;
    return { title: c.name, text: c.text + (pay ? `换得${pay}灵石。` : '今日没有工钱，文章却读通了一小段。') + (firstInsight ? '这些日子的寒热、劳苦与人情忽然连在了一起。你似乎摸到了一点自己的道理。' : ''), tags: [{ t: (key === 'read' ? '识字' : key === 'craft' ? '手艺' : '采集') + ' +0.5', c: 'up' }], event: careerEvent(s) };
  }
  function workYear(s) {
    const a = ensure(s), c = career(a && a.career);
    if (!c) return { err: '先选一件眼下要做的生计' };
    if (s.dead) return { err: '此生已经收卷' };
    const start = absolute(s), work0 = a.work, ls0 = s.ls;
    let event = '';
    for (let i = 0; i < 121 && !s.dead; i++) {
      const out = work(s);
      if (out.event) { event = out.event; break; }
    }
    const worked = a.work - work0, days = absolute(s) - start, pay = s.ls - ls0;
    let text = worked === 121
      ? `这一年，你仍做${c.name}。日子没有跳过去：共做${worked}段工，${pay ? `换得${pay}灵石。` : '没有工钱，文章却读通了不少。'}`
      : `这一段你仍做${c.name}。共做${worked}段工，${pay ? `换得${pay}灵石。` : '没有工钱，文章也没有白读。'}`;
    if (s.dead) text += '走到这里，日子便停下了。';
    if (event) text += event.startsWith('adult_teach') ? '中途有件教书的事，还需要你亲自拿个主意。' : '中途有件手上的活计，还需要你亲自拿个主意。';
    const tags = [{ t: `历时 ${days}日`, c: 'up' }, { t: `生计 ${worked}段`, c: 'gold' }];
    if (pay) tags.push({ t: `灵石 +${pay}`, c: 'up' });
    return { title: c.name + ' · 年计', text, tags, event };
  }
  function careerHistory(s) {
    const a = ensure(s); if (!a) return [];
    return CAREERS.map(c => ({ id: c.id, name: c.name, work: a.careerHistory[c.id] || 0 })).filter(c => c.work > 0);
  }
  function immortalOptions(s) {
    const a = ensure(s); if (!a || !a.started) return [];
    return [
      { id: 'rescue', name: '依所得残篇，尝试引气入体', enabled: !!s.childhood.fragment, hint: '需要在奇遇中真正得到功法或残篇' },
      { id: 'insight', name: '把这些年的经历连起来，尝试顿悟', enabled: !!s.flags.insightReady, hint: '需要认真做过一段时间的人间生计' },
      { id: 'sect', name: '携已知仙门消息，前往拜山', enabled: s.childhood.clues >= 2, hint: '需要至少两条仙缘线索' }
    ];
  }
  function contactState(s, id) {
    const c = CONTACTS.find(x => x.id === id), n = s.npc && s.npc[id];
    return { c, n, alive: typeof Core.npcAlive === 'function' ? Core.npcAlive(s, id) : !!(n && !n.dead), present: c && c.place === s.loc && typeof People !== 'undefined' && People.present(s, id) };
  }
  function contacts(s) {
    const a = ensure(s); if (!a || !a.started) return [];
    return CONTACTS.map(c => {
      const st = contactState(s, c.id), project = a.projects.school;
      let goal = c.goal;
      if (c.id === 'village_teacher' && project) goal = project.stage === 2 ? '村塾已经修好，孩子们仍能来读书' : project.stage === 3 ? '漏处先补上了，还缺一个能长期帮忙的人' : project.introduced ? '鲁师傅已来看过屋顶，约了开工的日子' : c.goal;
      if (c.id === 'village_craftsman' && project) goal = project.introduced ? '你已把村塾的事说给他听' : c.goal;
      if (c.id === 'village_friend' && s.flags.childhoodFriend==='speak') goal='还记得你当年替她解围，想听你往后要走的路';
      if (c.id === 'village_friend' && s.flags.childhoodFriend==='study') goal='记得那场夏雨，也想知道你是否已经读到自己想读的书';
      if (c.id === 'village_craftsman' && s.flags.childhoodSchool==='repair') goal='还记得你递瓦搬木，愿意教你认第一块木料';
      if (c.id === 'village_teacher' && s.flags.childhoodSchool==='ledger') goal='还留着你整理的书册，常说你做事实在';
      const teaching = a.projects.teach;
      if (c.id === 'village_teacher' && teaching && teaching.stage === 3) goal = '村塾里已有你能独自分担的一堂课';
      else if (c.id === 'village_teacher' && teaching && teaching.stage > 0) goal = '你不只是教书，也在学怎样照顾孩子的快慢';
      const craftwork = a.projects.craftwork;
      if (c.id === 'village_craftsman' && craftwork && craftwork.stage === 3) goal = '你已经能独立做完并验好一件活计';
      else if (c.id === 'village_craftsman' && craftwork && craftwork.stage > 0) goal = '从量木、榫卯到验收，你在学完整的手艺';
      const promise = a.promises.find(p => p.id === c.id && !p.done && !p.missed);
      return { c, goal, alive: st.alive, present: st.present, relation: st.n ? Core.npcWord(st.n.a) : '相识', state: st.n && st.n.life ? st.n.life.state : '在', promise };
    });
  }
  function interact(s, id, kind) {
    const a = ensure(s), st = contactState(s, id);
    if (!a || !a.started || !st.c) return { err: '还没有这样一段关系' };
    if (!st.alive) return { err: '故人的事还在，人已经不在了' };
    if (!st.present) return { err: st.c.place === s.loc ? '此人此刻不在原处' : '要去对方所在的地方，才能当面说' };
    const p = a.projects.school;
    if (kind === 'talk') {
      Core.passDays(s, 1); People.touch(s, id);
      const lines = TALKS[id] || [];
      const text = lines.length ? lines[absolute(s) % lines.length] : st.n.life.line || st.c.goal;
      return { title: st.c.name, text, tags: [] };
    }
    if (kind === 'introduce') {
      if (id !== 'village_teacher' && id !== 'village_craftsman') return { err: '此刻没有可引荐的事' };
      if (!p || p.stage !== 0) return { err: '村塾这一桩事已经有了下文' };
      if (p.introduced) return { err: '先生与匠人已经见过面了' };
      Core.passDays(s, 1); p.introduced = true; a.links.teacher_craftsman = '相识';
      People.note(s, 'village_teacher', '在', '你把村塾漏雨的事说给鲁师傅听。两人约好日子，先去看屋顶。');
      People.note(s, 'village_craftsman', '在', '周先生与鲁师傅因你的引荐相识，村塾修缮有了商量。');
      return { title: '引荐', text: '你没有替任何一人做主，只把两边的话带到。先生与匠人约好一同去看村塾的屋顶。', tags: [{ t: '两人已相识', c: 'gold' }] };
    }
    if (kind === 'materials') {
      if (!p || p.stage !== 0) return { err: '这桩修缮已经有了下文' };
      if (p.materials) return { err: '备下的木料已经够了' };
      if (s.items['枯枝'] > 0) s.items['枯枝']--;
      else if (s.ls >= 3) s.ls -= 3;
      else return { err: '需要一份枯枝，或三灵石置办木料' };
      Core.passDays(s, 2); p.materials = true;
      return { title: '托付木料', text: '你把合用的材料送到匠人手里。不是贵重东西，却够他先量清尺寸。', tags: [{ t: '修缮材料已备', c: 'up' }] };
    }
    if (kind === 'letter') {
      if (id !== 'village_friend') return { err: '此刻没有要捎的话' };
      if (a.projects.letter) return { err: '那句话已经带到了' };
      Core.passDays(s, 2); a.projects.letter = 1; s.found.taohua = 1;
      People.note(s, id, '远行', '阿禾托人把话带到镇上。旧识回了信，阿禾也准备亲眼看一看那条路。');
      s.npc[id].life.awayUntil = s.months + 1;
      return { title: '捎话', text: '你把阿禾的话写在信尾，托熟悉渡口的人带去。回程时，桃花溪的路也记住了。', tags: [{ t: '地图已添 · 桃花溪', c: 'gold' }] };
    }
    if (kind === 'promise') {
      if (a.promises.some(x => x.id === id && !x.done && !x.missed)) return { err: '与这人的上一次约定还未履行' };
      const due = absolute(s) + 30, cal = typeof Calendar !== 'undefined' ? Calendar.after(s, 30) : null;
      a.promises.push({ id, due, cal, place: 'qingshi', done: false, missed: false });
      return { title: '相约', text: `你约${st.c.name}一个月后仍在青石村见面。${cal ? `日子定在${cal.year}年${Calendar.monthName(cal.month)}${Calendar.dayName(cal.day)}，` : ''}不能只说一声算了。`, tags: [{ t: '相约 · 一月后', c: 'gold' }] };
    }
    if (kind === 'visit') {
      const promise = a.promises.find(x => x.id === id && !x.done && !x.missed);
      if (!promise) return { err: '此刻没有定下的约' };
      if (absolute(s) < promise.due - 15) return { err: '约的日子还早，先把眼前的事办好' };
      Core.passDays(s, 1); promise.done = true; Core.npcAdd(s, id, 6); People.touch(s, id);
      return { title: '赴约', text: `你在说好的地方见到了${st.c.name}。没有特别要紧的事，只是一起坐了一会儿。`, tags: [{ t: '此约已赴', c: 'gold' }] };
    }
    return { err: '此刻无此事' };
  }
  function tick(s, emit) {
    const a = ensure(s); if (!a || !a.started) return;
    const p = a.projects.school;
    if (p && p.stage === 0 && absolute(s) > p.due) {
      p.stage = p.introduced || p.materials ? 2 : 3;
      const text = p.stage === 2
        ? '周先生与鲁师傅已把村塾的屋顶修好。你此前带去的话和材料，都有了落脚处。'
        : '周先生先补上了最漏雨的一处。鲁师傅接了镇上的活，两人没能坐下来商量。';
      if (p.stage === 2) { s.flags.schoolRepaired = 1; s.childhood.skills.read += 1; }
      if (s.npc && s.npc.village_teacher) People.note(s, 'village_teacher', '在', text);
      if (s.npc && s.npc.village_craftsman) People.note(s, 'village_craftsman', '在', text);
      if (emit) emit({ title: '村塾修缮', text, cls: p.stage === 2 ? 'gold' : 'sys' });
    }
    if(typeof Town!=='undefined')Town.tick(s,undefined,emit);
    a.promises.forEach(promise => {
      if (promise.done || promise.missed || absolute(s) <= promise.due + 15) return;
      promise.missed = true; Core.npcAdd(s, promise.id, -4);
      const c = CONTACTS.find(x => x.id === promise.id);
      if (c && s.npc && s.npc[promise.id]) People.note(s, promise.id, '在', c.name + '等过了约好的日子。你没有去。');
      if (emit && c) emit({ title: '失约', text: c.name + '等过了约好的日子。你没有去。', cls: 'warn' });
    });
  }
  return { CAREERS, CONTACTS, ensure, begin, nextLine, discoveries, chooseCareer, work, workYear, careerHistory, immortalOptions, contacts, interact, tick };
})();
