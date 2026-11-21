/* Protomota Share (2026-11-21)
   One small script shared by every Protomota site.
   Any element with [data-pm-share] becomes a Share button:
   - phones and tablets (touch) open the native share sheet (Web Share API)
   - desktops get a small menu: Copy link, X, LinkedIn, Facebook, Email
     (plus "More options" when the browser has its own share sheet)
   Optional attributes: data-share-url, data-share-title, data-share-text.
   A child with [data-pm-share-label] shows "Link copied" after a copy. */
(function () {
  if (typeof window === 'undefined' || window.__pmShareReady) return;
  window.__pmShareReady = true;

  var CSS = [
    '.pm-share-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px 0 15px;border-radius:999px;border:1px solid var(--pm-share-line,rgba(245,128,37,.6));background:var(--pm-share-bg,transparent);color:var(--pm-share-ink,inherit);font:inherit;font-size:15px;font-weight:600;line-height:1;cursor:pointer;white-space:nowrap;text-decoration:none;box-shadow:0 0 18px var(--pm-share-glow,rgba(245,128,37,.22));transition:border-color .2s,box-shadow .2s,transform .2s,background .2s}',
    '.pm-share-btn:hover{border-color:var(--pm-share-accent,#f58025);box-shadow:0 0 26px var(--pm-share-glow-hover,rgba(245,128,37,.42))}',
    '.pm-share-btn:active{transform:translateY(1px)}',
    '.pm-share-btn:focus-visible{outline:2px solid var(--pm-share-accent,#f58025);outline-offset:3px}',
    '.pm-share-btn svg{width:17px;height:17px;flex:none;color:var(--pm-share-accent,#f58025)}',
    '.pm-share-btn.is-small{height:36px;padding:0 14px 0 12px;font-size:13.5px;gap:7px}',
    '.pm-share-btn.is-small svg{width:15px;height:15px}',
    '.pm-share-pop{position:fixed;z-index:2147483000;min-width:228px;padding:8px;border-radius:18px;background:rgba(16,18,24,.97);color:#f4f4f6;border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 60px -18px rgba(0,0,0,.6),0 0 0 1px rgba(0,0,0,.25);font:500 14.5px/1.2 -apple-system,BlinkMacSystemFont,"Inter","Segoe UI",Roboto,sans-serif;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);opacity:0;transform:translateY(-4px) scale(.98);transform-origin:top center;transition:opacity .14s,transform .14s}',
    '.pm-share-pop.is-open{opacity:1;transform:none}',
    '.pm-share-pop .pm-share-head{padding:8px 12px 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:rgba(244,244,246,.6)}',
    '.pm-share-pop a,.pm-share-pop button{display:flex;align-items:center;gap:12px;width:100%;padding:10px 12px;border:0;border-radius:999px;background:transparent;color:inherit;font:inherit;text-align:left;text-decoration:none;cursor:pointer}',
    '.pm-share-pop a:hover,.pm-share-pop button:hover,.pm-share-pop a:focus-visible,.pm-share-pop button:focus-visible{background:rgba(255,255,255,.09);outline:none}',
    '.pm-share-pop svg{width:18px;height:18px;flex:none;color:var(--pm-pop-accent,#f58025)}',
    '.pm-share-pop svg[fill=currentColor],.pm-share-pop svg[fill=currentColor] *{fill:currentColor!important;stroke:none!important}',
    '.pm-share-pop svg[fill=none],.pm-share-pop svg[fill=none] *,.pm-share-btn svg[fill=none],.pm-share-btn svg[fill=none] *{fill:none!important;stroke:currentColor!important}',
    '.pm-share-pop .pm-share-sep{height:1px;margin:6px 10px;background:rgba(255,255,255,.1)}',
    '.pm-share-toast{position:fixed;left:50%;bottom:28px;z-index:2147483001;transform:translate(-50%,12px);padding:12px 20px;border-radius:999px;background:rgba(16,18,24,.96);color:#fff;font:600 14px/1 -apple-system,BlinkMacSystemFont,"Inter","Segoe UI",Roboto,sans-serif;border:1px solid rgba(245,128,37,.55);box-shadow:0 0 22px rgba(245,128,37,.3);opacity:0;transition:opacity .2s,transform .2s;pointer-events:none}',
    '.pm-share-toast.is-on{opacity:1;transform:translate(-50%,0)}'
  ].join('\n');

  var ICON = {
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="3"/><path d="m3.5 6.5 8.5 6 8.5-6"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7.5 7.5 4.5-4.5 4.5 4.5"/><path d="M5 12v6.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V12"/></svg>'
  };

  function injectCss() {
    if (document.getElementById('pm-share-css')) return;
    var s = document.createElement('style');
    s.id = 'pm-share-css';
    s.textContent = CSS;
    // in <body>, not <head>: some frameworks (Next.js) rebuild <head> after load
    (document.body || document.documentElement).insertBefore(s, (document.body || document.documentElement).firstChild);
  }

  function dataFor(btn) {
    var d = btn.dataset || {};
    var canon = document.querySelector('link[rel="canonical"]');
    var url = d.shareUrl || (canon && canon.href) || location.href;
    var title = d.shareTitle || document.title || '';
    var text = d.shareText || '';
    return { url: url, title: title, text: text };
  }

  function isTouch() {
    try {
      return window.matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    } catch (e) { return false; }
  }

  var toastTimer;
  function toast(msg) {
    var t = document.querySelector('.pm-share-toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'pm-share-toast';
      t.setAttribute('role', 'status');
      t.setAttribute('aria-live', 'polite');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(function () { t.classList.add('is-on'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 2200);
  }

  function flashLabel(btn) {
    var label = btn && btn.querySelector('[data-pm-share-label]');
    if (!label) return;
    if (!label.dataset.pmOrig) label.dataset.pmOrig = label.textContent;
    label.textContent = 'Link copied';
    clearTimeout(label.__pmT);
    label.__pmT = setTimeout(function () { label.textContent = label.dataset.pmOrig; }, 2200);
  }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  function doCopy(btn, data) {
    copy(data.url).then(function () {
      flashLabel(btn);
      toast('Link copied');
    }, function () {
      window.prompt('Copy this link:', data.url);
    });
  }

  var pop = null, popBtn = null;
  function closePop() {
    if (!pop) return;
    var p = pop;
    pop = null;
    if (popBtn) popBtn.setAttribute('aria-expanded', 'false');
    popBtn = null;
    p.classList.remove('is-open');
    setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, 160);
  }

  function place(p, btn) {
    var r = btn.getBoundingClientRect();
    var w = p.offsetWidth, h = p.offsetHeight;
    var vw = document.documentElement.clientWidth, vh = window.innerHeight;
    var left = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), vw - w - 12);
    var top = r.bottom + 10;
    if (top + h > vh - 12 && r.top - h - 10 > 12) top = r.top - h - 10;
    p.style.left = left + 'px';
    p.style.top = Math.max(12, top) + 'px';
  }

  function openPop(btn, data) {
    closePop();
    var enc = encodeURIComponent;
    var line = data.text ? data.title + ' - ' + data.text : data.title;
    var items = [
      { k: 'copy', icon: ICON.link, label: 'Copy link' },
      { k: 'x', icon: ICON.x, label: 'Post on X', href: 'https://x.com/intent/post?text=' + enc(line) + '&url=' + enc(data.url) },
      { k: 'linkedin', icon: ICON.linkedin, label: 'Share on LinkedIn', href: 'https://www.linkedin.com/sharing/share-offsite/?url=' + enc(data.url) },
      { k: 'facebook', icon: ICON.facebook, label: 'Share on Facebook', href: 'https://www.facebook.com/sharer/sharer.php?u=' + enc(data.url) },
      { k: 'email', icon: ICON.mail, label: 'Email', href: 'mailto:?subject=' + enc(data.title) + '&body=' + enc((data.text ? data.text + '\n\n' : '') + data.url) }
    ];
    if (navigator.share) items.push({ k: 'more', icon: ICON.more, label: 'More options', sep: true });

    var p = document.createElement('div');
    p.className = 'pm-share-pop';
    p.setAttribute('role', 'menu');
    p.setAttribute('aria-label', 'Share');
    var html = '<div class="pm-share-head">Share</div>';
    items.forEach(function (it) {
      if (it.sep) html += '<div class="pm-share-sep"></div>';
      if (it.href) {
        var ext = it.k !== 'email';
        html += '<a role="menuitem" data-k="' + it.k + '" href="' + it.href.replace(/"/g, '&quot;') + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + it.icon + '<span>' + it.label + '</span></a>';
      } else {
        html += '<button type="button" role="menuitem" data-k="' + it.k + '">' + it.icon + '<span>' + it.label + '</span></button>';
      }
    });
    p.innerHTML = html;
    try {
      var acc = getComputedStyle(btn).getPropertyValue('--pm-share-accent').trim();
      if (acc) p.style.setProperty('--pm-pop-accent', acc);
    } catch (e) {}
    document.body.appendChild(p);
    place(p, btn);
    pop = p;
    popBtn = btn;
    btn.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function () { p.classList.add('is-open'); });
    var first = p.querySelector('[role="menuitem"]');
    if (first) first.focus({ preventScroll: true });

    p.addEventListener('click', function (e) {
      var el = e.target.closest('[data-k]');
      if (!el) return;
      var k = el.getAttribute('data-k');
      if (k === 'copy') {
        e.preventDefault();
        doCopy(btn, data);
        el.innerHTML = ICON.check + '<span>Copied</span>';
        setTimeout(closePop, 650);
      } else if (k === 'more') {
        e.preventDefault();
        closePop();
        navigator.share(data).catch(function () {});
      } else if (k === 'x' || k === 'linkedin' || k === 'facebook') {
        e.preventDefault();
        window.open(el.href, 'pm-share', 'noopener,noreferrer,width=640,height=640');
        closePop();
      } else {
        setTimeout(closePop, 50);
      }
    });
  }

  function onClick(e) {
    var btn = e.target.closest && e.target.closest('[data-pm-share]');
    if (!btn) {
      if (pop && !pop.contains(e.target)) closePop();
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    injectCss();
    if (pop && popBtn === btn) { closePop(); return; }
    var data = dataFor(btn);
    if (navigator.share && isTouch()) {
      navigator.share(data).catch(function (err) {
        if (err && err.name === 'AbortError') return;
        doCopy(btn, data);
      });
      return;
    }
    openPop(btn, data);
  }

  function init() {
    injectCss();
    // re-add the styles if a framework swaps the page out after load
    setTimeout(injectCss, 1500);
    setTimeout(injectCss, 4000);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && pop) { var b = popBtn; closePop(); if (b) b.focus(); } });
    window.addEventListener('resize', closePop);
    window.addEventListener('scroll', function () { if (pop && popBtn) place(pop, popBtn); }, { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
