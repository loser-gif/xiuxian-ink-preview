/* 三阶段成长：保留底账，转换用途，不把旧日直接兑换成修为。 */
'use strict';
const Growth = (() => {
  function ensure(s) {
    if (!s || !s.childhood) return null;
    const g = s.growth = s.growth || {};
    g.adultSeen = g.adultSeen ? 1 : 0;
    g.cultSeen = g.cultSeen ? 1 : 0;
    g.readBonus = typeof g.readBonus === 'number' ? g.readBonus : 0;
    return g;
  }
  function relationBase(s) {
    const r = s.childhood.relations || {};
    return Math.floor((r.family || 0) + (r.teacher || 0) + (r.craftsman || 0));
  }
  function childBase(s) {
    const c = s.childhood, g = ensure(s);
    return g.childBase || {
      read: Math.floor(c.skills.read), craft: Math.floor(c.skills.craft + c.skills.gather),
      heart: Math.floor(c.skills.care), people: relationBase(s)
    };
  }
  function experience(s) {
    const a = s.adult || {};
    return Math.max(0, Object.keys(s.found || {}).length - 1) + Object.keys(s.seen || {}).length + (a.projects && a.projects.letter ? 1 : 0);
  }
  function renown(s) {
    const a = s.adult || {}, court = s.court || { rank: -1, min: 40 };
    return Math.max(0, (a.work || 0) * 2 + Math.max(0, court.rank | 0) * 10 + Math.max(0, (court.min | 0) - 40) + (s.flags.schoolRepaired ? 4 : 0));
  }
  function adultBase(s) {
    const a = s.adult || {}, g = ensure(s);
    return g.adultBase || {
      read: Math.floor(s.childhood.skills.read), work: a.work || 0,
      experience: experience(s), renown: renown(s), career: a.career || ''
    };
  }
  function enterAdult(s) {
    const g = ensure(s); if (!g || g.adultSeen) return null;
    g.childBase = childBase(s); g.adultSeen = 1;
    return '识字、手艺、心性与村中人情没有清零。它们将换作学问、职业、阅历与声名，继续陪你过日子。';
  }
  function enterCultivation(s, route) {
    const g = ensure(s); if (!g || g.cultSeen) return null;
    g.adultBase = adultBase(s); g.cultSeen = 1; g.origin = route || 'self';
    g.readBonus = Math.min(.08, Math.floor(s.childhood.skills.read / 4) * .01);
    g.heartAtEntry = Math.floor(s.childhood.skills.care);
    g.craftAtEntry = Math.floor(s.childhood.skills.craft + s.childhood.skills.gather);
    return g.readBonus > 0
      ? `往日读过的字仍在。识字带来的熟稔，让功法习练效率提高 ${Math.round(g.readBonus * 100)}%；修为仍要亲自一步步修来。`
      : '往日的手艺、人情与心志仍在。仙途没有抹掉来处，往后的修为仍要亲自修来。';
  }
  function practiceMul(s) { const g = ensure(s); return g && g.cultSeen ? 1 + g.readBonus : 1; }
  function heartLine(s) {
    const g = ensure(s); if (!g || !g.cultSeen) return '';
    return (g.heartAtEntry || 0) >= 4
      ? '那声音停了一瞬。你想起小时候也曾把一件事慢慢做完，没有因为着急，就把它敷衍过去。'
      : '那声音没有替你回答。小时候尚未学会的事，如今仍能慢慢学会。';
  }
  function view(s) {
    if (!s.childhood) return {
      stage: '仙途', lead: '这是旧卷中的仙途。没有童年与成年底账，就不补写并未经历的事。',
      items: [
        { name: '修为', value: Math.floor(s.xw), note: '当前实际修为' },
        { name: '悟性', value: s.wx, note: '旧卷原有悟性' },
        { name: '心境', value: Math.floor(s.xj), note: '旧卷当前心境' },
        { name: '道缘', value: 0, note: '旧卷不补算仙缘点数' }
      ], history: null, historyType: '', conversion: '旧卷保持原样，不追加转换收益'
    };
    const g = ensure(s), c = s.childhood, a = s.adult || {}, currentCareer = typeof Adulthood !== 'undefined' && a.career ? Adulthood.CAREERS.find(x => x.id === a.career) : null;
    const careerPast = typeof Adulthood !== 'undefined' ? Adulthood.careerHistory(s).map(x => `${x.name}${x.work}段`).join('、') : '';
    if (!s.mortal) {
      const dao = Math.floor(c.clues) + (s.seen.adult_rescue ? 2 : 0) + (s.seen.adult_manual ? 1 : 0) + (s.sect && s.sect.org ? 1 : 0);
      return {
        stage: '仙途', lead: '仙途没有抹掉来处。当前四项之外，童年的名字与成年经历仍留在底账里。',
        items: [
          { name: '修为', value: Math.floor(s.xw), note: '当前境界内的实际修为，不由旧属性兑换' },
          { name: '悟性', value: s.wx, note: '原有悟性保留，不因入道重掷' },
          { name: '心境', value: Math.floor(s.xj), note: '心性与旧日经历会进入心魔一问' },
          { name: '道缘', value: dao, note: '来自实际线索、奇遇与宗门，不是额外随机点数' }
        ],
        history: adultBase(s), historyType: 'adult', conversion: g.cultSeen ? `入道底账已封存 · 功法习练熟识 +${Math.round(g.readBonus * 100)}%` : '旧卷尚未记录入道转换'
      };
    }
    if (a.started) {
      return {
        stage: '成年', lead: '童年所学没有散去。职业与声名会变化，旧日识字、手艺和人情仍是底账。',
        items: [
          { name: '学问', value: Math.floor(c.skills.read), note: '读书、备考、辨读残篇与进京规矩都使用它' },
          { name: '职业', value: `${a.work || 0}段`, note: currentCareer ? currentCareer.name + ' · ' + (careerPast || '刚开始这份生计') + ' · 转行保留履历' : '尚未择业，可在生计页选择' },
          { name: '阅历', value: experience(s), note: '来自不同事件、已识地点与真实来往，不按重复点击累积' },
          { name: '声名', value: renown(s), note: '来自职业、村中公事和仕途民心，不是全局好感' }
        ],
        history: childBase(s), historyType: 'child', conversion: '人情与旧人物不随成年清零'
      };
    }
    return {
      stage: '童年', lead: '现在的每件小事都有去处。属性不会变成修为，只会成为以后理解世界的方式。',
      items: [
        { name: '识字', value: Math.floor(c.skills.read), note: '读书、皇历、旧书与以后的学问' },
        { name: '手艺', value: Math.floor(c.skills.craft + c.skills.gather), note: '修补与采集合并为手上的经验，细项仍分别记录' },
        { name: '心性', value: Math.floor(c.skills.care), note: '来自认真做完的事，也写入以后的心魔文案' },
        { name: '人情', value: relationBase(s), note: '家人、先生与匠人的关系，进入成年人物网' }
      ], history: null, historyType: '', conversion: '童年记录会带入成年，不直接兑换修为'
    };
  }
  return { ensure, enterAdult, enterCultivation, practiceMul, heartLine, view };
})();
