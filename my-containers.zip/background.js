// Фоновый скрипт: меню по правому клику.
// "Открыть ссылку в контейнере" и "Перенести эту вкладку в контейнер".

const ROOT_LINK = "open-link";
const ROOT_MOVE = "move-tab";

// Открыть URL в контейнере. Если активное окно приватное (там контейнеры
// запрещены) — открываем новое обычное окно, чтобы не падать с ошибкой.
async function openInContainer(url, cookieStoreId, index) {
  const opts = { cookieStoreId };
  if (url) opts.url = url;
  try {
    if (index !== undefined) opts.index = index;
    return await browser.tabs.create(opts);
  } catch (e) {
    return await browser.windows.create(opts);
  }
}

// Перестроить меню заново (вызывается при создании/удалении контейнеров)
async function rebuildMenus() {
  await browser.menus.removeAll();

  let identities = [];
  try {
    identities = await browser.contextualIdentities.query({});
  } catch (e) {
    return // контейнеры выключены в настройках Firefox
  }
  if (identities.length === 0) return;

  browser.menus.create({
    id: ROOT_LINK,
    title: "Открыть ссылку в контейнере",
    contexts: ["link"]
  });
  browser.menus.create({
    id: ROOT_MOVE,
    title: "Перенести эту вкладку в контейнер",
    contexts: ["page", "tab"]
  });

  for (const ci of identities) {
    browser.menus.create({
      id: "link|" + ci.cookieStoreId,
      parentId: ROOT_LINK,
      title: ci.name,
      contexts: ["link"]
    });
    browser.menus.create({
      id: "move|" + ci.cookieStoreId,
      parentId: ROOT_MOVE,
      title: ci.name,
      contexts: ["page", "tab"]
    });
  }
  browser.menus.refresh().catch(() => {});
}

browser.menus.onClicked.addListener(async (info, tab) => {
  const sep = info.menuItemId.indexOf("|");
  if (sep === -1) return;
  const action = info.menuItemId.slice(0, sep);
  const cookieStoreId = info.menuItemId.slice(sep + 1);

  try {
    if (action === "link" && info.linkUrl) {
      await openInContainer(info.linkUrl, cookieStoreId);
    } else if (action === "move" && tab && tab.url) {
      // сначала открываем копию в контейнере, потом закрываем старую
      await openInContainer(tab.url, cookieStoreId, tab.index + 1);
      await browser.tabs.remove(tab.id);
    }
  } catch (e) {
    console.warn("Не удалось открыть вкладку в контейнере:", e);
  }
});

browser.contextualIdentities.onCreated.addListener(rebuildMenus);
browser.contextualIdentities.onRemoved.addListener(rebuildMenus);
browser.contextualIdentities.onUpdated.addListener(rebuildMenus);

rebuildMenus();