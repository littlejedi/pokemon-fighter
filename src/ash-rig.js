// Editable side-profile cutout rig. Coordinates are artwork units, origin at the floor.
// All limbs are two bones with fixed lengths; IK preserves their lengths in every pose.
export const RIG_HEIGHT=286;
export const CELL={width:420,height:330,rootX:160,baseline:305};
export const CLIPS={idle:{duration:1.2,loop:true},walk:{duration:.72,loop:true},punch:{duration:.48,contact:.18},kick:{duration:.7,contact:.3},guard:{duration:1,loop:true},hurt:{duration:.3},jump:{duration:.6},command:{duration:.65},special:{duration:.65,contact:.24}};
const base={hip:[0,-128],lean:7,nearHand:[45,-203],farHand:[27,-232],nearFoot:[38,-12],farFoot:[-38,-12],shoe:0};
const key=(t,v)=>({t,...v});
const punch=[key(0,{}),key(.055,{lean:-9,nearHand:[-2,-196],hip:[-7,-127]}),key(.12,{lean:13,nearHand:[61,-209],hip:[2,-129]}),key(.18,{lean:27,nearHand:[136,-213],hip:[8,-128],farHand:[49,-236]}),key(.28,{lean:23,nearHand:[132,-211],hip:[8,-128],farHand:[48,-235]}),key(.37,{lean:10,nearHand:[56,-204],hip:[1,-128]}),key(.48,{})];
const kick=[key(0,{}),key(.105,{hip:[-14,-130],lean:-7,nearFoot:[27,-22],nearHand:[37,-222]}),key(.21,{hip:[-10,-130],lean:-17,nearFoot:[27,-100],nearHand:[23,-224],shoe:-25}),key(.3,{hip:[-6,-130],lean:-26,nearFoot:[129,-152],nearHand:[14,-231],farHand:[-42,-214],shoe:-12}),key(.42,{hip:[-6,-130],lean:-24,nearFoot:[129,-150],nearHand:[16,-230],farHand:[-40,-210],shoe:-12}),key(.55,{hip:[-8,-130],lean:-11,nearFoot:[30,-99],nearHand:[31,-224],shoe:-25}),key(.7,{})];
const mix=(a,b,t)=>Array.isArray(a)?a.map((x,i)=>mix(x,b[i],t)):a+(b-a)*t;
function tween(keys,t){let i=0;while(i<keys.length-2&&t>keys[i+1].t)i++;const a={...base,...keys[i]},b={...base,...keys[i+1]},u=Math.max(0,Math.min(1,(t-a.t)/(b.t-a.t))),v=u*u*(3-2*u);return Object.fromEntries(Object.keys(base).map(k=>[k,mix(a[k],b[k],v)]))}
export function ik(a,target,l1,l2,bend=1){const dx=target[0]-a[0],dy=target[1]-a[1],raw=Math.hypot(dx,dy),d=Math.max(.01,Math.min(l1+l2-.01,raw)),ux=dx/(raw||1),uy=dy/(raw||1),q=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-q*q));return [a,[a[0]+ux*q-uy*h*bend,a[1]+uy*q+ux*h*bend],[a[0]+ux*d,a[1]+uy*d]]}
export function poseAt(clip,time){
 const spec=CLIPS[clip]||CLIPS.idle,t=spec.loop?time%spec.duration:Math.min(time,spec.duration);let p={...base};
 if(clip==='punch'||clip==='special')p=tween(punch,clip==='special'?t*.48/.65:t);
 else if(clip==='kick')p=tween(kick,t);
 else if(clip==='walk'){const a=t/.72*Math.PI*2;p={...base,hip:[0,-130+Math.cos(a*2)*3],lean:10,nearFoot:[Math.cos(a)*43,-12-Math.max(0,Math.sin(a))*20],farFoot:[-Math.cos(a)*43,-12-Math.max(0,-Math.sin(a))*20],nearHand:[35-Math.cos(a)*19,-201],farHand:[24+Math.cos(a)*19,-221]}}
 else if(clip==='guard')p={...base,hip:[-5,-123],lean:-7,nearHand:[32,-247],farHand:[36,-232]};
 else if(clip==='hurt')p={...base,hip:[-8,-127],lean:-25,nearHand:[-13,-184],farHand:[13,-211]};
 else if(clip==='jump')p={...base,hip:[0,-139],lean:4,nearFoot:[53,-52],farFoot:[-30,-47],nearHand:[41,-239]};
 else if(clip==='command')p=tween(punch,Math.min(.18,t*.9));
 else {const b=Math.sin(t/1.2*Math.PI*2)*1.6;p={...base,hip:[0,-128+b],nearHand:[45,-203+b],farHand:[27,-232+b]}}
 const hip=p.hip,shoulder=[hip[0]+p.lean,hip[1]-78];
 const bones={nearArm:ik([shoulder[0]+5,shoulder[1]+7],p.nearHand,54,48,1),farArm:ik([shoulder[0]-8,shoulder[1]+6],p.farHand,54,48,1),nearLeg:ik([hip[0]+7,hip[1]],p.nearFoot,67,65,-1),farLeg:ik([hip[0]-9,hip[1]],p.farFoot,67,65,-1)};
 return {...p,shoulder,bones};
}
const ink='#202b3c',skin='#efb98d',shade='#cf8f6b';
const path=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const group=(id,x,y,angle,body)=>`<g id="${id}" transform="translate(${x.toFixed(3)} ${y.toFixed(3)}) rotate(${angle.toFixed(3)})">${body}</g>`;
function segment(id,a,b,body){return group(id,...a,Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI,body)}
function arm(id,bones,far){const [a,b,c]=bones,col=far?'#d49b78':skin;
 return `<g id="${id}">`+segment(id+'-upper',a,b,
 path('M -5 -12 Q 9 -19 25 -12 L 53 -8 Q 62 -1 53 8 L 18 11 Q -3 12 -5 -12 Z',col)+
 path('M -8 -14 Q 5 -20 20 -13 L 26 -8 L 21 13 Q 5 15 -6 8 Z',far?'#b6c2ce':'#f1f1e7')+
 path('M 18 10 L 22 -8','none','stroke="#929eaa" stroke-width="1.5"'))+
 segment(id+'-forearm',b,c,path('M -5 -8 Q 6 -10 17 -7 L 44 -6 Q 50 -4 49 4 L 39 8 L 4 8 Q -5 7 -5 -8 Z',col)+path('M 6 6 L 41 5 L 44 8 L 5 8 Z',far?'#b8795d':shade,'stroke="none"'))+
 group(id+'-fist',...c,0,path('M -5 -8 L 4 -11 Q 10 -12 12 -8 L 16 -5 L 17 4 Q 14 10 7 9 L -3 5 Z',col)+path('M 5 -9 L 6 -3 M 10 -7 L 11 -2 M -3 0 Q 2 -3 6 1','none','stroke-width="1.2"'))+'</g>';
}
function leg(id,bones,far,shoe){const [a,b,c]=bones;return `<g id="${id}">`+
 segment(id+'-thigh',a,b,path('M -8 -19 Q 17 -23 46 -14 L 49 15 Q 23 18 0 17 Z',far?'#343e5d':'#485478')+path('M 9 -16 L 43 -10 L 44 -1 L 21 -3 Z',far?'#414b69':'#5b6688','stroke="none"')+path('M 45 -12 L 45 12','none','stroke="#242e49" stroke-width="2"')+path('M 48 -11 L 65 -9 Q 74 -3 65 10 L 49 12 Z',far?'#cb9372':skin))+
 segment(id+'-shin',b,c,path('M -5 -10 Q 14 -12 32 -8 L 64 -6 L 65 7 L 31 9 L 0 10 Z',far?'#cb9372':skin)+path('M 11 7 L 61 4 L 65 7 L 31 9 L 5 9 Z',shade,'stroke="none"'))+
 group(id+'-shoe',...c,shoe,path('M -10 -8 L 7 -8 L 12 -1 L 28 4 Q 33 6 33 13 L 9 17 L -11 13 Z',far?'#245c89':'#2d82b6')+path('M 8 1 L 26 4 Q 31 6 32 11 L 9 13 L 4 6 Z','#2c3949')+path('M -10 10 L 9 13 L 32 10 L 33 15 L 10 20 L -12 16 Z','#e0e5e6')+path('M -4 -5 L 7 4 M 6 -5 L -3 3','none','stroke="#f4f1e6" stroke-width="2.5"'))+'</g>'}
