"use strict";

const ACCOUNTS=[
{id:"u_1001",login:"smirnova",password:"1234",name:"Д.И. Смирнова",role:"seeker"},
{id:"u_1002",login:"khalilov",password:"1234",name:"А.Р. Халилов",role:"initiator"},
{id:"u_1003",login:"mustafina",password:"admin",name:"К.В. Мустафина",role:"admin"}];
const ROLES={seeker:"Искатель комнаты",initiator:"Инициатор шеринга",admin:"Администратор"};
const MENU={
seeker:[["objects","Объекты"],["apps","Заявки"],["contract","Договор"],["act","Акт приёмки"],["tests","Тесты"],["stats","Статистика"],["journal","Журнал"]],
initiator:[["lots","Мои лоты"],["candidates","Кандидаты"],["contracts","Договоры"],["tests","Тесты"],["stats","Статистика"],["journal","Журнал"]],
admin:[["verify","Верификация"],["disputes","Споры"],["deposits","Депозиты"],["tests","Тесты"],["stats","Статистика"],["journal","Журнал"]]};
const SCREENS={
seeker:["objects","object","apps","contract","act","tests","stats","journal","profile"],
initiator:["lots","lot-form","candidates","contracts","tests","stats","journal","profile"],
admin:["verify","disputes","deposits","tests","stats","journal","profile"]};
const PARENT={object:"objects","lot-form":"lots"};
const SLOG={
objects:()=>["open_object_list","screen","objects"],object:()=>["open_object","object",S.objectId||"unknown"],
apps:()=>["open_applications","screen","apps"],contract:()=>["open_offer","contract",S.contractId||"current"],
act:()=>["open_act","act",S.contractId||"new"],lots:()=>["open_lots","screen","lots"],
"lot-form":()=>S.editLot?["edit_lot","lot",S.editLot]:["create_lot","lot","new"],
candidates:()=>["open_candidates","screen","candidates"],contracts:()=>["open_contracts","screen","contracts"],
verify:()=>["open_verification","screen","verify"],disputes:()=>["open_disputes","screen","disputes"],
deposits:()=>["open_deposits","screen","deposits"],tests:()=>["open_tests","screen","tests"],
stats:()=>["open_stats","screen","stats"],journal:()=>["open_journal","screen","journal"],profile:()=>["open_profile","screen","profile"]};

const TASKS=[
{id:1,role:"initiator",mu:36.28,name:"Создание и публикация лота",
task:"Создайте лот: адрес «ул. Менделеева, 137» (выберите из подсказки), Октябрьский район, 2 комнаты, площадь 14 м², доля аренды 18000 ₽. Депозит подставится автоматически. Тишина после 23:00, уборка еженедельно, ЖКХ поровну, все запреты оставьте включёнными. Сохраните лот и опубликуйте его.",
sig:["create_lot","save_lot","publish_lot"]},
{id:2,role:"initiator",mu:11.70,name:"Одобрение кандидата и договор",
task:"Откройте раздел «Кандидаты», просмотрите скоринг-балл Д.И. Смирновой, одобрите её, сформируйте цифровой договор и подпишите его со своей стороны — не покидая карточку кандидата.",
sig:["open_candidates","view_scoring","approve_candidate","create_contract","sign_contract"]},
{id:3,role:"initiator",mu:13.80,name:"Редактирование лота",
task:"Откройте на редактирование лот «ул. Менделеева, 137», измените долю аренды на 17500 ₽, график уборки — на «По очереди дежурств» и сохраните изменения.",
sig:["edit_lot","save_lot"]},
{id:4,role:"seeker",mu:17.10,name:"Поиск объекта и подача заявки",
task:"Найдите объекты с бюджетом до 20 000 ₽ (используйте пресет) и графиком «Ночные смены». Откройте карточку объекта «ул. Шафиева, 22», ознакомьтесь с правилами и подайте заявку на заселение.",
sig:["set_search_attrs","find_objects","open_object","submit_application"]},
{id:5,role:"seeker",mu:14.40,name:"Оферта и заморозка депозита",
task:"В разделе «Мои заявки» откройте оферту по одобренной заявке на «ул. Шафиева, 22». Подпишите оферту и заморозьте депозит через эскроу-счёт, подтвердив операцию.",
sig:["open_offer","sign_offer","freeze_deposit"]},
{id:6,role:"seeker",mu:12.70,name:"Акт приёмки при заселении",
task:"Откройте акт приёмки по договору с удержанным депозитом. Показания подставлены из предыдущего акта — скорректируйте электричество на 12450, прикрепите фото и сохраните акт.",
sig:["open_act","enter_meters","save_act"]},
{id:7,role:"admin",mu:9.00,name:"Верификация документов",
task:"Откройте очередь верификации, просмотрите документы А.Р. Халилова и одобрите верификацию.",
sig:["open_verification","view_documents","approve_verification"]},
{id:8,role:"admin",mu:12.10,name:"Арбитраж спора",
task:"Откройте спор о порче имущества (диван) между А.Р. Халиловым и Д.И. Смирновой, изучите материалы и зафиксируйте решение об удержании 4500 ₽ из депозита.",
sig:["open_disputes","view_materials","decide_dispute"]},
{id:9,role:"admin",mu:10.10,name:"Блокировка плательщика",
task:"В разделе «Депозиты и блокировки» выберите из справочника Т.Н. Волкова, укажите типовую причину «3 просрочки платежа» и заблокируйте пользователя.",
sig:["open_blacklist","block_user"]},
{id:10,role:"admin",mu:9.00,name:"Возврат депозита при выселении",
task:"Спор по депозиту Д.И. Смирновой урегулирован. Убедитесь по столбцу «Ограничения», что открытых споров и задолженностей нет, и выполните возврат депозита, подтвердив операцию.",
sig:["open_deposits","refund_deposit"]}];

const PARTICIPANTS=["Даниэль","Радмир","Леонид","Роман","Нурислам","Руслан","Ильяс","Ярослав"];
const EXPERIMENT={
1:[42.18,55.63,38.94,61.27,49.85,36.72,52.40,45.09],
2:[10.85,15.86,11.42,14.73,12.94,9.87,16.15,11.62],
3:[13.24,18.97,14.06,16.82,15.31,12.58,19.44,14.62],
4:[16.38,24.71,17.92,22.45,19.86,15.27,23.18,18.47],
5:[13.06,21.83,14.27,19.42,16.95,12.61,21.14,14.72],
6:[16.42,23.87,17.95,21.34,null,15.18,22.76,18.63],
7:[8.64,13.37,9.28,11.53,10.42,7.15,12.86,9.71],
8:[12.18,21.64,13.07,17.82,15.39,9.26,18.93,14.11],
9:[9.87,14.62,10.53,13.28,11.94,9.16,15.07,10.81],
10:[8.42,13.16,9.05,11.74,10.28,7.83,12.51,9.41]};
const FAIL_TIME={6:{4:68.40}};

const TCRIT={1:12.706,2:4.303,3:3.182,4:2.776,5:2.571,6:2.447,7:2.365,8:2.306,9:2.262,10:2.228,11:2.201,12:2.179,13:2.160,14:2.145,15:2.131,16:2.120,17:2.110,18:2.101,19:2.093,20:2.086,21:2.080,22:2.074,23:2.069,24:2.064,25:2.060,26:2.056,27:2.052,28:2.048,29:2.045,30:2.042};
const tCrit=k=>TCRIT[k]||(k<=40?2.021:k<=60?2.000:k<=120?1.980:1.960);

const STREETS=["ул. Менделеева, 137","ул. Менделеева, 24","ул. Шафиева, 22","пр. Октября, 46","ул. Цюрупы, 91","ул. Правды, 14","ул. Первомайская, 54","ул. Ленина, 28","ул. Комсомольская, 112","ул. Гагарина, 7","б-р Хадии Давлетшиной, 21","ул. Революционная, 55"];
const REASONS=["3 просрочки платежа","Порча имущества","Нарушение режима тишины","Систематическое нарушение регламента","Задолженность по ЖКХ"];
const SCHED={day:"Дневная работа",night:"Ночные смены",remote:"Удалёнка",any:"Любой"};
const CLEAN={weekly:"Еженедельно",biweekly:"Раз в две недели",roster:"По очереди дежурств"};
const SPLIT={equal:"Поровну",area:"По площади",meters:"По счётчикам"};
const KEY="sharing_lr6";
const $=s=>document.querySelector(s);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=n=>Number(n).toLocaleString("ru-RU");
const uid=p=>p+"_"+Math.random().toString(36).slice(2,7);
const stamp=()=>new Date().toISOString();
const nf=(n,d=2)=>Number(n).toFixed(d).replace(".",",");

