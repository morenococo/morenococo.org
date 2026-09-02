// Mobile nav toggle + reveal-on-scroll.
//
// Note on the reveal: sections here can be far taller than the viewport (the
// publications list is ~7700px), so an IntersectionObserver threshold above
// (viewportHeight / sectionHeight) can NEVER be reached and the section would
// stay hidden forever. Threshold must be 0, to fire as soon as any pixel enters.
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const showAll = () => revealEls.forEach(el => el.classList.add('is-visible'));

  if (!('IntersectionObserver' in window)) { showAll(); return; }

  try {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } catch (e) {
    showAll();
    return;
  }

  // Failsafe: whatever happens above, nothing stays hidden for more than 3s.
  setTimeout(showAll, 3000);
});

/* A DOI link lives inside the <summary>. Without this, following it would also
   toggle the disclosure open or shut. Purely an enhancement: with JS off the
   link still works, it just toggles as well. */
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('.pub-details summary a');
  if (a) { e.stopPropagation(); }
});

/* Click to enlarge the animations.
 *
 * Each .frame image is wrapped in a real <button> so it is reachable by
 * keyboard and announced as a control; a div with a click handler would not
 * be. The dialog is built once, on first use, and reused.
 *
 * <dialog> is what does the hard work: Escape to close, focus trapping and
 * the inert backdrop are all native. If it is missing, we bind nothing and
 * the figures stay exactly as they were.
 */
document.addEventListener('DOMContentLoaded', function () {
  var frames = document.querySelectorAll('.frame > img');
  if (!frames.length) return;
  if (typeof HTMLDialogElement === 'undefined' ||
      !HTMLDialogElement.prototype.showModal) return;

  var dialog = null, dlgImg = null, dlgCap = null, opener = null;

  function build() {
    dialog = document.createElement('dialog');
    dialog.className = 'lightbox';

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'lightbox-close';
    close.setAttribute('aria-label', 'Close');
    close.textContent = '\u00d7';
    close.addEventListener('click', function () { dialog.close(); });

    var inner = document.createElement('div');
    inner.className = 'lightbox-inner';

    dlgImg = document.createElement('img');
    dlgCap = document.createElement('p');
    dlgCap.className = 'lightbox-cap';

    inner.appendChild(dlgImg);
    inner.appendChild(dlgCap);
    dialog.appendChild(close);
    dialog.appendChild(inner);
    document.body.appendChild(dialog);

    // Clicking the backdrop closes. The backdrop is not a separate element,
    // so detect a click that landed on the dialog box itself rather than on
    // any of its children.
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });

    // Returning focus to the figure the reader came from keeps their place.
    dialog.addEventListener('close', function () {
      dlgImg.removeAttribute('src');
      if (opener) { opener.focus(); opener = null; }
    });
  }

  Array.prototype.forEach.call(frames, function (img) {
    var frame = img.parentNode;
    var figure = frame.closest ? frame.closest('figure') : null;
    var cap = figure ? figure.querySelector('figcaption') : null;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'frame-zoom';
    btn.setAttribute('aria-label', 'Enlarge: ' + (img.alt || 'animation'));
    frame.parentNode.insertBefore(btn, frame);
    btn.appendChild(frame);

    btn.addEventListener('click', function () {
      if (!dialog) build();
      // A lazy image below the fold may not have loaded yet; currentSrc is
      // empty until it does, so fall back to the resolved src attribute.
      dlgImg.src = img.currentSrc || img.src;
      dlgImg.alt = img.alt || '';
      if (cap) { dlgCap.innerHTML = cap.innerHTML; dlgCap.hidden = false; }
      else { dlgCap.textContent = ''; dlgCap.hidden = true; }
      opener = btn;
      dialog.showModal();
    });
  });
});
