/* Quiet Valley: cosmetic home-building paid for by study-earned coins. */
(function(){
'use strict';
var SAVE='datacraft-quiet-valley-v1',WALLET='datacraft-wallet-v1',W=900,H=540,CELL=30;
var canvas=document.getElementById('quietValleyCanvas'),ctx=canvas&&canvas.getContext('2d');
var statusEl=document.getElementById('quietValleyStatus'),shopEl=document.getElementById('quietValleyShop'),inventoryEl=document.getElementById('quietValleyInventory'),zonesEl=document.getElementById('quietValleyZones');
var balanceEl=document.getElementById('quietValleyBalance'),selectionTitle=document.getElementById('quietValleySelectionTitle'),selectionActions=document.getElementById('quietValleySelectionActions');
var selectedItem=null,selectedObject=null,mode='select',category='all',counter=0,time=0,lastFrame=0;
var reducedMotion=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
var ZONES=[
{id:'garden',name:'🌿 Сад у дома',short:'Сад у дома',price:0,kind:'garden'},
{id:'forest',name:'🌲 Лесная поляна',short:'Лесная поляна',price:25,kind:'forest'},
{id:'beach',name:'🏖️ Тихий пляж',short:'Тихий пляж',price:35,kind:'beach'},
{id:'cave',name:'💎 Сумеречная пещера',short:'Пещера',price:40,kind:'cave'},
{id:'waterfall',name:'💧 Долина водопада',short:'Водопад',price:50,kind:'waterfall'}];
var ITEMS=[
{id:'roof-terracotta',name:'Черепичная крыша',emoji:'🏠',cat:'house',price:14,kind:'upgrade',slot:'roof',value:'#b9654b',desc:'Тёплая терракотовая крыша.'},
{id:'roof-nightblue',name:'Синяя крыша',emoji:'🏡',cat:'house',price:18,kind:'upgrade',slot:'roof',value:'#53769a',desc:'Спокойный синий оттенок.'},
{id:'wall-cream',name:'Кремовые стены',emoji:'🧱',cat:'house',price:10,kind:'upgrade',slot:'wall',value:'#e4d2a4',desc:'Светлый уютный дом.'},
{id:'wall-sage',name:'Фисташковые стены',emoji:'🏡',cat:'house',price:13,kind:'upgrade',slot:'wall',value:'#a8c69a',desc:'Мягкий зелёный цвет.'},
{id:'window-glow',name:'Тёплый свет в окнах',emoji:'🪟',cat:'house',price:9,kind:'upgrade',slot:'window',value:'glow',desc:'Дом уютно светится в сумерках.'},
{id:'porch-lantern',name:'Фонарь у крыльца',emoji:'🏮',cat:'house',price:8,kind:'item',desc:'Маленький фонарь рядом с домом.'},
{id:'oak-tree',name:'Дуб',emoji:'🌳',cat:'garden',price:9,kind:'item',desc:'Тенистое дерево для участка.'},
{id:'flower-tulips',name:'Тюльпаны',emoji:'🌷',cat:'garden',price:4,kind:'item',desc:'Яркая цветочная клумба.'},
{id:'flower-daisies',name:'Ромашки',emoji:'🌼',cat:'garden',price:3,kind:'item',desc:'Солнечная полянка.'},
{id:'garden-bush',name:'Кустарник',emoji:'🌿',cat:'garden',price:4,kind:'item',desc:'Зелёный куст с мягкими листьями.'},
{id:'mushrooms',name:'Лесные грибы',emoji:'🍄',cat:'garden',price:3,kind:'item',desc:'Маленькая полянка грибов.'},
{id:'pond',name:'Собственный пруд',emoji:'💧',cat:'water',price:20,kind:'item',desc:'Пруд с мягкой рябью.'},
{id:'wooden-bridge',name:'Деревянный мостик',emoji:'🌉',cat:'water',price:12,kind:'item',desc:'Мостик через ручей или пруд.'},
{id:'fish-ornament',name:'Рыбки в пруду',emoji:'🐟',cat:'water',price:5,kind:'item',desc:'Декоративные рыбки для воды.'},
{id:'bench',name:'Скамейка',emoji:'🪑',cat:'furniture',price:7,kind:'item',desc:'Место посидеть и отдохнуть.'},
{id:'wooden-table',name:'Столик',emoji:'🪵',cat:'furniture',price:7,kind:'item',desc:'Небольшой деревянный стол.'},
{id:'chair',name:'Кресло',emoji:'🪑',cat:'furniture',price:6,kind:'item',desc:'Уютное кресло для чтения.'},
{id:'garden-lantern',name:'Садовый фонарь',emoji:'🏮',cat:'furniture',price:6,kind:'item',desc:'Мягкое тёплое освещение.'},
{id:'fountain',name:'Фонтан',emoji:'⛲',cat:'furniture',price:19,kind:'item',desc:'Тихое журчание в центре сада.'},
{id:'cat',name:'Кот',emoji:'🐈',cat:'animals',price:12,kind:'item',desc:'Пушистый сосед для домика.'},
{id:'dog',name:'Собака',emoji:'🐕',cat:'animals',price:15,kind:'item',desc:'Весёлый друг для прогулок.'},
{id:'rabbit',name:'Кролик',emoji:'🐇',cat:'animals',price:10,kind:'item',desc:'Тихий житель поляны.'},
{id:'bird',name:'Птичка',emoji:'🐦',cat:'animals',price:7,kind:'item',desc:'Маленькая птичка возле дерева.'},
{id:'garland',name:'Гирлянда',emoji:'🎐',cat:'decor',price:8,kind:'item',desc:'Мягкие огоньки для вечернего сада.'},
{id:'garden-gnome',name:'Садовая фигурка',emoji:'🧙',cat:'decor',price:9,kind:'item',desc:'Сказочный хранитель сада.'},
{id:'wind-chime',name:'Музыка ветра',emoji:'🎐',cat:'decor',price:6,kind:'item',desc:'Подвесной декор для крыльца.'},
{id:'birdhouse',name:'Скворечник',emoji:'🪺',cat:'decor',price:8,kind:'item',desc:'Домик для птиц.'},
{id:'glow-mushroom',name:'Светящийся гриб',emoji:'🍄',cat:'decor',price:11,kind:'item',desc:'Нежное свечение в сумерках.'}];
var CATS=[{id:'all',label:'Всё'},{id:'house',label:'🏠 Дом'},{id:'garden',label:'🌷 Сад'},{id:'water',label:'🌊 Водоём'},{id:'furniture',label:'🪑 Мебель'},{id:'animals',label:'🐾 Животные'},{id:'decor',label:'✨ Декор'}];
var DEFAULT={version:1,current:'garden',unlocked:['garden'],inventory:{},objects:{garden:[],forest:[],beach:[],cave:[],waterfall:[]},styles:{roof:['default'],wall:['default'],window:['default']},active:{roof:'default',wall:'default',window:'default'},counts:{}};
var state=load();
function clone(o){return JSON.parse(JSON.stringify(o));}
function read(k){try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}}
function load(){
 var old=read(SAVE);if(!old||old.version!==1)return clone(DEFAULT);var s=clone(DEFAULT);
 s.current=ZONES.some(function(z){return z.id===old.current;})?old.current:'garden';
 s.unlocked=Array.isArray(old.unlocked)?old.unlocked.filter(function(id){return ZONES.some(function(z){return z.id===id;});}):['garden'];if(s.unlocked.indexOf('garden')<0)s.unlocked.unshift('garden');
 if(old.inventory&&typeof old.inventory==='object')s.inventory=old.inventory;if(old.objects&&typeof old.objects==='object')s.objects=old.objects;
 ZONES.forEach(function(z){if(!Array.isArray(s.objects[z.id]))s.objects[z.id]=[];});
 if(old.styles&&typeof old.styles==='object')s.styles=old.styles;['roof','wall','window'].forEach(function(k){if(!Array.isArray(s.styles[k]))s.styles[k]=['default'];});
 s.active=Object.assign(s.active,old.active||{});if(old.counts&&typeof old.counts==='object')s.counts=old.counts;
 Object.keys(s.inventory).forEach(function(id){s.inventory[id]=Math.max(0,Math.floor(Number(s.inventory[id])||0));});return s;
}
function save(){try{localStorage.setItem(SAVE,JSON.stringify(state));}catch(e){setStatus('Не удалось сохранить долину. Проверь свободное место в браузере.','error');}}
function zone(){return ZONES.filter(function(z){return z.id===state.current;})[0]||ZONES[0];}
function objects(){return state.objects[state.current]||[];}
function item(id){return ITEMS.filter(function(x){return x.id===id;})[0]||null;}
function wallet(){if(!window.DataCraftEconomy)return {balance:0};return typeof window.DataCraftEconomy.getWallet==='function'?window.DataCraftEconomy.getWallet():window.DataCraftEconomy.sync();}
function coins(){return Math.max(0,Number(wallet().balance)||0);}
function stock(id){return Math.max(0,Number(state.inventory[id])||0)>0;}
function setStatus(msg,kind){if(statusEl){statusEl.textContent=msg;statusEl.className='quiet-valley-status'+(kind?' '+kind:'');}}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function el(id){return document.getElementById(id);}
function getSize(id){return id==='pond'?58:(id==='wooden-bridge'?40:(id==='oak-tree'?29:(id==='fountain'?30:21)));}
function buy(it){
 if(it.kind==='upgrade'){
  var styles=state.styles[it.slot]||['default'];
  if(styles.indexOf(it.id)>=0){var returnedHome=state.current!=='garden';state.active[it.slot]=it.id;state.current='garden';selectedItem=null;selectedObject=null;mode='select';save();draw();render();setStatus('Стиль уже куплен — применил его к дому бесплатно.'+(returnedHome?' Вернул тебя к дому, чтобы сразу увидеть результат.':''));return;}
  if(coins()<it.price){setStatus('Не хватает монет. Пройди уроки, чтобы пополнить кошелёк.','warn');return;}
  if(!window.DataCraftEconomy||!window.DataCraftEconomy.spend(it.price,'Покупка для дома: '+it.name,'quiet-valley:style:'+it.id)){setStatus('Не удалось списать монеты.','error');return;}
  styles.push(it.id);state.styles[it.slot]=styles;state.active[it.slot]=it.id;var returnedHome=state.current!=='garden';state.current='garden';selectedItem=null;selectedObject=null;mode='select';save();draw();render();setStatus('Куплено: '+it.name+'. Стиль применён к дому и теперь его можно переключать бесплатно.'+(returnedHome?' Я вернул тебя в сад, чтобы сразу увидеть изменение.':''));return;
 }
 if(coins()<it.price){setStatus('Не хватает монет. Заработай монеты за учебные задания.','warn');return;}
 var n=Math.max(0,Number(state.counts[it.id])||0),purchaseId='quiet-valley:item:'+it.id+':'+n;
 if(!window.DataCraftEconomy||!window.DataCraftEconomy.spend(it.price,'Покупка для долины: '+it.name,purchaseId)){setStatus('Не удалось списать монеты.','error');return;}
 state.counts[it.id]=n+1;state.inventory[it.id]=(Number(state.inventory[it.id])||0)+1;selectedItem=it.id;selectedObject=null;mode='place';save();draw();render();setStatus('Куплено: '+it.name+'. Нажми на свободное место карты, чтобы разместить предмет.');
}
function selectZone(z){
 if(state.unlocked.indexOf(z.id)>=0){state.current=z.id;selectedItem=null;selectedObject=null;mode='select';save();draw();render();setStatus('Ты сейчас в месте «'+z.short+'».');return;}
 if(coins()<z.price){setStatus('Для этой территории нужно '+z.price+' 🪙. Заработай монеты за учебные задания.','warn');return;}
 if(!window.DataCraftEconomy||!window.DataCraftEconomy.spend(z.price,'Новая территория отдыха: '+z.short,'quiet-valley:zone:'+z.id)){setStatus('Не удалось открыть территорию.','error');return;}
 state.unlocked.push(z.id);state.current=z.id;selectedItem=null;selectedObject=null;mode='select';save();draw();render();setStatus('Открыто новое место: '+z.short+'. Здесь можно создать свой уголок отдыха.');
}
function point(e){var r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
function hit(p){var a=objects();for(var i=a.length-1;i>=0;i--)if(Math.hypot(p.x-a[i].x,p.y-a[i].y)<=getSize(a[i].itemId)+7)return a[i];return null;}
function valid(x,y,id,ignore){
 if(x<35||y<35||x>W-35||y>H-35)return false;
 if(state.current==='garden'&&x>88&&x<252&&y>94&&y<253)return false;
 return !objects().some(function(o){if(o.uid===ignore)return false;return Math.hypot(x-o.x,y-o.y)<Math.max(25,Math.min(60,(getSize(id)+getSize(o.itemId))*.75));});
}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function cloud(x,y,r){ctx.fillStyle='rgba(247,250,224,.24)';ctx.beginPath();ctx.arc(x-r*.45,y,r*.33,0,Math.PI*2);ctx.arc(x,y-r*.12,r*.42,0,Math.PI*2);ctx.arc(x+r*.42,y,r*.31,0,Math.PI*2);ctx.fill();}
function drawHouse(){
 var wall='#d5bd8e',roof='#8e5540',wi=item(state.active.wall),ri=item(state.active.roof);if(wi&&wi.value)wall=wi.value;if(ri&&ri.value)roof=ri.value;
 ctx.fillStyle='rgba(24,39,25,.3)';ctx.beginPath();ctx.ellipse(174,230,82,14,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=wall;ctx.fillRect(124,156,103,75);ctx.strokeStyle='#5a5039';ctx.lineWidth=3;ctx.strokeRect(124,156,103,75);\n if(state.active.wall==='wall-cream'||state.active.wall==='wall-sage'){ctx.save();ctx.strokeStyle=state.active.wall==='wall-sage'?'rgba(67,111,65,.34)':'rgba(131,103,65,.25)';ctx.lineWidth=1;for(var sidingY=171;sidingY<229;sidingY+=13){ctx.beginPath();ctx.moveTo(127,sidingY);ctx.lineTo(224,sidingY);ctx.stroke();}ctx.restore();}
 ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(111,163);ctx.lineTo(174,111);ctx.lineTo(240,163);ctx.closePath();ctx.fill();ctx.strokeStyle='#563b30';ctx.stroke();\n if(state.active.roof==='roof-terracotta'||state.active.roof==='roof-nightblue'){ctx.save();ctx.strokeStyle=state.active.roof==='roof-nightblue'?'rgba(218,238,255,.48)':'rgba(255,222,183,.58)';ctx.lineWidth=1.5;for(var tileY=124;tileY<160;tileY+=7){var leftX=174-(tileY-111)*63/52,rightX=174+(tileY-111)*66/52;ctx.beginPath();ctx.moveTo(leftX,tileY);ctx.lineTo(rightX,tileY);ctx.stroke();}ctx.restore();}
 ctx.fillStyle='#6a4733';ctx.fillRect(163,188,23,43);ctx.fillStyle='#e9ce8c';ctx.fillRect(182,205,3,3);
 var glow=state.active.window==='window-glow';[[137,172],[194,172]].forEach(function(p){if(glow){ctx.save();ctx.fillStyle='rgba(255,208,83,.28)';ctx.beginPath();ctx.ellipse(p[0]+9.5,p[1]+8.5,20,18,0,0,Math.PI*2);ctx.fill();ctx.restore();}ctx.fillStyle=glow?'#ffdf89':'#b6d9dc';ctx.fillRect(p[0],p[1],19,17);ctx.strokeStyle='#6b6c51';ctx.lineWidth=2;ctx.strokeRect(p[0],p[1],19,17);ctx.beginPath();ctx.moveTo(p[0]+9,p[1]);ctx.lineTo(p[0]+9,p[1]+17);ctx.moveTo(p[0],p[1]+8);ctx.lineTo(p[0]+19,p[1]+8);ctx.stroke();});
 ctx.fillStyle='#f4f0d5';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText('Мой дом',174,99);
}
function background(z){
 var g=ctx.createLinearGradient(0,0,0,H);
 if(z.kind==='beach'){g.addColorStop(0,'#58a7b2');g.addColorStop(.34,'#78c5c2');g.addColorStop(.36,'#dccb91');g.addColorStop(1,'#b9a96e');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);for(var w=0;w<8;w++){ctx.fillStyle='rgba(255,244,190,.55)';ctx.fillRect(20+w*105,191+Math.sin(time*.7+w)*4,55,2);}}
 else if(z.kind==='cave'){g.addColorStop(0,'#354447');g.addColorStop(.5,'#283b39');g.addColorStop(1,'#162c28');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle='#202d2b';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(180,0);ctx.lineTo(140,55);ctx.lineTo(95,35);ctx.lineTo(40,92);ctx.lineTo(0,70);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(W,0);ctx.lineTo(W-175,0);ctx.lineTo(W-120,70);ctx.lineTo(W-82,40);ctx.lineTo(W,95);ctx.closePath();ctx.fill();}
 else{if(z.kind==='forest'){g.addColorStop(0,'#31583b');g.addColorStop(.5,'#47754b');g.addColorStop(1,'#294f35');}else if(z.kind==='waterfall'){g.addColorStop(0,'#497f60');g.addColorStop(.55,'#6a9864');g.addColorStop(1,'#3f7657');}else{g.addColorStop(0,'#63965a');g.addColorStop(.48,'#79a966');g.addColorStop(1,'#487f4c');}ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  for(var i=0;i<170;i++){var x=(i*137+41)%W,y=(i*83+29)%H;ctx.fillStyle=i%3?'rgba(225,242,164,.12)':'rgba(25,80,42,.12)';ctx.fillRect(x,y,2,2);}
  if(z.kind==='forest'){for(var t=0;t<7;t++){var tx=28+t*132,ty=36+(t%2)*20;ctx.fillStyle='#684d34';ctx.fillRect(tx-4,ty+14,8,30);ctx.fillStyle='#1b5135';ctx.beginPath();ctx.arc(tx,ty,25,0,Math.PI*2);ctx.fill();}}
  if(z.kind==='waterfall'){ctx.fillStyle='rgba(32,101,124,.75)';ctx.beginPath();ctx.moveTo(810,0);ctx.lineTo(900,0);ctx.lineTo(900,540);ctx.lineTo(755,540);ctx.lineTo(786,430);ctx.lineTo(816,265);ctx.closePath();ctx.fill();for(var s=0;s<5;s++){ctx.strokeStyle='rgba(210,248,244,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(815+s*15,25);ctx.bezierCurveTo(800+s*15,120,840+s*12,175,810+s*16,250);ctx.stroke();}}
 }
 cloud(155,64,45);cloud(600,83,55);
 if(z.kind==='garden'){ctx.strokeStyle='#c7b98b';ctx.lineWidth=33;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(195,235);ctx.bezierCurveTo(230,300,365,305,404,376);ctx.stroke();ctx.strokeStyle='#e0d0a2';ctx.lineWidth=22;ctx.beginPath();ctx.moveTo(195,235);ctx.bezierCurveTo(230,300,365,305,404,376);ctx.stroke();drawHouse();}
 if(z.kind==='waterfall'){ctx.fillStyle='rgba(54,160,184,.68)';ctx.beginPath();ctx.ellipse(785,452,102,57,-.1,0,Math.PI*2);ctx.fill();}
 if(z.kind==='beach'){ctx.fillStyle='rgba(51,129,140,.6)';ctx.beginPath();ctx.ellipse(745,220,130,24,.1,0,Math.PI*2);ctx.fill();}
}
function drawObject(o){
 var it=item(o.itemId);if(!it)return;var r=getSize(it.id),x=o.x,y=o.y;ctx.save();ctx.globalAlpha=.28;ctx.fillStyle='#17271c';ctx.beginPath();ctx.ellipse(x,y+r*.5,r*.72,r*.25,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
 if(selectedObject===o.uid){ctx.strokeStyle='#ffe38a';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y,r+7,r*.75+7,0,0,Math.PI*2);ctx.stroke();}
 ctx.translate(x,y);ctx.rotate((o.rotation||0)*Math.PI/180);
 if(it.id==='pond'){var water=ctx.createRadialGradient(-15,-15,2,0,0,63);water.addColorStop(0,'#78d1cf');water.addColorStop(1,'#236c80');ctx.fillStyle='#bcb08b';ctx.beginPath();ctx.ellipse(0,0,63,42,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=water;ctx.beginPath();ctx.ellipse(0,-2,56,35,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(224,249,236,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(-6,-2,28,12,0,0,Math.PI*2);ctx.stroke();}
 else if(it.id==='wooden-bridge'){ctx.fillStyle='#754c2d';ctx.fillRect(-29,-12,58,24);ctx.strokeStyle='#dfbd7b';ctx.lineWidth=2;ctx.strokeRect(-29,-12,58,24);for(var p=-20;p<29;p+=10){ctx.beginPath();ctx.moveTo(p,-10);ctx.lineTo(p,10);ctx.stroke();}}
 else if(it.id==='fountain'){ctx.fillStyle='#b6c6c3';ctx.beginPath();ctx.ellipse(0,8,27,13,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#6ab9c6';ctx.beginPath();ctx.ellipse(0,5,21,8,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#b8eeea';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,5);ctx.quadraticCurveTo(-6,-8,0,-19);ctx.stroke();}
 else{var fs=it.id==='oak-tree'?48:(it.id==='garden-bush'?34:32);if(it.id==='glow-mushroom'){ctx.fillStyle='rgba(143,244,194,'+(.22+.12*Math.sin(time*2))+')';ctx.beginPath();ctx.arc(0,0,29,0,Math.PI*2);ctx.fill();}if(it.id==='garden-lantern'||it.id==='porch-lantern'){ctx.fillStyle='rgba(255,211,109,'+(.15+.06*Math.sin(time*2))+')';ctx.beginPath();ctx.arc(0,0,26,0,Math.PI*2);ctx.fill();}ctx.font=fs+'px "Apple Color Emoji","Segoe UI Emoji",system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(it.emoji,0,0);}
 ctx.restore();
}
function draw(){
 if(!ctx)return;ctx.clearRect(0,0,W,H);background(zone());objects().forEach(drawObject);ctx.save();ctx.fillStyle='rgba(13,31,19,.65)';rr(14,14,205,29,9);ctx.fill();ctx.fillStyle='#eef7df';ctx.font='bold 12px system-ui';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(zone().short,25,28);
 if(mode==='place'&&selectedItem){ctx.fillStyle='#ffe7a0';ctx.textAlign='right';ctx.fillText('Выбери место для '+(item(selectedItem)||{}).name,W-20,28);}else if(mode==='move'&&selectedObject){ctx.fillStyle='#ffe7a0';ctx.textAlign='right';ctx.fillText('Выбери новое место',W-20,28);}ctx.restore();
 for(var i=0;i<5;i++){var sx=state.current==='waterfall'?750+i*15:(state.current==='beach'?420+i*32:440+i*37),sy=state.current==='waterfall'?390+Math.sin(time+i)*17:(state.current==='beach'?220+Math.sin(time+i)*7:330+Math.sin(time*1.2+i)*11);ctx.fillStyle='rgba(255,246,186,'+(.2+.45*Math.abs(Math.sin(time*1.6+i)))+')';ctx.beginPath();ctx.arc(sx,sy,1.5+Math.abs(Math.sin(time+i)),0,Math.PI*2);ctx.fill();}
}
function place(p){
 var it=item(selectedItem);if(!it||!stock(selectedItem))return;var x=Math.round(p.x/CELL)*CELL,y=Math.round(p.y/CELL)*CELL;
 if(!valid(x,y,it.id,null)){setStatus('Здесь тесно или слишком близко к дому. Выбери другое свободное место.','warn');return;}
 objects().push({uid:'valley-'+Date.now()+'-'+(counter++),itemId:it.id,x:x,y:y,rotation:0});state.inventory[it.id]-=1;selectedObject=null;selectedItem=null;mode='select';save();draw();render();setStatus(it.name+' украшает долину. Его можно выбрать, повернуть, переместить или убрать в инвентарь.');
}
function move(p){var o=objects().filter(function(x){return x.uid===selectedObject;})[0];if(!o)return;var x=Math.round(p.x/CELL)*CELL,y=Math.round(p.y/CELL)*CELL;if(!valid(x,y,o.itemId,o.uid)){setStatus('В этой точке недостаточно места. Попробуй рядом.','warn');return;}o.x=x;o.y=y;mode='select';save();draw();render();setStatus('Предмет перемещён.');}
function canvasClick(e){var p=point(e);if(mode==='place'&&selectedItem){place(p);return;}if(mode==='move'&&selectedObject){move(p);return;}var o=hit(p);if(o){selectedObject=o.uid;selectedItem=null;mode='select';draw();render();setStatus('Предмет выбран. Его можно повернуть, переместить или убрать в инвентарь.');}else{selectedObject=null;selectedItem=null;mode='select';draw();render();setStatus('Выбери предмет в каталоге или нажми на уже размещённый объект.');}}
function rotate(){var o=objects().filter(function(x){return x.uid===selectedObject;})[0];if(!o)return;o.rotation=((Number(o.rotation)||0)+45)%360;save();draw();render();setStatus('Предмет повёрнут на 45°.');}
function moveMode(){if(!selectedObject)return;mode='move';draw();render();setStatus('Нажми на свободное место карты, чтобы переместить выбранный предмет.');}
function store(){var a=objects(),i=a.findIndex(function(o){return o.uid===selectedObject;});if(i<0)return;var o=a.splice(i,1)[0];state.inventory[o.itemId]=(Number(state.inventory[o.itemId])||0)+1;selectedObject=null;selectedItem=null;mode='select';save();draw();render();setStatus('Предмет возвращён в инвентарь и доступен для повторного размещения без новой покупки.');}
function renderZones(){zonesEl.innerHTML='';ZONES.forEach(function(z){var open=state.unlocked.indexOf(z.id)>=0,b=document.createElement('button');b.type='button';b.className='quiet-valley-zone'+(state.current===z.id?' active':'')+(!open?' locked':'');b.textContent=open?z.name:'🔒 '+z.short+' · '+z.price+' 🪙';b.setAttribute('aria-pressed',state.current===z.id?'true':'false');b.addEventListener('click',function(){selectZone(z);});zonesEl.appendChild(b);});}
function renderShop(){
 shopEl.innerHTML='';ITEMS.filter(function(it){return category==='all'||it.cat===category;}).forEach(function(it){var up=it.kind==='upgrade',styles=up?(state.styles[it.slot]||[]):[],owned=up&&styles.indexOf(it.id)>=0,active=up&&state.active[it.slot]===it.id;
 var b=document.createElement('button');b.type='button';b.className='quiet-valley-item'+(selectedItem===it.id?' selected':'')+(active?' active-style':'');b.disabled=!owned&&!stock(it.id)&&coins()<it.price;
 var action=active?'Активен · применён':(owned?'Выбрать стиль':(stock(it.id)?'Выбрать · '+state.inventory[it.id]+' шт.':'Купить · '+it.price+' 🪙'));
 b.innerHTML='<span class="quiet-valley-item-top"><span class="quiet-valley-item-icon" aria-hidden="true">'+it.emoji+'</span><span class="quiet-valley-item-name">'+esc(it.name)+'</span></span><span class="quiet-valley-item-desc">'+esc(it.desc)+'</span><span class="quiet-valley-item-action"><span>'+action+'</span><span>'+(active?'✓ Активен':(owned?'✓ Куплено':(stock(it.id)?'В наличии':it.price+' 🪙')))+'</span></span>';
 b.addEventListener('click',function(){if(up){buy(it);return;}if(stock(it.id)){selectedItem=it.id;selectedObject=null;mode='place';draw();render();setStatus('Выбрано: '+it.name+'. Нажми на свободное место карты.');}else buy(it);});shopEl.appendChild(b);});
 balanceEl.textContent='🪙 '+coins()+' монет';
}
function renderInventory(){
 inventoryEl.innerHTML='';var ids=Object.keys(state.inventory).filter(function(id){return Number(state.inventory[id])>0&&item(id);});
 if(!ids.length){inventoryEl.innerHTML='<div class="quiet-valley-empty">Инвентарь пуст. Купи предмет за монеты, заработанные за учебные задания.</div>';return;}
 ids.forEach(function(id){var it=item(id),row=document.createElement('div');row.className='quiet-valley-inventory-row';var emoji=document.createElement('span');emoji.className='quiet-valley-inventory-emoji';emoji.textContent=it.emoji;emoji.setAttribute('aria-hidden','true');var copy=document.createElement('div');copy.className='quiet-valley-inventory-copy';var name=document.createElement('div');name.className='quiet-valley-inventory-name';name.textContent=it.name;var qty=document.createElement('div');qty.className='quiet-valley-inventory-count';qty.textContent='В запасе: '+state.inventory[id];copy.append(name,qty);var b=document.createElement('button');b.type='button';b.className='quiet-valley-small-btn';b.textContent='Разместить';b.addEventListener('click',function(){selectedItem=id;selectedObject=null;mode='place';draw();render();setStatus('Выбрано: '+it.name+'. Нажми на свободное место.');});row.append(emoji,copy,b);inventoryEl.appendChild(row);});
}
function renderSelection(){
 selectionActions.innerHTML='';var o=objects().filter(function(x){return x.uid===selectedObject;})[0];
 if(o){selectionTitle.textContent='Выбрано: '+((item(o.itemId)||{}).name||'предмет');[['↻ Повернуть',rotate],['↔ Переместить',moveMode],['⇩ В инвентарь',store],['Снять выбор',function(){selectedObject=null;mode='select';draw();render();}]].forEach(function(entry){var b=document.createElement('button');b.type='button';b.className='quiet-valley-small-btn';b.textContent=entry[0];b.addEventListener('click',entry[1]);selectionActions.appendChild(b);});}
 else{selectionTitle.textContent=mode==='place'&&selectedItem?'Размещение: '+((item(selectedItem)||{}).name||'предмет'):(mode==='move'?'Перемещение предмета':'Ничего не выбрано');var help=document.createElement('div');help.className='quiet-valley-selection-empty';help.textContent=mode==='place'?'Нажми на свободное место. Если передумаешь, предмет останется в инвентаре.':(mode==='move'?'Нажми на новое место для предмета.':'Нажми на объект на карте, чтобы выбрать его.');selectionActions.appendChild(help);}
}
function render(){renderZones();renderShop();renderInventory();renderSelection();if(el('quietValleyCurrentZone'))el('quietValleyCurrentZone').textContent=zone().short;}
function categories(){var box=el('quietValleyCategories');box.innerHTML='';CATS.forEach(function(c){var b=document.createElement('button');b.type='button';b.className='quiet-valley-category'+(category===c.id?' active':'');b.textContent=c.label;b.setAttribute('aria-pressed',category===c.id?'true':'false');b.addEventListener('click',function(){category=c.id;categories();renderShop();});box.appendChild(b);});}
function init(){
 if(!canvas||!ctx||!shopEl||!inventoryEl||!zonesEl)return;canvas.addEventListener('click',canvasClick);
 canvas.addEventListener('keydown',function(e){if(e.key==='Escape'){selectedItem=null;selectedObject=null;mode='select';draw();render();setStatus('Выбор отменён.');}if((e.key==='r'||e.key==='R')&&selectedObject)rotate();});
 categories();draw();render();setStatus('Добро пожаловать домой. Покупай декор за учебные монеты и оформляй свой участок.');
 window.addEventListener('datacraft:wallet-updated',function(){renderShop();});window.addEventListener('storage',function(e){if(!e.key||e.key===WALLET)renderShop();});window.addEventListener('focus',function(){renderShop();});
 function frame(ts){var dt=Math.min(.05,(ts-lastFrame)/1000||0);lastFrame=ts;if(!document.hidden){if(!reducedMotion)time+=dt;draw();}window.requestAnimationFrame(frame);}window.requestAnimationFrame(frame);
}
init();
})();