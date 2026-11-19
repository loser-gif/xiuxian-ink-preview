'use strict';
const Town = (() => {
  const CONTACTS = [
    { id:'wang_shoucang', name:'王守仓', short:'王掌柜', seal:'王', title:'王记粮行 · 掌柜', sex:'m', wish:'让王记的粮食按期到仓，也不欠下工人的钱', goal:'粮仓漏雨，怕新收的米受潮' },
    { id:'li_zhiwei', name:'李知微', short:'李大夫', seal:'李', title:'李记药铺 · 坐堂大夫', sex:'f', wish:'药能救人，也要让药铺长久开下去', goal:'柜上赊账渐多，仍不忍拒了急病的人' },
    { id:'chen_laosan', name:'陈老三', short:'陈铁匠', seal:'陈', title:'铁匠铺 · 铁匠', sex:'m', wish:'打出的铁件要经得起年月', goal:'等着工钱结药账，炉里的火不敢停' }
  ];
  const LOCATIONS = [
    { id:'gate', name:'镇口', seal:'口', person:'', x:8, y:54, lx:7, ly:49, text:'青石路从这里进镇。商队、旅人和回村的人，都要在界石旁停一停脚。', action:'听听路上的消息', route:'M590 390 C440 430 230 430 84 302' },
    { id:'oldtree', name:'镇中老槐', seal:'槐', person:'', x:49, y:49, lx:47, ly:37, text:'老槐遮住半条街。树下说书人讲仙人的事，也讲镇上谁家的仓漏了、谁家的炉熄了。', action:'在老槐下坐坐', route:'M590 390 C575 355 565 310 564 207' },
    { id:'school', name:'村塾', seal:'塾', person:'village_teacher', x:52, y:39, lx:52, ly:23, text:'晨钟、读书声与旧书都在此处。周先生知道每个孩子的名字，也记得谁曾来帮过忙。', action:'去村塾看看', route:'M590 390 C610 340 620 250 624 129' },
    { id:'grain', name:'王记粮行', seal:'米', person:'wang_shoucang', x:35, y:49, lx:34, ly:42, text:'米袋从门内一直码到檐下。王守仓做生意精明，却最不愿听人说王记短了谁的分量。', action:'去王记粮行', route:'M590 390 C510 380 450 345 408 235' },
    { id:'medicine', name:'李记药铺', seal:'药', person:'li_zhiwei', x:64, y:48, lx:63, ly:43, text:'药香混着晒草的苦味。李知微记账很细，急病的人来赊药时，却总先把药包递出去。', action:'去李记药铺', route:'M590 390 C650 380 700 340 756 241' },
    { id:'forge', name:'铁匠铺', seal:'铁', person:'chen_laosan', x:72, y:56, lx:72, ly:51, text:'炉火未熄，墙上挂着农具与门闩。陈老三不肯省一道淬火，也不喜欢开口催人结账。', action:'去铁匠铺', route:'M590 390 C670 400 748 365 864 286' },
    { id:'carpenter', name:'木工坊', seal:'木', person:'village_craftsman', x:43, y:58, lx:43, ly:55, text:'刨花落在门槛边。鲁师傅做木器先看纹路，也先看一件旧物还能不能再撑十年。', action:'去木工坊', route:'M590 390 C560 410 530 390 516 308' },
    { id:'home', name:'民居小巷', seal:'家', person:'village_mother', x:28, y:58, lx:27, ly:54, text:'屋檐下晒着谷子与旧衣。家人知道你什么时候出门，也知道你有没有记得回来。', action:'回家看看', route:'M590 390 C500 430 420 420 336 302' },
    { id:'creek', name:'溪边', seal:'溪', x:19, y:73, lx:19, ly:35, text:'沿着浅水石滩走，不往深处去。春水有草，夏日有薄荷，秋日也能拾得野果。', items:['青叶草','薄荷','野果','枯枝'], action:'沿溪走一趟', kind:'gather', route:'M590 390 C480 402 410 442 310 430 S245 422 228 409' },
    { id:'hill', name:'山脚', seal:'山', x:78, y:42, lx:80, ly:12, text:'只走熟悉的小径，看看石缝与背阴处。不往深山去，认得回来的路才最要紧。', items:['青叶草','青叶草','野果','枯枝'], action:'沿小径走走', kind:'gather', route:'M590 390 C700 350 744 310 804 296 S876 260 936 235' },
    { id:'shrine', name:'祠堂后坡', seal:'祠', x:62, y:61, lx:58, ly:27, text:'旧纸、枯叶和风声都在后坡。祠堂前的路走熟了，屋后仍有值得细看的东西。', items:['旧纸','枯叶','枯枝','旧纸'], action:'去后坡看看', kind:'gather', route:'M590 390 C640 370 668 345 744 342' }
  ];
  function registerPeople() {
    if(typeof People==='undefined'||typeof NPCS==='undefined')return;
    CONTACTS.forEach(c=>{
      if(!NPCS[c.id])NPCS[c.id]={name:c.name,seal:c.seal,title:c.title,a0:0,sex:c.sex,trait:c.wish,bio:c.wish+'。',style:'wen',rel:.7};
      if(!People.newcomers[c.id])People.newcomers[c.id]=[c.name,c.seal,c.title,c.sex,c.wish,'qingshi','',c.id==='wang_shoucang'?32:c.id==='li_zhiwei'?28:35,84];
      People.biographies[c.id]=NPCS[c.id].bio;
      if(typeof Samsara!=='undefined'&&!Samsara.PERSON_IDS.includes(c.id))Samsara.PERSON_IDS.push(c.id);
    });
  }
  registerPeople();
  function ensure(s) {
    if(!s)return null;
    s.town=s.town||{};const town=s.town.qingshi=s.town.qingshi||{};
    town.granary=town.granary||{stage:0,path:''};
    if(typeof town.granary.stage!=='number')town.granary.stage=0;
    if(typeof town.granary.path!=='string')town.granary.path='';
    town.met=town.met||{};
    if(typeof People!=='undefined'){People.ensure(s);CONTACTS.forEach(c=>{if(s.npc[c.id].met==null)s.npc[c.id].met=false;});}
    return town;
  }
  function place(id){return LOCATIONS.find(p=>p.id===id);}
  function person(id){return CONTACTS.find(c=>c.id===id);}
  function note(s,id) {
    const stage=ensure(s).granary.stage;
    if(id==='grain')return['粮仓后檐还在滴水。王守仓把米袋往里挪，见你来了，才停下手。','仓木已经看过，接下来要请鲁师傅配好新木。','新木已上，门闩与铁件还得陈老三来看。','陈老三已经应下铁件，只差药钱与工钱有个着落。','粮仓已经修好，米袋重新码回干燥的架上。'][stage];
    if(id==='medicine'&&stage===3)return'李知微翻着赊账册，没有催陈老三，只说治病与结账都得有个章程。';
    if(id==='medicine'&&stage===4)return'李知微把陈老三那一页赊账作了结，药铺仍照常有急病的人来。';
    if(id==='forge'&&stage===3)return'陈老三已经量好铁件，却迟迟没有开炉。问起缘由，他才提起欠李记的药钱。';
    if(id==='forge'&&stage===4)return'铁匠铺重新开炉，修好的门闩已经送回王记。';
    if(id==='carpenter'&&stage>=2)return'鲁师傅已经配好仓木，剩下铁件要由铁匠铺接手。';
    return place(id)?place(id).text:'';
  }
  function talk(s,id) {
    const c=person(id);if(!c)return{err:'这里没有要叙话的人'};
    if(typeof Core.npcAlive==='function'&&!Core.npcAlive(s,id))return{err:'故人已经不在'};
    Core.passDays(s,1);if(s.npc&&s.npc[id])s.npc[id].met=true;ensure(s).met[id]=true;
    const stage=s.town.qingshi.granary.stage,path=s.town.qingshi.granary.path;
    let text='';
    if(id==='wang_shoucang')text=stage===4?'王守仓带你看了修好的粮仓，又让人包了三份干粮：“以后路过，进来喝口水。”':stage? '王守仓惦记着仓里的米，说事情总得一件件办妥。':'王守仓说粮行最怕的不是少赚，是米在仓里坏了。';
    if(id==='li_zhiwei')text=path==='debtPaid'?'李知微把药钱收据递给你：“赊账是救人，记账是过日子。两样都不耽误。”':stage===3?'李知微没有催债，只说陈老三若肯开口，事情总有商量。':'李知微教你认了两味常用草药，又问你近日有没有哪里不适。';
    if(id==='chen_laosan')text=path==='wageAdvanced'?'陈老三说王守仓先把工钱结了，炉才重新烧起来：“不是不肯做，是总得先把家里的药钱还上。”':path==='debtPaid'?'陈老三把修好的铁件看了两遍，说这份情记在心上。':'陈老三让你看火候，说好铁件急不得。';
    return{title:c.name,text,tags:[]};
  }
  function choose(s,placeId,actionId) {
    const town=ensure(s),g=town.granary;
    const defs={
      inspect_granary:{place:'grain',stage:0,next:1,days:1,text:'你跟着王守仓看完粮仓。椽木朽了一处，门闩也松了。王守仓愿意出料，只缺可靠的人把木与铁都修好。'},
      repair_wood:{place:'carpenter',stage:1,next:2,days:2,text:'鲁师傅看过朽木，重新配好仓木，又把尺寸一一记下。接下来还差门闩与铁件。'},
      repair_iron:{place:'forge',stage:2,next:3,days:1,text:'陈老三量好铁件，却没有立刻开炉。追问之下，他才说家里前些日子欠了李记药钱，工钱一日未结，心里总不踏实。'},
      pay_medicine:{place:'medicine',stage:3,next:4,days:1,cost:2,path:'debtPaid',text:'你替陈老三结清药钱。李知微把账页合上，陈老三也终于肯安心开炉。王守仓听说后，把修仓的工钱一并结清。'},
      advance_wages:{place:'grain',stage:3,next:4,days:1,path:'wageAdvanced',text:'你把陈老三的难处说给王守仓听。王守仓没有推托，先结清工钱。陈老三拿到钱，先还药账，再回炉打完铁件。'}
    };
    const d=defs[actionId];if(!d||d.place!==placeId||d.stage!==g.stage)return{err:'这件事眼下不在这里'};
    if(d.cost&&s.ls<d.cost)return{err:'灵石不够，先去别处想想办法'};
    Core.passDays(s,d.days);if(d.cost)s.ls-=d.cost;g.stage=d.next;if(d.path)g.path=d.path;
    const personId=placeId==='grain'?'wang_shoucang':placeId==='medicine'?'li_zhiwei':placeId==='forge'?'chen_laosan':placeId==='carpenter'?'village_craftsman':'';
    if(personId&&s.npc&&s.npc[personId])s.npc[personId].met=true;
    if(g.stage===4){s.items['干粮']=(s.items['干粮']||0)+3;}
    return{text:d.text+(g.stage===4?' 粮仓终于修好，王守仓另包了三份干粮谢你。':''),tags:g.stage===4?[{t:'粮仓已修好',c:'gold'},{t:'干粮 +3',c:'up'}]:[{t:'粮仓一事有了下文',c:'up'}]};
  }
  function eventFor(s,id) {
    const p=place(id);if(!p)return null;ensure(s);const stage=s.town.qingshi.granary.stage;
    const actions={grain:stage===0?'inspect_granary':stage===3?'advance_wages':'',carpenter:stage===1?'repair_wood':'',forge:stage===2?'repair_iron':'',medicine:stage===3?'pay_medicine':''};
    const labels={inspect_granary:'跟王守仓去查看粮仓',repair_wood:'请鲁师傅修仓木',repair_iron:'请陈老三修铁件',pay_medicine:'替陈老三垫付药钱',advance_wages:'请王守仓先结工钱'};
    const action=actions[id];
    const title=id==='grain'&&stage<4?'粮仓漏雨':p.name;
    return{id:'town_qingshi_'+id+'_'+stage,title,seal:p.seal,text:()=>note(s,id),choices:()=>{
      const list=[];
      if(action){const cost=action==='pay_medicine'?2:0;list.push({id:action,label:labels[action],sub:cost?'灵石 −2 · 一日':'推进粮仓一事',disabled:!!(cost&&s.ls<cost),act:state=>choose(state,id,action)});}
      if(p.person){const c=person(p.person);list.push({id:'talk',label:c?'与'+c.short+'叙话':'在此叙话',sub:'一日 · 听听眼下的日子',act:()=>talk(s,p.person)});}
      else list.push({id:'observe',label:'在此看看',sub:'不耗时日',act:()=>({text:note(s,id),tags:[]})});
      return list;
    }};
  }
  return{ensure,places:LOCATIONS,contacts:CONTACTS,placeNote:note,eventFor,choose,talk};
})();
