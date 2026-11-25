# my-containers

[English](#english) | [Русский](#русский)

## English

A small Firefox extension for managing container tabs. I wrote it because
Multi-Account Containers only creates and deletes containers one at a time,
and I needed to do it in batches.

Each container is a separate cookie jar: cookies, localStorage and cache are
not shared between containers, so the same site sees different sessions.

No build step, no dependencies — plain HTML/CSS/JS.

### What it does

- create 1 to 30 containers at once (names get numbered, colors cycle)
- delete several at once via checkboxes, with a confirmation step
- open a new tab in a container
- right-click a link: open it in a chosen container
- right-click a tab or page: move it to a chosen container
- shows how many tabs are open in each container
- light and dark theme

### Install

Requires Firefox 91 or newer.

1. Enable containers in Firefox: open `about:preferences`, search for
   "container", turn on "Enable container tabs". Or set
   `privacy.userContext.enabled` to `true` in `about:config`.
2. Clone the repo or download the ZIP:

   ```
   git clone https://github.com/wusder/my-containers.git
   ```

3. Open `about:debugging#/runtime/this-firefox`
4. Click "Load Temporary Add-on..." and pick `manifest.json` from the folder.
5. The button appears in the toolbar. If you don't see it, look under
   the puzzle icon.

Temporary add-ons disappear when Firefox restarts. To install permanently,
either sign the extension on addons.mozilla.org (choose "On your own",
it's free) and install the signed .xpi from `about:addons`, or use
Firefox Developer Edition / Nightly / ESR with
`xpinstall.signatures.required` set to `false`.

### Usage

- Create: type a name, pick a color and icon, set the count, press Create.
- Delete: tick the checkboxes (or "select all"), press "Delete selected",
  confirm.
- The plus button on a row opens a new tab in that container.
- Deleting a container closes its tabs and erases its cookies and site data.

### Compatibility with Multi-Account Containers

Containers are stored by Firefox itself, not by the extension. This one
works on its own; if you also have Multi-Account Containers installed,
both show the same containers. MAC has "always open this site in
container X", this one has batch operations. They don't conflict.

### Permissions

- `contextualIdentities` — create, list, delete containers
- `cookies` — required by the contextualIdentities API
- `tabs` — open, close, move tabs and count them
- `menus` — context menus

Nothing is sent anywhere; the extension makes no network requests.

### Limitations

- This is not private browsing. History and IP address are still shared;
  only cookies, storage and cache are isolated.
- Containers don't apply to private windows. If the current window is
  private, the extension opens a normal one.
- Firefox only.

### Files

```
manifest.json    manifest (MV2)
background.js    context menus
popup.html       panel markup
popup.css        styles
popup.js         list, batch create/delete
icon.svg         icon
```

### TODO

- rename containers from the panel
- "always open site X in container Y"
- search
- close all tabs of a container

### License

MIT

---

## Русский

Небольшое расширение для Firefox для управления контейнерами. Написал его,
потому что в Multi-Account Containers контейнеры создаются и удаляются
только по одному, а мне нужно было пачками.

Каждый контейнер — отдельное хранилище: куки, localStorage и кэш между
контейнерами не общие, поэтому один и тот же сайт видит разные сессии.

Сборка не нужна, зависимостей нет — обычные HTML/CSS/JS.

### Возможности

- создание от 1 до 30 контейнеров за раз (имена нумеруются, цвета чередуются)
- удаление нескольких сразу через галочки, с подтверждением
- новая вкладка в контейнере
- ПКМ по ссылке — открыть в выбранном контейнере
- ПКМ по вкладке или странице — перенести в выбранный контейнер
- счётчик вкладок у каждого контейнера
- светлая и тёмная тема

### Установка

Нужен Firefox 91 или новее.

1. Включи контейнеры: `about:preferences`, поиск по слову "контейнер",
   галочка "Включить контейнеры вкладок". Или
   `privacy.userContext.enabled = true` в `about:config`.
2. Клонируй репозиторий или скачай ZIP:

   ```
   git clone https://github.com/wusder/my-containers.git
   ```

3. Открой `about:debugging#/runtime/this-firefox`
4. "Загрузить временное дополнение..." — выбери `manifest.json` из папки.
5. Кнопка появится на панели; если не видно — посмотри под значком пазла.

Временное дополнение пропадает после перезапуска Firefox. Чтобы поставить
навсегда: подпиши расширение на addons.mozilla.org (режим "On your own",
бесплатно) и поставь подписанный .xpi через `about:addons`, либо используй
Firefox Developer Edition / Nightly / ESR с
`xpinstall.signatures.required = false`.

### Использование

- Создание: название, цвет, значок, количество, кнопка "Создать".
- Удаление: галочки (или "выбрать все"), "Удалить выбранные", подтвердить.
- Плюс в строке контейнера открывает в нём новую вкладку.
- При удалении контейнера его вкладки закрываются, куки и данные сайтов
  стираются.

### Совместимость с Multi-Account Containers

Контейнеры хранит сам Firefox, а не расширение. Это расширение работает
отдельно; если стоит и Multi-Account Containers, оба показывают одни и те
же контейнеры. В MAC есть "сайт всегда открывать в контейнере X", здесь —
массовые операции. Не конфликтуют.

### Разрешения

- `contextualIdentities` — создание, список, удаление контейнеров
- `cookies` — требуется для API contextualIdentities
- `tabs` — открыть, закрыть, перенести вкладки и посчитать их
- `menus` — контекстные меню

Ничего никуда не отправляется, сетевых запросов расширение не делает.

### Ограничения

- Это не приватный режим. История и IP общие, изолированы только куки,
  хранилище и кэш.
- В приватных окнах контейнеры не работают; если текущее окно приватное,
  расширение откроет обычное.
- Только Firefox.

### Файлы

```
manifest.json    манифест (MV2)
background.js    контекстные меню
popup.html       разметка панели
popup.css        стили
popup.js         список, массовое создание/удаление
icon.svg         значок
```

### TODO

- переименование контейнеров из панели
- "сайт всегда в контейнере X"
- поиск
- закрыть все вкладки контейнера

### Лицензия

MIT
