(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./run-data'):root.MemeRunData,typeof module==='object'&&module.exports?require('./run-core'):root.MemeRun,typeof module==='object'&&module.exports?require('./run-view'):root.MemeRunView,typeof module==='object'&&module.exports?require('./run-events'):root.MemeEventScenes);if(typeof module==='object'&&module.exports)module.exports=api;else root.MemeEventView=api;})(globalThis,function(D,C,V,S){
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cardIds=Object.keys(D.cards);
function thumb(op){const id=op.card||op.remove;if(id){const i=cardIds.indexOf(id);return `<span class="event-thumb card-art" style="--art-x:${i%5*25}%;--art-y:${Math.floor(i/5)*25}%" aria-hidden="true"></span>`;}return `<span class="event-thumb symbol-thumb" aria-hidden="true">${V.icon(op.relic?'relic':op.upgrade?'upgrade':op.clue?'clue':op.heal||op.fullHeal?'heal':op.coins?'coin':'draw')}</span>`;}
function amounts(s,op){const parts=[],add=(kind,text,bad=false)=>parts.push(`<span class="event-amount ${kind}${bad?' loss':''}">${V.icon(kind)}${esc(text)}</span>`);
 if(op.coins)add('coin',(op.coins>0?'+':'−')+Math.abs(op.coins)+' 硬币',op.coins<0);
 if(op.hurt)add('hurt','−'+op.hurt+' 生命',true);
 if(op.heal||op.fullHeal){const gain=Math.min(80-s.hp,op.fullHeal?80:op.heal);add('heal',gain?'+'+gain+' 生命':'生命已满');}
 if(op.remove)add('draw','移除「'+D.cards[op.remove].name+'」');
 if(op.card)add(D.cards[op.card].curse?'hurt':'draw',(D.cards[op.card].curse?'负担：':'＋')+D.cards[op.card].name,!!D.cards[op.card].curse);
 if(op.relic)add('relic',s.relics.includes(op.relic)?'重复 → 12硬币':'＋'+D.relics[op.relic].name);
 if(op.clue)add('clue',s.clues.includes(op.clue)?'证据已留存':'＋证据');
 if(op.upgrade)add('upgrade','强化一张牌');
 return parts.join('');
}
function option(s,c,i,label=c.label){const why=C.available(s,c.op),item=c.op.card||c.op.relic||c.op.remove;return `<article class="event-option${why?' unavailable':''}"><button data-choice="${i}" ${why?'disabled':''} class="event-action">${thumb(c.op)}<span class="event-option-copy"><strong>${esc(label)}</strong><span class="event-amounts">${amounts(s,c.op)}</span>${why?`<span class="event-unavailable">${esc(why)}</span>`:''}</span><span class="event-arrow" aria-hidden="true">›</span></button>${item?`<button class="event-item-info" data-event-option="${i}" aria-label="查看这个选项的物品详情">i</button>`:''}</article>`;}
function loot(text){let op={},label=text,item=null,kind='clue';const m=text.match(/^(加入牌组|移除|获得|证据|强化) · (.+)$/),num=text.match(/^(硬币|生命) ([+-])(\d+)$/);if(m){const name=m[2].replace(/＋$/,'');if(['加入牌组','移除','强化'].includes(m[1])){const id=cardIds.find(id=>D.cards[id].name===name);if(id){op={card:id};item=(m[1]==='强化'?'card+:':'card:')+id;}kind=m[1]==='强化'?'upgrade':'draw';label=(m[1]==='移除'?'移除 ':'')+m[2];if(m[1]==='加入牌组'&&id&&D.cards[id].curse){kind='burden';label='负担：'+m[2];}}else if(m[1]==='获得'){const id=Object.keys(D.relics).find(id=>D.relics[id].name===m[2]);op={relic:id};item=id?'relic:'+id:null;label=m[2];kind='relic';}else{op={clue:true};label='证据已收好';kind='clue';}}
 if(num){kind=num[1]==='硬币'?'coin':num[2]==='-'?'hurt':'heal';label=(num[2]==='-'?'−':'+')+num[3]+' '+num[1];}
 if(text==='重复梗物换成12硬币'){kind='coin';label='+12 硬币（重复梗物）';}
 const media=m&&!num?thumb(op):`<span class="loot-symbol">${V.icon(kind)}</span>`;
 return `<${item?'button':'span'} class="event-loot ${kind}${num?.[2]==='-'?' loss':''}" ${item?`data-event-item="${item}"`:''}>${media}<span>${esc(label)}</span>${item?'<span class="loot-info" aria-hidden="true">i</span>':''}</${item?'button':'span'}>`;
}
function render(s){const e=C.event(s),n=C.node(s),m=S.get(e,n.chapter),result=s.phase==='result',r=s.result;
 const quote=result?r.text:m.quote,context=result?'':m.context;
 return `<section class="event-table${result?' is-result':''}" aria-label="${esc(m.title)}"><header class="event-heading"><div><small>${e.boss?'章末挑战':String(s.completedEvents+(result?0:1)).padStart(2,'0')+' / 30'}</small><h1>${esc(m.title)}</h1></div><button class="event-life" data-menu="health" aria-label="生命${s.hp}/80">${V.icon('heal')}<b>${s.hp}</b><span>/80</span></button><button class="event-context" data-menu="event-context" aria-label="查看事件完整叙述">⋯</button></header><div class="event-picture" role="img" aria-label="${esc(m.title)}的场景插画"><div class="event-art" style="--scene-x:${m.scene%3*50}%;--scene-y:${Math.floor(m.scene/3)*50}%"></div><div class="event-vignette"></div>${context?`<p class="event-context-line">${esc(context)}</p>`:''}</div><div class="event-speech" aria-live="polite"><span class="event-speaker">${result?'你的选择之后':esc(m.speaker)}</span><p>${esc(quote)}</p></div>${result?`<div class="event-settlement"><div class="event-loot-tray">${r.rewards.map(loot).join('')}</div><button class="primary event-continue" data-do="continue">继续赶路 <span aria-hidden="true">→</span></button></div>`:`<div class="event-options">${e.boss?`<article class="event-option"><button class="event-action boss-action" data-choice="0"><span class="symbol-thumb event-thumb">${V.icon('damage')}</span><strong>${n.chapter===3?'挑战光之巨人':'上场，会会它'}</strong><span class="event-arrow">›</span></button></article>${n.chapter===3?'<article class="event-option"><button class="event-action boss-action" data-choice="1"><span class="symbol-thumb event-thumb">'+V.icon('damage')+'</span><strong>挑战怪兽</strong><span class="event-arrow">›</span></button></article>':''}`:e.choices.map((c,i)=>option(s,c,i,S.actions[e.id]?.[i])).join('')}</div>`}</section>`;
}
return{render,amounts,loot};
});
