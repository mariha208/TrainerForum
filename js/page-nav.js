/**
 * page-nav.js
 * Overrides the SPA nav() function on standalone pages so that
 * clicking nav links or calling nav('browse') etc. navigates to
 * the correct .html file instead of trying to show a hidden div.
 */
(function () {
  const PAGE_MAP = {
    home: 'index.html',
    about: 'about.html',
    browse: 'find-trainers.html',
    categories: 'categories.html',
    pricing: 'pricing.html',
    blog: 'blog.html',
    contact: 'index.html',
    compare: 'index.html',
    profile: 'index.html',
    'trainer-dash': 'dashboard.html',
    'user-dash': 'index.html',
    admin: 'index.html',
  };

  window.nav = function (id) {
    const url = PAGE_MAP[id];
    if (url) {
      window.location.href = url;
    }
  };

  window.filterByCategory = function (cat) {
    window.location.href = 'find-trainers.html?cat=' + encodeURIComponent(cat);
  };

})();
