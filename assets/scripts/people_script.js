/* Render people data from YAML files into people.html and index.html.
   Requires js-yaml. Include:
   <script src="https://cdn.jsdelivr.net/npm/js-yaml@4/dist/js-yaml.min.js" defer></script>
   Then include this script.
*/
(function(){
  function loadYaml(url) {
    return fetch(url, { credentials: 'same-origin' })
      .then(function(resp) {
        if (!resp.ok) throw new Error('Failed to load ' + url + ' (' + resp.status + ')');
        return resp.text();
      })
      .then(function(text) {
        try {
          return jsyaml.load(text);
        } catch (e) {
          console.error('YAML parse error for', url, e);
          return null;
        }
      });
  }

  function getIdsFromManifest() {
    return loadYaml('data/people_index.yml').then(function(index){
      if (index && Array.isArray(index.people)) return index.people;
      return null;
    });
  }

  // Fallback: attempt to parse directory listing HTML if server exposes it
  function getIdsFromAutoindex() {
    return fetch('people/', { credentials: 'same-origin' })
      .then(function(resp){
        if (!resp.ok) throw new Error('No autoindex available');
        return resp.text();
      })
      .then(function(html){
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var anchors = Array.from(doc.querySelectorAll('a[href]'));
        var ids = anchors
          .map(function(a){ return a.getAttribute('href'); })
          .filter(function(href){ return href && /\/$/.test(href); })
          .map(function(href){ return href.replace(/\/$/, '').replace(/\/?$/, ''); })
          .filter(function(name){ return !!name; });
        return ids.length ? ids : null;
      })
      .catch(function(){ return null; });
  }

  function buildPeople() {
    (getIdsFromManifest().then(function(ids){
      if (ids && ids.length) return ids;
      return getIdsFromAutoindex();
    })).then(function(ids){
      if (!ids || !ids.length) return;
      return Promise.all(ids.map(function(id){
        return loadYaml('people/' + id + '/' + id + '.yml');
      })).then(function(items){
        var people = items.filter(Boolean);
        renderPeoplePage(people);
        renderHomePeople(people);
      });
    }).catch(function(err){ console.error(err); });
  }

  function renderPeoplePage(people){
    var root = document.getElementById('people-list');
    if (!root) return;
    people.forEach(function(p){
      var article = document.createElement('article');
      article.className = 'person-block';
      article.id = p.id;

      var media = document.createElement('div');
      media.className = 'person-block-media';
      var img = document.createElement('img');
      img.src = p.image;
      img.alt = p.name;
      media.appendChild(img);

      var body = document.createElement('div');
      body.className = 'person-block-body';
      var h4 = document.createElement('h4');
      h4.textContent = p.name + ' ';
      body.appendChild(h4);

      var bio = document.createElement('p');
      bio.textContent = (p.bio || '').trim();
      body.appendChild(bio);

      if (Array.isArray(p.links) && p.links.length){
        var links = document.createElement('p');
        links.className = 'links';
        p.links.forEach(function(l, idx){
          var a = document.createElement('a');
          a.href = l.url;
          a.target = '_blank';
          a.textContent = l.label || 'Link';
          links.appendChild(a);
          if (idx < p.links.length - 1){
            links.appendChild(document.createTextNode(' '));
          }
        });
        body.appendChild(links);
      }

      article.appendChild(media);
      article.appendChild(body);
      root.appendChild(article);
    });
  }

  function renderHomePeople(people){
    var root = document.getElementById('home-people');
    if (!root) return;
    root.setAttribute('role', 'list');
    people.filter(function(p){ return p.home_display !== false; }).forEach(function(p){
      var link = document.createElement('a');
      link.className = 'person-link';
      link.target = '_blank';
      link.href = 'people.html#' + p.id;

      var card = document.createElement('div');
      card.className = 'person';
      card.setAttribute('role', 'listitem');

      var img = document.createElement('img');
      img.src = p.image;
      img.alt = p.name;
      card.appendChild(img);

      var name = document.createElement('div');
      name.style.marginTop = '8px';
      name.style.fontWeight = '700';
      name.textContent = p.name;
      card.appendChild(name);

      var role = document.createElement('div');
      role.className = 'role';
      role.textContent = p.role || '';
      card.appendChild(role);

      link.appendChild(card);
      root.appendChild(link);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildPeople);
  } else {
    buildPeople();
  }
})();
