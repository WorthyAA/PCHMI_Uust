"use strict";

const ACCOUNTS = [
  { id: "u_1001", login: "smirnova", password: "1234", name: "Д.И. Смирнова", role: "seeker" },
  { id: "u_1002", login: "khalilov", password: "1234", name: "А.Р. Халилов", role: "initiator" },
  { id: "u_1003", login: "mustafina", password: "admin", name: "К.В. Мустафина", role: "admin" }
];

const ROLES = { seeker: "Искатель комнаты", initiator: "Инициатор шеринга", admin: "Администратор" };

const MENU = {
  seeker: [["objects", "Объекты"], ["apps", "Мои заявки"], ["contract", "Договор"], ["act", "Акт приёмки"], ["journal", "Журнал"], ["profile", "Профиль"]],
  initiator: [["lots", "Мои лоты"], ["candidates", "Кандидаты"], ["contracts", "Договоры"], ["journal", "Журнал"], ["profile", "Профиль"]],
  admin: [["verify", "Верификация"], ["disputes", "Споры"], ["deposits", "Депозиты"], ["journal", "Журнал"], ["profile", "Профиль"]]
};

const SCREENS = {
  seeker: ["objects", "object", "apps", "contract", "act", "journal", "profile"],
  initiator: ["lots", "lot-form", "candidates", "contracts", "journal", "profile"],
  admin: ["verify", "disputes", "deposits", "journal", "profile"]
};

const PARENT = { object: "objects", "lot-form": "lots" };

const SCREEN_LOG = {
  objects: () => ["open_object_list", "screen", "objects"],
  object: () => ["open_object", "object", S.objectId || "unknown"],
  apps: () => ["open_applications", "screen", "apps"],
  contract: () => ["open_offer", "contract", S.contractId || "current"],
  act: () => ["open_act", "act", S.contractId || "new"],
  lots: () => ["open_lots", "screen", "lots"],
  "lot-form": () => S.editLot ? ["edit_lot", "lot", S.editLot] : ["create_lot", "lot", "new"],
  candidates: () => ["open_candidates", "screen", "candidates"],
  contracts: () => ["open_contracts", "screen", "contracts"],
  verify: () => ["open_verification", "screen", "verify"],
  disputes: () => ["open_disputes", "screen", "disputes"],
  deposits: () => ["open_deposits", "screen", "deposits"],
  journal: () => ["open_journal", "screen", "journal"],
  profile: () => ["open_profile", "screen", "profile"]
};

const SCENARIOS = [
  { id: 1, name: "Создание и публикация лота", steps: ["create_lot", "save_lot", "publish_lot"] },
  { id: 2, name: "Одобрение кандидата и договор", steps: ["open_candidates", "view_scoring", "approve_candidate", "create_contract", "sign_contract"] },
  { id: 3, name: "Редактирование лота", steps: ["edit_lot", "save_lot"] },
  { id: 4, name: "Поиск объекта и подача заявки", steps: ["set_search_attrs", "find_objects", "open_object", "submit_application"] },
  { id: 5, name: "Оферта и заморозка депозита", steps: ["open_offer", "sign_offer", "freeze_deposit"] },
  { id: 6, name: "Акт приёмки при заселении", steps: ["open_act", "enter_meters", "save_act"] },
  { id: 7, name: "Верификация документов", steps: ["open_verification", "view_documents", "approve_verification"] },
  { id: 8, name: "Арбитраж спора", steps: ["open_disputes", "view_materials", "decide_dispute"] },
  { id: 9, name: "Блокировка плательщика", steps: ["open_blacklist", "block_user"] },
  { id: 10, name: "Возврат депозита при выселении", steps: ["open_deposits", "refund_deposit"] }
];

const KEY = "sharing_prototype_lr5";
const $ = (s) => document.querySelector(s);
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => Number(n).toLocaleString("ru-RU");
const uid = (p) => p + "_" + Math.random().toString(36).slice(2, 7);
const stamp = () => new Date().toISOString();
const SCHED = { day: "Дневная работа", night: "Ночные смены", remote: "Удалёнка", any: "Любой" };
const CLEAN = { weekly: "Еженедельно", biweekly: "Раз в две недели", roster: "По очереди дежурств" };
const SPLIT = { equal: "Поровну", area: "По площади", meters: "По счётчикам" };

function seedData() {
  return {
    objects: [
      { id: "obj_001", address: "ул. Менделеева, 137", district: "Октябрьский район", rooms: 2, area: 14, price: 18000, deposit: 9000, schedule: "day", quiet: "23:00", smoking: false, guests: false, pets: false, cleaning: "weekly", split: "equal", score: 87, status: "published", owner: "А.Р. Халилов" },
      { id: "obj_002", address: "пр. Октября, 46", district: "Советский район", rooms: 3, area: 12, price: 15500, deposit: 7500, schedule: "night", quiet: "22:00", smoking: true, guests: false, pets: false, cleaning: "roster", split: "equal", score: 92, status: "published", owner: "Л.Р. Хисматуллина" },
      { id: "obj_003", address: "ул. Цюрупы, 91", district: "Кировский район", rooms: 2, area: 16, price: 20000, deposit: 10000, schedule: "day", quiet: "23:00", smoking: false, guests: false, pets: false, cleaning: "weekly", split: "area", score: 78, status: "published", owner: "А.Р. Халилов" },
      { id: "obj_004", address: "ул. Шафиева, 22", district: "Октябрьский район", rooms: 3, area: 18, price: 16000, deposit: 8000, schedule: "night", quiet: "23:00", smoking: false, guests: false, pets: false, cleaning: "roster", split: "equal", score: 92, status: "published", owner: "А.Р. Халилов" },
      { id: "obj_005", address: "ул. Правды, 14", district: "Дёмский район", rooms: 1, area: 10, price: 12000, deposit: 6000, schedule: "any", quiet: "23:00", smoking: false, guests: true, pets: true, cleaning: "biweekly", split: "equal", score: 65, status: "published", owner: "Т.Н. Волков" },
      { id: "obj_006", address: "ул. Первомайская, 54", district: "Калининский район", rooms: 2, area: 13, price: 14500, deposit: 7000, schedule: "remote", quiet: "22:00", smoking: false, guests: false, pets: true, cleaning: "weekly", split: "meters", score: 81, status: "draft", owner: "А.Р. Халилов" }
    ],
    candidates: [
      { id: "cand_001", name: "Д.И. Смирнова", score: 92, budget: 18000, schedule: "night", objectId: "obj_004", status: "new", notified: false },
      { id: "cand_002", name: "А.В. Гареев", score: 74, budget: 15000, schedule: "day", objectId: "obj_004", status: "new", notified: false },
      { id: "cand_003", name: "Л.Р. Хисматуллина", score: 88, budget: 20000, schedule: "remote", objectId: "obj_003", status: "new", notified: false }
    ],
    applications: [
      { id: "app_001", objectId: "obj_004", seeker: "Д.И. Смирнова", status: "approved" },
      { id: "app_002", objectId: "obj_001", seeker: "Д.И. Смирнова", status: "approved" }
    ],
    contracts: [
      { id: "con_001", objectId: "obj_004", applicationId: "app_001", offerSigned: false, ownerSigned: false, depositHeld: false },
      { id: "con_002", objectId: "obj_001", applicationId: "app_002", offerSigned: true, ownerSigned: true, depositHeld: true }
    ],
    acts: [],
    verifications: [
      { id: "ver_001", name: "А.Р. Халилов", passport: "80 12 № 456789", issued: "ОВД Октябрьского р-на г. Уфы", date: "2026-11-08", status: "pending" },
      { id: "ver_002", name: "Д.И. Смирнова", passport: "80 14 № 123456", issued: "ОВД Советского р-на г. Уфы", date: "2026-11-09", status: "pending" },
      { id: "ver_003", name: "Т.Н. Волков", passport: "80 09 № 778211", issued: "ОВД Дёмского р-на г. Уфы", date: "2026-11-10", status: "pending" }
    ],
    disputes: [
      { id: "disp_001", objectId: "obj_001", parties: "А.Р. Халилов ↔ Д.И. Смирнова", subject: "Порча имущества (диван)", claim: 4500, depositId: "dep_001", status: "open", decision: null, held: 0 },
      { id: "disp_002", objectId: "obj_003", parties: "А.Р. Халилов ↔ А.В. Гареев", subject: "Нарушение режима тишины", claim: 0, depositId: null, status: "open", decision: null, held: 0 }
    ],
    deposits: [
      { id: "dep_001", user: "Д.И. Смирнова", objectId: "obj_001", amount: 9000, status: "held", debt: 0 },
      { id: "dep_002", user: "А.В. Гареев", objectId: "obj_003", amount: 10000, status: "held", debt: 0 },
      { id: "dep_003", user: "Л.Р. Хисматуллина", objectId: "obj_002", amount: 7500, status: "released", debt: 0 }
    ],
    blacklist: []
  };
}

