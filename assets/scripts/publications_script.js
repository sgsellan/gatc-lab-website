// ---- Publications renderer ----
(function() {
  const root = document.getElementById('pub-root');
  if (!root) return;

  const HIGHLIGHT_AUTHORS = [/silvia\s*sellán/i]; // bold these names if found

  function formatAuthors(authors) {
    if (!Array.isArray(authors)) return '';
    return authors.map(name => {
      const shouldBold = HIGHLIGHT_AUTHORS.some(rx => rx.test(name));
      return shouldBold ? `<strong>${name}</strong>` : name;
    }).join(', ');
  }

  function linkList(links = {}) {
    const map = [
      ['pdf', 'PDF'],
      ['code', 'Code'],
      ['video', 'Video'],
      ['data', 'Data'],
      ['project', 'Project Page'],
      ['doi', 'DOI']
    ];
    const items = map
      .filter(([k]) => links[k])
      .map(([k, label]) => `<a href="${links[k]}" target="_blank" rel="noopener">${label}</a>`);
    return items.join(' · ');
  }

  function card(pub) {
    const imgSrc = pub.image || 'assets/img/paper-placeholder.jpg';
    const title = pub.title || 'Untitled';
    const year = pub.year ? ` (${pub.year})` : '';
    const venue = pub.venue ? `<div class="venue">${pub.venue}</div>` : '';
    const authors = formatAuthors(pub.authors || []);
    const summary = pub.summary ? `<p class="summary">${pub.summary}</p>` : '';
    const links = linkList(pub.links || {});

    return `
      <article class="pub-card">
        <div class="pub-media">
          <img src="${imgSrc}" alt="${title} image" />
        </div>
        <div class="pub-body">
          <h4>${title}${year}</h4>
          <div class="authors">${authors}</div>
          ${venue}
          ${summary}
          <div class="links">${links}</div>
        </div>
      </article>
    `;
  }

  function sortPubs(pubs) {
    // Sort by year (desc), then by title
    return pubs.slice().sort((a, b) => {
      const y = (b.year || 0) - (a.year || 0);
      if (y !== 0) return y;
      return String(a.title || '').localeCompare(String(b.title || ''));
    });
  }

  function render(pubs) {
    root.innerHTML = sortPubs(pubs).map(card).join('');
  }

  // Load JSON
  fetch('data/publications.json')
    .then(r => {
      if (!r.ok) throw new Error(`Failed to load publications.json (${r.status})`);
      return r.json();
    })
    .then(render)
    .catch(err => {
      console.error(err);
      root.innerHTML = `<div class="list-item">Could not load publications. Please try again later.</div>`;
    });
})();