function seed(){return{
objects:[
{id:"obj_001",address:"ул. Менделеева, 137",district:"Октябрьский район",rooms:2,area:14,price:18000,deposit:9000,schedule:"day",quiet:"23:00",smoking:false,guests:false,pets:false,cleaning:"weekly",split:"equal",score:87,status:"published",owner:"А.Р. Халилов"},
{id:"obj_002",address:"пр. Октября, 46",district:"Советский район",rooms:3,area:12,price:15500,deposit:7500,schedule:"night",quiet:"22:00",smoking:true,guests:false,pets:false,cleaning:"roster",split:"equal",score:92,status:"published",owner:"Л.Р. Хисматуллина"},
{id:"obj_003",address:"ул. Цюрупы, 91",district:"Кировский район",rooms:2,area:16,price:20000,deposit:10000,schedule:"day",quiet:"23:00",smoking:false,guests:false,pets:false,cleaning:"weekly",split:"area",score:78,status:"published",owner:"А.Р. Халилов"},
{id:"obj_004",address:"ул. Шафиева, 22",district:"Октябрьский район",rooms:3,area:18,price:16000,deposit:8000,schedule:"night",quiet:"23:00",smoking:false,guests:false,pets:false,cleaning:"roster",split:"equal",score:92,status:"published",owner:"А.Р. Халилов"},
{id:"obj_005",address:"ул. Правды, 14",district:"Дёмский район",rooms:1,area:10,price:12000,deposit:6000,schedule:"any",quiet:"23:00",smoking:false,guests:true,pets:true,cleaning:"biweekly",split:"equal",score:65,status:"published",owner:"Т.Н. Волков"},
{id:"obj_006",address:"ул. Первомайская, 54",district:"Калининский район",rooms:2,area:13,price:14500,deposit:7000,schedule:"remote",quiet:"22:00",smoking:false,guests:false,pets:true,cleaning:"weekly",split:"meters",score:81,status:"draft",owner:"А.Р. Халилов"}],
candidates:[
{id:"cand_001",name:"Д.И. Смирнова",score:92,budget:18000,schedule:"night",objectId:"obj_004",status:"new",notified:false},
{id:"cand_002",name:"А.В. Гареев",score:74,budget:15000,schedule:"day",objectId:"obj_004",status:"new",notified:false},
{id:"cand_003",name:"Л.Р. Хисматуллина",score:88,budget:20000,schedule:"remote",objectId:"obj_003",status:"new",notified:false}],
applications:[{id:"app_001",objectId:"obj_004",seeker:"Д.И. Смирнова",status:"approved"},{id:"app_002",objectId:"obj_001",seeker:"Д.И. Смирнова",status:"approved"}],
contracts:[{id:"con_001",objectId:"obj_004",applicationId:"app_001",offerSigned:false,ownerSigned:false,depositHeld:false},
{id:"con_002",objectId:"obj_001",applicationId:"app_002",offerSigned:true,ownerSigned:true,depositHeld:true}],
acts:[],prevMeters:{electricity:"12310",cold:"118",hot:"82"},
verifications:[
{id:"ver_001",name:"А.Р. Халилов",passport:"80 12 № 456789",issued:"ОВД Октябрьского р-на г. Уфы",date:"2026-11-08",status:"pending"},
{id:"ver_002",name:"Д.И. Смирнова",passport:"80 14 № 123456",issued:"ОВД Советского р-на г. Уфы",date:"2026-11-09",status:"pending"},
{id:"ver_003",name:"Т.Н. Волков",passport:"80 09 № 778211",issued:"ОВД Дёмского р-на г. Уфы",date:"2026-11-10",status:"pending"}],
disputes:[
{id:"disp_001",objectId:"obj_001",parties:"А.Р. Халилов ↔ Д.И. Смирнова",subject:"Порча имущества (диван)",claim:4500,depositId:"dep_001",status:"open",decision:null,held:0},
{id:"disp_002",objectId:"obj_003",parties:"А.Р. Халилов ↔ А.В. Гареев",subject:"Нарушение режима тишины",claim:0,depositId:null,status:"open",decision:null,held:0}],
deposits:[
{id:"dep_001",user:"Д.И. Смирнова",objectId:"obj_001",amount:9000,status:"held",debt:0},
{id:"dep_002",user:"А.В. Гареев",objectId:"obj_003",amount:10000,status:"held",debt:0},
{id:"dep_003",user:"Л.Р. Хисматуллина",objectId:"obj_002",amount:7500,status:"released",debt:0}],
blacklist:[],directory:["Т.Н. Волков","А.В. Гареев","Л.Р. Хисматуллина","Д.И. Смирнова","А.Р. Халилов"]};}

function seedRuns(){const r=[];TASKS.forEach(t=>{EXPERIMENT[t.id].forEach((v,i)=>{
if(v===null){const f=(FAIL_TIME[t.id]||{})[i];r.push({scenario:t.id,participant:PARTICIPANTS[i],ms:Math.round((f||60)*1000),ok:false,src:"experiment"});}
else r.push({scenario:t.id,participant:PARTICIPANTS[i],ms:Math.round(v*1000),ok:true,src:"experiment"});});});return r;}

function load(){try{return JSON.parse(localStorage.getItem(KEY));}catch{return null;}}
let S=load()||{session:null,sessionId:null,screen:null,objectId:null,contractId:null,editLot:null,photos:0,filters:{},data:seed(),log:[],runs:seedRuns(),series:null};
if(!S.runs||!S.runs.length)S.runs=seedRuns();
function save(){localStorage.setItem(KEY,JSON.stringify(S));}
function me(){return ACCOUNTS.find(a=>a.id===S.session)||null;}
function obj(id){return S.data.objects.find(o=>o.id===id);}
function con(id){return S.data.contracts.find(c=>c.id===id);}
function app(id){return S.data.applications.find(a=>a.id===id);}
function title(o){return o?`${o.rooms}-комн. квартира, ${o.district}`:"—";}
function myContracts(){const u=me();if(!u)return[];return u.role==="seeker"?S.data.contracts.filter(c=>{const a=app(c.applicationId);return a&&a.seeker===u.name;}):S.data.contracts.filter(c=>{const o=obj(c.objectId);return o&&o.owner===u.name;});}

function logEvent(action,otype,oid,outcome,changes){const u=me();
S.log.push({timestamp:stamp(),actor_id:u?u.id:"guest",actor_role:u?u.role:"guest",action,object_type:otype,object_id:oid,outcome:outcome||"success",changes:changes||{},context:{correlation_id:S.sessionId||"auth",participant:S.series?S.series.name:null,task:S.series?S.series.taskId:null}});
save();if(S.series)checkTask(action,outcome||"success");}

function toast(t,k){const e=document.createElement("div");e.className="toast "+(k||"");
e.innerHTML=`<span>${k==="g"?"✓":k==="r"?"✕":k==="a"?"!":"•"}</span><span>${esc(t)}</span>`;
$("#toasts").appendChild(e);setTimeout(()=>{e.style.transition="opacity .3s";e.style.opacity="0";setTimeout(()=>e.remove(),320);},3400);}
function openModal(h){const m=$("#modal");m.innerHTML=`<div class="mbox">${h}</div>`;m.hidden=false;}
function closeModal(){const m=$("#modal");m.hidden=true;m.innerHTML="";}
function stag(s){const m={published:["g","Опубликован"],draft:["a","Черновик"],pending:["a","На рассмотрении"],approved:["g","Одобрена"],rejected:["r","Отклонена"],new:["b","Новый"],open:["a","Открыт"],resolved:["g","Решён"],held:["b","Удержан"],released:["g","Возвращён"],withheld:["r","Удержан по спору"]};const v=m[s]||["",s];return `<span class="tag ${v[0]}">${v[1]}</span>`;}
function rules(o){return `<div class="tags"><span class="tag">Тишина ${o.quiet}</span><span class="tag ${o.smoking?"a":"g"}">${o.smoking?"Курение: балкон":"Без курения"}</span><span class="tag ${o.guests?"a":"g"}">${o.guests?"Гости разрешены":"Без гостей"}</span><span class="tag ${o.pets?"a":"g"}">${o.pets?"Животные можно":"Без животных"}</span><span class="tag t">${SCHED[o.schedule]}</span></div>`;}
function sc(v){return v>=85?"":v>=70?"w":"d";}

function go(screen){const u=me();if(!u)return;
if(!SCREENS[u.role].includes(screen))screen=MENU[u.role][0][0];
S.screen=screen;document.querySelectorAll("main > section").forEach(s=>{s.hidden=true;});
const sec=$("#s-"+screen);if(sec)sec.hidden=false;
const act=PARENT[screen]||screen;
$("#nav").innerHTML=MENU[u.role].map(([id,n])=>`<button data-act="go" data-id="${id}" class="${id===act?"on":""}">${n}</button>`).join("");
const lg=SLOG[screen];if(lg){const[a,t,i]=lg();logEvent(a,t,i);if(screen==="deposits")logEvent("open_blacklist","screen","blacklist");}
const R={objects:rObjects,object:rObject,apps:rApps,contract:rContract,act:rAct,lots:rLots,"lot-form":rLotForm,candidates:rCand,contracts:rContracts,verify:rVerify,disputes:rDisp,deposits:rDep,tests:rTests,stats:rStats,journal:rJournal,profile:rProfile}[screen];
if(R)R();save();window.scrollTo({top:0,behavior:"smooth"});}

function rObjects(){const sel=$("#fl-district");
if(sel.options.length<=1)[...new Set(S.data.objects.map(o=>o.district))].forEach(d=>sel.add(new Option(d,d)));
$("#fl-budget").value=S.filters.budget||"";$("#fl-schedule").value=S.filters.schedule||"";sel.value=S.filters.district||"";$("#fl-sort").value=S.filters.sort||"score";
let L=S.data.objects.filter(o=>o.status==="published");
if(S.filters.budget)L=L.filter(o=>o.price<=+S.filters.budget);
if(S.filters.schedule)L=L.filter(o=>o.schedule===S.filters.schedule||o.schedule==="any");
if(S.filters.district)L=L.filter(o=>o.district===S.filters.district);
const s=S.filters.sort||"score";
L.sort((a,b)=>s==="price"?a.price-b.price:s==="area"?b.area-a.area:b.score-a.score);
$("#flc").textContent="Найдено: "+L.length;
$("#objects-list").innerHTML=L.map(o=>`<div class="card obj">
<div class="row" style="justify-content:space-between"><span class="tag v">${esc(o.district)}</span>${stag(o.status)}</div>
<h4>${esc(title(o))}</h4><div class="muted">${esc(o.address)} · комната ${o.area} м²</div>
<div class="price">${money(o.price)} ₽ <span style="font-size:12px;color:var(--muted);font-weight:600">/ мес. (доля)</span></div>
<div class="muted">Совместимость <b style="color:var(--green)">${o.score}%</b> · депозит ${money(o.deposit)} ₽</div>
<div class="bar ${sc(o.score)}"><i style="width:${o.score}%"></i></div>${rules(o)}
<div class="row" style="margin-top:auto"><button class="btn bs bp" data-act="open-object" data-id="${o.id}">Открыть карточку</button></div></div>`).join("")
||`<div class="card empty" style="grid-column:1/-1">По заданным параметрам объектов не найдено.<br><button class="btn bo" data-act="find-reset">Сбросить фильтры</button></div>`;}

