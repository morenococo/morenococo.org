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
