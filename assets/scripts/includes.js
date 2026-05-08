/* Lightweight client-side HTML includes for partials.
   Usage: <div data-include="header.html"></div>
   This will be replaced with the file's HTML content.
*/
(function() {
  function replaceIncludes() {
    var nodes = document.querySelectorAll('[data-include]');
    nodes.forEach(function(node) {
      var src = node.getAttribute('data-include');
      if (!src) return;
      fetch(src, { credentials: 'same-origin' })
        .then(function(resp) {
          if (!resp.ok) throw new Error('Include failed: ' + src + ' (' + resp.status + ')');
          return resp.text();
        })
        .then(function(html) {
          // Replace the placeholder element entirely to avoid extra wrappers
          var tmp = document.createElement('div');
          tmp.innerHTML = html;
          var includeUrl = new URL(src, window.location.href);
          var includeBase = new URL('.', includeUrl);
          var siteRoot = node.getAttribute('data-root');
          tmp.querySelectorAll('[data-include-href]').forEach(function(el) {
            var href = el.getAttribute('data-include-href');
            el.setAttribute('href', siteRoot !== null ? siteRoot + href : new URL(href, includeBase).pathname);
          });
          tmp.querySelectorAll('[data-include-src]').forEach(function(el) {
            var src = el.getAttribute('data-include-src');
            el.setAttribute('src', siteRoot !== null ? siteRoot + src : new URL(src, includeBase).pathname);
          });
          // If the partial has root element(s), adopt them; otherwise insert as-is
          var parent = node.parentNode;
          while (tmp.firstChild) {
            parent.insertBefore(tmp.firstChild, node);
          }
          parent.removeChild(node);
        })
        .catch(function(err) {
          console.error(err);
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', replaceIncludes);
  } else {
    replaceIncludes();
  }
})();