function torso(p){const [hx,hy]=p.hip,[sx,sy]=p.shoulder;return `<g id="torso">`+
 path(`M ${sx-18} ${sy-7} Q ${sx-28} ${sy+15} ${hx-22} ${hy-3} L ${hx+22} ${hy+2} Q ${sx+29} ${sy+34} ${sx+18} ${sy-4} Z`,'#f3efdf')+
 path(`M ${sx-8} ${sy+33} L ${sx+25} ${sy+34} L ${hx+25} ${hy-30} L ${hx-9} ${hy-32} Z`,'#d64b43','stroke="none"')+
 path(`M ${sx-16} ${sy-10} L ${sx+1} ${sy-4} L ${hx-2} ${hy+5} L ${hx-29} ${hy+3} Q ${hx-19} ${hy-36} ${sx-25} ${sy+12} Z`,'#236cad')+
 path(`M ${sx-15} ${sy+5} L ${sx-5} ${sy+4} L ${hx-8} ${hy-7} L ${hx-23} ${hy-7} Z`,'#3b8bc9','stroke="none"')+
 path(`M ${sx+17} ${sy-8} L ${sx+23} ${sy+3} L ${hx+29} ${hy+4} L ${hx+19} ${hy+5} Z`,'#246bb0')+
 path(`M ${sx+1} ${sy-4} L ${hx-2} ${hy+5} M ${sx+17} ${sy-6} L ${hx+19} ${hy+4}`,'none','stroke="#e8c766" stroke-width="3"')+
 path(`M ${hx-24} ${hy-22} L ${hx-7} ${hy-23} L ${hx-8} ${hy-7} L ${hx-25} ${hy-7} Z`,'#266ba8','stroke-width="1.4"')+'</g>'}
