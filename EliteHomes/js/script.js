/* EliteHomes - interactions */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const navbar = $('#mainNavbar');

  /* ---------- Mega menu: opens by click (Bootstrap dropdown), closes after choosing a link ---------- */
  const megaToggle = $('#propertiesDropdown');
  if (megaToggle) {
    const dd = bootstrap.Dropdown.getOrCreateInstance(megaToggle);
    $$('.mega-menu-panel a').forEach(a => a.addEventListener('click', () => dd.hide()));
  }

  /* ---------- Collapse mobile menu after clicking a link ---------- */
  const collapseEl = $('#navbarContent');
  $$('#navbarContent .nav-link:not(.dropdown-toggle), #navbarContent .mega-menu-panel a').forEach(a => {
    a.addEventListener('click', () => {
      if (collapseEl.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(collapseEl).hide();
    });
  });

  /* ---------- Scrollspy (active link follows the section on screen) ---------- */
  const links = $$('#mainNavbar .navbar-nav > .nav-item > .nav-link');
  const sections = [...links, ]
    .map(l => ({ link: l, el: $(l.getAttribute('href')) }))
    .filter(x => x.el);
  const propsLink = $('#propertiesDropdown');
  const spy = () => {
    const y = window.scrollY + 120;
    let current = sections[0];
    sections.forEach(s => { if (s.el.offsetTop <= y) current = s; });
    // bottom of page -> last section (Contact)
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = sections[sections.length - 1];
    links.forEach(l => l.classList.toggle('active', current && l === current.link && l !== propsLink));
  };
  window.addEventListener('scroll', spy, { passive: true });
  window.addEventListener('resize', spy);
  spy();


  /* ---------- Property search / filter ---------- */
  const cards = $$('.property-col');
  const noResults = $('#noResults');
  const val = id => $(id).value;
  const num = id => { const v = parseFloat(val(id)); return isNaN(v) ? null : v; };
  const priceRanges = { '$0 - $500K': [0, 500000], '$500K - $1M': [500000, 1000000], '$1M - $2M': [1000000, 2000000], '$2M+': [2000000, Infinity] };

  const applyFilters = () => {
    const loc = val('#searchLocation').trim().toLowerCase();
    const type = val('#searchType');
    const range = priceRanges[val('#searchPrice')];
    const beds = parseInt(val('#searchBeds'), 10);       // "3+ Beds" -> 3, "Any" -> NaN
    const baths = parseInt(val('#searchBaths'), 10);
    const minSq = num('#searchMinSqft'), maxSq = num('#searchMaxSqft');
    let shown = 0;
    cards.forEach(c => {
      const d = c.dataset, price = +d.price;
      const ok =
        (!loc || loc.split(/[\s,]+/).filter(Boolean).every(w => d.loc.includes(w))) &&
        (type === 'All Types' || d.type.split('|').includes(type)) &&
        (!range || (price >= range[0] && price < range[1])) &&
        (isNaN(beds) || +d.beds >= beds) &&
        (isNaN(baths) || +d.baths >= baths) &&
        (minSq === null || +d.sqft >= minSq) &&
        (maxSq === null || +d.sqft <= maxSq);
      c.classList.toggle('d-none', !ok);
      if (ok) shown++;
    });
    noResults.classList.toggle('d-none', shown !== 0);
  };
  $('#propertySearchForm').addEventListener('submit', e => {
    e.preventDefault();
    applyFilters();
    $('#properties').scrollIntoView({ behavior: 'smooth' });
  });
  $('#viewAllBtn').addEventListener('click', () => {
    $('#propertySearchForm').reset();
    cards.forEach(c => c.classList.remove('d-none'));
    noResults.classList.add('d-none');
  });

  /* ---------- Favorites ---------- */
  $$('.fav-btn').forEach(btn => btn.addEventListener('click', () => {
    const on = btn.classList.toggle('active');
    btn.setAttribute('aria-pressed', on);
    btn.setAttribute('aria-label', on ? 'Remove from favorites' : 'Add to favorites');
  }));

  /* ---------- Contact form ---------- */
  const form = $('#contactForm'), ok = $('#formSuccess');
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      form.querySelector(':invalid')?.focus();
      return;
    }
    form.reset();
    form.classList.remove('was-validated');
    ok.classList.remove('d-none');
    ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => ok.classList.add('d-none'), 6000);
  });

  /* ---------- Live chat card -> focus first field ---------- */
  $$('a[href="#contactForm"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => $('#firstName').focus({ preventScroll: true }), 500);
  }));
});