function rObject(){const o=obj(S.objectId);if(!o){go("objects");return;}
const u=me(),ap=S.data.applications.some(a=>a.objectId===o.id&&a.seeker===u.name&&a.status!=="rejected");
const mine=S.data.applications.find(a=>a.objectId===o.id&&a.seeker===u.name);
$("#object-body").innerHTML=`${ap?`<div class="next"><b>Следующий шаг:</b> ${mine&&mine.status==="approved"?"заявка одобрена — откройте оферту и подпишите её":"заявка подана, ожидается решение инициатора"}<span class="sp"></span><button class="btn bs bp" data-act="go" data-id="apps">Перейти к заявкам</button></div>`:""}
<div class="grid g2"><div class="card">
<div class="row" style="justify-content:space-between"><span class="tag v">${esc(o.district)}</span>${stag(o.status)}</div>
<h3 style="margin-top:12px">${esc(title(o))}</h3>
<p class="muted">${esc(o.address)} · комната ${o.area} м² · инициатор: ${esc(o.owner)}</p>
<div class="price" style="font-size:26px;margin:12px 0">${money(o.price)} ₽ / мес.</div>
<p class="muted">Депозит: <b>${money(o.deposit)} ₽</b> — резервируется на эскроу-счёте платформы</p>
<p class="muted" style="margin-top:10px">Скоринг-совместимость: <b style="color:var(--green)">${o.score}%</b></p>
<div class="bar ${sc(o.score)}" style="margin-top:7px"><i style="width:${o.score}%"></i></div>
<div class="row mt"><button class="btn bp" data-act="apply" data-id="${o.id}" ${ap?"disabled":""}>${ap?"Заявка уже подана":"Подать заявку на заселение"}</button></div>
</div><div class="card"><h3>Бытовой регламент</h3>${rules(o)}
<div class="doc mt"><p><b>Режим тишины:</b> после ${o.quiet}</p><p><b>Курение:</b> ${o.smoking?"только на балконе":"запрещено"}</p>
<p><b>Гости с ночёвкой:</b> ${o.guests?"по согласованию с жильцами":"не допускаются"}</p>
<p><b>Домашние животные:</b> ${o.pets?"допускаются":"не допускаются"}</p>
<p><b>Уборка общих зон:</b> ${CLEAN[o.cleaning]}</p><p><b>Сплит-оплата ЖКХ:</b> ${SPLIT[o.split]}</p></div>
<div class="note mt">Подавая заявку, вы соглашаетесь на бытовой скоринг. Результат доступен инициатору до одобрения.</div></div></div>`;}

function rApps(){const u=me(),L=S.data.applications.filter(a=>a.seeker===u.name);
const ready=L.find(a=>a.status==="approved");
const rc=ready?S.data.contracts.find(c=>c.applicationId===ready.id):null;
$("#apps-next").innerHTML=rc&&!rc.offerSigned?`<div class="next"><b>Следующий шаг:</b> подписать оферту по одобренной заявке<span class="sp"></span><button class="btn bs bp" data-act="open-offer" data-id="${rc.id}">Открыть оферту</button></div>`:rc&&rc.offerSigned&&!rc.depositHeld?`<div class="next"><b>Следующий шаг:</b> заморозить депозит через эскроу-счёт<span class="sp"></span><button class="btn bs bg" data-act="open-offer" data-id="${rc.id}">К договору</button></div>`:rc&&rc.depositHeld?`<div class="next"><b>Следующий шаг:</b> зафиксировать показания счётчиков в акте приёмки<span class="sp"></span><button class="btn bs bt" data-act="open-act" data-id="${rc.id}">Открыть акт</button></div>`:"";
$("#apps-list").innerHTML=L.map(a=>{const o=obj(a.objectId),c=S.data.contracts.find(x=>x.applicationId===a.id);
return `<div class="card"><div class="row" style="justify-content:space-between"><h3 style="margin:0">${esc(title(o))}</h3>${stag(a.status)}</div>
<p class="muted">${esc(o?o.address:"")} · ${money(o?o.price:0)} ₽/мес · депозит ${money(o?o.deposit:0)} ₽</p>
<div class="row mt">${a.status==="approved"&&c?`<button class="btn bp" data-act="open-offer" data-id="${c.id}">Открыть оферту и договор</button>`:`<span class="tag a">Ожидает решения инициатора</span>`}
<button class="btn bo" data-act="open-object" data-id="${a.objectId}">Карточка объекта</button></div></div>`;}).join("")
||`<div class="card empty">Заявок пока нет.<br><button class="btn bp" data-act="go" data-id="objects">Перейти к объектам</button></div>`;}

function rContract(){const mine=myContracts();let c=con(S.contractId);
if(!c||!mine.includes(c))c=mine.find(x=>!x.depositHeld)||mine[0]||null;
if(!c){$("#contract-next").innerHTML="";$("#contract-body").innerHTML=`<div class="card empty">Договор ещё не сформирован.<br><button class="btn bp" data-act="go" data-id="apps">К моим заявкам</button></div>`;return;}
S.contractId=c.id;const o=obj(c.objectId),a=act2(c.id);
const done=c.offerSigned&&c.ownerSigned&&c.depositHeld;
$("#contract-next").innerHTML=!c.offerSigned?`<div class="next"><b>Следующий шаг:</b> подписать оферту о правилах проживания</div>`:!c.depositHeld?`<div class="next"><b>Следующий шаг:</b> заморозить депозит ${money(o.deposit)} ₽ через эскроу-счёт</div>`:`<div class="next"><b>Следующий шаг:</b> оформить акт приёмки при заселении<span class="sp"></span><button class="btn bs bt" data-act="open-act" data-id="${c.id}">Открыть акт</button></div>`;
$("#contract-body").innerHTML=`<div class="grid g2"><div class="card"><h3>Цифровой договор соаренды</h3>
<div class="doc"><h4>ДОГОВОР № ${c.id.toUpperCase()}</h4>
<p><b>Объект:</b> ${esc(title(o))}, ${esc(o.address)}</p>
<p><b>Инициатор:</b> ${esc(o.owner)} · <b>Соарендатор:</b> ${esc(me().name)}</p>
<p><b>Доля аренды:</b> ${money(o.price)} ₽/мес · <b>Депозит:</b> ${money(o.deposit)} ₽</p>
<p><b>Регламент:</b> тишина после ${o.quiet}; ${o.smoking?"курение на балконе":"без курения"}; ${o.guests?"гости по согласованию":"без гостей"}; ${o.pets?"животные допускаются":"без животных"}.</p>
<p><b>Уборка:</b> ${CLEAN[o.cleaning]} · <b>ЖКХ:</b> ${SPLIT[o.split]}</p>
<p>Депозит резервируется на эскроу-счёте платформы и возвращается после акта выселения либо удерживается по решению арбитража.</p>
<div class="signs"><div class="sign ${c.offerSigned?"ok":""}">${c.offerSigned?"✓ Оферта подписана":"Оферта не подписана"}</div>
<div class="sign ${c.ownerSigned?"ok":""}">${c.ownerSigned?"✓ Подпись инициатора":"Ожидает инициатора"}</div>
<div class="sign ${c.depositHeld?"ok":""}">${c.depositHeld?"✓ Депозит удержан":"Депозит не зарезервирован"}</div></div></div>
${done?`<div class="note g mt">Договор заключён. Депозит удержан на эскроу-счёте.</div>`:""}</div>
<div class="card"><h3>Действия по договору</h3><div class="grid">
<button class="btn bp bw" data-act="sign-offer" data-id="${c.id}" ${c.offerSigned?"disabled":""}>${c.offerSigned?"✓ Оферта подписана":"Подписать оферту о правилах проживания"}</button>
<button class="btn bg bw" data-act="freeze" data-id="${c.id}" ${!c.offerSigned||c.depositHeld?"disabled":""}>${c.depositHeld?"✓ Депозит удержан":"Заморозить депозит через эскроу-счёт"}</button>
<button class="btn bo bw" data-act="open-act" data-id="${c.id}" ${!c.depositHeld?"disabled":""}>${a?"Акт приёмки сохранён — открыть":"Перейти к акту приёмки"}</button></div>
<div class="note a mt">Заморозка депозита доступна после подписания оферты. Возврат или удержание выполняет администратор по итогам арбитража.</div></div></div>`;}
function act2(cid){return S.data.acts.find(a=>a.contractId===cid);}

function rAct(){const mine=myContracts().filter(c=>c.depositHeld);let c=con(S.contractId);
if(!c||!mine.includes(c))c=mine[0]||null;
const f=$("#f-act");
if(!c){$("#act-obj").textContent="Нет договора с удержанным депозитом. Сначала подпишите оферту и заморозьте депозит.";$("#act-auto").hidden=true;f.hidden=true;return;}
f.hidden=false;$("#act-auto").hidden=false;S.contractId=c.id;
const o=obj(c.objectId),a=act2(c.id),p=a||S.data.prevMeters;
$("#act-obj").textContent=`${title(o)}, ${o.address} · договор ${c.id.toUpperCase()}`;
f.electricity.value=p.electricity;f.cold.value=p.cold;f.hot.value=p.hot;f.note.value=a?a.note:"";
S.photos=a?a.photos:0;$("#act-ph").textContent=S.photos?`Прикреплено фото: ${S.photos}`:"Фото не прикреплены";}

