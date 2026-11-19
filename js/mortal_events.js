/* 凡人游历池：乡里生计与山外消息，不混入修士斗法。 */
'use strict';
EVENTS.push(
  {
    id: 'mortal_ferry', title: '渡口搭船', mortal: true, w: 6,
    text: () => '渡口的船家正把几袋米搬上船。他认得你，也愿意让你搭一段顺路船。',
    choices: () => [
      { label: '先帮船家搬货', act: s => { Core.passDays(s, 1); s.ls += 2; return { text: '你帮着把米袋放稳。船家收了货钱，也塞给你两份辛苦钱。', fx: {} }; } },
      { label: '坐船听些山外消息', act: s => { Core.passDays(s, 1); s.childhood.clues += 0.5; return { text: '船家说山门外偶尔有仙师经过。他把听来的地名又认真说了一遍。', fx: {} }; } }
    ]
  },
  {
    id: 'mortal_bookstall', title: '镇口书摊', mortal: true, w: 6,
    text: () => '旧书摊摆着农书、话本和几册缺页的杂记。摊主不催你，只把灯挑亮了些。',
    choices: () => [
      { label: '买下一册旧杂记', sub: '灵石二', act: s => {
        if (s.ls < 2) return { text: '你摸了摸钱袋，还是先把书名记住。', fx: {} };
        Core.passDays(s, 2); s.ls -= 2; s.childhood.skills.read += 1; s.childhood.clues += 0.5;
        return { text: '旧杂记里夹着几行行气歌。字句不全，却比传言更可读。', fx: {} };
      } },
      { label: '在灯边读一会儿', act: s => { Core.passDays(s, 1); s.childhood.skills.read += 0.5; return { text: '摊主默许你读完短短几页。离开时，天已经斜了。', fx: {} }; } }
    ]
  },
  {
    id: 'mortal_rain', title: '檐下急雨', mortal: true, w: 5,
    text: () => '夏雨忽然压下来，路边几户人家的旧筐还留在檐外。',
    choices: () => [
      { label: '帮着把筐收进去', act: s => { Core.passDays(s, 1); s.childhood.relations.family += 1; s.xj = Math.min(100, s.xj + 2); return { text: '你浑身湿透，东西却一点没坏。主人家坚持留你喝了碗热汤。', fx: {} }; } },
      { label: '在桥边等雨停', act: s => { Core.passDays(s, 1); return { text: '雨声盖住了远处的人声。等水势稍缓，你才慢慢走回去。', fx: {} }; } }
    ]
  },
  {
    id: 'mortal_herb', title: '山脚药囊', mortal: true, w: 5,
    text: () => '采药人坐在石上整理药囊。见你认出几味草，他愿意教你怎样不伤根。',
    choices: () => [
      { label: '请教辨认与采收', act: s => { Core.passDays(s, 2); s.childhood.skills.gather += 2; s.items['青叶草'] = (s.items['青叶草'] || 0) + 2; return { text: '你学会留住根须，也得了一小把青叶草。', fx: {} }; } },
      { label: '把路径记下来', act: s => { Core.passDays(s, 1); s.childhood.skills.gather += 1; return { text: '哪一段雨后难走，哪一处有遮阳的石壁，你都记下了。', fx: {} }; } }
    ]
  },
  {
    id: 'mortal_bell', title: '远处钟声', mortal: true, w: 4,
    text: () => '山那边传来一声钟响。村人说是仙门，也有人说不过是庙里撞钟。没有人替你断定。',
    choices: () => [
      { label: '向村人追问来历', act: s => { Core.passDays(s, 2); s.childhood.clues += 1; return { text: '你问出钟声的方向，也知道了哪条山路能到镇上。线索又清楚了一点。', fx: {} }; } },
      { label: '听完钟声，继续回家', act: s => { Core.passDays(s, 1); s.xj = Math.min(100, s.xj + 2); return { text: '钟声慢慢散了。你没有追出去，家中灯还亮着。', fx: {} }; } }
    ]
  }
);

