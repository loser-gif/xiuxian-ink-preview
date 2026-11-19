/* 童年与凡人规则：真实日期、技艺、线索与入道资格。 */
'use strict';
const Childhood = (() => {
  const initial = () => ({
    active: true, completed: false, actions: 0, storyMode: true, story: { chapter: 0, memories: [] },
    skills: { read: 0, craft: 0, gather: 0, care: 0 },
    relations: { family: 0, teacher: 0, craftsman: 0 },
    clues: 0, fragment: false, route: '', last: ''
  });
  const actionDefs = [
    { id: 'study', name: '读书识字', days: 2, minAge: 6, text: '在村塾认下几页新字。先生把旧书留在你的手边。' },
    { id: 'farm', name: '帮家中做活', days: 1, minAge: 6, text: '把柴米一件件安顿好。家人记住了你的可靠。' },
    { id: 'craft', name: '跟匠人学修补', days: 3, minAge: 9, text: '竹木、铁钉和旧绳在指间各归其位。匠人愿意让你再试一件。' },
    { id: 'gather', name: '去山脚采集', days: 1, minAge: 6, text: '沿着熟悉的石径走了一趟，辨认可用的草木，也记住回家的路。' },
    { id: 'play', name: '在溪边散心', days: 1, minAge: 6, text: '看水过桥，听风穿林。心里的褶皱慢慢展开。' },
    { id: 'talk', name: '听先生讲古', days: 1, minAge: 9, text: '先生说到大黎皇历与山外修士。你记下了几个此前不懂的名字。' },
    { id: 'calendarHint', name: '去祠堂看旧历', days: 1, minAge: 9, text: '祠堂里供着一册旧皇历。先生见你逐字辨认，便说：“先把字认熟些，十二岁来帮我换新历。”' },
    { id: 'calendar', name: '帮先生整理新历', days: 3, minAge: 12, text: '你替祠堂清点旧册，又抄下来年的节气。先生把一册《大黎皇历》赠给你。' },
    { id: 'seek', name: '寻访仙缘线索', days: 4, minAge: 12, text: '你向旅人和旧书问起仙踪。消息不再只是捕风捉影。' }
  ];
  function def(id) { return actionDefs.find(a => a.id === id); }
  function available(s) {
    const age = s.age | 0;
    return actionDefs.filter(a => age >= a.minAge && !(s.childhood.storyMode && (a.id === 'calendar' || a.id === 'calendarHint')) && (a.id !== 'calendar' || !Calendar.owned(s)) && (a.id !== 'calendarHint' || !s.flags.calendarHint));
  }
  function addSkill(s, key, amount) { s.childhood.skills[key] += amount; }
  function relation(s, key, amount) { s.childhood.relations[key] += amount; }
  function act(s, id) {
    if (!s || !s.childhood || !s.mortal || s.dead) return { err: '此刻不能安排凡间生活' };
    const action = def(id);
    if (!action || !available(s).some(a => a.id === id)) return { err: '还不到做这件事的时候' };
    const category = id === 'farm' || id === 'craft' ? 'work' : id === 'talk' ? 'people' : id === 'seek' ? 'travel' : id === 'calendar' || id === 'calendarHint' ? 'study' : id;
    const mod = Calendar.modifier(s, category);
    const tag = Calendar.tag(s, category);
    Core.passDays(s, action.days);
    if (s.dead) { s.ending = 'fanren'; return { text: '这一日走到这里，屋里的灯慢慢静了下来。', days: action.days }; }
    s.childhood.actions++;
    s.childhood.last = id;
    let text = action.text;
    if (id === 'study') { addSkill(s, 'read', 2 * mod); relation(s, 'teacher', mod); }
    if (id === 'farm') { const pay = mod > 1 ? 3 : mod < 1 ? 1 : 2; s.ls += pay; addSkill(s, 'care', 2 * mod); relation(s, 'family', 2 * mod); text += ` 换得${pay}灵石。`; }
    if (id === 'craft') { addSkill(s, 'craft', 2 * mod); relation(s, 'craftsman', mod); }
    if (id === 'gather') { addSkill(s, 'gather', 2 * mod); s.items['青叶草'] = (s.items['青叶草'] || 0) + (mod > 1 ? 2 : 1); }
    if (id === 'play') { s.xj = Math.min(100, s.xj + 3); addSkill(s, 'care', mod); }
    if (id === 'talk') { addSkill(s, 'read', mod); relation(s, 'teacher', 2 * mod); if (s.age >= 12) s.childhood.clues += 0.5; }
    if (id === 'calendarHint') { s.flags.calendarHint = 1; relation(s, 'teacher', 2); }
    if (id === 'calendar') {
      s.flags.almanac = 1; s.items['大黎皇历'] = 1; addSkill(s, 'read', 2 * mod); relation(s, 'teacher', 3);
      text += '大黎开国皇帝创制此历，颁行州郡；今日起，你也能按日安排自己的生活。';
    }
    if (id === 'seek') {
      s.childhood.clues += mod;
      if (s.childhood.skills.read >= 4) s.childhood.clues += 0.5;
    }
    if (!s.childhood.fragment && s.childhood.clues >= 3 && (s.childhood.skills.read >= 6 || s.childhood.clues >= 6)) {
      s.childhood.fragment = true; s.items['吐纳残篇'] = 1;
      text += ' 你把几处记载拼在一起，终于读出一段可依法尝试的吐纳残篇。';
    }
    return { text, tags: tag ? [tag] : [], days: action.days };
  }
  function season(s, id) {
    if (!s || !s.childhood || !s.childhood.active || !s.mortal || s.dead) return { err: '此刻不能安排这一段时日' };
    if (id === 'study' && !s.flags.firstLessonDone) return { err: '先跟先生亲手写完第一课' };
    if (id === 'farm' && !s.flags.firstErrandDone) return { err: '先亲手替家中送一次米' };
    const action = def(id);
    if (!action || !available(s).some(a => a.id === id) || id === 'calendar' || id === 'calendarHint') return { err: '这件事需要亲自去做，或还不到时候' };
    const turns = Math.max(1, Math.round(90 / action.days));
    const start = Calendar.absolute(s), before = s.childhood.actions, ls = s.ls, hadFragment = s.childhood.fragment;
    for (let i = 0; i < turns && !s.dead; i++) act(s, id);
    const worked = s.childhood.actions - before, days = Calendar.absolute(s) - start;
    let text = `这一段时日，你做了${worked}次“${action.name}”，经过${days}日。每次都照原来的样子记入账中。`;
    if (!hadFragment && s.childhood.fragment) text += '寻访所得也在其中：几处旧记载终于拼成了吐纳残篇。';
    if (s.dead) text += '这一程走到这里，便不再往后安排。';
    const tags = [{ t: `历时 ${days}日`, c: 'up' }, { t: `${action.name} ${worked}次`, c: 'gold' }];
    if (s.ls !== ls) tags.push({ t: `灵石 ${s.ls - ls > 0 ? '+' : ''}${s.ls - ls}`, c: s.ls > ls ? 'up' : 'down' });
    return { title: '童年 · 一季', text, tags, days, worked };
  }
  function choices(s) {
    if (!s || !s.childhood || s.age < 16) return [];
    return [
      { id: 'stay', name: '留在村中，把日子过下去', enabled: true },
      { id: 'travel', name: '整理行装，去镇里边谋生边寻访', enabled: true },
      { id: 'self', name: '依吐纳残篇，尝试引气入体', enabled: !!s.childhood.fragment },
      { id: 'sect', name: '携仙门消息，前往拜山', enabled: s.childhood.clues >= 2 }
    ];
  }
  function complete(s, route) {
    s.childhood.active = false; s.childhood.completed = true; s.childhood.route = route;
  }
  function root() {
    const total = LINGGEN.reduce((sum, item) => sum + item.w, 0);
    let roll = Math.random() * total, lg = LINGGEN[LINGGEN.length - 1];
    for (const item of LINGGEN) { roll -= item.w; if (roll < 0) { lg = item; break; } }
    const count = lg.id === 'tian' || lg.id === 'yi' ? 1 : lg.id === 'shuang' ? 2 : lg.id === 'san' ? 3 : lg.id === 'si' ? 4 : 5;
    const shuffled = ELEMENTS.slice().sort(() => Math.random() - 0.5);
    return { lg, els: shuffled.slice(0, count), wx: 1 + Math.floor(Math.random() * 10), luck: Math.floor(Math.random() * 4) };
  }
  return { initial, available, act, season, choices, complete, root };
})();
