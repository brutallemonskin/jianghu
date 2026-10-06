/* Narrative adapter. Game outcomes are calculated by the original handlers. */
window.JianghuDrama={version:'20261005',installed:false,install(){
if(this.installed)return;this.installed=true;
const D=window.JianghuDramaData,prepared=new WeakSet();
const plain=v=>readingPlain(v),read=v=>typeof v==='function'?v():String(v||'');
// Chinese punctuation inside a quotation must not split the speaker's sentence.
function sentences(text){const out=[];let buf='',depth=0;for(const c of String(text||'')){buf+=c;if(c==='“'||c==='「')depth++;if(c==='”'||c==='」')depth=Math.max(0,depth-1);if(!depth&&(/[。！？\n]/.test(c)||/[”」]/.test(c)&&/[。！？][”」]$/.test(buf))){if(buf.trim())out.push(buf.trim());buf='';}}if(buf.trim())out.push(buf.trim());return out;}
function stakes(old,opening){return sentences(plain(old)).filter(s=>/殒命|丧命|致死|经脉尽断|走火入魔|\d+\s*(?:两|银两)|十年一度|点到为止|不降级|本年|日常练功|盘缠不退|回满|门内身份|本世不再/.test(s)&&!opening.includes(s)&&!s.includes('得到眼前的好处')).join('\n');}
function prose(text){let groups=[],line='';for(const s of sentences(text)){if(line&&(line.length+s.length>105||/[“「]/.test(s))){groups.push(line);line='';}line+=s;}if(line)groups.push(line);return '<div class="drama-prose">'+groups.map(p=>'<p'+(/[“「]/.test(p)?' class="drama-dialogue"':'')+'>'+storyEscape(p)+'</p>').join('')+'</div>';}
function cleanNarrative(text){return String(text||'').replace('愿意同行的人，也要看你把时间留给了什么。听消息不等于已经替对方办完事情。','').replace('凭本领办理、花钱请人协助与暂时作别，会留下不同的合作经验；未完成的邀约仍可在重逢后继续。','').trim();}
function apply(ev,profile){if(!ev||!profile||prepared.has(ev))return ev;prepared.add(ev);const original=ev.text;ev.dramaProfile=profile;ev.text=()=>{const opening=typeof profile.opening==='function'?profile.opening():profile.opening;const extra=stakes(read(original),opening);return opening+(extra?'\n'+extra:'');};return ev;}
function profile(ev){return ev?.dramaProfile||D.events[ev?.id]||D.events[ev?.title];}
for(const ev of [...EVENTS,...SMALL_EVENTS,...REPLAY_EVENTS])apply(ev,profile(ev));
for(const ev of SCHOOL_EXAMS)apply(ev,{opening:()=>{const d=activeSchool(),rank=schoolExamRecord().rank;return (d?.name||'师门')+'的考功执事在名册上找到你，'+['抬头问名字是不是自己写的，叫你先把手心的汗擦干净。','认出你，笑说这回总不会找错演武场了，翻页时却一点没放宽要求。','把名册递给年轻弟子，自己起身试剑：“再往上走，可不只是你一个人的名声。”','将传功长老的衣袍留在台后，先请你出招。台下的后辈都在看，这最后一关仍须凭真本事。'][Math.min(3,rank)]+'你可以上场切磋，也能提交门务历练接受考评。';}});
for(const [id,patch]of Object.entries(D.companions)){const d=COMPANION_DIALOGUE[id];if(d){const {intro,jointLine,...lines}=patch;Object.assign(d,lines);COMPANIONS[id].intro=intro;d.joint.line=jointLine;d.joint.success=patch.help;
 d.joint.text=d.joint.text.replace(/(?:这段奔忙|辨认与拆解|核对账目|研读|辨认和送药)会占去[\s\S]*$/,'').trim()+'\n亲自办理占用本年日常练功；花'+d.joint.cost+'两雇熟手接应，则保留练功时日。';
}}
for(const [id,data]of Object.entries(D.chapters)){const def=JIANGHU_CHAPTERS[id],old=def.scenes;def.scenes=r=>old(r).map((s,i)=>{const p=data[i];return {...s,text:typeof p.opening==='function'?p.opening(r):p.opening,choices:s.choices.map((c,j)=>({...c,...p.choices[j]}))};});if(D.chapterInvitations[id])def.invitation=D.chapterInvitations[id];}
// Keep factual memories and expression selection; replace the lecture-like dialogue.
const originalReadingOutcome=readingOutcome;
readingOutcome=function(ev,index,text,phase){const data=originalReadingOutcome.apply(this,arguments);if(!data)return data;const failed=/判定失败|准备失败/.test(plain(text))||phase==='lose'||phase==='escape';const lines={
13:['饼分你一半。下回我要是没赶上晚课，你先给我留门，别替我说瞎话。','我没说不能救人。你们真当我只认那块门规？','替我出头我领情。可你再骂，他明日练剑只会更狠。'],
22:[failed?'认输倒快。起来，再看一遍你刚才退的那半步。':'这一招我记下了。下回，可别指望我还往这儿递。','他在院里等着呢。桥修好了，你自己回去跟他讲，别指望我替你赔笑。','你没来。他磨了两柄一样长的木剑，又自己收回去了。'],
28:[failed?'湿衣换了再说。今天没找着的，不能拿猜的补上。':'把账页给我。谁再说不必查，让他当着我的面说。','你肯护我，我知道。可我不想一辈子都只靠你一句“她不会”。','你要我等，我等了。如今又要我走，那我便走。'],
37:[failed?'先喘气，别说话。我叫你扶人，没叫你把自己也丢在那儿。':'都回头数数人。别忙着给我报喜，漏一个也去找。','别站那儿哭。带着他们走，走快些。','你把信物收好了。至于山上的人，今日便各顾各的罢。'],
57:[failed?'今天说不通，明天还来。茶叶贵，你们别只来一回。':'原来你们都有这么多话。我当师父的时候，怎么一个比一个闷？',failed?'钱不够就别硬撑。院子也不是非得今天修完。':'梁修牢些。青禾还要拿它挂药，裴照又嫌熏着剑。','信留下了就好。往后别总只写平安，写点你真过的日子。'],
77:['这三个都肯学，只是学得不一样。我替他们记着，慢慢来。','他答应的话，今天便要做。不必等学会剑再守信。','旧谱收好了。若孩子们问起您，我便叫他们先去练，别光羡慕。'],
95:['我记下了。可您输了那几回，我也想听。','信里吵过的架也留下，好不好？读着比门谱亲切。','那我明日下山。您别送，真别送，我认得路。']};return {...data,line:lines[ev.age]?.[index]||data.line,note:''};};
// Dedicated portrait scenes use the authored scene itself, not a second summary.
readingIntro=function(ev,opening){return readingMemory(ev)+prose(opening);};
worldReadingSentences=sentences;
worldReadingIntro=function(view){const memory=view.memory?'<details class="reading-memory drama-memory"><summary>'+storyEscape((view.age-view.memory.age)+'年前 · '+view.memory.title)+'</summary><p>'+storyEscape(view.memory.choice)+'<br>'+storyEscape(view.memory.fact)+'</p></details>':'';return memory+prose(cleanNarrative(view.opening));};
const format= formatEventResult;
formatEventResult=function(html){const template=document.createElement('template');template.innerHTML=format.apply(this,arguments);const root=template.content.firstElementChild,ctx=storyContext?.index>=0?storyContext:C?.cfg?.story,ev=ctx?.event,last=S?.flags?.readingWorld?.last,p=profile(ev)||(last&&D.events[last.title]),index=ctx?.index??last?.index;
 if(!p||!Number.isInteger(index)||S?.dead)return root.outerHTML;
 const source=plain(html),battleMatches=C?.over&&C?.cfg?.story?.event===ev&&C.cfg.story.index===index,failed=/判定失败/.test(source)||battleMatches&&['lose','escape'].includes(C.outcome);
 // Eligibility, unfinished learning and idempotency messages remain literal.
 if(/准备失败|购买失败|拜师失败|筹款失败|尚未|已(?:经)?结算|已答复|已记下|不能重复|暂未|未能学|没能学|未习得|未通过|未达成/.test(source))return root.outerHTML;
 const text=(failed?p.lose:p.win)?.[index];if(!text){if(!failed&&p.reactions?.[index])root.querySelector('.result-story')?.insertAdjacentHTML('beforeend',prose(p.reactions[index]));return root.outerHTML;}
 const story=root.querySelector('.result-story');if(!story)return root.outerHTML;
 const original=document.createElement('details');original.className='drama-resolution-detail';const summary=document.createElement('summary');summary.textContent='结算经过';original.append(summary);const originalBody=document.createElement('div');originalBody.append(...story.childNodes);original.append(originalBody);
 story.innerHTML=prose(text);root.append(original);return root.outerHTML;
};
const render=renderEvent;
renderEvent=function(ev){apply(ev,profile(ev));return render.apply(this,arguments);};
// Dynamic events retain their actual old clues, transactional rules and identities.
const thread=lifeThreadEvent;
lifeThreadEvent=function(key){const ev=thread.apply(this,arguments),t=lifeThreads().threads[key],later=t.stage===1;const line=key==='river'?(later?'年轻郎中给你留着一张凳子，一边问近况，一边还在替门外的病人叫号。“别嫌怠慢。”他说，“你当年救我，也没挑清闲时候。”':'年轻郎中指着眉上一道旧疤，说就是河灯那年磕的。你认了许久，他已经打开药箱：“这回轮到您把手给我。”'):key==='road'?(later?'女掌柜宁晚棠把联名信给你，先声明只写真事。“吹牛另算钱。”她说完又笑，“开玩笑，给钱也不替你吹。”':'宁晚棠见你进铺，先叫伙计多沏一杯。“别拿贵的唬人，他知道我当年穷成什么样。”她挪开账本，让出桌子的一半。'):(later?'杜横的弟子偷偷问，那场旧怨师父究竟输没输。你还没回答，他就先替师父补一句：“他喝了酒才讲，兴许说得不准。”':t.hostile?'杜横把酒坛重重放下：“上回的话我没服。今日不躲着说，你也别只顾给我讲道理。”':'杜横先倒了两碗，嘴上仍不认输：“上回那一掌收得还成。酒是谢你，不是服你。”');return apply(ev,{opening:()=>line+'\n'+read(ev.dramaOriginal||'')});};
const connection=connectionEvent;
connectionEvent=function(key){const ev=connection.apply(this,arguments);if(!ev)return ev;const old=ev.text,a=connectionState().arcs[key],line=D.dynamic.connections[key]?.[a.step];return apply(ev,{opening:()=>{const text=read(old),extra=sentences(text).filter(s=>/当年|你带来|原单|尚有疑|义仓的船工|查案后|共守过|残碑考证|核实过|仍有几行|当初/.test(s)).join('');return line+'\n'+extra;}});};
const follow=decisionFollowup;
decisionFollowup=function(key){const ev=follow.apply(this,arguments);if(!ev)return ev;const a=decisionState().arcs[key],line=D.dynamic.decisions[key]?.[a.step];return apply(ev,{opening:()=>decisionOldFact(DECISION_ARCS[key].kind)+'\n'+line+(a.lastOk===false?'\n上一次事情没有办成，这回仍须补上缺口。':'')});};
const path=lifePathEvent;
lifePathEvent=function(phase){const ev=path.apply(this,arguments),g=lifeThreads().offered.goal;return apply(ev,{opening:D.dynamic.paths[g][phase]+'\n'+LIFE_GOALS[g].texts[phase]});};
const daily=schoolDailyEvent;
schoolDailyEvent=function(id,kind){const ev=daily.apply(this,arguments),d=D.schools[id],f=SCHOOL_DAILY_FLAVOR[id];const remarks={duty:{zhengpai:'陆青禾把工具塞来：“站着也帮不上，先搭把手。”',shaolin:'行远把袖子挽高：“今天真没偷懒，你来得晚。”',wudang:'宋听松递来茶，又把茶收回：“先干完，省得你说烫。”',emei:'闻溪嘴上催，手却先替你挑好了顺手的工具。',gaibang:'阿篱把人数一数：“多你一个，大家就能早些歇。”',tangmen:'唐小满递出图纸，先指给你看怎么停机。',qingcheng:'林照竹把自己的衣角扎紧，这回没嫌泥脏。',diancang:'白砚想抢最重的，被你看了一眼才肯分出半边。',kunlun:'祁望舒给你留了干手套，东西放下便开始做事。',kongtong:'孟石先动了动旧伤的腿，这回没有再硬说无事。',xiaoyao:'叶听雨哼着新曲，说这次保证做完再去听回音。',mojiao:'谢红绡笑说帮完会记账，清单倒一项也没瞒你。'},peer:{zhengpai:'对方把两柄练习剑比齐：“这回可别怪兵刃。”',shaolin:'行远摸摸后脑：“我若失手，你记得喊停。”',wudang:'宋听松说不急，脚下却已换好了步。',emei:'闻溪把药放到场边：“备着。别因这个就乱来。”',gaibang:'阿篱将碗拿远，说输了也不许拿饭钱抵。',tangmen:'唐小满朝空地试过机关，才叫你入场。',qingcheng:'林照竹扫平沙地，连双方站处都一样宽。',diancang:'白砚说先打再叙旧，嘴上却已问起你一路近况。',kunlun:'祁望舒横剑等你，见你站稳才点头。',kongtong:'孟石攥拳又松开：“点到便收，我记着呢。”',xiaoyao:'叶听雨把琴放在剑够不到的地方，才笑着来邀。',mojiao:'谢红绡把退路指给你：“切磋而已，别真跑没影。”'}};return apply(ev,{opening:f[kind==='duty'?1:kind==='peer'?4:6]+'\n'+(remarks[kind]?.[id]||d.peer+'核过约定的时辰，先将接应的信号告诉你。不是去练招，这一趟真会碰上拦路的人。')});};
const encounter=makeEncounter;
makeEncounter=function(en){const ev=encounter.apply(this,arguments);return apply(ev,{opening:D.dynamic.enemies[en.name]||en.intro});};
const merchant=merchantEvent;
merchantEvent=function(){const ev=merchant.apply(this,arguments),kind=S.flags.merchant.kind;return apply(ev,{opening:({wares:'货郎把担子一放，先夸你眼光好。你还没看，他又改口：“一瞧就是识货的。旧物也收，别把舍不得扔的都往我这儿倒。”',books:'书商替旧卷掸灰，掸出一脸心疼。你问有没有真本事，他把书合上：“真假要验，纸也要钱。先看货，再议价。”',rare:'行商揭开货箱一角便等你神色，见你不动声色，才把盖子全打开。“看来是见过好的。”他说，“那便别在凡品上费工夫。”'})[kind]+'每件货只备一份，价格以货单为准；也可出售闲置物品，或付钱换一批货。'});};
const moral=moralEvent;
moralEvent=function(key){const ev=moral.apply(this,arguments);return apply(ev,{opening:{purse:'驿站门槛下躺着一包银子，封签上是赈济村落的名字。押镖人还在街那头找，急得鞋都掉了一只。没人看到你拾起钱袋，封口的绳很容易解开。',trust:'乡人把义仓的钱交给你，老妇硬要点清，村长却说大侠还能骗咱们？她把算盘抱紧，声音低了些：“银子是大家凑的，总该点清。”',debt:'索账人进客栈先看你的兵刃，又把封签铺好：“今日不争江湖名声，只说这笔钱。”掌柜想替你圆场，他摇摇头，说家里不能再等了。'}[key]});};
this.sentences=sentences;this.prose=prose;this.profile=profile;this.apply=apply;
const style=document.createElement('style');style.textContent=`.drama-prose{font-family:"Microsoft YaHei","PingFang SC",system-ui,sans-serif;font-size:17px;line-height:1.85;color:inherit;max-width:52em}.drama-prose p{margin:.1em 0 .7em}.drama-prose p:last-child{margin-bottom:0}.drama-dialogue{font-weight:500}.drama-memory{font-size:13px;margin-bottom:12px}.drama-memory summary{cursor:pointer}.drama-resolution-detail{font-size:13px;opacity:.8;margin-top:12px}.drama-resolution-detail summary{cursor:pointer}.drama-resolution-detail>div{margin-top:8px;line-height:1.7}@media(max-width:600px){.drama-prose{font-size:16px;line-height:1.8}.drama-prose p{margin-bottom:.6em}}`;document.head.append(style);
}};