EVENTS.push(
  {
    id: 'adult_rescue', title: '山道上的伤者', mortal: true, w: 5, once: true,
    cond: s => !!(s.adult && s.adult.started && s.found && s.found.yunyue),
    text: () => '商道旁的草叶上沾着血。一个陌生修士靠在石后，灵力散得厉害，先问你的不是姓名，而是能否替他找一处避雨的地方。',
    choices: () => [
      { label: '先安置伤者，再听他说', act: s => {
        Core.passDays(s, 3); s.childhood.fragment = true; s.items['吐纳残篇'] = 1; s.childhood.clues += 2;
        return { text: '你替他挪到檐下，又守过一夜。临走时，他把一段调匀气息的法子慢慢说给你听。不是谢礼清单，是一条真正可以尝试的路。', fx: {} };
      } },
      { label: '替他叫来商队医师', act: s => {
        Core.passDays(s, 2); s.childhood.clues += 1;
        return { text: '医师替他止了血。他没有传你功法，只在地图上指出一处山门方向。你做的仍是救命的事。', fx: {} };
      } }
    ]
  },
  {
    id: 'adult_manual', title: '两种行气歌', mortal: true, w: 5, once: true,
    cond: s => !!(s.adult && s.adult.started && s.childhood.skills.read >= 8),
    text: () => '旧书摊上两册行气歌都缺了后半截。一册辞句漂亮，一册纸页粗糙，连呼吸的次序也写得不同。',
    choices: () => [
      { label: '对照皇历与旧注，逐句辨读', act: s => {
        Core.passDays(s, 3); s.childhood.fragment = true; s.items['吐纳残篇'] = 1; s.childhood.clues += 1;
        return { text: '你没有选字句好看的那册。两处旧注相互印证，终于拼出一段不妨先静坐尝试的残篇。', fx: {} };
      } },
      { label: '先抄下出处，不急着照练', act: s => {
        Core.passDays(s, 1); s.childhood.clues += .5;
        return { text: '你把两册书的来历抄在纸背。今日没有法门入手，但至少知道哪些话不可轻信。', fx: {} };
      } }
    ]
  }
);


function completeTeachStage(s, stage, field, text, tags) {
  if (!s || !s.adult) return { text, tags: tags || [] };
  const p = s.adult.projects.teach = s.adult.projects.teach || { stage: 0 };
  p.stage = Math.max(p.stage | 0, stage);
  if (field) p[field] = 1;
  if (Core.npcAlive(s, 'village_teacher')) {
    Core.npcAdd(s, 'village_teacher', stage === 3 ? 2 : 1);
    People.note(s, 'village_teacher', '在', text);
  }
  return { text, tags: tags || [] };
}

EVENTS.push(
  {
    id: 'adult_teach_first', title: '一堂慢课', mortal: true, w: 0, once: true,
    text: () => '同一个字，前排的孩子已经会写，后排的孩子还把笔握得很紧。周先生没有替你回答，只问这一句要怎样教。',
    choices: () => [
      { label: '让先会写的温习，慢的那个坐到前来', act: s => completeTeachStage(s, 1, 'slowFirst', '你把会写的字留给他们自己温习，再蹲到后排，一笔一笔教那个孩子握笔。周先生看着，没有催。', [{ t: '学会了先看谁没跟上', c: 'gold' }]) },
      { label: '带大家把同一句话再读齐一遍', act: s => completeTeachStage(s, 1, 'together', '你让大家再读一遍，声音齐了，落笔仍各有快慢。周先生笑说，齐读也有齐读的用处。', [{ t: '先让课上稳住', c: 'up' }]) }
    ]
  },
  {
    id: 'adult_teach_paper', title: '纸墨有限', mortal: true, w: 0, once: true,
    text: s => {
      const p = s.adult && s.adult.projects && s.adult.projects.teach;
      return (p && p.slowFirst ? '上回坐到前排的孩子，如今已经敢把写错的字拿给你看。' : '上回齐读过的孩子，如今开始各自举手发问。') + '只是近来纸用得太快。周先生搬出一摞旧簿，村里的纸墨并不宽裕。';
    },
    choices: s => [
      { label: '拿出二灵石，添些新纸', sub: '灵石 −2', disabled: s.ls < 2, act: s => {
        s.ls -= 2;
        return completeTeachStage(s, 2, 'newPaper', '你添了一刀新纸，没有让孩子们知道这钱来得是否容易。周先生把旧簿也收好，说纸再新，也要一笔一笔写。', [{ t: '灵石 −2', c: 'down' }, { t: '村塾纸墨已添', c: 'up' }]);
      } },
      { label: '把旧簿的空白页找出来接着用', act: s => completeTeachStage(s, 2, 'reusePaper', '你们把旧簿一页页翻过，空白处仍够写许多字。孩子们也学会，珍惜纸张不是把字写得越少越好。', [{ t: '旧簿重新用上', c: 'up' }]) }
    ]
  },
  {
    id: 'adult_teach_lesson', title: '替先生一堂课', mortal: true, w: 0, once: true,
    text: () => '周先生近来咳得厉害，明日却有人要来村塾听课。他把明日要讲的册子推给你，既没有命令，也没有试探，只问你是否愿意分担。',
    choices: () => [
      { label: '替他讲完这一堂课', act: s => completeTeachStage(s, 3, 'independent', '次日你站在先生平日站的地方，先看谁没跟上，再往下讲。周先生在窗下听完，课后只说：“今日这堂，是你讲的。”', [{ t: '已能独自讲课', c: 'gold' }]) },
      { label: '先请先生歇着，你来陪他备课', act: s => completeTeachStage(s, 3, 'prepare', '你没有急着走上讲台，而是陪先生把明日要说的每一句理清。第二天仍由先生讲课，你坐在后排，知道哪些地方有你的心意。', [{ t: '学会分担一堂课', c: 'gold' }]) }
    ]
  }
);


