// Логика панели: список контейнеров, создание пачкой, удаление пачкой.

const COLOR_HEX = {
  blue: "#37adff", turquoise: "#00c79a", green: "#51cd00",
  yellow: "#ffcb00", orange: "#ff9f00", red: "#ff613d",
  pink: "#ff4bda", purple: "#af51f5", toolbar: "#888888"
};
const COLOR_RU = {
  blue: "Синий", turquoise: "Бирюзовый", green: "Зелёный",
  yellow: "Жёлтый", orange: "Оранжевый", red: "Красный",
  pink: "Розовый", purple: "Фиолетовый", toolbar: "Серый"
};
const ICON_EMOJI = {
  fingerprint: "👤", briefcase: "💼", dollar: "💲", cart: "🛒",
  circle: "⚪", gift: "🎁", vacation: "🌴", food: "🍜",
  fruit: "🍎", pet: "🐾", tree: "🌲", chill: "🎧", fence: "🚧"
};
const ICON_RU = {
  fingerprint: "Профиль", briefcase: "Работа", dollar: "Деньги", cart: "Покупки",
  circle: "Обычный", gift: "Подарок", vacation: "Отпуск", food: "Еда",
  fruit: "Фрукт", pet: "Питомец", tree: "Природа", chill: "Отдых", fence: "Прочее"
};

const $ = (s) => document.querySelector(s);
let identities = [];          // текущий список контейнеров
const selected = new Set();   // отмеченные галочками
let pendingDelete = [];       // что ждёт подтверждения удаления

// --- заполняем выпадающие списки цвета и значка ---
function fillSelect(sel, dict) {
  for (const [value, label] of Object.entries(dict)) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = label;
    sel.appendChild(opt);
  }
}
fillSelect($("#color"), COLOR_RU);
fillSelect($("#icon"), ICON_RU);
$("#icon").value = "fingerprint";

// --- загрузить данные и перерисовать список ---
async function refresh() {
  try {
    identities = await browser.contextualIdentities.query({});
  } catch (e) {
    // контейнеры отключены в настройках Firefox
    $("#disabled-warning").hidden = false;
    $("#create-form").hidden = true;
    $("#list-section").hidden = true;
    $("footer").hidden = true;
    return;
  }

  // считаем, сколько вкладок открыто в каждом контейнере
  const tabs = await browser.tabs.query({});
  const tabCount = {};
  for (const t of tabs) tabCount[t.cookieStoreId] = (tabCount[t.cookieStoreId] || 0) + 1;

  // убираем из выбора то, что уже удалено
  const alive = new Set(identities.map(c => c.cookieStoreId));
  for (const id of [...selected]) if (!alive.has(id)) selected.delete(id);

  renderList(tabCount);
}

function renderList(tabCount) {
  const list = $("#list");
  list.textContent = "";
  $("#total").textContent = identities.length ? `всего: ${identities.length}` : "";
  $("#empty").hidden = identities.length > 0;
  $("#select-all").checked = identities.length > 0 && selected.size === identities.length;

  for (const ci of identities) {
    const id = ci.cookieStoreId;
    const li = document.createElement("li");

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = selected.has(id);
    cb.addEventListener("change", () => {
      cb.checked ? selected.add(id) : selected.delete(id);
      $("#select-all").checked = selected.size === identities.length;
      updateFooter();
    });

    const dot = document.createElement("span");
    dot.className = "dot";
    dot.style.background = COLOR_HEX[ci.color] || "#888";

    const emoji = document.createElement("span");
    emoji.textContent = ICON_EMOJI[ci.icon] || "⚪";

    const name = document.createElement("span");
    name.className = "name";
    name.textContent = ci.name;   // textContent, а не innerHTML — безопасно
    name.title = ci.name;

    const count = document.createElement("span");
    count.className = "badge muted";
    count.textContent = `${tabCount[id] || 0} вкл.`;

    const openBtn = document.createElement("button");
    openBtn.textContent = "＋";
    openBtn.title = "Открыть новую вкладку в этом контейнере";
    openBtn.addEventListener("click", async () => {
      try {
        await browser.tabs.create({ cookieStoreId: id });
      } catch (e) {
        // активное окно приватное → открываем обычное окно
        await browser.windows.create({ cookieStoreId: id });
      }
      window.close();
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑";
    delBtn.className = "del";
    delBtn.title = "Удалить контейнер (вкладки закроются, куки сотрутся)";
    delBtn.addEventListener("click", () => askDelete([id]));

    li.append(cb, dot, emoji, name, count, openBtn, delBtn);
    list.appendChild(li);
  }
  updateFooter();
}

function updateFooter() {
  const btn = $("#delete-selected");
  btn.disabled = selected.size === 0;
  btn.textContent = selected.size
    ? `🗑 Удалить выбранные (${selected.size})`
    : "🗑 Удалить выбранные";
}

// --- создание: 1 штука или пачка до 30 ---
$("#create").addEventListener("click", async () => {
  const base = $("#name").value.trim() || "Контейнер";
  const count = Math.max(1, Math.min(30, parseInt($("#count").value, 10) || 1));
  const colors = Object.keys(COLOR_HEX);
  const start = colors.indexOf($("#color").value);
  const icon = $("#icon").value;

  $("#create").disabled = true;
  try {
    for (let i = 0; i < count; i++) {
      await browser.contextualIdentities.create({
        name: count === 1 ? base : `${base} ${i + 1}`,
        color: colors[(start + i) % colors.length], // цвета по кругу
        icon
      });
    }
  } finally {
    $("#create").disabled = false;
  }
  $("#name").value = "";
  $("#count").value = 1;
  await refresh();
});

$("#name").addEventListener("keydown", (e) => {
  if (e.key === "Enter") $("#create").click();
});

// --- выбор всех / удаление выбранных ---
$("#select-all").addEventListener("change", (e) => {
  selected.clear();
  if (e.target.checked) identities.forEach(ci => selected.add(ci.cookieStoreId));
  document.querySelectorAll("#list input[type=checkbox]")
    .forEach(cb => cb.checked = e.target.checked);
  updateFooter();
});

$("#delete-selected").addEventListener("click", () => {
  if (selected.size) askDelete([...selected]);
});

// --- подтверждение удаления (своя плашка вместо confirm) ---
function askDelete(ids) {
  pendingDelete = ids;
  $("#confirm-text").textContent =
    `Удалить ${ids.length} шт.? Вкладки закроются, куки и данные сайтов сотрутся.`;
  $("#confirm-bar").hidden = false;
}

$("#confirm-no").addEventListener("click", () => {
  pendingDelete = [];
  $("#confirm-bar").hidden = true;
});

$("#confirm-yes").addEventListener("click", async () => {
  $("#confirm-bar").hidden = true;
  const ids = pendingDelete;
  pendingDelete = [];
  for (const id of ids) {
    // сначала закрываем вкладки контейнера, потом удаляем его
    const tabs = await browser.tabs.query({ cookieStoreId: id });
    if (tabs.length) await browser.tabs.remove(tabs.map(t => t.id));
    try { await browser.contextualIdentities.remove(id); } catch (e) {}
    selected.delete(id);
  }
  await refresh();
});

// если контейнеры меняются, пока панель открыта — обновляемся
browser.contextualIdentities.onCreated.addListener(refresh);
browser.contextualIdentities.onRemoved.addListener(refresh);

refresh();