function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } }
let S = load() || { session: null, sessionId: null, screen: null, objectId: null, contractId: null, editLot: null, photos: 0, filters: {}, data: seedData(), log: [] };
function save() { localStorage.setItem(KEY, JSON.stringify(S)); }
function me() { return ACCOUNTS.find((a) => a.id === S.session) || null; }
function actorName(id) { const a = ACCOUNTS.find((x) => x.id === id); return a ? a.name : id; }
function objectById(id) { return S.data.objects.find((o) => o.id === id); }
function contractById(id) { return S.data.contracts.find((c) => c.id === id); }
function appById(id) { return S.data.applications.find((a) => a.id === id); }
function title(o) { return o ? `${o.rooms}-комн. квартира, ${o.district}` : "—"; }

function myContracts() {
  const u = me();
  if (!u) return [];
  if (u.role === "seeker") return S.data.contracts.filter((c) => { const a = appById(c.applicationId); return a && a.seeker === u.name; });
  return S.data.contracts.filter((c) => { const o = objectById(c.objectId); return o && o.owner === u.name; });
}

function logEvent(action, objectType, objectId, outcome, changes) {
  const u = me();
  S.log.push({
    timestamp: stamp(),
    actor_id: u ? u.id : "guest",
    actor_role: u ? u.role : "guest",
    action,
    object_type: objectType,
    object_id: objectId,
    outcome: outcome || "success",
    changes: changes || {},
    context: { correlation_id: S.sessionId || "auth", user_agent: navigator.userAgent.slice(0, 48) }
  });
  save();
}

function toast(text, kind) {
  const el = document.createElement("div");
  el.className = "toast " + (kind || "");
  el.innerHTML = `<span>${kind === "g" ? "✓" : kind === "r" ? "✕" : kind === "a" ? "!" : "•"}</span><span>${esc(text)}</span>`;
  $("#toasts").appendChild(el);
  setTimeout(() => { el.style.transition = "opacity .3s"; el.style.opacity = "0"; setTimeout(() => el.remove(), 320); }, 3400);
}

function openModal(html) { const m = $("#modal"); m.innerHTML = `<div class="modal-box">${html}</div>`; m.hidden = false; }
function closeModal() { const m = $("#modal"); m.hidden = true; m.innerHTML = ""; }

function statusTag(s) {
  const m = { published: ["g", "Опубликован"], draft: ["a", "Черновик"], pending: ["a", "На рассмотрении"], approved: ["g", "Одобрена"], rejected: ["r", "Отклонена"], new: ["b", "Новый"], open: ["a", "Открыт"], resolved: ["g", "Решён"], held: ["b", "Удержан"], released: ["g", "Возвращён"], withheld: ["r", "Удержан по спору"] };
  const v = m[s] || ["", s];
  return `<span class="tag ${v[0]}">${v[1]}</span>`;
}

function rulesTags(o) {
  return `<div class="tags">
    <span class="tag">Тишина ${o.quiet}</span>
    <span class="tag ${o.smoking ? "a" : "g"}">${o.smoking ? "Курение: балкон" : "Без курения"}</span>
    <span class="tag ${o.guests ? "a" : "g"}">${o.guests ? "Гости разрешены" : "Без гостей"}</span>
    <span class="tag ${o.pets ? "a" : "g"}">${o.pets ? "Животные можно" : "Без животных"}</span>
    <span class="tag t">${SCHED[o.schedule]}</span>
  </div>`;
}

function scoreClass(v) { return v >= 85 ? "" : v >= 70 ? "warn" : "bad"; }

