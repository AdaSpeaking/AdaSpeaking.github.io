(function () {
  var body = document.body;
  var KEY = 'workbench-sidebar-open';
  var isMobile = function () { return window.matchMedia('(max-width: 760px)').matches; };

  function setOpen(open) {
    body.classList.toggle('open', open);
    document.getElementById('toggle').setAttribute('aria-expanded', open);
    if (!isMobile()) { try { localStorage.setItem(KEY, open ? '1' : '0'); } catch (e) {} }
  }

  // 桌機記住上次的開合狀態；預設收合
  if (!isMobile()) {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved === '1') body.classList.add('open');
  }

  document.getElementById('toggle').addEventListener('click', function () { setOpen(!body.classList.contains('open')); });
  document.getElementById('toggleMobile').addEventListener('click', function () { setOpen(true); });
  document.getElementById('scrim').addEventListener('click', function () { setOpen(false); });

  // 文章清單／工具清單：依 ?c= 只顯示該分類
  var c = new URLSearchParams(location.search).get('c');
  var sections = document.querySelectorAll('.cat-section');
  if (sections.length) {
    var listType = location.pathname.indexOf('/tools') === 0 ? 'tools' : 'articles';
    var hit = null;
    sections.forEach(function (s) { if (s.dataset.cat === c) hit = s; });
    if (hit) {
      sections.forEach(function (s) { s.hidden = s !== hit; });
      hit.querySelector('.cat-label').hidden = true;
      var h1 = document.querySelector('.list-title');
      h1.textContent = hit.dataset.name + '・' + (listType === 'tools' ? '工具清單' : '文章清單');
      document.title = h1.textContent + '｜Ada\'s Workbench';
      var nav = document.querySelector('[data-nav="articles-' + c + '"]');
      if (listType === 'articles' && nav) nav.classList.add('active');
    }
  }

  // 文章卡分頁：每頁 data-paginate 篇，下方顯示頁碼
  document.querySelectorAll('[data-paginate]').forEach(function (list) {
    var per = parseInt(list.dataset.paginate, 10) || 10;
    var items = Array.prototype.slice.call(list.children);
    var pages = Math.ceil(items.length / per);
    if (pages <= 1) return;
    var pager = document.createElement('nav');
    pager.className = 'pager';
    pager.setAttribute('aria-label', '分頁');
    list.after(pager);

    function show(n, scroll) {
      items.forEach(function (li, i) { li.hidden = Math.floor(i / per) !== n - 1; });
      pager.innerHTML = '';
      function btn(label, target, opts) {
        var b = document.createElement('button');
        b.textContent = label;
        if (opts && opts.current) b.setAttribute('aria-current', 'page');
        if (opts && opts.disabled) b.disabled = true;
        if (opts && opts.aria) b.setAttribute('aria-label', opts.aria);
        b.addEventListener('click', function () { show(target, true); });
        pager.appendChild(b);
      }
      btn('‹', n - 1, { disabled: n === 1, aria: '上一頁' });
      for (var i = 1; i <= pages; i++) btn(String(i), i, { current: i === n });
      btn('›', n + 1, { disabled: n === pages, aria: '下一頁' });
      if (scroll) list.closest('section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    show(1, false);
  });
})();
