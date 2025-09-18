// --- Projects page: build right-side TOC + scroll spy ---
(function() {
  const toc = document.getElementById('project-toc');
  const sections = document.querySelectorAll('.project-section[id]');

  if (!toc || sections.length === 0) return;

  // 1) Build TOC items from sections (id + data-title or h4 text)
  const frag = document.createDocumentFragment();
  sections.forEach(sec => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    const title = sec.dataset.title || (sec.querySelector('h4')?.textContent || sec.id);
    a.href = `#${sec.id}`;
    a.textContent = title.trim();
    li.appendChild(a);
    frag.appendChild(li);
  });
  toc.appendChild(frag);

  // 2) Scroll spy – highlight the link for the section in view
  const links = toc.querySelectorAll('a');
  const byId = {};
  links.forEach(a => { byId[a.getAttribute('href').slice(1)] = a; });

  const observer = new IntersectionObserver((entries) => {
    // Prefer the section with greatest intersection ratio
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (visible.length) {
      const id = visible[0].target.id;
      links.forEach(a => a.classList.toggle('active', a === byId[id]));
    }
  }, { rootMargin: '-40% 0px -50% 0px', threshold: [0.1, 0.25, 0.5, 0.75] });

  sections.forEach(sec => observer.observe(sec));

  // 3) Improve keyboard + click UX (close focus ring after click)
  toc.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      links.forEach(a => a.classList.remove('active'));
      e.target.classList.add('active');
    }
  });
})();
