(function(root,factory){const v=factory(typeof module==='object'&&module.exports?require('./run-core'):root.MemeRun,typeof module==='object'&&module.exports?require('./run-data'):root.MemeRunData);if(typeof module==='object'&&module.exports)module.exports=v;else root.MemeRunView=v;})(globalThis,function(C,D){
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={damage:'M5 19 18 6M12 5h7v7M4 14l6 6',block:'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6Z',heal:'M12 20S3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 12-9 12ZM8 11h8m-4-4v8',hurt:'M12 20S3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 12-9 12ZM8 11h8',draw:'M7 3h12v15H7ZM4 7v14h11',energy:'m14 2-9 12h6l-1 8 9-13h-6Z',poison:'M7 4h10M9 4v5l-5 8q-1 3 2 3h12q3 0 2-3l-5-8V4M7 15h10',weak:'M12 3v16m-6-6 6 6 6-6M4 4h3m10 0h3',dispel:'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6ZM4 20 20 4',coin:'M21 12a9 9 0 1 0-18 0 9 9 0 0 0 18 0ZM9 8h6v8H9Z',relic:'m12 3 9 7-9 11L3 10ZM3 10h18M8 10l4 11 4-11',clue:'M6 3h12v18H6ZM9 7h6m-6 5h6m-6 5h4',upgrade:'M12 21V4m-6 6 6-6 6 6'};
function icon(kind){return `<svg class="effect-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[kind]||paths.draw}"/></svg>`;}
function cardEffects(v){return C.cardEffects(v).map(e=>`<span class="effect-item ${e.kind}"><span class="effect-line">${icon(e.kind)}<span>${esc(e.before)}${e.value!==''?` <b>${esc(e.value)}</b> `:''}${esc(e.after)}</span></span>${e.hint?`<span class="effect-rule">${esc(e.hint)}</span>`:''}</span>`).join('')+(v.bonusNote?`<span class="effect-rule live-bonus">已计入${esc(v.bonusNote)}</span>`:'');}
// Card faces answer “what will this play do?”; reusable rules live in inspection.
function cardFaceEffects(v){
 const a=[],add=(kind,text)=>a.push(`<span class="effect-item ${kind}"><span class="effect-line">${icon(kind)}<span>${text}</span></span></span>`),n=x=>`<b>${x}</b>`;
 if(v.dispel)add('dispel','清空敌人护盾');
 if(v.damage)add('damage',v.hits?`造成 ${n(v.damage)}×${n(v.hits)} 伤害`:`造成 ${n(v.damage)} 点伤害`);
 if(v.block)add('block',`获得 ${n(v.block)} 点护盾`);
 if(v.heal)add('heal',`恢复 ${n(v.heal)} 点生命`);
 if(v.hurt)add('hurt',`自身失去 ${n(v.hurt)} 生命`);
 if(v.poison)add('poison',`施加 ${n(v.poison)} 层洗脑`);
 if(v.weak)add('weak',`施加 ${n(v.weak)} 回合虚弱`);
 if(v.energy)add('energy',`获得 ${n(v.energy)} 点能量`);
 if(v.draw)add('draw',`抽 ${n(v.draw)} 张牌`);
 if(v.detonate)add('poison','额外结算一次洗脑');
 const notes=[];
 if(v.pierce)notes.push('无视护盾');
 if(v.fromBlock)notes.push(v.blockBonus!==undefined?`含护盾加成 +${v.blockBonus}`:'另加自身护盾的一半');
 if(v.chainBonus)notes.push(v.chainReady?'连招已生效':`先出2张：每段再 +${v.chainBonus}`);
 if(v.counterRatio)notes.push(`本回合反弹挡伤的${Math.round(v.counterRatio*100)}%`);
 if(v.retainBlock)notes.push(`下回合留盾 ≤${v.retainBlock}`);
 return a.join('')+notes.map(t=>`<span class="card-condition">${esc(t)}</span>`).join('');
}
function line(kind,text,loss=false){return `<span class="outcome-line ${kind}${loss?' loss':''}">${icon(kind)}<span>${esc(text)}</span></span>`;}
function costMarkup(s,op,compact=false){const a=[];
 if(op.coins)a.push(line('coin',op.coins<0?`支付${-op.coins}枚硬币`:`获得${op.coins}枚硬币`,op.coins<0));
 if(op.hurt)a.push(line('hurt',`失去${op.hurt}点生命`,true));
 if(op.heal||op.fullHeal){const gain=Math.min(80-s.hp,op.fullHeal?80:op.heal);a.push(line('heal',gain?`恢复${gain}点生命${op.fullHeal?'（回满）':''}`:'生命已满，无需恢复'));}
 if(op.card)a.push(line('draw',`加入卡牌「${D.cards[op.card].name}」`));
 if(op.remove)a.push(line('draw',`移除一张「${D.cards[op.remove].name}」`));
 if(op.upgrade)a.push(line('upgrade','选择一张牌强化，本局生效'));
 if(op.relic)a.push(line('relic',s.relics.includes(op.relic)?'重复梗物换成12枚硬币':`获得梗物「${D.relics[op.relic].name}」`));
 if(op.clue)a.push(line('clue','获得一份女神的证据'));
 const html=a.join('');return compact?html.replace(/枚硬币/g,'硬币').replace(/点生命/g,'生命').replace(/加入卡牌「/g,'获得「').replace(/选择一张牌强化，本局生效/g,'强化一张牌').replace(/获得一份女神的证据/g,'获得女神证据'):html;
}
// Old saves keep result strings: normalize their display without migrating storage.
function rewardMarkup(text){let t=text,kind='clue',loss=false,m;
 if((m=text.match(/^(硬币|生命) ([+-])(\d+)$/))){loss=m[2]==='-';kind=m[1]==='硬币'?'coin':loss?'hurt':'heal';t=(m[1]==='硬币'?(loss?'支付':'获得'):(loss?'失去':'恢复'))+m[3]+(m[1]==='硬币'?'枚硬币':'点生命');}
 else if((m=text.match(/^(加入牌组|移除|获得|证据|强化) · (.+)$/))){kind=m[1]==='获得'?'relic':m[1]==='证据'?'clue':m[1]==='强化'?'upgrade':'draw';t=({'加入牌组':'卡牌已加入：','移除':'已移除卡牌：','获得':'获得梗物：','证据':'获得证据：','强化':'卡牌已强化：'})[m[1]]+m[2];}
 else if(text==='重复梗物换成12硬币'){kind='coin';t='重复梗物换成12枚硬币';}
 return line(kind,t,loss);
}
function logMarkup(text){return esc(text).replace(/(\d+)(点生命|点护盾|点伤害|点能量|张牌|回合|层)/g,'<b>$1</b>$2');}
const glossary=[['block','护盾','每1点护盾抵挡1点攻击伤害。你的剩余护盾在下回合开始时清空（卡牌注明保留的部分除外）；敌人的护盾在它行动时重新设置。'],['damage','伤害与穿透','攻击先扣敌人护盾，剩余部分才扣生命。「无视护盾」直接扣生命。多段攻击逐次结算，每一段都可能被护盾抵挡。'],['poison','洗脑','敌人每次行动前，失去等于当前层数的生命，无视护盾，然后减少1层。可叠加，上限30层。'],['weak','虚弱','降低敌人25%的攻击伤害，向下取整。每次敌人行动后减少1回合，叠加后最多持续4回合。'],['energy','能量','左上角数字是出牌需要支付的能量。每回合恢复为3点，剩余能量不保留。0费牌也可以在能量用完时打出。'],['draw','抽牌、弃牌与移出本场','手牌最多10张，超出时停止抽牌。用过或回合结束时没用的牌进入弃牌堆，抽牌堆空了便洗回。「本场仅用一次」的牌进入移出区，下场战斗恢复。']];
function glossaryMarkup(){return '<div class="effect-glossary">'+glossary.map(([k,t,d])=>`<article>${icon(k)}<div><h3>${t}</h3><p>${d}</p></div></article>`).join('')+'</div>';}
return{icon,cardEffects,cardFaceEffects,costMarkup,rewardMarkup,logMarkup,glossaryMarkup};
});
