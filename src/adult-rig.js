import {path,group,segment,poseAt} from './ash-rig.js';
export function adultPose(id,clip,t){return poseAt(clip,t)}
function arm(id,bones,oak,far){const [a,b,c]=bones,cloth=oak?(far?'#b3bec5':'#eef0ed'):(far?'#303643':'#454c5b'),shade=oak?'#c8cfd1':'#343b49',skin=oak?'#e4b993':'#d3ab86';return `<g id="${id}">`+
 segment(id+'-upper',a,b,path('M -9 -16 Q 6 -22 21 -15 L 52 -11 Q 61 -4 54 10 L 7 15 Q -11 10 -9 -16 Z',cloth)+path('M 15 11 L 49 6 L 53 10 L 15 15 Z',shade,'stroke="none"'))+
 segment(id+'-forearm',b,c,path('M -5 -10 Q 10 -14 25 -9 L 46 -8 L 48 8 L 18 12 L -4 10 Z',cloth)+path('M 4 8 L 42 4 L 45 8 L 15 12 Z',shade,'stroke="none"')+path('M 40 -8 L 42 8','none','stroke-width="1.2"'))+
 group(id+'-fist',...c,0,path('M -3 -8 L 7 -10 L 14 -6 L 18 1 L 16 8 L 5 10 L -4 4 Z',skin)+path('M 6 -7 L 8 -2 M 11 -5 L 12 -1 M -2 0 L 5 3','none','stroke-width="1.3"'))+'</g>'}
function leg(id,bones,oak,far,shoe){const [a,b,c]=bones,col=oak?(far?'#9c8c73':'#b7a58a'):(far?'#303642':'#444b5a'),shade=oak?'#94816b':'#303744';return `<g id="${id}">`+
 segment(id+'-thigh',a,b,path('M -9 -21 Q 17 -23 39 -17 L 67 -13 Q 74 -3 67 13 L 33 18 L -6 18 Z',col)+path('M 12 12 L 59 5 L 66 12 L 30 17 Z',shade,'stroke="none"')+path('M 10 -6 L 58 -5','none','stroke-width="1.2"'))+
 segment(id+'-shin',b,c,path('M -5 -13 Q 17 -15 32 -10 L 65 -11 L 67 11 L 28 13 L -4 12 Z',col)+path('M 12 9 L 62 4 L 65 10 L 30 13 Z',shade,'stroke="none"')+path('M 11 -4 L 55 -3','none','stroke-width="1"'))+
 group(id+'-shoe',...c,shoe,path('M -12 -2 L 8 -3 L 16 3 L 31 6 Q 37 10 34 16 L 9 19 L -13 15 Z',oak?'#625749':'#232a34')+path('M -12 12 L 8 16 L 34 13 L 34 18 L 9 21 L -13 17 Z',oak?'#443f39':'#151f29')+path('M 3 1 L 7 6 L 15 7','none','stroke="#89908d" stroke-width="1.3"'))+'</g>'}
function torso(p,oak){const [x,y]=p.hip,[sx,sy]=p.shoulder,cloth=oak?'#eceeea':'#454c5a';return `<g id="torso">`+
 path(`M ${sx-25} ${sy-10} Q ${sx+2} ${sy-25} ${sx+27} ${sy-7} L ${x+25} ${y+10} L ${x-29} ${y+9} Z`,oak?'#b4a9be':'#afb9c4')+
 path(`M ${x-23} ${y-1} L ${x+24} ${y-1} L ${x+24} ${y+7} L ${x-24} ${y+7} Z`,'#373b42')+
 path(`M ${sx-25} ${sy-11} L ${sx-2} ${sy-16} L ${x-1} ${y-12} L ${x-8} ${y+13} L ${x-33} ${y+10} Z`,cloth)+
 path(`M ${sx+17} ${sy-16} L ${sx+29} ${sy-8} L ${x+29} ${y+10} L ${x-8} ${y+13} L ${x-1} ${y-12} Z`,cloth)+
 path(`M ${sx-12} ${sy-15} L ${sx-19} ${sy+9} L ${sx-8} ${sy+13} L ${sx-16} ${sy+22} L ${x-1} ${y-12} L ${sx-3} ${sy+6} Z`,oak?'#fafaf2':'#535b69')+
 path(`M ${sx+17} ${sy-16} L ${sx+23} ${sy+7} L ${sx+15} ${sy+13} L ${sx+24} ${sy+18} L ${x-1} ${y-12} Z`,oak?'#f8f9f1':'#535b69')+
 (oak?path(`M ${sx-3} ${sy-9} L ${sx+4} ${sy+10} L ${sx+13} ${sy-9} M ${sx+5} ${sy+12} L ${x+8} ${y-2}`,'none','stroke="#887f96" stroke-width="1.4"'):
 group('rocket-emblem',sx+17,sy+28,0,path('M -5 -11 L 3 -11 Q 10 -11 10 -5 Q 10 -1 6 1 L 11 9 L 5 9 L 0 2 L -1 2 L -1 9 L -5 9 Z M -1 -7 L -1 -2 L 3 -2 Q 6 -2 6 -5 Q 6 -7 3 -7 Z','#c75c4a','fill-rule="evenodd" stroke-width="1.2"')))+'</g>'}
