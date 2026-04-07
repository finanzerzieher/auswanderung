// =============================================
// AUSWANDERUNG — View: L\u00e4nder (Referenz/Nachschlagewerk)
// =============================================

window.Views = window.Views || {};
window.Views.countries = (function () {

  function ruleTypeLabel(ruleType, windowDays) {
    if (ruleType === 'per_entry') return 'pro Einreise';
    if (ruleType === 'rolling') return 'je ' + (windowDays || 180) + ' Tage';
    if (ruleType === 'continuous') return 'am St\u00fcck';
    if (ruleType === 'calendar_year') return 'pro Kalenderjahr';
    return 'gesamt';
  }

  function renderCards(filter) {
    var grid = document.getElementById('countryGrid');
    var esc = DateUtils.escapeHtml;
    var stays = (Views.stays && Views.stays.getStays) ? Views.stays.getStays() : [];

    var countries = DATA.countries.slice();

    // Sort: countries with stays first
    countries.sort(function (a, b) {
      var aStays = stays.filter(function (s) { return s.country === a.name; }).length;
      var bStays = stays.filter(function (s) { return s.country === b.name; }).length;
      if (aStays > 0 && bStays === 0) return -1;
      if (aStays === 0 && bStays > 0) return 1;
      return 0;
    });

    // Filter
    if (filter) {
      var q = filter.toLowerCase();
      countries = countries.filter(function (c) {
        return c.name.toLowerCase().includes(q) || c.flag.includes(q);
      });
    }

    grid.innerHTML = countries.map(function (c) {
      var daysUsed = (Views.stays && Views.stays.calcDaysUsed) ? Views.stays.calcDaysUsed(c.name) : 0;
      var pct = Math.round((daysUsed / c.maxStay) * 100);
      if (pct > 100) pct = 100;
      var fillClass = pct < 60 ? 'safe' : pct < 85 ? 'caution' : 'danger';
      var remaining = c.maxStay - daysUsed;
      if (remaining < 0) remaining = 0;
      var isSchengen = c.schengen || (window.Schengen && window.Schengen.isSchengen(c.name));
      var schengenBadge = isSchengen ? '<span class="schengen-badge">Schengen</span>' : '';
      var ruleHint = ruleTypeLabel(c.ruleType, c.windowDays);
      var countryStayCount = stays.filter(function (s) { return s.country === c.name; }).length;

      return '\
        <div class="country-card country-card-clickable" data-country="' + esc(c.name) + '">\
          <div class="country-header">\
            <div class="country-name">' + esc(c.name) + ' ' + schengenBadge + '</div>\
            <div class="country-flag">' + c.flag + '</div>\
          </div>\
          <div class="country-stay">\
            <div class="country-stay-bar">\
              <div class="country-stay-fill ' + fillClass + '" style="width: ' + pct + '%"></div>\
            </div>\
            <div class="country-stay-text">\
              <span>' + daysUsed + ' von ' + c.maxStay + ' Tage (' + ruleHint + ')</span>\
              <span>' + remaining + ' \u00fcbrig</span>\
            </div>\
          </div>\
          ' + (countryStayCount > 0 ? '<div class="country-stay-count">' + countryStayCount + ' Aufenthalt' + (countryStayCount > 1 ? 'e' : '') + ' erfasst</div>' : '') + '\
        </div>';
    }).join('');

    // Click to show detail dialog
    grid.querySelectorAll('.country-card-clickable').forEach(function (card) {
      card.addEventListener('click', function () {
        var name = card.dataset.country;
        if (Views.stays && Views.stays.showCountryInfo) {
          Views.stays.showCountryInfo(name);
        }
      });
    });
  }

  function render() {
    renderCards('');

    // Search field
    var searchField = document.getElementById('countrySearch');
    if (searchField) {
      searchField.addEventListener('input', function () {
        renderCards(searchField.value);
      });
    }

    // Re-render when stays are loaded
    if (Views.stays) {
      DB.loadStays().then(function () {
        // stays.js will have loaded by now via its own render
        renderCards(document.getElementById('countrySearch') ? document.getElementById('countrySearch').value : '');
      });
    }
  }

  return { render: render };
})();
