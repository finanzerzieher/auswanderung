// =============================================
// AUSWANDERUNG — View: Länder (Referenz/Nachschlagewerk)
// =============================================

window.Views = window.Views || {};
window.Views.countries = (function () {
  var FAVORITES_KEY = 'auswanderung_fav_countries';

  function loadFavorites() {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveFavorites(favs) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  }

  function toggleFavorite(name) {
    var favs = loadFavorites();
    var idx = favs.indexOf(name);
    if (idx >= 0) { favs.splice(idx, 1); }
    else { favs.push(name); }
    saveFavorites(favs);
    renderCards(document.getElementById('countrySearch') ? document.getElementById('countrySearch').value : '');
  }

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
    var favs = loadFavorites();

    // Determine which countries to show
    var countriesWithStays = [];
    stays.forEach(function (s) {
      if (countriesWithStays.indexOf(s.country) === -1) {
        countriesWithStays.push(s.country);
      }
    });

    // Build display list: countries with stays + favorites + search matches
    var isSearching = filter && filter.trim().length > 0;
    var q = isSearching ? filter.toLowerCase() : '';

    var displayCountries = [];

    if (isSearching) {
      // When searching: show ALL matching countries from DATA + CountriesDB
      DATA.countries.forEach(function (c) {
        if (c.name.toLowerCase().includes(q)) {
          displayCountries.push(c);
        }
      });
      // Also search CountriesDB for countries not in DATA
      if (window.CountriesDB) {
        var dbResults = CountriesDB.search(q);
        dbResults.forEach(function (r) {
          var alreadyIn = displayCountries.some(function (c) { return c.name === r.nameDE; });
          if (!alreadyIn) {
            displayCountries.push({
              name: r.nameDE,
              flag: r.flag,
              maxStay: 0,
              stayUnit: 'Tage',
              ruleType: 'unknown',
              schengen: r.schengen,
              rules: [],
              _fromDB: true
            });
          }
        });
      }
    } else {
      // Not searching: show only countries with stays + favorites
      var shown = {};
      // Countries with stays (from DATA.countries)
      DATA.countries.forEach(function (c) {
        if (countriesWithStays.indexOf(c.name) >= 0) {
          displayCountries.push(c);
          shown[c.name] = true;
        }
      });
      // Countries with stays not in DATA.countries
      countriesWithStays.forEach(function (name) {
        if (!shown[name]) {
          var dbEntry = window.CountriesDB ? CountriesDB.getByName(name) : null;
          displayCountries.push({
            name: name,
            flag: dbEntry ? dbEntry.flag : '',
            maxStay: 0,
            stayUnit: 'Tage',
            ruleType: 'unknown',
            schengen: dbEntry ? dbEntry.schengen : false,
            rules: [],
            _fromDB: true
          });
          shown[name] = true;
        }
      });
      // Favorites
      favs.forEach(function (name) {
        if (!shown[name]) {
          var dataC = DATA.countries.find(function (c) { return c.name === name; });
          if (dataC) {
            displayCountries.push(dataC);
          } else {
            var dbEntry = window.CountriesDB ? CountriesDB.getByName(name) : null;
            displayCountries.push({
              name: name,
              flag: dbEntry ? dbEntry.flag : '',
              maxStay: 0,
              stayUnit: 'Tage',
              ruleType: 'unknown',
              schengen: dbEntry ? dbEntry.schengen : false,
              rules: [],
              _fromDB: true
            });
          }
          shown[name] = true;
        }
      });
    }

    // Sort: countries with stays first, then favorites, then rest
    displayCountries.sort(function (a, b) {
      var aStays = countriesWithStays.indexOf(a.name) >= 0 ? 1 : 0;
      var bStays = countriesWithStays.indexOf(b.name) >= 0 ? 1 : 0;
      if (aStays !== bStays) return bStays - aStays;
      var aFav = favs.indexOf(a.name) >= 0 ? 1 : 0;
      var bFav = favs.indexOf(b.name) >= 0 ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      return 0;
    });

    if (displayCountries.length === 0 && !isSearching) {
      grid.innerHTML = '<div class="stay-empty">Noch keine L\u00e4nder. Trage einen Aufenthalt ein oder suche ein Land und f\u00fcge es als Favorit hinzu.</div>';
      return;
    }

    if (displayCountries.length === 0 && isSearching) {
      grid.innerHTML = '<div class="stay-empty">Kein Land gefunden f\u00fcr \u201e' + esc(filter) + '\u201c</div>';
      return;
    }

    grid.innerHTML = displayCountries.map(function (c) {
      var daysUsed = (Views.stays && Views.stays.calcDaysUsed) ? Views.stays.calcDaysUsed(c.name) : 0;
      var hasMaxStay = c.maxStay && c.maxStay > 0;
      var pct = hasMaxStay ? Math.round((daysUsed / c.maxStay) * 100) : 0;
      if (pct > 100) pct = 100;
      var fillClass = pct < 60 ? 'safe' : pct < 85 ? 'caution' : 'danger';
      var remaining = hasMaxStay ? c.maxStay - daysUsed : 0;
      if (remaining < 0) remaining = 0;
      var isSchengen = c.schengen || (window.Schengen && window.Schengen.isSchengen(c.name));
      var schengenBadge = isSchengen ? '<span class="schengen-badge">Schengen</span>' : '';
      var ruleHint = c.ruleType && c.ruleType !== 'unknown' ? ruleTypeLabel(c.ruleType, c.windowDays) : '';
      var countryStayCount = stays.filter(function (s) { return s.country === c.name; }).length;
      var isFav = favs.indexOf(c.name) >= 0;
      var favIcon = isFav ? '\u2605' : '\u2606';
      var favClass = isFav ? 'fav-active' : 'fav-inactive';

      var stayBar = '';
      if (hasMaxStay) {
        stayBar = '\
          <div class="country-stay">\
            <div class="country-stay-bar">\
              <div class="country-stay-fill ' + fillClass + '" style="width: ' + pct + '%"></div>\
            </div>\
            <div class="country-stay-text">\
              <span>' + daysUsed + ' von ' + c.maxStay + ' Tage' + (ruleHint ? ' (' + ruleHint + ')' : '') + '</span>\
              <span>' + remaining + ' \u00fcbrig</span>\
            </div>\
          </div>';
      }

      return '\
        <div class="country-card country-card-clickable" data-country="' + esc(c.name) + '">\
          <div class="country-header">\
            <div class="country-name">' + esc(c.name) + ' ' + schengenBadge + '</div>\
            <div class="country-header-right">\
              <button class="country-fav ' + favClass + '" data-fav="' + esc(c.name) + '" title="' + (isFav ? 'Favorit entfernen' : 'Als Favorit hinzuf\u00fcgen') + '">' + favIcon + '</button>\
              <div class="country-flag">' + c.flag + '</div>\
            </div>\
          </div>\
          ' + stayBar + '\
          ' + (countryStayCount > 0 ? '<div class="country-stay-count">' + countryStayCount + ' Aufenthalt' + (countryStayCount > 1 ? 'e' : '') + ' erfasst</div>' : '') + '\
          ' + (c._fromDB && !hasMaxStay ? '<div class="country-no-rules">Keine Visa-Infos hinterlegt</div>' : '') + '\
        </div>';
    }).join('');

    // Click handlers
    grid.querySelectorAll('.country-card-clickable').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('.country-fav')) return;
        var name = card.dataset.country;
        if (Views.stays && Views.stays.showCountryInfo) {
          Views.stays.showCountryInfo(name);
        }
      });
    });

    // Favorite toggle
    grid.querySelectorAll('.country-fav').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleFavorite(btn.dataset.fav);
      });
    });
  }

  function render() {
    renderCards('');

    var searchField = document.getElementById('countrySearch');
    if (searchField) {
      searchField.addEventListener('input', function () {
        renderCards(searchField.value);
      });
    }

    // Re-render when stays are loaded
    if (Views.stays) {
      DB.loadStays().then(function () {
        renderCards(document.getElementById('countrySearch') ? document.getElementById('countrySearch').value : '');
      });
    }
  }

  return { render: render };
})();
