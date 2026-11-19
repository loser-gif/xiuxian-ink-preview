'use strict';
const ChildhoodStory = (() => {
  const scenes = [
    { id:'calendar', age:6, title:'今日何宜', label:'接下皇历', text:'先生在名册旁放下一册旧皇历。“大黎开国皇帝创制此历，颁行州郡。名字写进名册，日子写进皇历；往后你做过的事，也有地方可查。”他教你翻到当月，又把册子推到你面前。' },
    { id:'lesson', age:6, title:'村塾第一课', label:'去窗下写字' },
    { id:'friend', age:12, title:'窗外落雨', text:'九岁夏雨，阿禾在门外被你同窗拦住，笑她只认得自己的名字。先生还没有回来，几双眼睛都望着你。', nextAge:12, choices:[
      { id:'speak', label:'替她解围', sub:'阿禾会记得这次出头', text:'你把阿禾拉到窗边，说今日可以同你一起认字。那几个孩子觉得无味，很快散了。阿禾没有道谢，只把一张写着渡口二字的纸塞给你。', apply(s){s.flags.childhoodFriend='speak';s.childhood.skills.care+=2;s.childhood.relations.family+=1;} },
      { id:'study', label:'先把功课做完', sub:'先生会记得你的专心', text:'你没有放下手里的字。等先生回来，门外的争执已经散了。他看完你的功课，又单独给你讲了一个错字。你学得踏实，也记住了门外的雨声。', apply(s){s.flags.childhoodFriend='study';s.childhood.skills.read+=2;s.childhood.relations.teacher+=2;} }
    ] },
    { id:'school', age:14, title:'村塾漏雨', text:'十二岁那年，连日雨水泡软了村塾的屋顶。先生要保住书，鲁师傅要换坏木，家中也等着人搭手。你能拿出一日的工夫。', nextAge:14, choices:[
      { id:'repair', label:'跟鲁师傅上屋顶', sub:'学手艺，也认下一份人情', text:'你递瓦、搬木，也跟着认出哪根木头已经朽透。鲁师傅没有把你当只跑腿的孩子，教你试了第一回凿榫。', apply(s){s.flags.childhoodSchool='repair';s.childhood.skills.craft+=3;s.childhood.relations.craftsman+=2;s.flags.schoolRepaired=1;} },
      { id:'ledger', label:'帮先生搬书记账', sub:'识字与条理留在成年以后', text:'你把湿书摊开，把还能读的书按页码记清。先生照你的册子找回了几本险些丢掉的书，也把一册空白账簿留给你。', apply(s){s.flags.childhoodSchool='ledger';s.childhood.skills.read+=3;s.childhood.skills.care+=1;s.childhood.relations.teacher+=2;s.flags.schoolRepaired=1;} }
    ] },
    { id:'rumor', age:16, title:'山外来信', text:'十四岁，镇上来的旅人说起山门收徒，又留下一页有行气口诀的旧纸。字句不全，先生也只看懂一半。你可以追问，也可以先把它当作寻常传闻。', nextAge:16, choices:[
      { id:'ask', label:'向先生逐句问清', sub:'得到两条仙缘线索，可拜山测灵', text:'你拿来旧书，与先生逐句对照。虽然仍不能依法修行，至少记住了两家山门的名字和拜山规矩。', apply(s){s.flags.childhoodRumor='ask';s.childhood.skills.read+=1;s.childhood.relations.teacher+=1;s.childhood.clues+=2;} },
      { id:'road', label:'先问旅人山外的路', sub:'得到一条线索与远行见识', text:'你没有追问口诀，先请旅人把渡口、驿所和山路说清。那人临走前告诉你，若以后想拜山，先学会把一条路走明白。', apply(s){s.flags.childhoodRumor='road';s.childhood.skills.gather+=2;s.childhood.skills.care+=1;s.childhood.clues+=1;} }
    ] },
    { id:'farewell', age:16, title:'十六岁 · 临行', text:'晨钟还是当年的声音，名册上的名字却已经写了十年。母亲替你收拾行囊，先生与阿禾都在等你说话。往后的日子，要由你自己选了。' }
  ];
  function ensure(s) {
    if (!s || !s.childhood) return null;
    const c=s.childhood;
    if (typeof c.storyMode!=='boolean') c.storyMode=false;
    if (!c.story) c.story={chapter:c.completed?scenes.length-1:0,memories:[]};
    if (!Array.isArray(c.story.memories)) c.story.memories=[];
    return c.story;
  }
  function active(s) { return !!(s&&s.childhood&&s.childhood.storyMode&&s.childhood.active&&!s.dead); }
  function current(s) { const story=ensure(s);return story?scenes[Math.max(0,Math.min(scenes.length-1,story.chapter|0))]:null; }
  function advanceTo(s,age) { if(s.months<age*12)s.months=age*12;Core.sync(s); }
  function grantCalendar(s) {
    if(!active(s)||current(s).id!=='calendar')return{err:'这一幕已经写进皇历'};
    if(Calendar.owned(s))return{err:'皇历已经在行囊里'};
    s.flags.almanac=1;s.items['大黎皇历']=1;s.childhood.relations.teacher+=1;
    s.childhood.story.memories.push('calendar');s.childhood.story.chapter=1;
    return{text:'大黎开国皇帝创制此历，颁行州郡。你亲手翻开当月，点下今天。先生把这册《大黎皇历》赠给你：“日子不是写在纸上就定了，要一天天做过。”',tags:[{t:'获得 · 大黎皇历',c:'gold'}]};
  }
  function finishLesson(s) {
    if(!active(s)||current(s).id!=='lesson')return{err:'这一课已经写完'};
    s.childhood.story.memories.push('lesson');s.childhood.story.chapter=2;advanceTo(s,9);
    return{text:'此后几年，你照常读书，也帮家中做活。先生换过两次戒尺，村口的树又高了一截。九岁夏雨，有一件事你没有忘掉。',tags:[{t:'岁月 · 九岁',c:'gold'}]};
  }
  function choose(s,id) {
    if(!active(s))return{err:'此刻没有正在等待的童年选择'};
    const scene=current(s),choice=scene.choices&&scene.choices.find(c=>c.id===id);
    if(!choice)return{err:'这个选择不属于眼前这一幕'};
    choice.apply(s);s.childhood.story.memories.push(scene.id+':'+id);s.childhood.story.chapter++;
    advanceTo(s,scene.nextAge);
    const next=current(s),years=scene.nextAge===12?'此后三年，村中的日子照常往前走。':scene.nextAge===14?'又是两年，旧书与手艺都渐渐有了分量。':'两年后再看，村外的路已经不只是故事里的名字。';
    return{text:choice.text+(next.id!=='farewell'?years:''),tags:[{t:'岁月 · '+cn(scene.nextAge)+'岁',c:'gold'}]};
  }
  function event(s) {
    const scene=current(s);if(!scene||!scene.choices)return null;
    return{id:'childhood_story_'+scene.id,title:scene.title,seal:'记',text:()=>scene.text,choices:()=>scene.choices.map(choice=>({label:choice.label,sub:choice.sub,act:state=>choose(state,choice.id)}))};
  }
  function nextLine(s) { const scene=current(s);return scene?scene.title+' · 点“续事”写下这一幕':'童年将合 · 自择去向'; }
  return{ensure,current,grantCalendar,finishLesson,choose,event,nextLine};
})();