function rLots(){const L=S.data.objects.filter(o=>o.owner===me().name);
$("#lots-list").innerHTML=L.map(o=>`<div class="card obj">
<div class="row" style="justify-content:space-between"><span class="tag v">${esc(o.district)}</span>${stag(o.status)}</div>
<h4>${esc(title(o))}</h4><div class="muted">${esc(o.address)} · комната ${o.area} м²</div>
<div class="price">${money(o.price)} ₽ / мес.</div>
<div class="muted">Уборка: ${CLEAN[o.cleaning]} · ЖКХ: ${SPLIT[o.split]}</div>${rules(o)}
<div class="row" style="margin-top:auto"><button class="btn bs bo" data-act="lot-edit" data-id="${o.id}">Изменить</button>
${o.status==="draft"?`<button class="btn bs bg" data-act="lot-publish" data-id="${o.id}">Опубликовать</button>`:""}
<button class="btn bs br" data-act="lot-del" data-id="${o.id}">Удалить</button></div></div>`).join("")
||`<div class="card empty" style="grid-column:1/-1">Лотов пока нет.<br><button class="btn bp" data-act="lot-new">Создать первый лот</button></div>`;}

function rLotForm(){const f=$("#f-lot"),o=S.editLot?obj(S.editLot):null;
$("#lf-title").textContent=o?"Редактирование лота":"Новый лот";
f.id.value=o?o.id:"";f.address.value=o?o.address:"";f.district.value=o?o.district:"Октябрьский район";
f.rooms.value=o?o.rooms:"2";f.area.value=o?o.area:"";f.price.value=o?o.price:"";
f.deposit.value=o?o.deposit:"";f.schedule.value=o?o.schedule:"day";f.quiet.value=o?o.quiet:"23:00";
f.cleaning.value=o?o.cleaning:"weekly";f.split.value=o?o.split:"equal";
f.smoking.checked=o?o.smoking:false;f.guests.checked=o?o.guests:false;f.pets.checked=o?o.pets:false;
$("#addr-sug").hidden=true;}

function rCand(){$("#cand-list").innerHTML=S.data.candidates.map(c=>{const o=obj(c.objectId);
const cc=c.applicationId?S.data.contracts.find(x=>x.applicationId===c.applicationId):null;
let actions=`<button class="btn bs bo" data-act="scoring" data-id="${c.id}">Просмотреть скоринг</button>`;
if(c.status==="new")actions+=`<button class="btn bs bg" data-act="cand-ok" data-id="${c.id}">Одобрить</button><button class="btn bs br" data-act="cand-no" data-id="${c.id}">Отклонить</button>`;
else if(c.status==="approved"&&!cc)actions+=`<button class="btn bs bp" data-act="mk-contract" data-id="${c.id}">Сформировать договор</button>`;
else if(cc&&!cc.ownerSigned)actions+=`<button class="btn bs bv" data-act="sign-contract" data-id="${cc.id}">Подписать договор</button>`;
else if(cc)actions+=`<span class="tag g">Договор подписан</span>`;
return `<div class="card obj"><div class="row" style="justify-content:space-between"><h4>${esc(c.name)}</h4>${stag(c.status)}</div>
<div class="muted">${esc(title(o))} · ${esc(o?o.address:"")}</div>
<div class="muted">Бюджет ${money(c.budget)} ₽ · ${SCHED[c.schedule]}</div>
<div class="muted">Скоринг-балл: <b style="color:${c.score>=85?"var(--green)":c.score>=70?"var(--amber)":"var(--red)"}">${c.score} / 100</b> · порог 80</div>
<div class="bar ${sc(c.score)}"><i style="width:${c.score}%"></i></div>
${c.notified?`<div class="note a">Условия лота изменены — уведомление отправлено кандидату.</div>`:""}
<div class="row" style="margin-top:auto">${actions}</div></div>`;}).join("");}

function rContracts(){const L=myContracts();
$("#contracts-list").innerHTML=L.map(c=>{const o=obj(c.objectId),a=app(c.applicationId);
const done=c.offerSigned&&c.ownerSigned&&c.depositHeld;
return `<div class="card"><div class="row" style="justify-content:space-between"><h3 style="margin:0">${esc(title(o))}</h3>${done?'<span class="tag g">Заключён</span>':'<span class="tag a">В процессе</span>'}</div>
<p class="muted">Договор ${c.id.toUpperCase()} · соарендатор ${esc(a?a.seeker:"—")} · ${money(o.price)} ₽/мес · депозит ${money(o.deposit)} ₽</p>
<div class="signs"><div class="sign ${c.offerSigned?"ok":""}">${c.offerSigned?"✓ Оферта подписана":"Оферта не подписана"}</div>
<div class="sign ${c.ownerSigned?"ok":""}">${c.ownerSigned?"✓ Подпись инициатора":"Ожидает подписи"}</div>
<div class="sign ${c.depositHeld?"ok":""}">${c.depositHeld?"✓ Депозит удержан":"Депозит не зарезервирован"}</div></div>
<div class="row mt"><button class="btn bv" data-act="sign-contract" data-id="${c.id}" ${c.ownerSigned?"disabled":""}>${c.ownerSigned?"✓ Договор подписан":"Подписать договор со своей стороны"}</button></div></div>`;}).join("")
||`<div class="card empty">Договоров пока нет.<br><button class="btn bp" data-act="go" data-id="candidates">Перейти к кандидатам</button></div>`;}

function rVerify(){$("#vc").textContent="В очереди: "+S.data.verifications.filter(v=>v.status==="pending").length;
$("#verify-list").innerHTML=S.data.verifications.map(v=>`<div class="card">
<div class="row" style="justify-content:space-between"><h3 style="margin:0">${esc(v.name)}</h3>${stag(v.status)}</div>
<p class="muted">Паспорт ${esc(v.passport)} · заявление от ${v.date}</p>
<div class="row mt"><button class="btn bs bo" data-act="docs" data-id="${v.id}">Просмотреть документы</button>
<button class="btn bs bg" data-act="ver-ok" data-id="${v.id}" ${v.status!=="pending"?"disabled":""}>Одобрить верификацию</button>
<button class="btn bs br" data-act="ver-no" data-id="${v.id}" ${v.status!=="pending"?"disabled":""}>Отклонить</button></div></div>`).join("");}

function rDisp(){$("#dc").textContent="Открыто: "+S.data.disputes.filter(d=>d.status==="open").length;
$("#disp-list").innerHTML=S.data.disputes.map(d=>{const o=obj(d.objectId);
return `<div class="card"><div class="row" style="justify-content:space-between"><h3 style="margin:0">${esc(d.subject)}</h3>${stag(d.status)}</div>
<p class="muted">${esc(d.parties)} · ${esc(title(o))}, ${esc(o?o.address:"")}</p>
${d.claim?`<p class="muted">Сумма претензии: <b style="color:var(--red)">${money(d.claim)} ₽</b></p>`:""}
${d.status==="resolved"?`<div class="note g mt">Решение: ${d.decision==="withhold"?`удержать ${money(d.held)} ₽ из депозита`:"вернуть депозит полностью"}. Спор закрыт.</div>`:""}
<div class="row mt"><button class="btn bs bo" data-act="materials" data-id="${d.id}">Материалы спора</button>
<button class="btn bs ba" data-act="decide" data-id="${d.id}" ${d.status!=="open"?"disabled":""}>Принять решение</button></div></div>`;}).join("");}

function blockers(d){return{open:S.data.disputes.some(x=>x.depositId===d.id&&x.status==="open"),debt:d.debt>0};}
function rDep(){
$("#dep-body").innerHTML=S.data.deposits.map(d=>{const o=obj(d.objectId),b=blockers(d),bl=b.open||b.debt;
return `<tr><td class="mono">${d.id}</td><td>${esc(d.user)}</td><td>${esc(o?o.district:"—")}</td>
<td><b>${money(d.amount)} ₽</b></td><td>${stag(d.status)}</td>
<td>${d.status!=="held"?'<span class="muted">—</span>':bl?`<span class="tag a">${b.open?"Открытый спор":"Задолженность"}</span>`:'<span class="tag g">Ограничений нет</span>'}</td>
<td><div class="row"><button class="btn bs bg" data-act="refund" data-id="${d.id}" ${d.status!=="held"||bl?"disabled":""}>Вернуть</button>
<button class="btn bs br" data-act="withhold" data-id="${d.id}" ${d.status!=="held"?"disabled":""}>Удержать</button></div></td></tr>`;}).join("");
$("#bl-body").innerHTML=S.data.blacklist.map(b=>`<tr><td>${esc(b.user)}</td><td>${esc(b.reason)}</td><td class="mono">${b.date}</td><td><span class="tag r">Заблокирован</span></td>
<td><button class="btn bs bo" data-act="unblock" data-id="${b.id}">Разблокировать</button></td></tr>`).join("")||`<tr><td colspan="5" class="empty">Реестр пуст</td></tr>`;
const us=$("#bl-user"),rs=$("#bl-reason");
if(!us.options.length){us.add(new Option("— выберите пользователя —",""));S.data.directory.forEach(n=>us.add(new Option(n,n)));}
if(!rs.options.length){rs.add(new Option("— выберите причину —",""));REASONS.forEach(n=>rs.add(new Option(n,n)));}}