function coat(p){const [x,y]=p.hip,twist=p.lean*.35;return `<g id="coat-tails">`+path(`M ${x-28} ${y-6} L ${x-3} ${y-5} Q ${x-8+twist} ${y+39} ${x-17+twist} ${y+59} L ${x-47+twist} ${y+53} Q ${x-34} ${y+14} ${x-28} ${y-6} Z`,'#d3dadb')+path(`M ${x+12} ${y-6} L ${x+28} ${y-4} Q ${x+33+twist} ${y+28} ${x+36+twist} ${y+53} L ${x+8+twist} ${y+59} L ${x+4} ${y+9} Z`,'#edf0e9')+path(`M ${x+12} ${y+20} L ${x+29} ${y+19} L ${x+30} ${y+38} L ${x+13} ${y+40} Z`,'#dce1df','stroke-width="1.3"')+'</g>'}
function head(p,oak){return group('head',p.shoulder[0],p.shoulder[1]-30,-p.lean*.1,
 path('M -10 13 L 10 16 L 12 35 L 0 40 L -12 29 Z',oak?'#d2a885':'#bf9474')+
 path('M -15 -25 Q 5 -36 23 -19 L 25 -4 L 35 6 L 26 10 L 26 22 L 15 32 L -4 29 L -16 14 Z',oak?'#e4bb95':'#d5af8b')+
 path('M -13 16 Q -1 28 15 26 L 26 19 L 25 25 L 15 32 L -4 29 Z',oak?'#c99e7c':'#b58b6d','stroke="none"')+
 (oak?path('M -17 15 L -23 1 L -25 -16 L -32 -30 L -19 -28 L -29 -43 L -7 -38 L -12 -50 L 10 -40 Q 27 -39 29 -24 L 25 -13 L 15 -20 L 11 -10 L 1 -22 L -8 -24 L -10 6 Z','#c6c8cc')+path('M -24 -37 L -7 -33 L -6 -43 L 12 -35 L 23 -31 L 18 -25 L -3 -30 Z','#ecebe8','stroke="none"'):
 path('M -15 15 L -22 3 L -24 -21 Q -24 -39 -6 -44 Q 12 -48 26 -31 L 29 -19 L 24 -10 L 19 -23 L 8 -28 L -4 -23 L -12 -26 L -12 3 Z','#242933')+path('M -18 -29 Q 0 -43 21 -30 M -15 -33 Q 0 -42 16 -34','none','stroke="#4d525c" stroke-width="1.5"'))+
 path('M -13 0 Q -23 -3 -20 9 Q -18 18 -11 14 Z',oak?'#e4bb95':'#d5af8b')+path('M -17 3 Q -12 4 -15 10','none','stroke-width="1.3"')+
 path(oak?'M 11 -9 Q 18 -15 24 -10 L 22 3 Q 17 9 12 3 Z':'M 9 -7 L 24 -11 L 22 2 L 15 4 Z','#fff9ea','stroke-width="1.3"')+
 '<ellipse cx="20" cy="-3" rx="2.1" ry="4.8" fill="#303644" stroke="none"/>'+
 path(oak?'M 8 -14 L 21 -20 L 26 -15 L 12 -10 Z':'M 8 -14 L 25 -16 L 25 -12 L 11 -9 Z',oak?'#68696b':'#242a32','stroke-width="1"')+
 path('M 13 19 L 26 17 M 5 21 L 7 17','none','stroke-width="1.4"')+
 (oak?path('M 5 7 L 10 9 M 8 11 L 11 12 M 18 23 L 23 21','none','stroke="#a27e65" stroke-width="1"'):''))}
export function adultSvg(p,id,debug=false){const oak=id===14;let out='<g stroke="#28313e" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">'+leg('far-leg',p.bones.farLeg,oak,true,0)+arm('far-arm',p.bones.farArm,oak,true)+leg('near-leg',p.bones.nearLeg,oak,false,p.shoe)+(oak?coat(p):'')+torso(p,oak)+head(p,oak)+arm('near-arm',p.bones.nearArm,oak,false)+'</g>';return out}