function head(p){return group('head',p.shoulder[0]+1,p.shoulder[1]-29,-p.lean*.11,
 path('M -9 16 L 9 17 L 10 34 Q 0 38 -9 28 Z',skin)+
 path('M -19 -12 L -26 1 L -20 9 L -25 17 L -15 19 L -20 28 L -3 23 L 5 12 L 5 -15 Z','#172b3d')+
 path('M -7 -21 Q 10 -27 22 -15 L 22 -1 L 31 6 Q 33 9 23 10 L 24 18 Q 19 25 10 27 L -3 22 L -10 8 Z',skin)+
 path('M -4 15 Q 10 23 23 16 L 23 20 L 10 27 L -3 22 Z',shade,'stroke="none"')+
 path('M -12 -13 L 10 -18 L 15 -10 L 6 1 L 4 -8 L -3 7 L -7 1 L -12 6 Z','#172b3d')+
 path('M -8 1 Q -17 -4 -16 6 Q -15 14 -7 12 Z',skin)+path('M -12 3 Q -8 3 -10 8','none','stroke="#a96954" stroke-width="1.4"')+
 path('M 12 -6 Q 17 -10 21 -5 L 20 5 Q 17 10 13 5 Z','#fff8e8','stroke-width="1.5"')+
 '<ellipse cx="18" cy="0" rx="2.5" ry="5" fill="#654831" stroke="none"/><ellipse cx="19" cy="-1" rx="1.2" ry="3.4" fill="#172637" stroke="none"/><circle cx="19" cy="-3" r="1.1" fill="white" stroke="none"/>'+
 path('M 11 -10 L 21 -9 M 19 15 L 24 14 M 5 11 L 8 13 M 4 14 L 7 16','none','stroke-width="1.5"')+
 path('M -23 -16 Q -24 -40 -4 -45 Q 12 -49 23 -35 L 26 -18 L 10 -15 Z','#d93e3e')+
 path('M -22 -28 Q -19 -41 -4 -45 L -2 -20 L -22 -16 Z','#b92735','stroke="none"')+
 path('M 4 -43 Q 17 -42 22 -32 L 24 -20 L 5 -18 Z','#f1eee4')+
 path('M -23 -17 Q 1 -23 26 -19 L 46 -12 Q 48 -8 40 -8 L 16 -10 L -2 -10 Z','#d43b3e')+
 path('M -20 -17 Q 6 -21 25 -18','none','stroke="#f17b62" stroke-width="2"')+
 path('M 11 -35 L 17 -34 L 17 -30 L 12 -30 L 10 -27 L 7 -29 Z','#378e65','stroke="none"'))}
export function characterSvg(p,debug=false){let out=`<g stroke="${ink}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">`+leg('far-leg',p.bones.farLeg,true,0)+arm('far-arm',p.bones.farArm,true)+leg('near-leg',p.bones.nearLeg,false,p.shoe)+torso(p)+head(p)+arm('near-arm',p.bones.nearArm,false)+'</g>';
 if(debug)out+='<g stroke="#ffcf64" stroke-width="1.5" fill="#10283c">'+Object.values(p.bones).map(b=>`<polyline fill="none" points="${b.map(a=>a.join(',')).join(' ')}"/>`+b.map(a=>`<circle cx="${a[0]}" cy="${a[1]}" r="3"/>`).join('')).join('')+'</g>';return out}
export function frameSvg(clip,t,debug=false){return `<svg xmlns="http://www.w3.org/2000/svg" width="${CELL.width}" height="${CELL.height}" viewBox="0 0 ${CELL.width} ${CELL.height}"><g transform="translate(${CELL.rootX} ${CELL.baseline})">${characterSvg(poseAt(clip,t),debug)}</g></svg>`}
export {path,group,segment};