function rTests(){const sel=$("#t-name");
if(!sel.options.length)PARTICIPANTS.forEach(n=>sel.add(new Option(n,n)));
$("#t-list").innerHTML=TASKS.map(t=>`<tr><td class="mono">S${t.id}</td><td><b>${esc(t.name)}</b></td><td>${ROLES[t.role]}</td><td style="max-width:520px">${esc(t.task)}</td><td class="num">${nf(t.mu)}</td></tr>`).join("");
$("#t-count").textContent="Записей: "+S.runs.length;
$("#t-runs").innerHTML=S.runs.slice().reverse().slice(0,120).map(r=>{const t=TASKS.find(x=>x.id===r.scenario);
return `<tr><td>S${r.scenario} · ${esc(t?t.name:"")}</td><td>${esc(r.participant)}</td><td class="num">${nf(r.ms/1000)}</td>
<td>${r.ok?'<span class="pill ok">Засчитано</span>':'<span class="pill no">Не выполнено</span>'}</td></tr>`;}).join("")
||`<tr><td colspan="4" class="empty">Прохождений пока нет</td></tr>`;}

function computeStats(vals,mu){const n=vals.length;
if(!n)return{n:0,mean:0,varr:0,sd:0,se:0,t:0,tc:0,lo:0,hi:0,reject:false,inside:false,mu};
const mean=vals.reduce((a,b)=>a+b,0)/n;
const varr=n>1?vals.reduce((a,b)=>a+(b-mean)*(b-mean),0)/(n-1):0;
const sd=Math.sqrt(varr),se=sd/Math.sqrt(n),tc=tCrit(n-1);
const t=se>0?(mean-mu)/se:0,half=tc*se;
return{n,mean,varr,sd,se,t,tc,lo:mean-half,hi:mean+half,reject:Math.abs(t)>tc,inside:mu>=mean-half&&mu<=mean+half,mu};}

function allStats(){return TASKS.map(t=>{
const ok=S.runs.filter(r=>r.scenario===t.id&&r.ok).map(r=>r.ms/1000);
const failed=S.runs.filter(r=>r.scenario===t.id&&!r.ok);
return{task:t,st:computeStats(ok,t.mu),failed,vals:ok};});}

function chartSVG(rows){const R=rows.filter(r=>r.st.n);if(!R.length)return '<div class="empty">Нет данных для построения диаграммы</div>';
const W=980,rh=54,H=R.length*rh+34,max=Math.max(...R.map(r=>Math.max(r.st.mean,r.task.mu)))*1.16;
const col={seeker:"#0ea371",initiator:"#2563eb",admin:"#7c4ddb"};
const bw=v=>Math.max(2,v/max*(W-330));
return `<svg class="chart" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Сравнение среднего времени и оценки GOMS">
${R.map((r,i)=>{const y=i*rh+16,c=col[r.task.role];
return `<g><text x="0" y="${y+13}" fill="#647192" font-size="11.5" font-family="ui-monospace,Consolas,monospace">S${r.task.id} · ${r.task.role==="seeker"?"искатель":r.task.role==="initiator"?"инициатор":"админ"}</text>
<rect x="168" y="${y}" width="${bw(r.task.mu)}" height="13" rx="6.5" fill="#cfd8ea"/>
<text x="${168+bw(r.task.mu)+8}" y="${y+11}" fill="#647192" font-size="10.5" font-family="ui-monospace,Consolas,monospace">${nf(r.task.mu)} с</text>
<rect x="168" y="${y+18}" width="${bw(r.st.mean)}" height="13" rx="6.5" fill="${c}"/>
${r.st.reject?`<rect x="168" y="${y+18}" width="${bw(r.st.mean)}" height="13" rx="6.5" fill="none" stroke="#dc3545" stroke-width="2" stroke-dasharray="4 3"/>`:""}
<text x="${168+bw(r.st.mean)+8}" y="${y+29}" fill="#141d33" font-size="10.5" font-weight="700" font-family="ui-monospace,Consolas,monospace">${nf(r.st.mean)} с</text></g>`;}).join("")}
</svg><div class="legend"><span><i style="background:#cfd8ea"></i>Оценка GOMS</span><span><i style="background:#2563eb"></i>Инициатор</span><span><i style="background:#0ea371"></i>Искатель</span><span><i style="background:#7c4ddb"></i>Администратор</span><span><i style="background:#fff;border:2px dashed #dc3545"></i>H₀ отвергается</span></div>`;}

function rStats(){const rows=allStats();
const total=S.runs.length,okc=S.runs.filter(r=>r.ok).length,rej=rows.filter(r=>r.st.reject).length;
const sumMean=rows.reduce((a,r)=>a+r.st.mean,0),sumMu=rows.reduce((a,r)=>a+r.task.mu,0);
$("#st-top").innerHTML=`<div class="stat"><b>${total}</b><span>Всего прохождений</span></div>
<div class="stat"><b>${okc}</b><span>Засчитано</span></div>
<div class="stat"><b>${rej} из ${rows.length}</b><span>Сценариев с отклонением H₀</span></div>
<div class="stat" style="grid-column:1/-1"><b>${nf(sumMean)} с / ${nf(sumMu)} с</b><span>Сумма средних фактических времён / сумма оценок GOMS · превышение ${nf((sumMean-sumMu)/sumMu*100,1)} %</span></div>`;
$("#st-chart").innerHTML=chartSVG(rows);
$("#st-sum").innerHTML=rows.map(r=>{const s=r.st;
return `<tr><td><b>S${r.task.id}.</b> ${esc(r.task.name)}</td><td class="num">${s.n}</td><td class="num">${nf(s.mean)}</td><td class="num">${nf(s.sd)}</td>
<td class="num">${nf(r.task.mu)}</td><td class="num">${nf(Math.abs(s.t),3)}</td><td class="num">${nf(s.tc,3)}</td>
<td class="num">${nf(s.lo)}–${nf(s.hi)}</td><td>${s.reject?'<span class="pill no">Отвергается</span>':'<span class="pill ok">Не отвергается</span>'}</td></tr>`;}).join("");
$("#st-detail").innerHTML=rows.map(r=>{const s=r.st,t=r.task;
const cells=PARTICIPANTS.map((p,i)=>{const rec=S.runs.find(x=>x.scenario===t.id&&x.participant===p);
if(!rec)return "<td class='num'>—</td>";
return `<td class="num">${nf(rec.ms/1000)}${rec.ok?"":"*"}</td>`;}).join("");
const extra=S.runs.filter(x=>x.scenario===t.id&&!PARTICIPANTS.includes(x.participant));
return `<div class="card"><h3>Сценарий ${t.id} — ${esc(t.name)}</h3>
<div class="tw"><table><thead><tr><th>Участник</th>${PARTICIPANTS.map(p=>`<th>${p}</th>`).join("")}</tr></thead>
<tbody><tr><td><b>Время, с</b></td>${cells}</tr></tbody></table></div>
${extra.length?`<p class="muted mt">Дополнительные прохождения: ${extra.map(x=>`${esc(x.participant)} — ${nf(x.ms/1000)} с${x.ok?"":" (не засчитано)"}`).join("; ")}</p>`:""}
<div class="kv mt" style="grid-template-columns:1fr auto">
<span>Число засчитанных прохождений n</span><b>${s.n}</b>
<span>Среднее время x̄</span><b>${nf(s.mean)} с</b>
<span>Исправленная дисперсия s²</span><b>${nf(s.varr,4)}</b>
<span>Стандартное отклонение s</span><b>${nf(s.sd)} с</b>
<span>Стандартная ошибка s/√n</span><b>${nf(s.se,4)}</b>
<span>Оценка GOMS μ₀</span><b>${nf(t.mu)} с</b>
<span>Степени свободы k = n − 1</span><b>${s.n-1}</b>
<span>Критическая точка t кр (α = 0,05)</span><b>${nf(s.tc,3)}</b>
<span>Наблюдаемое |t набл|</span><b>${nf(Math.abs(s.t),3)}</b>
<span>95 %-й доверительный интервал</span><b>${nf(s.lo)} &lt; m &lt; ${nf(s.hi)}</b></div>
<div class="note ${s.reject?"a":"g"}">${s.reject
?`|t набл| = ${nf(Math.abs(s.t),3)} &gt; t кр = ${nf(s.tc,3)} — нулевая гипотеза отвергается. Оценка GOMS ${nf(t.mu)} с ${t.mu<s.lo?"находится ниже нижней границы":"находится выше верхней границы"} доверительного интервала. Фактические затраты времени статистически значимо отличаются от теоретических.`
:`|t набл| = ${nf(Math.abs(s.t),3)} ≤ t кр = ${nf(s.tc,3)} — оснований отвергнуть нулевую гипотезу нет. Оценка GOMS ${nf(t.mu)} с входит в 95 %-й доверительный интервал, фактические затраты времени согласуются с теоретической оценкой.`}</div>
${r.failed.length?`<p class="muted mt">Незасчитанные попытки: ${r.failed.map(x=>`${esc(x.participant)} — ${nf(x.ms/1000)} с`).join("; ")}. Исключены из расчёта.</p>`:""}
</div>`;}).join("");}

function rJournal(){const ses={};S.log.forEach(e=>{ses[e.context.correlation_id]=1;});
$("#j-top").innerHTML=`<div class="stat"><b>${S.log.length}</b><span>Записей в журнале</span></div>
<div class="stat"><b>${Object.keys(ses).length}</b><span>Сеансов работы</span></div>
<div class="stat"><b>${S.runs.filter(r=>r.ok).length}</b><span>Засчитанных сценариев</span></div>`;
$("#j-body").innerHTML=S.log.slice(-140).reverse().map(e=>`<tr><td class="mono">${e.timestamp.slice(11,23)}</td>
<td>${esc(e.context.participant||e.actor_id)}</td><td>${esc(ROLES[e.actor_role]||e.actor_role)}</td>
<td class="mono" style="color:var(--blueD)">${esc(e.action)}</td><td class="mono">${esc(e.object_type)}:${esc(e.object_id)}</td>
<td>${e.outcome==="success"?'<span class="tag g">Успешно</span>':'<span class="tag r">Ошибка</span>'}</td></tr>`).join("")
||`<tr><td colspan="6" class="empty">Журнал пуст</td></tr>`;}