function go(screen) {
  const u = me();
  if (!u) return;
  if (!SCREENS[u.role].includes(screen)) screen = MENU[u.role][0][0];
  S.screen = screen;
  document.querySelectorAll("main > section").forEach((s) => { s.hidden = true; });
  const sec = $("#s-" + screen);
  if (sec) sec.hidden = false;
  const active = PARENT[screen] || screen;
  $("#nav").innerHTML = MENU[u.role].map(([id, name]) => `<button data-act="go" data-id="${id}" class="${id === active ? "on" : ""}">${name}</button>`).join("");
  const lg = SCREEN_LOG[screen];
  if (lg) {
    const [a, t, id] = lg();
    logEvent(a, t, id);
    if (screen === "deposits") logEvent("open_blacklist", "screen", "blacklist");
  }
  const r = { objects: renderObjects, object: renderObject, apps: renderApps, contract: renderContract, act: renderAct, lots: renderLots, "lot-form": renderLotForm, candidates: renderCandidates, contracts: renderContracts, verify: renderVerify, disputes: renderDisputes, deposits: renderDeposits, journal: renderJournal, profile: renderProfile }[screen];
  if (r) r();
  save();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderObjects() {
  const sel = $("#fl-district");
  if (sel.options.length <= 1) [...new Set(S.data.objects.map((o) => o.district))].forEach((d) => sel.add(new Option(d, d)));
  $("#fl-budget").value = S.filters.budget || "";
  $("#fl-schedule").value = S.filters.schedule || "";
  sel.value = S.filters.district || "";
  $("#fl-sort").value = S.filters.sort || "score";
  let list = S.data.objects.filter((o) => o.status === "published");
  if (S.filters.budget) list = list.filter((o) => o.price <= +S.filters.budget);
  if (S.filters.schedule) list = list.filter((o) => o.schedule === S.filters.schedule || o.schedule === "any");
  if (S.filters.district) list = list.filter((o) => o.district === S.filters.district);
  const s = S.filters.sort || "score";
  list.sort((a, b) => s === "price" ? a.price - b.price : s === "area" ? b.area - a.area : b.score - a.score);
  $("#fl-count").textContent = "Найдено: " + list.length;
  $("#objects-list").innerHTML = list.map((o) => `
    <div class="card obj">
      <div class="row" style="justify-content:space-between"><span class="tag v">${esc(o.district)}</span>${statusTag(o.status)}</div>
      <h4>${esc(title(o))}</h4>
      <div class="muted">${esc(o.address)} · комната ${o.area} м²</div>
      <div class="price">${money(o.price)} ₽ <span style="font-size:12px;color:var(--muted);font-weight:600">/ мес. (доля)</span></div>
      <div class="muted">Совместимость <b style="color:var(--green)">${o.score}%</b> · депозит ${money(o.deposit)} ₽</div>
      <div class="bar ${scoreClass(o.score)}"><i style="width:${o.score}%"></i></div>
      ${rulesTags(o)}
      <div class="row" style="margin-top:auto"><button class="btn btn-s btn-p" data-act="open-object" data-id="${o.id}">Открыть карточку</button></div>
    </div>`).join("") || `<div class="card empty" style="grid-column:1/-1">По заданным параметрам объектов не найдено.<br><button class="btn btn-o" data-act="find-reset">Сбросить фильтры</button></div>`;
}

function renderObject() {
  const o = objectById(S.objectId);
  if (!o) { go("objects"); return; }
  const u = me();
  const applied = S.data.applications.some((a) => a.objectId === o.id && a.seeker === u.name && a.status !== "rejected");
  $("#object-body").innerHTML = `
    <div class="grid g2">
      <div class="card">
        <div class="row" style="justify-content:space-between"><span class="tag v">${esc(o.district)}</span>${statusTag(o.status)}</div>
        <h3 style="margin-top:12px">${esc(title(o))}</h3>
        <p class="muted">${esc(o.address)} · комната ${o.area} м² · инициатор: ${esc(o.owner)}</p>
        <div class="price" style="font-size:26px;margin:12px 0">${money(o.price)} ₽ / мес.</div>
        <p class="muted">Депозит: <b>${money(o.deposit)} ₽</b> — резервируется на эскроу-счёте платформы</p>
        <p class="muted" style="margin-top:10px">Скоринг-совместимость с вашим профилем: <b style="color:var(--green)">${o.score}%</b></p>
        <div class="bar ${scoreClass(o.score)}" style="margin-top:7px"><i style="width:${o.score}%"></i></div>
        <div class="row mt"><button class="btn btn-p" data-act="apply" data-id="${o.id}" ${applied ? "disabled" : ""}>${applied ? "Заявка уже подана" : "Подать заявку на заселение"}</button></div>
      </div>
      <div class="card">
        <h3>Бытовой регламент</h3>
        ${rulesTags(o)}
        <div class="doc mt">
          <p><b>Режим тишины:</b> после ${o.quiet}</p>
          <p><b>Курение:</b> ${o.smoking ? "только на балконе" : "запрещено"}</p>
          <p><b>Гости с ночёвкой:</b> ${o.guests ? "по согласованию с жильцами" : "не допускаются"}</p>
          <p><b>Домашние животные:</b> ${o.pets ? "допускаются" : "не допускаются"}</p>
          <p><b>Уборка общих зон:</b> ${CLEAN[o.cleaning]}</p>
          <p><b>Сплит-оплата ЖКХ:</b> ${SPLIT[o.split]}</p>
        </div>
        <div class="note mt">Подавая заявку, вы соглашаетесь на бытовой скоринг. Результат доступен инициатору до одобрения.</div>
      </div>
    </div>`;
}

function renderApps() {
  const u = me();
  const list = S.data.applications.filter((a) => a.seeker === u.name);
  $("#apps-list").innerHTML = list.map((a) => {
    const o = objectById(a.objectId);
    const c = S.data.contracts.find((x) => x.applicationId === a.id);
    return `<div class="card">
      <div class="row" style="justify-content:space-between"><h3 style="margin:0">${esc(title(o))}</h3>${statusTag(a.status)}</div>
      <p class="muted">${esc(o ? o.address : "")} · ${money(o ? o.price : 0)} ₽/мес · депозит ${money(o ? o.deposit : 0)} ₽</p>
      <div class="row mt">
        ${a.status === "approved" && c ? `<button class="btn btn-p" data-act="open-offer" data-id="${c.id}">Открыть оферту и договор</button>` : `<span class="tag a">Ожидает решения инициатора</span>`}
        <button class="btn btn-o" data-act="open-object" data-id="${a.objectId}">Карточка объекта</button>
      </div></div>`;
  }).join("") || `<div class="card empty">Заявок пока нет.<br><button class="btn btn-p" data-act="go" data-id="objects">Перейти к объектам</button></div>`;
}

function renderContract() {
  const mine = myContracts();
  let c = contractById(S.contractId);
  if (!c || !mine.includes(c)) c = mine[0] || null;
  if (!c) { $("#contract-body").innerHTML = `<div class="card empty">Договор ещё не сформирован.<br><button class="btn btn-p" data-act="go" data-id="apps">К моим заявкам</button></div>`; return; }
  S.contractId = c.id;
  const o = objectById(c.objectId);
  const act = S.data.acts.find((a) => a.contractId === c.id);
  const done = c.offerSigned && c.ownerSigned && c.depositHeld;
  $("#contract-body").innerHTML = `
    <div class="grid g2">
      <div class="card">
        <h3>Цифровой договор соаренды</h3>
        <div class="doc">
          <h4>ДОГОВОР № ${c.id.toUpperCase()}</h4>
          <p><b>Объект:</b> ${esc(title(o))}, ${esc(o.address)}</p>
          <p><b>Инициатор:</b> ${esc(o.owner)} · <b>Соарендатор:</b> ${esc(me().name)}</p>
          <p><b>Доля аренды:</b> ${money(o.price)} ₽/мес · <b>Депозит:</b> ${money(o.deposit)} ₽</p>
          <p><b>Регламент:</b> тишина после ${o.quiet}; ${o.smoking ? "курение на балконе" : "без курения"}; ${o.guests ? "гости по согласованию" : "без гостей"}; ${o.pets ? "животные допускаются" : "без животных"}.</p>
          <p><b>Уборка:</b> ${CLEAN[o.cleaning]} · <b>ЖКХ:</b> ${SPLIT[o.split]}</p>
          <p>Депозит резервируется на эскроу-счёте платформы и возвращается после акта выселения либо удерживается по решению арбитража.</p>
          <div class="signs">
            <div class="sign ${c.offerSigned ? "ok" : ""}">${c.offerSigned ? "✓ Оферта подписана" : "Оферта не подписана"}</div>
            <div class="sign ${c.ownerSigned ? "ok" : ""}">${c.ownerSigned ? "✓ Подпись инициатора" : "Ожидает инициатора"}</div>
            <div class="sign ${c.depositHeld ? "ok" : ""}">${c.depositHeld ? "✓ Депозит удержан" : "Депозит не зарезервирован"}</div>
          </div>
        </div>
        ${done ? `<div class="note mt" style="background:var(--green-l);border-color:#bfe8d7;color:#08704e">Договор заключён. Депозит удержан на эскроу-счёте. Статус: <b>Депозит удержан</b>.</div>` : ""}
      </div>
      <div class="card">
        <h3>Действия по договору</h3>
        <div class="grid">
          <button class="btn btn-p btn-w" data-act="sign-offer" data-id="${c.id}" ${c.offerSigned ? "disabled" : ""}>${c.offerSigned ? "✓ Оферта подписана" : "Подписать оферту о правилах проживания"}</button>
          <button class="btn btn-g btn-w" data-act="freeze" data-id="${c.id}" ${!c.offerSigned || c.depositHeld ? "disabled" : ""}>${c.depositHeld ? "✓ Депозит удержан" : "Заморозить депозит через эскроу-счёт"}</button>
          <button class="btn btn-o btn-w" data-act="open-act" data-id="${c.id}" ${!c.depositHeld ? "disabled" : ""}>${act ? "Акт приёмки сохранён — открыть" : "Перейти к акту приёмки"}</button>
        </div>
        <div class="note a mt">Заморозка депозита доступна только после подписания оферты. Возврат или удержание средств выполняет администратор по итогам арбитража.</div>
      </div>
    </div>`;
}

function renderAct() {
  const mine = myContracts().filter((c) => c.depositHeld);
  let c = contractById(S.contractId);
  if (!c || !mine.includes(c)) c = mine[0] || null;
  const form = $("#f-act");
  if (!c) {
    $("#act-obj").textContent = "Нет договора с удержанным депозитом. Сначала подпишите оферту и заморозьте депозит в разделе «Договор».";
    form.hidden = true;
    return;
  }
  form.hidden = false;
  S.contractId = c.id;
  const o = objectById(c.objectId);
  $("#act-obj").textContent = `${title(o)}, ${o.address} · договор ${c.id.toUpperCase()}`;
  const act = S.data.acts.find((a) => a.contractId === c.id);
  form.electricity.value = act ? act.electricity : "";
  form.cold.value = act ? act.cold : "";
  form.hot.value = act ? act.hot : "";
  form.note.value = act ? act.note : "";
  S.photos = act ? act.photos : 0;
  $("#act-photos").textContent = S.photos ? `Прикреплено фото: ${S.photos}` : "Фото не прикреплены";
}

function renderLots() {
  const list = S.data.objects.filter((o) => o.owner === me().name);
  $("#lots-list").innerHTML = list.map((o) => `
    <div class="card obj">
      <div class="row" style="justify-content:space-between"><span class="tag v">${esc(o.district)}</span>${statusTag(o.status)}</div>
      <h4>${esc(title(o))}</h4>
      <div class="muted">${esc(o.address)} · комната ${o.area} м²</div>
      <div class="price">${money(o.price)} ₽ / мес.</div>
      <div class="muted">Уборка: ${CLEAN[o.cleaning]} · ЖКХ: ${SPLIT[o.split]}</div>
      ${rulesTags(o)}
      <div class="row" style="margin-top:auto">
        <button class="btn btn-s btn-o" data-act="lot-edit" data-id="${o.id}">Изменить</button>
        ${o.status === "draft" ? `<button class="btn btn-s btn-g" data-act="lot-publish" data-id="${o.id}">Опубликовать</button>` : ""}
        <button class="btn btn-s btn-r" data-act="lot-delete" data-id="${o.id}">Удалить</button>
      </div>
    </div>`).join("") || `<div class="card empty" style="grid-column:1/-1">Лотов пока нет.<br><button class="btn btn-p" data-act="lot-new">Создать первый лот</button></div>`;
}

function renderLotForm() {
  const f = $("#f-lot");
  const o = S.editLot ? objectById(S.editLot) : null;
  $("#lot-form-title").textContent = o ? "Редактирование лота" : "Новый лот";
  f.id.value = o ? o.id : "";
  f.address.value = o ? o.address : "";
  f.district.value = o ? o.district : "Октябрьский район";
  f.rooms.value = o ? o.rooms : "2";
  f.area.value = o ? o.area : "";
  f.price.value = o ? o.price : "";
  f.deposit.value = o ? o.deposit : "";
  f.schedule.value = o ? o.schedule : "day";
  f.quiet.value = o ? o.quiet : "23:00";
  f.cleaning.value = o ? o.cleaning : "weekly";
  f.split.value = o ? o.split : "equal";
  f.smoking.checked = o ? o.smoking : true;
  f.guests.checked = o ? o.guests : true;
  f.pets.checked = o ? o.pets : false;
}

function renderCandidates() {
  $("#candidates-list").innerHTML = S.data.candidates.map((c) => {
    const o = objectById(c.objectId);
    return `<div class="card obj">
      <div class="row" style="justify-content:space-between"><h4>${esc(c.name)}</h4>${statusTag(c.status)}</div>
      <div class="muted">${esc(title(o))} · ${esc(o ? o.address : "")}</div>
      <div class="muted">Бюджет ${money(c.budget)} ₽ · ${SCHED[c.schedule]}</div>
      <div class="muted">Скоринг-балл: <b style="color:${c.score >= 85 ? "var(--green)" : c.score >= 70 ? "var(--amber)" : "var(--red)"}">${c.score} / 100</b> · порог 80</div>
      <div class="bar ${scoreClass(c.score)}"><i style="width:${c.score}%"></i></div>
      ${c.notified ? `<div class="note a">Условия лота изменены — уведомление отправлено кандидату.</div>` : ""}
      <div class="row" style="margin-top:auto">
        <button class="btn btn-s btn-o" data-act="scoring" data-id="${c.id}">Просмотреть скоринг</button>
        ${c.status === "new" ? `<button class="btn btn-s btn-g" data-act="approve-cand" data-id="${c.id}">Одобрить</button><button class="btn btn-s btn-r" data-act="reject-cand" data-id="${c.id}">Отклонить</button>` : ""}
        ${c.status === "approved" ? `<button class="btn btn-s btn-p" data-act="make-contract" data-id="${c.id}">Сформировать договор</button>` : ""}
      </div></div>`;
  }).join("");
}

function renderContracts() {
  const list = myContracts();
  $("#contracts-list").innerHTML = list.map((c) => {
    const o = objectById(c.objectId);
    const a = appById(c.applicationId);
    const done = c.offerSigned && c.ownerSigned && c.depositHeld;
    return `<div class="card">
      <div class="row" style="justify-content:space-between"><h3 style="margin:0">${esc(title(o))}</h3>${done ? '<span class="tag g">Заключён</span>' : '<span class="tag a">В процессе</span>'}</div>
      <p class="muted">Договор ${c.id.toUpperCase()} · соарендатор ${esc(a ? a.seeker : "—")} · ${money(o.price)} ₽/мес · депозит ${money(o.deposit)} ₽</p>
      <div class="signs">
        <div class="sign ${c.offerSigned ? "ok" : ""}">${c.offerSigned ? "✓ Оферта подписана" : "Оферта не подписана"}</div>
        <div class="sign ${c.ownerSigned ? "ok" : ""}">${c.ownerSigned ? "✓ Подпись инициатора" : "Ожидает подписи"}</div>
        <div class="sign ${c.depositHeld ? "ok" : ""}">${c.depositHeld ? "✓ Депозит удержан" : "Депозит не зарезервирован"}</div>
      </div>
      <div class="row mt"><button class="btn btn-v" data-act="sign-contract" data-id="${c.id}" ${c.ownerSigned ? "disabled" : ""}>${c.ownerSigned ? "✓ Договор подписан" : "Подписать договор со своей стороны"}</button></div>
    </div>`;
  }).join("") || `<div class="card empty">Договоров пока нет.<br><button class="btn btn-p" data-act="go" data-id="candidates">Перейти к кандидатам</button></div>`;
}

function renderVerify() {
  $("#verify-count").textContent = "В очереди: " + S.data.verifications.filter((v) => v.status === "pending").length;
  $("#verify-list").innerHTML = S.data.verifications.map((v) => `
    <div class="card">
      <div class="row" style="justify-content:space-between"><h3 style="margin:0">${esc(v.name)}</h3>${statusTag(v.status)}</div>
      <p class="muted">Паспорт ${esc(v.passport)} · заявление от ${v.date}</p>
      <div class="row mt">
        <button class="btn btn-s btn-o" data-act="docs" data-id="${v.id}">Просмотреть документы</button>
        <button class="btn btn-s btn-g" data-act="approve-ver" data-id="${v.id}" ${v.status !== "pending" ? "disabled" : ""}>Одобрить верификацию</button>
        <button class="btn btn-s btn-r" data-act="reject-ver" data-id="${v.id}" ${v.status !== "pending" ? "disabled" : ""}>Отклонить</button>
      </div></div>`).join("");
}

function renderDisputes() {
  $("#disputes-count").textContent = "Открыто: " + S.data.disputes.filter((d) => d.status === "open").length;
  $("#disputes-list").innerHTML = S.data.disputes.map((d) => {
    const o = objectById(d.objectId);
    return `<div class="card">
      <div class="row" style="justify-content:space-between"><h3 style="margin:0">${esc(d.subject)}</h3>${statusTag(d.status)}</div>
      <p class="muted">${esc(d.parties)} · ${esc(title(o))}, ${esc(o ? o.address : "")}</p>
      ${d.claim ? `<p class="muted">Сумма претензии: <b style="color:var(--red)">${money(d.claim)} ₽</b></p>` : ""}
      ${d.status === "resolved" ? `<div class="note mt" style="background:var(--green-l);border-color:#bfe8d7;color:#08704e">Решение: ${d.decision === "withhold" ? `удержать ${money(d.held)} ₽ из депозита` : "вернуть депозит полностью"}. Спор закрыт.</div>` : ""}
      <div class="row mt">
        <button class="btn btn-s btn-o" data-act="materials" data-id="${d.id}">Материалы спора</button>
        <button class="btn btn-s btn-a" data-act="decide" data-id="${d.id}" ${d.status !== "open" ? "disabled" : ""}>Принять решение</button>
      </div></div>`;
  }).join("");
}

function depositBlockers(d) {
  const open = S.data.disputes.some((x) => x.depositId === d.id && x.status === "open");
  return { open, debt: d.debt > 0 };
}

function renderDeposits() {
  $("#deposits-body").innerHTML = S.data.deposits.map((d) => {
    const o = objectById(d.objectId);
    const b = depositBlockers(d);
    const blocked = b.open || b.debt;
    return `<tr>
      <td class="mono">${d.id}</td><td>${esc(d.user)}</td><td>${esc(o ? o.district : "—")}</td>
      <td><b>${money(d.amount)} ₽</b></td><td>${statusTag(d.status)}</td>
      <td><div class="row">
        <button class="btn btn-s btn-g" data-act="refund" data-id="${d.id}" ${d.status !== "held" || blocked ? "disabled" : ""}>Вернуть</button>
        <button class="btn btn-s btn-r" data-act="withhold" data-id="${d.id}" ${d.status !== "held" ? "disabled" : ""}>Удержать</button>
      </div>${blocked && d.status === "held" ? `<div class="muted" style="margin-top:5px;color:var(--amber)">Блокирует: ${b.open ? "открытый спор" : "задолженность"}</div>` : ""}</td>
    </tr>`;
  }).join("");
  $("#blacklist-body").innerHTML = S.data.blacklist.map((b) => `<tr>
    <td>${esc(b.user)}</td><td>${esc(b.reason)}</td><td class="mono">${b.date}</td><td><span class="tag r">Заблокирован</span></td>
    <td><button class="btn btn-s btn-o" data-act="unblock" data-id="${b.id}">Разблокировать</button></td></tr>`).join("") || `<tr><td colspan="5" class="empty">Реестр пуст</td></tr>`;
}

function matchScenarios(events) {
  const rows = [];
  SCENARIOS.forEach((sc) => {
    let i = 0, first = null, last = null;
    events.forEach((e) => {
      if (e.action === sc.steps[i]) {
        if (i === 0) first = e;
        last = e;
        i++;
        if (i === sc.steps.length) {
          rows.push({ scenario: sc, actor: first.actor_id, steps: i, ms: new Date(last.timestamp) - new Date(first.timestamp) });
          i = 0; first = null; last = null;
        }
      }
    });
  });
  return rows;
}

function analyze() {
  const sessions = {};
  S.log.forEach((e) => {
    const sid = e.context.correlation_id;
    if (!sessions[sid]) sessions[sid] = { id: sid, events: [] };
    sessions[sid].events.push(e);
  });
  const rows = [];
  Object.values(sessions).forEach((s) => {
    matchScenarios(s.events).forEach((r) => rows.push({ ...r, session: s.id }));
  });
  return { sessions: Object.values(sessions), rows };
}

function renderJournal() {
  const bar = document.querySelector("#s-journal .head .row");
  if (bar && !bar.querySelector('[data-act="reset-demo"]')) {
    const b = document.createElement("button");
    b.className = "btn btn-s btn-o";
    b.dataset.act = "reset-demo";
    b.textContent = "Сбросить демо-данные";
    bar.appendChild(b);
  }
  const a = analyze();
  const total = a.rows.reduce((s, r) => s + r.ms, 0);
  $("#journal-stats").innerHTML = `
    <div class="stat"><b>${S.log.length}</b><span>Записей в журнале</span></div>
    <div class="stat"><b>${a.sessions.length}</b><span>Сеансов работы</span></div>
    <div class="stat"><b>${a.rows.length}</b><span>Завершённых сценариев</span></div>`;
  $("#scenario-body").innerHTML = a.rows.map((r) => `<tr>
    <td><b>Сценарий ${r.scenario.id}.</b> ${esc(r.scenario.name)}</td>
    <td class="mono">${esc(r.session)}</td><td>${esc(actorName(r.actor))}</td><td>${r.steps}</td>
    <td><b style="color:var(--blue)">${(r.ms / 1000).toFixed(2)} с</b></td></tr>`).join("") || `<tr><td colspan="5" class="empty">Завершённых сценариев пока нет — выполните последовательность действий в личном кабинете.</td></tr>`;
  $("#journal-body").innerHTML = S.log.slice(-140).reverse().map((e) => `<tr>
    <td class="mono">${e.timestamp.slice(11, 23)}</td><td>${esc(actorName(e.actor_id))}</td>
    <td>${esc(ROLES[e.actor_role] || e.actor_role)}</td><td class="mono" style="color:var(--blue-d)">${esc(e.action)}</td>
    <td class="mono">${esc(e.object_type)}:${esc(e.object_id)}</td>
    <td>${e.outcome === "success" ? '<span class="tag g">Успешно</span>' : '<span class="tag r">Ошибка</span>'}</td></tr>`).join("") || `<tr><td colspan="6" class="empty">Журнал пуст</td></tr>`;
  if (total) $("#journal-stats").innerHTML += `<div class="stat" style="grid-column:1/-1"><b>${(total / 1000).toFixed(2)} с</b><span>Суммарное время выполнения распознанных сценариев</span></div>`;
}

function renderProfile() {
  const u = me();
  const mine = S.log.filter((e) => e.actor_id === u.id);
  const extra = u.role === "seeker"
    ? `<p class="muted" style="margin-top:12px">Скоринг-балл профиля: <b style="color:var(--green)">87 / 100</b></p><div class="bar" style="margin-top:7px"><i style="width:87%"></i></div><p class="muted" style="margin-top:9px">Предпочтения: бюджет до 20 000 ₽ · ночные смены · без курения</p>`
    : u.role === "initiator"
      ? `<p class="muted" style="margin-top:12px">Активных лотов: <b>${S.data.objects.filter((o) => o.owner === u.name && o.status === "published").length}</b> · черновиков: <b>${S.data.objects.filter((o) => o.owner === u.name && o.status === "draft").length}</b></p>`
      : `<p class="muted" style="margin-top:12px">Открытых споров: <b>${S.data.disputes.filter((d) => d.status === "open").length}</b> · заявок на верификацию: <b>${S.data.verifications.filter((v) => v.status === "pending").length}</b></p>`;
  $("#profile-body").innerHTML = `
    <div class="grid g2">
      <div class="card"><h3>${esc(u.name)}</h3>
        <p class="muted">Роль: ${ROLES[u.role]}</p>
        <p class="muted">Учётная запись: <span class="mono">${u.login}</span> · <span class="mono">${u.id}</span></p>
        ${extra}
        <div class="row mt"><button class="btn btn-o" data-act="logout">Выйти из системы</button></div>
      </div>
      <div class="card"><h3>История действий</h3>
        ${mine.slice(-9).reverse().map((e) => `<p class="muted" style="padding:7px 0;border-bottom:1px dashed var(--line)"><span class="mono">${e.timestamp.slice(11, 19)}</span> · ${esc(e.action)}</p>`).join("") || '<p class="muted">Действий пока нет</p>'}
      </div>
    </div>`;
}

function csvCell(v) { return '"' + String(typeof v === "string" ? v : JSON.stringify(v ?? {})).replace(/"/g, '""') + '"'; }
function toCSV() { return "timestamp,actor_id,actor_role,action,object_type,object_id,outcome,changes,context\n" + S.log.map((e) => [e.timestamp, e.actor_id, e.actor_role, e.action, e.object_type, e.object_id, e.outcome, csvCell(e.changes), csvCell(e.context)].join(",")).join("\n"); }
function toJSONL() { return S.log.map((e) => JSON.stringify({ timestamp: e.timestamp, actor: { id: e.actor_id, role: e.actor_role }, action: e.action, object: { type: e.object_type, id: e.object_id }, outcome: e.outcome, changes: e.changes, context: e.context })).join("\n"); }
function toTXT() { return S.log.map((e) => `${e.timestamp} actor=${e.actor_id} role=${e.actor_role} action=${e.action} object=${e.object_type}:${e.object_id} outcome=${e.outcome} corr=${e.context.correlation_id}` + (Object.keys(e.changes).length ? " change=" + JSON.stringify(e.changes) : "")).join("\n"); }
function download(name, text) { const b = new Blob([text], { type: "text/plain;charset=utf-8" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1200); }

function render() {
  const u = me();
  if (!u) { $("#s-login").hidden = false; $("#shell").hidden = true; return; }
  $("#s-login").hidden = true;
  $("#shell").hidden = false;
  $("#who-name").textContent = u.name;
  $("#who-role").textContent = ROLES[u.role];
  go(S.screen || MENU[u.role][0][0]);
}

$("#f-login").addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const acc = ACCOUNTS.find((a) => a.login === String(fd.get("login")).trim() && a.password === String(fd.get("password")));
  if (!acc) {
    $("#login-err").hidden = false;
    $("#login-err").textContent = "Неверный логин или пароль";
    logEvent("login", "account", String(fd.get("login")), "failure", { reason: "invalid_credentials" });
    return;
  }
  $("#login-err").hidden = true;
  e.target.reset();
  S.session = acc.id;
  S.sessionId = uid("sess");
  S.screen = MENU[acc.role][0][0];
  S.objectId = null; S.contractId = null; S.editLot = null; S.filters = {};
  logEvent("login", "account", acc.id, "success", { role: acc.role });
  render();
  toast("Вы вошли как " + acc.name, "g");
});

$("#f-lot").addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const id = String(fd.get("id") || "");
  const publish = e.submitter && e.submitter.name === "publish";
  const vals = {
    address: String(fd.get("address")).trim(), district: String(fd.get("district")), rooms: +fd.get("rooms"),
    area: +fd.get("area"), price: +fd.get("price"), deposit: +fd.get("deposit"), schedule: String(fd.get("schedule")),
    quiet: String(fd.get("quiet")), cleaning: String(fd.get("cleaning")), split: String(fd.get("split")),
    smoking: fd.get("smoking") === "on", guests: fd.get("guests") === "on", pets: fd.get("pets") === "on"
  };
  if (!vals.address || !vals.area || !vals.price || !vals.deposit) { toast("Заполните обязательные поля", "r"); logEvent("save_lot", "lot", id || "new", "failure", { reason: "required_fields" }); return; }
  if (id) {
    const o = objectById(id);
    const before = { price: o.price, cleaning: o.cleaning };
    Object.assign(o, vals);
    if (publish) o.status = "published";
    logEvent("save_lot", "lot", id, "success", { price: { old: before.price, new: vals.price }, cleaning: { old: before.cleaning, new: vals.cleaning } });
    S.data.candidates.filter((c) => c.objectId === id).forEach((c) => { c.notified = true; });
    logEvent("notify_candidates", "lot", id, "success", { notified: S.data.candidates.filter((c) => c.objectId === id).length });
    if (publish) logEvent("publish_lot", "lot", id);
    toast(publish ? "Лот сохранён и опубликован" : "Изменения сохранены, кандидаты уведомлены", "g");
  } else {
    const o = { id: uid("obj"), ...vals, score: 80, status: publish ? "published" : "draft", owner: me().name };
    S.data.objects.push(o);
    logEvent("save_lot", "lot", o.id, "success", vals);
    if (publish) logEvent("publish_lot", "lot", o.id);
    toast(publish ? "Лот опубликован" : "Лот сохранён как черновик", "g");
  }
  S.editLot = null;
  save();
  go("lots");
});

