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

  // 分類：收合狀態下點圖示 → 展開側欄並打開該分類
  document.querySelectorAll('.cat-head').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.parentElement;
      if (!body.classList.contains('open')) {
        setOpen(true);
        cat.classList.add('expanded');
      } else {
        cat.classList.toggle('expanded');
      }
      btn.setAttribute('aria-expanded', cat.classList.contains('expanded'));
    });
  });
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
      var nav = document.querySelector('[data-nav="' + listType + '-' + c + '"]');
      if (nav) {
        nav.classList.add('active');
        var parent = nav.closest('.cat');
        parent.classList.add('expanded');
        parent.querySelector('.cat-head').setAttribute('aria-expanded', 'true');
      }
    }
  }
})();