function rProfile(){const u=me(),mine=S.log.filter(e=>e.actor_id===u.id);
const extra=u.role==="seeker"?`<p class="muted mt">Скоринг-балл профиля: <b style="color:var(--green)">87 / 100</b></p><div class="bar" style="margin-top:7px"><i style="width:87%"></i></div>`
:u.role==="initiator"?`<p class="muted mt">Активных лотов: <b>${S.data.objects.filter(o=>o.owner===u.name&&o.status==="published").length}</b> · черновиков: <b>${S.data.objects.filter(o=>o.owner===u.name&&o.status==="draft").length}</b></p>`
:`<p class="muted mt">Открытых споров: <b>${S.data.disputes.filter(d=>d.status==="open").length}</b> · заявок на верификацию: <b>${S.data.verifications.filter(v=>v.status==="pending").length}</b></p>`;
$("#prof-body").innerHTML=`<div class="grid g2"><div class="card"><h3>${esc(u.name)}</h3>
<p class="muted">Роль: ${ROLES[u.role]}</p><p class="muted">Учётная запись: <span class="mono">${u.login}</span> · <span class="mono">${u.id}</span></p>
${extra}<div class="row mt"><button class="btn bo" data-act="logout">Выйти из системы</button></div></div>
<div class="card"><h3>История действий</h3>${mine.slice(-9).reverse().map(e=>`<p class="muted" style="padding:7px 0;border-bottom:1px dashed var(--line)"><span class="mono">${e.timestamp.slice(11,19)}</span> · ${esc(e.action)}</p>`).join("")||'<p class="muted">Действий пока нет</p>'}</div></div>`;}