$("#f-act").addEventListener("submit", (e) => {
  e.preventDefault();
  const c = contractById(S.contractId);
  if (!c || !c.depositHeld) { toast("Сначала выберите договор с удержанным депозитом", "r"); return; }
  const fd = new FormData(e.target);
  const act = { id: uid("act"), contractId: c.id, electricity: String(fd.get("electricity")), cold: String(fd.get("cold")), hot: String(fd.get("hot")), note: String(fd.get("note")), photos: S.photos, at: stamp() };
  const i = S.data.acts.findIndex((a) => a.contractId === c.id);
  if (i >= 0) S.data.acts[i] = act; else S.data.acts.push(act);
  logEvent("save_act", "act", act.id, "success", { electricity: act.electricity, cold: act.cold, hot: act.hot, photos: act.photos });
  save();
  toast("Акт приёмки сохранён", "g");
  go("contract");
});

$("#f-block").addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const b = { id: uid("blk"), user: String(fd.get("user")).trim(), reason: String(fd.get("reason")).trim(), date: new Date().toISOString().slice(0, 10) };
  S.data.blacklist.push(b);
  logEvent("block_user", "user", b.id, "success", { user: b.user, reason: b.reason });
  e.target.reset();
  save();
  renderDeposits();
  toast("Пользователь заблокирован: " + b.user, "a");
});

