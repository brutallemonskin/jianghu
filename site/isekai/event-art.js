(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MemeEventArt=api;})(globalThis,function(){
'use strict';
const packs=[
  {
    "file": "village-v2",
    "ids": [
      "summon",
      "thursday",
      "wang",
      "manual",
      "salary",
      "delivery",
      "euclid",
      "wifi",
      "homework",
      "bell"
    ]
  },
  {
    "file": "forest-v2",
    "ids": [
      "haki",
      "green",
      "banana",
      "doge",
      "capy",
      "mushroom",
      "sleep",
      "owl",
      "honeyjar",
      "orange"
    ]
  },
  {
    "file": "court-v2",
    "ids": [
      "courtfile",
      "kun",
      "bench",
      "var",
      "sponsor",
      "fanclub",
      "overtimeball",
      "ankle",
      "trash",
      "mvp"
    ]
  },
  {
    "file": "city-v2",
    "ids": [
      "edit",
      "light",
      "transform",
      "beam",
      "bus",
      "helmet",
      "camera",
      "monsterfood",
      "foam",
      "ticket"
    ]
  },
  {
    "file": "office-v2",
    "ids": [
      "archive",
      "ppt",
      "meeting",
      "salarytwo",
      "toilet",
      "code",
      "coffee",
      "badge",
      "printer",
      "resign"
    ]
  },
  {
    "file": "finale-v2",
    "ids": [
      "comment",
      "version",
      "keyboard",
      "rumor",
      "blindbox",
      "lastmeal",
      "flag",
      "coupon",
      "healthbar",
      "godlike"
    ]
  }
];
// Generated atlas boundaries are measured, rather than assuming a mathematically exact grid.
// The 3px inset prevents neighboring scenes from leaking through fractional CSS scaling.
const rowCuts={'village-v2':[0,307,597,904,1194,1536],'forest-v2':[0,307,605,899,1189,1536],'court-v2':[0,307,614,922,1198,1536],'city-v2':[0,306,614,922,1214,1536],'office-v2':[0,305,596,893,1176,1536],'finale-v2':[0,307,614,921,1213,1536]};
const entries=Object.fromEntries(packs.flatMap(p=>p.ids.map((id,index)=>{const cuts=rowCuts[p.file]||[0,307.2,614.4,921.6,1228.8,1536],r=Math.floor(index/2),frame={x:index%2*512+3,y:cuts[r]+3,width:506,height:cuts[r+1]-cuts[r]-6};return[id,{src:'assets/events/'+p.file+'.webp',columns:2,rows:5,ratio:frame.width/frame.height,index,frame,width:1024,height:1536}];})));
function get(id,fallback=0){return entries[id]||{src:'assets/events/event-scenes-v1.webp',columns:3,rows:3,ratio:1.5,index:fallback};}
function style(a){const f=a.frame,size=f?a.width/f.width*100+'% '+a.height/f.height*100+'%':a.columns*100+'% '+a.rows*100+'%',x=f?f.x/(a.width-f.width)*100:a.index%a.columns/(a.columns-1)*100,y=f?f.y/(a.height-f.height)*100:Math.floor(a.index/a.columns)/(a.rows-1)*100;return "--scene-src:url('"+a.src+"');--scene-size:"+size+';--scene-ratio:'+a.ratio+';--scene-x:'+x+'%;--scene-y:'+y+'%';}
return{packs,entries,get,style};
});