function completeCraftStage(s, stage, field, text, tags) {
  if (!s || !s.adult) return { text, tags: tags || [] };
  const p = s.adult.projects.craftwork = s.adult.projects.craftwork || { stage: 0 };
  p.stage = Math.max(p.stage | 0, stage);
  if (field) p[field] = 1;
  if (Core.npcAlive(s, 'village_craftsman')) {
    Core.npcAdd(s, 'village_craftsman', 1);
    People.note(s, 'village_craftsman', '在', text);
  }
  return { text, tags: tags || [] };
}

EVENTS.push(
  {
    id: 'adult_craft_measure', title: '量木与下锯', mortal: true, w: 0, once: true,
    text: () => '鲁师傅把一块旧木料放到案上。木纹并不直，边缘还留着上一回用旧时的钉眼。他问你的第一件事情不是会不会下锯，而是准备从哪里下锯。',
    choices: () => [
      { label: '先量清三处，再决定落锯的位置', act: s => completeCraftStage(s, 1, 'measure', '你把三处尺寸都记下来，才发现最直的一段并不在正中间。鲁师傅说，量木不是怕锯错，是先知道什么还能用。', [{ t: '先量后锯', c: 'up' }]) },
      { label: '顺着木纹，先做一个小样', act: s => completeCraftStage(s, 1, 'sample', '你沿木纹削出一个小样，毛边里便看出哪里吃不住力。鲁师傅把小样留下，说手上先知道，尺寸才有意思。', [{ t: '先做出个样子', c: 'up' }]) }
    ]
  },
  {
    id: 'adult_craft_joint', title: '旧椅的榫头', mortal: true, w: 0, once: true,
    text: s => {
      const p = s.adult && s.adult.projects && s.adult.projects.craftwork;
      return (p && p.sample ? '小样让你更早看出了暗伤。' : '量过的尺寸让每一处暗伤都有了位置。') + '一把旧椅送到案前，几处榫头已经松了。全部换新最省事，但能用的旧料若都丢掉，也可惜。';
    },
    choices: s => [
      { label: '拆下仍能用的榫头，慢慢修回去', act: s => completeCraftStage(s, 2, 'reuseJoint', '你把还紧实的榫头留了下来，换掉真正朽坏的部分。旧椅没有变新，却还能再陪主人家许多年。鲁师傅也舍不得丢掉这样的旧物。', [{ t: '旧料尽量留用', c: 'up' }]) },
      { label: '朽坏处换妥新材，别只修表面', sub: '枯枝 −1，或灵石 −2', disabled: s.ls < 2 && !(s.items['枯枝'] > 0), act: s => {
        if (s.items['枯枝'] > 0) s.items['枯枝']--;
        else s.ls -= 2;
        return completeCraftStage(s, 2, 'replaceJoint', '你把松朽的部分逐处换妥，没有只在表面补一层木屑。新料与旧料接得紧实，这把旧椅也有了新的骨头。', [{ t: '材料已耗', c: 'down' }, { t: '朽处已经换妥', c: 'up' }]);
      } }
    ]
  },
  {
    id: 'adult_craft_delivery', title: '交期与验收', mortal: true, w: 0, once: true,
    text: () => '订做的木器已经到了交期。榫卯都合上了，只是验收前还有一道细墨线没有干透。你可以照约交付，也可以再留一日，把每处接缝重新验过。',
    choices: () => [
      { label: '再留一日，把每处接缝重新验过', sub: '耗时一日', act: s => {
        Core.passDays(s, 1);
        return completeCraftStage(s, 3, 'checked', '你多留了一日，把接缝逐处验过，又把两根太紧的木楔改细。交付晚了，却没有把问题留给用的人。鲁师傅说，这就是自己拿主意的手艺。', [{ t: '历时一日', c: 'up' }, { t: '已能独立验活', c: 'gold' }]);
      } },
      { label: '按约交付，把使用时的注意也写清', act: s => completeCraftStage(s, 3, 'timely', '你按约把木器送到，也把木料哪里怕潮、何时该重新上蜡写清楚。没有多余的炫耀，只有一件被认真交到人手上的活计。', [{ t: '如约交付', c: 'gold' }]) }
    ]
  }
);