document.addEventListener("click", (e) => {
  if (e.target.id === "modal") { closeModal(); return; }
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const act = el.dataset.act, id = el.dataset.id;

  if (act === "go") { go(id); return; }
  if (act === "logout") { logEvent("logout", "account", S.session); S.session = null; S.sessionId = null; S.screen = null; save(); closeModal(); render(); return; }
  if (act === "modal-close") { closeModal(); return; }

  if (act === "find") {
    S.filters = { budget: $("#fl-budget").value, schedule: $("#fl-schedule").value, district: $("#fl-district").value, sort: $("#fl-sort").value };
    logEvent("find_objects", "search", "objects", "success", S.filters);
    save(); renderObjects(); toast("Поиск выполнен", "g"); return;
  }
  if (act === "find-reset") { S.filters = {}; logEvent("reset_search", "search", "objects"); save(); renderObjects(); return; }
  if (act === "open-object") { S.objectId = id; save(); go("object"); return; }
  if (act === "apply") {
    const a = { id: uid("app"), objectId: id, seeker: me().name, status: "pending" };
    S.data.applications.push(a);
    logEvent("submit_application", "application", a.id, "success", { object_id: id });
    save(); renderObject(); toast("Заявка на заселение подана", "g"); return;
  }
  if (act === "open-offer") { S.contractId = id; save(); go("contract"); return; }
  if (act === "sign-offer") {
    const c = contractById(id); c.offerSigned = true;
    logEvent("sign_offer", "contract", id); save(); renderContract(); toast("Оферта о правилах проживания подписана", "g"); return;
  }
  if (act === "freeze") {
    const c = contractById(id), o = objectById(c.objectId);
    openModal(`<h3>Заморозка депозита</h3><p class="lead">Средства резервируются на эскроу-счёте платформы до завершения аренды. Возврат или удержание выполняется администратором по итогам арбитража.</p>
      <div class="kv"><span>Объект</span><b>${esc(title(o))}</b><span>Адрес</span><b>${esc(o.address)}</b><span>Сумма депозита</span><b style="color:var(--blue)">${money(o.deposit)} ₽</b><span>Договор</span><b class="mono">${c.id}</b></div>
      <div class="row"><button class="btn btn-g" data-act="freeze-confirm" data-id="${c.id}">Подтвердить заморозку</button><button class="btn btn-o" data-act="modal-close">Отмена</button></div>`);
    return;
  }
  if (act === "freeze-confirm") {
    const c = contractById(id), o = objectById(c.objectId);
    c.depositHeld = true;
    if (!S.data.deposits.some((d) => d.user === me().name && d.objectId === c.objectId && d.status === "held"))
      S.data.deposits.push({ id: uid("dep"), user: me().name, objectId: c.objectId, amount: o.deposit, status: "held", debt: 0 });
    logEvent("freeze_deposit", "deposit", c.id, "success", { amount: o.deposit });
    save(); closeModal(); renderContract(); toast("Депозит удержан на эскроу-счёте", "g"); return;
  }
  if (act === "open-act") { S.contractId = id; save(); go("act"); return; }
  if (act === "act-photo") { S.photos++; $("#act-photos").textContent = "Прикреплено фото: " + S.photos; logEvent("attach_photo", "act", S.contractId || "new", "success", { count: S.photos }); save(); return; }

  if (act === "lot-new") { S.editLot = null; save(); go("lot-form"); return; }
  if (act === "lot-edit") { S.editLot = id; save(); go("lot-form"); return; }
  if (act === "lot-publish") { const o = objectById(id); o.status = "published"; logEvent("publish_lot", "lot", id); save(); renderLots(); toast("Лот опубликован", "g"); return; }
  if (act === "lot-delete") {
    const o = objectById(id);
    openModal(`<h3>Удаление лота</h3><p class="lead">Лот «${esc(title(o))}, ${esc(o.address)}» будет удалён из системы. Действие нельзя отменить.</p>
      <div class="row"><button class="btn btn-r" data-act="lot-delete-confirm" data-id="${id}">Удалить лот</button><button class="btn btn-o" data-act="modal-close">Отмена</button></div>`);
    return;
  }
  if (act === "lot-delete-confirm") {
    S.data.objects = S.data.objects.filter((o) => o.id !== id);
    logEvent("delete_lot", "lot", id); save(); closeModal(); renderLots(); toast("Лот удалён", "a"); return;
  }
  if (act === "scoring") {
    const c = S.data.candidates.find((x) => x.id === id);
    logEvent("view_scoring", "candidate", id, "success", { score: c.score });
    openModal(`<h3>Скоринг-балл кандидата</h3><p class="lead">${esc(c.name)} · порог совместимости для объекта — 80 баллов.</p>
      <div class="kv"><span>Финансовая надёжность</span><b>${Math.min(100, c.score + 4)} / 100</b><span>Совпадение графика</span><b>${c.score} / 100</b><span>Бытовые привычки</span><b>${Math.max(0, c.score - 6)} / 100</b><span>Итоговый балл</span><b style="color:${c.score >= 80 ? "var(--green)" : "var(--red)"}">${c.score} / 100</b><span>Заключение</span><b>${c.score >= 80 ? "Выше порога" : "Ниже порога"}</b></div>
      <div class="row"><button class="btn btn-p" data-act="modal-close">Закрыть</button></div>`);
    save(); return;
  }
  if (act === "approve-cand") {
    const c = S.data.candidates.find((x) => x.id === id);
    c.status = "approved";
    let a = S.data.applications.find((x) => x.objectId === c.objectId && x.seeker === c.name);
    if (!a) { a = { id: uid("app"), objectId: c.objectId, seeker: c.name, status: "approved" }; S.data.applications.push(a); } else a.status = "approved";
    c.applicationId = a.id;
    logEvent("approve_candidate", "candidate", id, "success", { score: c.score });
    save(); renderCandidates(); toast("Кандидат одобрен. Сформируйте договор.", "g"); return;
  }
  if (act === "reject-cand") { const c = S.data.candidates.find((x) => x.id === id); c.status = "rejected"; logEvent("reject_candidate", "candidate", id); save(); renderCandidates(); toast("Кандидат отклонён", "a"); return; }
  if (act === "make-contract") {
    const c = S.data.candidates.find((x) => x.id === id);
    if (S.data.contracts.some((x) => x.applicationId === c.applicationId)) { toast("Договор уже сформирован", "a"); go("contracts"); return; }
    const con = { id: uid("con"), objectId: c.objectId, applicationId: c.applicationId, offerSigned: false, ownerSigned: false, depositHeld: false };
    S.data.contracts.push(con);
    logEvent("create_contract", "contract", con.id); save(); go("contracts"); toast("Цифровой договор сформирован", "g"); return;
  }
  if (act === "sign-contract") { const c = contractById(id); c.ownerSigned = true; logEvent("sign_contract", "contract", id); save(); renderContracts(); toast("Договор подписан со стороны инициатора", "g"); return; }

  if (act === "docs") {
    const v = S.data.verifications.find((x) => x.id === id);
    logEvent("view_documents", "verification", id);
    openModal(`<h3>Документы пользователя</h3><p class="lead">${esc(v.name)} · заявление от ${v.date}</p>
      <div class="kv"><span>Документ</span><b>Паспорт РФ</b><span>Серия и номер</span><b>${esc(v.passport)}</b><span>Кем выдан</span><b>${esc(v.issued)}</b><span>Скан главной страницы</span><b style="color:var(--green)">Загружен</b><span>Фото с документом</span><b style="color:var(--green)">Загружено</b></div>
      <div class="row"><button class="btn btn-g" data-act="approve-ver" data-id="${id}" ${v.status !== "pending" ? "disabled" : ""}>Одобрить верификацию</button><button class="btn btn-o" data-act="modal-close">Закрыть</button></div>`);
    save(); return;
  }
  if (act === "approve-ver") { const v = S.data.verifications.find((x) => x.id === id); v.status = "approved"; logEvent("approve_verification", "verification", id); save(); closeModal(); renderVerify(); toast("Профиль верифицирован: " + v.name, "g"); return; }
  if (act === "reject-ver") { const v = S.data.verifications.find((x) => x.id === id); v.status = "rejected"; logEvent("reject_verification", "verification", id); save(); closeModal(); renderVerify(); toast("Верификация отклонена", "a"); return; }

  if (act === "materials") {
    const d = S.data.disputes.find((x) => x.id === id);
    logEvent("view_materials", "dispute", id);
    openModal(`<h3>Материалы спора</h3><p class="lead">${esc(d.subject)} · ${esc(d.parties)}</p>
      <div class="kv"><span>Акт приёмки при заселении</span><b style="color:var(--green)">Приложен</b><span>Фото повреждений</span><b style="color:var(--green)">3 файла</b><span>Переписка сторон</span><b style="color:var(--green)">12 сообщений</b><span>Показания счётчиков</span><b>Зафиксированы</b><span>Сумма претензии</span><b style="color:var(--red)">${money(d.claim)} ₽</b></div>
      <div class="row"><button class="btn btn-a" data-act="decide" data-id="${id}" ${d.status !== "open" ? "disabled" : ""}>Принять решение</button><button class="btn btn-o" data-act="modal-close">Закрыть</button></div>`);
    save(); return;
  }
  if (act === "decide") {
    const d = S.data.disputes.find((x) => x.id === id);
    openModal(`<h3>Решение по спору</h3><p class="lead">${esc(d.subject)}. Решение фиксируется в системе и определяет судьбу депозита.</p>
      <div class="field"><label>Решение</label><select id="dec-kind"><option value="withhold">Удержать часть депозита</option><option value="refund">Вернуть депозит полностью</option></select></div>
      <div class="field"><label>Сумма удержания, ₽</label><input id="dec-sum" type="number" value="${d.claim}"></div>
      <div class="row"><button class="btn btn-a" data-act="decide-save" data-id="${id}">Зафиксировать решение</button><button class="btn btn-o" data-act="modal-close">Отмена</button></div>`);
    return;
  }
  if (act === "decide-save") {
    const d = S.data.disputes.find((x) => x.id === id);
    const kind = $("#dec-kind").value, sum = +$("#dec-sum").value || 0;
    d.status = "resolved"; d.decision = kind; d.held = kind === "withhold" ? sum : 0;
    logEvent("decide_dispute", "dispute", id, "success", { decision: kind, amount: d.held });
    save(); closeModal(); renderDisputes(); toast("Решение зафиксировано, спор закрыт", "g"); return;
  }

  if (act === "refund") {
    const d = S.data.deposits.find((x) => x.id === id);
    const dispute = S.data.disputes.find((x) => x.depositId === id && x.status === "resolved" && x.decision === "withhold");
    const back = d.amount - (dispute ? dispute.held : 0);
    openModal(`<h3>Возврат депозита</h3><p class="lead">Проверка завершена: открытых споров и задолженностей не выявлено. Средства возвращаются пользователю с эскроу-счёта.</p>
      <div class="kv"><span>Пользователь</span><b>${esc(d.user)}</b><span>Депозит</span><b>${money(d.amount)} ₽</b><span>Удержано по арбитражу</span><b>${money(dispute ? dispute.held : 0)} ₽</b><span>К возврату</span><b style="color:var(--green)">${money(back)} ₽</b></div>
      <div class="row"><button class="btn btn-g" data-act="refund-confirm" data-id="${id}">Выполнить возврат</button><button class="btn btn-o" data-act="modal-close">Отмена</button></div>`);
    return;
  }
  if (act === "refund-confirm") {
    const d = S.data.deposits.find((x) => x.id === id);
    d.status = "released";
    logEvent("refund_deposit", "deposit", id, "success", { amount: d.amount });
    save(); closeModal(); renderDeposits(); toast("Депозит возвращён пользователю " + d.user, "g"); return;
  }
  if (act === "withhold") { const d = S.data.deposits.find((x) => x.id === id); d.status = "withheld"; logEvent("withhold_deposit", "deposit", id, "success", { amount: d.amount }); save(); renderDeposits(); toast("Депозит удержан", "a"); return; }
  if (act === "unblock") { S.data.blacklist = S.data.blacklist.filter((b) => b.id !== id); logEvent("unblock_user", "user", id); save(); renderDeposits(); toast("Пользователь разблокирован", "g"); return; }
  if (act === "report") { logEvent("generate_report", "report", uid("rep")); save(); toast("Отчёт по депозитам и спорам сформирован", "g"); return; }

  if (act === "export") {
    const content = id === "csv" ? toCSV() : id === "jsonl" ? toJSONL() : toTXT();
    download("sharing_log." + (id === "jsonl" ? "jsonl" : id === "csv" ? "csv" : "txt"), content);
    logEvent("export_log", "log", id, "success", { format: id, records: S.log.length });
    renderJournal(); toast("Журнал выгружен: " + id.toUpperCase(), "g"); return;
  }
  if (act === "journal-clear") { S.log = []; save(); renderJournal(); toast("Журнал очищен", "a"); return; }
  if (act === "reset-demo") {
    openModal(`<h3>Сброс демо-данных</h3><p class="lead">Все объекты, заявки, договоры, споры и журнал вернутся к исходному состоянию. Учётная запись останется активной.</p>
      <div class="row"><button class="btn btn-r" data-act="reset-demo-confirm">Сбросить</button><button class="btn btn-o" data-act="modal-close">Отмена</button></div>`);
    return;
  }
  if (act === "reset-demo-confirm") {
    S.data = seedData(); S.log = []; S.objectId = null; S.contractId = null; S.editLot = null; S.photos = 0; S.filters = {};
    save(); closeModal(); go(S.screen); toast("Демо-данные сброшены к исходному состоянию", "g"); return;
  }
});

["fl-budget", "fl-schedule", "fl-district", "fl-sort"].forEach((id) => {
  document.getElementById(id).addEventListener("change", (e) => {
    const field = id.replace("fl-", "");
    S.filters[field] = e.target.value;
    logEvent("set_search_attrs", "search", field, "success", { field, value: e.target.value });
    save();
  });
});

document.addEventListener("change", (e) => {
  if (e.target.closest("#f-act") && ["electricity", "cold", "hot"].includes(e.target.name)) {
    logEvent("enter_meters", "act", S.contractId || "new", "success", { field: e.target.name, value: e.target.value });
  }
});

document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

render();