function csvCell(v){return '"'+String(typeof v==="string"?v:JSON.stringify(v??{})).replace(/"/g,'""')+'"';}
function toCSV(){return "timestamp,actor_id,actor_role,action,object_type,object_id,outcome,changes,context\n"+S.log.map(e=>[e.timestamp,e.actor_id,e.actor_role,e.action,e.object_type,e.object_id,e.outcome,csvCell(e.changes),csvCell(e.context)].join(",")).join("\n");}
function toJSONL(){return S.log.map(e=>JSON.stringify({timestamp:e.timestamp,actor:{id:e.actor_id,role:e.actor_role},action:e.action,object:{type:e.object_type,id:e.object_id},outcome:e.outcome,changes:e.changes,context:e.context})).join("\n");}
function toTXT(){return S.log.map(e=>`${e.timestamp} actor=${e.actor_id} role=${e.actor_role} action=${e.action} object=${e.object_type}:${e.object_id} outcome=${e.outcome} corr=${e.context.correlation_id}`+(e.context.participant?` participant="${e.context.participant}"`:"")+(Object.keys(e.changes).length?" change="+JSON.stringify(e.changes):"")).join("\n");}
function statsCSV(){const rows=allStats();
let c="scenario,name,n,mean_s,sd_s,goms_s,t_obs,t_crit,ci_low,ci_high,h0\n";
rows.forEach(r=>{const s=r.st;c+=`S${r.task.id},"${r.task.name}",${s.n},${s.mean.toFixed(4)},${s.sd.toFixed(4)},${r.task.mu},${Math.abs(s.t).toFixed(4)},${s.tc},${s.lo.toFixed(4)},${s.hi.toFixed(4)},${s.reject?"rejected":"not_rejected"}\n`;});
c+="\nscenario,participant,time_s,counted\n";
S.runs.forEach(r=>{c+=`S${r.scenario},"${r.participant}",${(r.ms/1000).toFixed(2)},${r.ok?1:0}\n`;});
return c;}
function download(n,t){const b=new Blob(["\uFEFF"+t],{type:"text/plain;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1200);}

function setupTask(t){S.data=seed();S.objectId=null;S.contractId=null;S.editLot=null;S.photos=0;S.filters={};
if(t.id===10){const d=S.data.disputes.find(x=>x.id==="disp_001");d.status="resolved";d.decision="refund";d.held=0;}
if(t.id===6){const c=S.data.contracts.find(x=>x.id==="con_002");S.contractId=c.id;}
if(t.id===5){const c=S.data.contracts.find(x=>x.id==="con_001");S.contractId=c.id;}
S.session=ACCOUNTS.find(a=>a.role===t.role).id;S.sessionId=S.series.sid;}

function startSeries(){const custom=$("#t-custom").value.trim();
const name=custom||$("#t-name").value;
if(!name){toast("Укажите имя участника","r");return;}
S.series={name,sid:uid("sess"),idx:0,taskId:null,t0:0,step:0,events:[]};
logEvent("series_start","series",S.series.sid,"success",{participant:name});
startTask();toast("Серия заданий начата: "+name,"g");}

function startTask(){const sr=S.series;if(!sr)return;
if(sr.idx>=TASKS.length){endSeries();return;}
const t=TASKS[sr.idx];sr.taskId=t.id;sr.step=0;sr.t0=performance.now();sr.events=[];
setupTask(t);S.screen=MENU[t.role][0][0];
$("#main").classList.add("testing");
render();renderHud();}

function renderHud(){const sr=S.series,el=$("#hud");
if(!sr||sr.taskId===null){el.hidden=true;el.innerHTML="";return;}
const t=TASKS.find(x=>x.id===sr.taskId);
el.hidden=false;
el.innerHTML=`<div class="hud"><div class="hud-p"><i style="width:${sr.idx/TASKS.length*100}%"></i></div>
<div class="hud-in"><div class="hud-n"><b>${sr.idx+1}/${TASKS.length}</b><span>задание</span></div>
<div class="hud-t"><b>S${t.id}. ${esc(t.name)} · ${ROLES[t.role]}</b><p>${esc(t.task)}</p></div>
<div class="hud-c"><div class="tm" id="hud-tm">00:00.0</div><span>время</span></div>
<div class="hud-b"><button class="btn bs ba" data-act="task-fail">Не могу выполнить</button><button class="btn bs bo" data-act="series-stop">Прервать серию</button></div></div></div>`;}

setInterval(()=>{const sr=S.series;if(sr&&sr.taskId!==null){const e=performance.now()-sr.t0;
const m=Math.floor(e/60000),s=Math.floor(e%60000/1000),d=Math.floor(e%1000/100);
const n=$("#hud-tm");if(n)n.textContent=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}.${d}`;}},100);

function checkTask(action,outcome){const sr=S.series;if(!sr||sr.taskId===null)return;
const t=TASKS.find(x=>x.id===sr.taskId);
if(action===t.sig[sr.step]){sr.step++;
if(sr.step>=t.sig.length){const ms=performance.now()-sr.t0;
S.runs.push({scenario:t.id,participant:sr.name,ms:Math.round(ms),ok:true,src:"live"});
logEvent("scenario_end","scenario","S"+t.id,"success",{participant:sr.name,time_s:+(ms/1000).toFixed(2)});
sr.taskId=null;sr.idx++;save();
toast(`Задание S${t.id} засчитано: ${nf(ms/1000)} с`,"g");
$("#hud").hidden=true;setTimeout(()=>startTask(),900);}}
else if(action==="scenario_start"||action==="series_start"){}
}

function failTask(){const sr=S.series;if(!sr||sr.taskId===null)return;
const t=TASKS.find(x=>x.id===sr.taskId),ms=performance.now()-sr.t0;
S.runs.push({scenario:t.id,participant:sr.name,ms:Math.round(ms),ok:false,src:"live"});
logEvent("scenario_end","scenario","S"+t.id,"failure",{participant:sr.name,time_s:+(ms/1000).toFixed(2),reason:"not_completed"});
sr.taskId=null;sr.idx++;save();toast(`Задание S${t.id} не засчитано`,"a");
$("#hud").hidden=true;setTimeout(()=>startTask(),700);}

function stopSeries(){const sr=S.series;if(!sr)return;
logEvent("series_abort","series",sr.sid,"failure",{completed:sr.idx});
S.series=null;$("#main").classList.remove("testing");$("#hud").hidden=true;save();render();toast("Серия прервана","a");}

function endSeries(){const sr=S.series;if(!sr)return;
const done=S.runs.filter(r=>r.participant===sr.name&&r.src==="live");
const ok=done.filter(r=>r.ok);
logEvent("series_end","series",sr.sid,"success",{participant:sr.name,counted:ok.length,total:done.length});
S.series=null;$("#main").classList.remove("testing");$("#hud").hidden=true;save();
const sum=ok.reduce((a,r)=>a+r.ms,0)/1000;
openModal(`<h3>Серия завершена</h3><p class="lead">Участник: <b>${esc(sr.name)}</b>. Засчитано ${ok.length} из ${done.length} заданий.</p>
<div class="kv"><span>Суммарное время засчитанных сценариев</span><b>${nf(sum)} с</b><span>Среднее время сценария</span><b>${ok.length?nf(sum/ok.length):"—"} с</b><span>Записей в журнале</span><b>${S.log.length}</b></div>
<div class="tw" style="margin-bottom:16px"><table style="min-width:420px"><thead><tr><th>Сценарий</th><th>Время, с</th><th>Результат</th></tr></thead><tbody>
${done.map(r=>`<tr><td>S${r.scenario}</td><td class="num">${nf(r.ms/1000)}</td><td>${r.ok?'<span class="pill ok">Засчитано</span>':'<span class="pill no">Не выполнено</span>'}</td></tr>`).join("")}</tbody></table></div>
<div class="row"><button class="btn bp" data-act="exp-log" data-id="csv">Скачать лог CSV</button><button class="btn bo" data-act="go-stats">Открыть статистику</button><button class="btn bo" data-act="modal-close">Закрыть</button></div>`);
render();}

function render(){const u=me();
if(!u){$("#s-login").hidden=false;$("#shell").hidden=true;$("#hud").hidden=true;$("#main").classList.remove("testing");return;}
$("#s-login").hidden=true;$("#shell").hidden=false;
$("#wn").textContent=u.name;$("#wr").textContent=ROLES[u.role];
go(S.screen||MENU[u.role][0][0]);
if(S.series&&S.series.taskId!==null){$("#main").classList.add("testing");renderHud();}}

$("#f-login").addEventListener("submit",e=>{e.preventDefault();const fd=new FormData(e.target);
const a=ACCOUNTS.find(x=>x.login===String(fd.get("login")).trim()&&x.password===String(fd.get("password")));
if(!a){$("#lerr").hidden=false;$("#lerr").textContent="Неверный логин или пароль";logEvent("login","account",String(fd.get("login")),"failure",{reason:"invalid_credentials"});return;}
$("#lerr").hidden=true;e.target.reset();
S.session=a.id;S.sessionId=uid("sess");S.screen=MENU[a.role][0][0];S.objectId=null;S.contractId=null;S.editLot=null;S.filters={};
logEvent("login","account",a.id,"success",{role:a.role});render();toast("Вы вошли как "+a.name,"g");});

$("#f-lot").addEventListener("submit",e=>{e.preventDefault();const fd=new FormData(e.target);
const id=String(fd.get("id")||""),pub=e.submitter&&e.submitter.name==="publish";
const v={address:String(fd.get("address")).trim(),district:String(fd.get("district")),rooms:+fd.get("rooms"),
area:+fd.get("area"),price:+fd.get("price"),deposit:+fd.get("deposit"),schedule:String(fd.get("schedule")),
quiet:String(fd.get("quiet")),cleaning:String(fd.get("cleaning")),split:String(fd.get("split")),
smoking:fd.get("smoking")==="on",guests:fd.get("guests")==="on",pets:fd.get("pets")==="on"};
if(!v.address||!v.area||!v.price||!v.deposit){toast("Заполните обязательные поля","r");logEvent("save_lot","lot",id||"new","failure",{reason:"required_fields"});return;}
if(id){const o=obj(id),before={price:o.price,cleaning:o.cleaning};Object.assign(o,v);if(pub)o.status="published";
logEvent("save_lot","lot",id,"success",{price:{old:before.price,new:v.price},cleaning:{old:before.cleaning,new:v.cleaning}});
S.data.candidates.filter(c=>c.objectId===id).forEach(c=>{c.notified=true;});
logEvent("notify_candidates","lot",id,"success",{notified:S.data.candidates.filter(c=>c.objectId===id).length});
if(pub)logEvent("publish_lot","lot",id);
toast(pub?"Лот сохранён и опубликован":"Изменения сохранены, кандидаты уведомлены","g");}
else{const o={id:uid("obj"),...v,score:80,status:pub?"published":"draft",owner:me().name};S.data.objects.push(o);
logEvent("save_lot","lot",o.id,"success",v);if(pub)logEvent("publish_lot","lot",o.id);
toast(pub?"Лот опубликован":"Лот сохранён как черновик","g");}
S.editLot=null;save();go("lots");});

$("#f-act").addEventListener("submit",e=>{e.preventDefault();const c=con(S.contractId);
if(!c||!c.depositHeld){toast("Сначала выберите договор с удержанным депозитом","r");return;}
const fd=new FormData(e.target);
const a={id:uid("act"),contractId:c.id,electricity:String(fd.get("electricity")),cold:String(fd.get("cold")),hot:String(fd.get("hot")),note:String(fd.get("note")),photos:S.photos,at:stamp()};
const i=S.data.acts.findIndex(x=>x.contractId===c.id);if(i>=0)S.data.acts[i]=a;else S.data.acts.push(a);
S.data.prevMeters={electricity:a.electricity,cold:a.cold,hot:a.hot};
logEvent("save_act","act",a.id,"success",{electricity:a.electricity,cold:a.cold,hot:a.hot,photos:a.photos});
save();toast("Акт приёмки сохранён","g");go("contract");});

$("#f-block").addEventListener("submit",e=>{e.preventDefault();const fd=new FormData(e.target);
const u=String(fd.get("user")||""),r=String(fd.get("reason")||"");
if(!u||!r){toast("Выберите пользователя и причину","r");return;}
const b={id:uid("blk"),user:u,reason:r,date:new Date().toISOString().slice(0,10)};
S.data.blacklist.push(b);logEvent("block_user","user",b.id,"success",{user:u,reason:r});
e.target.reset();save();rDep();toast("Пользователь заблокирован: "+u,"a");});

$("#lot-addr").addEventListener("input",e=>{const q=e.target.value.trim().toLowerCase(),box=$("#addr-sug");
if(q.length<2){box.hidden=true;return;}
const m=STREETS.filter(s=>s.toLowerCase().includes(q)).slice(0,6);
if(!m.length){box.hidden=true;return;}
box.innerHTML=m.map(s=>`<button type="button" data-act="pick-addr" data-id="${esc(s)}">${esc(s)}</button>`).join("");box.hidden=false;});

$("#lot-price").addEventListener("input",e=>{const p=+e.target.value,d=$("#lot-dep");
if(p>0){d.value=Math.round(p/2);logEvent("autofill_deposit","lot",S.editLot||"new","success",{deposit:Math.round(p/2)});}});

document.addEventListener("click",e=>{
if(e.target.id==="modal"){closeModal();return;}
const el=e.target.closest("[data-act]");if(!el)return;
const a=el.dataset.act,id=el.dataset.id;
if(a==="go"){go(id);return;}
if(a==="go-stats"){closeModal();go("stats");return;}
if(a==="logout"){logEvent("logout","account",S.session);S.session=null;S.sessionId=null;S.screen=null;S.series=null;save();closeModal();render();return;}
if(a==="modal-close"){closeModal();return;}
if(a==="pick-addr"){$("#lot-addr").value=id;$("#addr-sug").hidden=true;logEvent("pick_address","lot",S.editLot||"new","success",{address:id});return;}
if(a==="find"){S.filters={budget:$("#fl-budget").value,schedule:$("#fl-schedule").value,district:$("#fl-district").value,sort:$("#fl-sort").value};logEvent("find_objects","search","objects","success",S.filters);save();rObjects();toast("Поиск выполнен","g");return;}
if(a==="find-reset"){S.filters={};logEvent("reset_search","search","objects");save();rObjects();return;}
if(a==="preset"){$("#fl-budget").value=id;S.filters.budget=id;logEvent("set_search_attrs","search","budget","success",{field:"budget",value:id,preset:true});save();rObjects();return;}
if(a==="open-object"){S.objectId=id;save();go("object");return;}
if(a==="apply"){const ap={id:uid("app"),objectId:id,seeker:me().name,status:"pending"};S.data.applications.push(ap);
logEvent("submit_application","application",ap.id,"success",{object_id:id});save();rObject();toast("Заявка на заселение подана","g");return;}
if(a==="open-offer"){S.contractId=id;save();go("contract");return;}
if(a==="sign-offer"){const c=con(id);c.offerSigned=true;logEvent("sign_offer","contract",id);save();rContract();toast("Оферта подписана","g");return;}
if(a==="freeze"){const c=con(id),o=obj(c.objectId);
openModal(`<h3>Заморозка депозита</h3><p class="lead">Средства резервируются на эскроу-счёте платформы до завершения аренды.</p>
<div class="kv"><span>Объект</span><b>${esc(title(o))}</b><span>Адрес</span><b>${esc(o.address)}</b><span>Сумма депозита</span><b style="color:var(--blue)">${money(o.deposit)} ₽</b><span>Договор</span><b class="mono">${c.id}</b><span>Условие возврата</span><b>после акта выселения</b></div>
<div class="row"><button class="btn bg" data-act="freeze-ok" data-id="${c.id}">Подтвердить заморозку</button><button class="btn bo" data-act="modal-close">Отмена</button></div>`);return;}
if(a==="freeze-ok"){const c=con(id),o=obj(c.objectId);c.depositHeld=true;
if(!S.data.deposits.some(d=>d.user===me().name&&d.objectId===c.objectId&&d.status==="held"))
S.data.deposits.push({id:uid("dep"),user:me().name,objectId:c.objectId,amount:o.deposit,status:"held",debt:0});
logEvent("freeze_deposit","deposit",c.id,"success",{amount:o.deposit});save();closeModal();rContract();toast("Депозит удержан на эскроу-счёте","g");return;}
if(a==="open-act"){S.contractId=id;save();go("act");return;}
if(a==="act-photo"){S.photos++;$("#act-ph").textContent="Прикреплено фото: "+S.photos;logEvent("attach_photo","act",S.contractId||"new","success",{count:S.photos});save();return;}
if(a==="lot-new"){S.editLot=null;save();go("lot-form");return;}
if(a==="lot-edit"){S.editLot=id;save();go("lot-form");return;}
if(a==="lot-publish"){const o=obj(id);o.status="published";logEvent("publish_lot","lot",id);save();rLots();toast("Лот опубликован","g");return;}
if(a==="lot-del"){const o=obj(id);openModal(`<h3>Удаление лота</h3><p class="lead">Лот «${esc(title(o))}, ${esc(o.address)}» будет удалён.</p>
<div class="row"><button class="btn br" data-act="lot-del-ok" data-id="${id}">Удалить</button><button class="btn bo" data-act="modal-close">Отмена</button></div>`);return;}
if(a==="lot-del-ok"){const i=S.data.objects.findIndex(o=>o.id===id),rm=S.data.objects.splice(i,1)[0];
logEvent("delete_lot","lot",id);save();closeModal();rLots();
toast("Лот удалён","a");S.undo={obj:rm,index:i};return;}
if(a==="scoring"){const c=S.data.candidates.find(x=>x.id===id);logEvent("view_scoring","candidate",id,"success",{score:c.score});
openModal(`<h3>Скоринг-балл кандидата</h3><p class="lead">${esc(c.name)} · порог совместимости — 80 баллов.</p>
<div class="kv"><span>Финансовая надёжность</span><b>${Math.min(100,c.score+4)} / 100</b><span>Совпадение графика</span><b>${c.score} / 100</b><span>Бытовые привычки</span><b>${Math.max(0,c.score-6)} / 100</b><span>Итоговый балл</span><b style="color:${c.score>=80?"var(--green)":"var(--red)"}">${c.score} / 100</b><span>Заключение</span><b>${c.score>=80?"Выше порога":"Ниже порога"}</b></div>
<div class="row"><button class="btn bp" data-act="modal-close">Закрыть</button></div>`);save();return;}
if(a==="cand-ok"){const c=S.data.candidates.find(x=>x.id===id);c.status="approved";
let ap=S.data.applications.find(x=>x.objectId===c.objectId&&x.seeker===c.name);
if(!ap){ap={id:uid("app"),objectId:c.objectId,seeker:c.name,status:"approved"};S.data.applications.push(ap);}else ap.status="approved";
c.applicationId=ap.id;logEvent("approve_candidate","candidate",id,"success",{score:c.score});save();rCand();toast("Кандидат одобрен — сформируйте договор","g");return;}
if(a==="cand-no"){const c=S.data.candidates.find(x=>x.id===id);c.status="rejected";logEvent("reject_candidate","candidate",id);save();rCand();toast("Кандидат отклонён","a");return;}
if(a==="mk-contract"){const c=S.data.candidates.find(x=>x.id===id);
if(S.data.contracts.some(x=>x.applicationId===c.applicationId)){toast("Договор уже сформирован","a");rCand();return;}
const cc={id:uid("con"),objectId:c.objectId,applicationId:c.applicationId,offerSigned:false,ownerSigned:false,depositHeld:false};
S.data.contracts.push(cc);logEvent("create_contract","contract",cc.id);save();rCand();toast("Цифровой договор сформирован","g");return;}
if(a==="sign-contract"){const c=con(id);c.ownerSigned=true;logEvent("sign_contract","contract",id);save();
if(S.screen==="candidates")rCand();else rContracts();toast("Договор подписан инициатором","g");return;}
if(a==="docs"){const v=S.data.verifications.find(x=>x.id===id);logEvent("view_documents","verification",id);
openModal(`<h3>Документы пользователя</h3><p class="lead">${esc(v.name)} · заявление от ${v.date}</p>
<div class="kv"><span>Документ</span><b>Паспорт РФ</b><span>Серия и номер</span><b>${esc(v.passport)}</b><span>Кем выдан</span><b>${esc(v.issued)}</b><span>Скан главной страницы</span><b style="color:var(--green)">Загружен</b><span>Фото с документом</span><b style="color:var(--green)">Загружено</b></div>
<div class="row"><button class="btn bg" data-act="ver-ok" data-id="${id}" ${v.status!=="pending"?"disabled":""}>Одобрить верификацию</button><button class="btn bo" data-act="modal-close">Закрыть</button></div>`);save();return;}
if(a==="ver-ok"){const v=S.data.verifications.find(x=>x.id===id);v.status="approved";logEvent("approve_verification","verification",id);save();closeModal();rVerify();toast("Профиль верифицирован: "+v.name,"g");return;}
if(a==="ver-no"){const v=S.data.verifications.find(x=>x.id===id);v.status="rejected";logEvent("reject_verification","verification",id);save();closeModal();rVerify();toast("Верификация отклонена","a");return;}
if(a==="materials"){const d=S.data.disputes.find(x=>x.id===id);logEvent("view_materials","dispute",id);
openModal(`<h3>Материалы спора</h3><p class="lead">${esc(d.subject)} · ${esc(d.parties)}</p>
<div class="kv"><span>Акт приёмки при заселении</span><b style="color:var(--green)">Приложен</b><span>Фото повреждений</span><b style="color:var(--green)">3 файла</b><span>Переписка сторон</span><b style="color:var(--green)">12 сообщений</b><span>Показания счётчиков</span><b>Зафиксированы</b><span>Сумма претензии</span><b style="color:var(--red)">${money(d.claim)} ₽</b></div>
<div class="row"><button class="btn ba" data-act="decide" data-id="${id}" ${d.status!=="open"?"disabled":""}>Принять решение</button><button class="btn bo" data-act="modal-close">Закрыть</button></div>`);save();return;}
if(a==="decide"){const d=S.data.disputes.find(x=>x.id===id);
openModal(`<h3>Решение по спору</h3><p class="lead">${esc(d.subject)}. Решение определяет судьбу депозита.</p>
<div class="f"><label>Решение</label><select id="dk"><option value="withhold">Удержать часть депозита</option><option value="refund">Вернуть депозит полностью</option></select></div>
<div class="f"><label>Сумма удержания, ₽</label><input id="ds" type="number" value="${d.claim}"></div>
<div class="row"><button class="btn ba" data-act="decide-ok" data-id="${id}">Зафиксировать решение</button><button class="btn bo" data-act="modal-close">Отмена</button></div>`);return;}
if(a==="decide-ok"){const d=S.data.disputes.find(x=>x.id===id),k=$("#dk").value,s=+$("#ds").value||0;
d.status="resolved";d.decision=k;d.held=k==="withhold"?s:0;
logEvent("decide_dispute","dispute",id,"success",{decision:k,amount:d.held});save();closeModal();rDisp();toast("Решение зафиксировано, спор закрыт","g");return;}
if(a==="refund"){const d=S.data.deposits.find(x=>x.id===id);
const disp=S.data.disputes.find(x=>x.depositId===id&&x.status==="resolved"&&x.decision==="withhold");
const back=d.amount-(disp?disp.held:0);
openModal(`<h3>Возврат депозита</h3><p class="lead">Открытых споров и задолженностей не выявлено. Средства возвращаются с эскроу-счёта.</p>
<div class="kv"><span>Пользователь</span><b>${esc(d.user)}</b><span>Депозит</span><b>${money(d.amount)} ₽</b><span>Удержано по арбитражу</span><b>${money(disp?disp.held:0)} ₽</b><span>К возврату</span><b style="color:var(--green)">${money(back)} ₽</b></div>
<div class="row"><button class="btn bg" data-act="refund-ok" data-id="${id}">Выполнить возврат</button><button class="btn bo" data-act="modal-close">Отмена</button></div>`);return;}
if(a==="refund-ok"){const d=S.data.deposits.find(x=>x.id===id);d.status="released";
logEvent("refund_deposit","deposit",id,"success",{amount:d.amount});save();closeModal();rDep();toast("Депозит возвращён: "+d.user,"g");return;}
if(a==="withhold"){const d=S.data.deposits.find(x=>x.id===id);d.status="withheld";logEvent("withhold_deposit","deposit",id,"success",{amount:d.amount});save();rDep();toast("Депозит удержан","a");return;}
if(a==="unblock"){S.data.blacklist=S.data.blacklist.filter(b=>b.id!==id);logEvent("unblock_user","user",id);save();rDep();toast("Пользователь разблокирован","g");return;}
if(a==="report"){logEvent("generate_report","report",uid("rep"));save();toast("Отчёт по депозитам и спорам сформирован","g");return;}
if(a==="series-start"){startSeries();return;}
if(a==="task-fail"){failTask();return;}
if(a==="series-stop"){stopSeries();return;}
if(a==="series-reset"){S.data=seed();S.objectId=null;S.contractId=null;S.editLot=null;S.filters={};save();render();toast("Данные прототипа возвращены к исходному состоянию","g");return;}
if(a==="runs-clear"){openModal(`<h3>Очистка результатов</h3><p class="lead">Все записанные прохождения будут удалены. Журнал событий сохранится.</p>
<div class="row"><button class="btn br" data-act="runs-clear-ok">Очистить</button><button class="btn bo" data-act="modal-close">Отмена</button></div>`);return;}
if(a==="runs-clear-ok"){S.runs=[];save();closeModal();render();toast("Результаты очищены","a");return;}
if(a==="exp-log"){const c=id==="csv"?toCSV():id==="jsonl"?toJSONL():toTXT();
download("sharing_log."+(id==="jsonl"?"jsonl":id==="csv"?"csv":"txt"),c);
logEvent("export_log","log",id,"success",{format:id,records:S.log.length});
if(S.screen==="journal")rJournal();if(S.screen==="tests")rTests();toast("Журнал выгружен: "+id.toUpperCase(),"g");return;}
if(a==="exp-stats"){download("sharing_stats.csv",statsCSV());logEvent("export_stats","stats","all","success",{scenarios:TASKS.length});toast("Расчёты выгружены","g");return;}
if(a==="log-clear"){S.log=[];save();rJournal();toast("Журнал очищен","a");return;}
});

document.addEventListener("change",e=>{
const t=e.target;
if(t.id&&t.id.startsWith("fl-")){const f=t.id.replace("fl-","");S.filters[f]=t.value;
logEvent("set_search_attrs","search",f,"success",{field:f,value:t.value});save();return;}
if(t.closest("#f-act")&&["electricity","cold","hot"].includes(t.name)){
logEvent("enter_meters","act",S.contractId||"new","success",{field:t.name,value:t.value});return;}
});

document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal();$("#addr-sug").hidden=true;}});
document.addEventListener("click",e=>{if(!e.target.closest("#lot-addr")&&!e.target.closest("#addr-sug")){const b=$("#addr-sug");if(b)b.hidden=true;}},true);

render();