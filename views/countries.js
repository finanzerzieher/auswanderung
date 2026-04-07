// =============================================
// AUSWANDERUNG — View: Countries + Stay Log
// =============================================

window.Views = window.Views || {};
window.Views.countries = (function () {
  var stays = [];

  function calcDaysUsed(countryName) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var total = 0;
    stays.forEach(function (s) {
      if (s.country !== countryName) return;
      var entry = window.DateUtils.parseLocalDate(s.entry_date);
      var exit = s.exit_date ? window.DateUtils.parseLocalDate(s.exit_date) : today;
      var days = window.DateUtils.daysBetween(entry, exit);
      if (days < 0) days = 0;
      total += days;
    });
    return total;
  }

  function renderSchengenCounter() {
    var container = document.getElementById('schengenCounter');
    if (!container) return;

    var result = window.Schengen.calculate(stays);
    var pct = Math.round((result.daysUsed / 90) * 100);
    if (pct > 100) pct = 100;

    var colorClass = 'schengen-safe';
    if (result.daysUsed > 76) {
      colorClass = 'schengen-danger';
    } else if (result.daysUsed >= 60) {
      colorClass = 'schengen-caution';
    }

    var warningHtml = '';
    if (result.daysRemaining < 14) {
      warningHtml = '\
        <div class="schengen-warning">\
          Achtung: Nur noch ' + result.daysRemaining + ' Schengen-Tage \u00fcbrig!\
        </div>';
    }

    var windowStartStr = window.DateUtils.formatDate(
      result.windowStart.toISOString().split('T')[0]
    );
    var windowEndStr = window.DateUtils.formatDate(
      result.windowEnd.toISOString().split('T')[0]
    );

    container.innerHTML = '\
      <div class="schengen-block ' + colorClass + '">\
        <div class="schengen-main">\
          <div class="schengen-number">' + result.daysRemaining + '</div>\
          <div class="schengen-label">Tage verbleibend</div>\
        </div>\
        <div class="schengen-detail">\
          <div class="schengen-bar-track">\
            <div class="schengen-bar-fill ' + colorClass + '" style="width: ' + pct + '%"></div>\
          </div>\
          <div class="schengen-text">' + result.daysUsed + ' von 90 Tagen genutzt im letzten 180-Tage-Fenster</div>\
          <div class="schengen-window">' + windowStartStr + ' \u2014 ' + windowEndStr + '</div>\
        </div>\
        ' + warningHtml + '\
      </div>';
  }

  function renderCards() {
    var grid = document.getElementById('countryGrid');
    grid.innerHTML = DATA.countries.map(function (c) {
      var daysUsed = calcDaysUsed(c.name);
      var pct = Math.round((daysUsed / c.maxStay) * 100);
      if (pct > 100) pct = 100;
      var fillClass = pct < 60 ? 'safe' : pct < 85 ? 'caution' : 'danger';
      var remaining = c.maxStay - daysUsed;
      if (remaining < 0) remaining = 0;
      var isSchengen = c.schengen || window.Schengen.isSchengen(c.name);
      var schengenBadge = isSchengen ? '<span class="schengen-badge">Schengen</span>' : '';
      // COMP-05: 183-Tage-Warnung
      var taxWarning = '';
      if (daysUsed > 150) {
        taxWarning = '<div class="tax-residence-warning">Achtung: 183-Tage-Schwelle naht \u2014 m\u00f6gliche Steuerresidenz</div>';
      }
      return '\
        <div class="country-card">\
          <div class="country-header">\
            <div class="country-name">' + c.name + ' ' + schengenBadge + '</div>\
            <div class="country-flag">' + c.flag + '</div>\
          </div>\
          ' + taxWarning + '\
          <div class="country-stay">\
            <div class="country-stay-bar">\
              <div class="country-stay-fill ' + fillClass + '" style="width: ' + pct + '%"></div>\
            </div>\
            <div class="country-stay-text">\
              <span>' + daysUsed + ' von ' + c.maxStay + ' ' + c.stayUnit + '</span>\
              <span>' + remaining + ' \u00fcbrig</span>\
            </div>\
          </div>\
          <div class="country-rules">\
            ' + c.rules.map(function (r) {
              return '\
              <div class="country-rule">\
                <span class="country-rule-label">' + r.label + '</span>\
                <span class="country-rule-value">' + r.value + '</span>\
              </div>';
            }).join('') + '\
          </div>\
        </div>';
    }).join('');
  }

  function renderHistory() {
    var container = document.getElementById('stayHistory');
    if (!container) return;
    if (stays.length === 0) {
      container.innerHTML = '<div class="stay-empty">Noch keine Aufenthalte erfasst.</div>';
      return;
    }
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    container.innerHTML = stays.map(function (s) {
      var entry = window.DateUtils.parseLocalDate(s.entry_date);
      var exit = s.exit_date ? window.DateUtils.parseLocalDate(s.exit_date) : today;
      var days = window.DateUtils.daysBetween(entry, exit);
      if (days < 0) days = 0;
      var isOpen = !s.exit_date;
      var country = DATA.countries.find(function (c) { return c.name === s.country; });
      var flag = country ? country.flag : (window.CountriesDB ? window.CountriesDB.getFlag(s.country) : '');
      return '\
        <div class="stay-item">\
          <div class="stay-item-main">\
            <div class="stay-item-country">' + flag + ' ' + s.country + '</div>\
            <div class="stay-item-dates">\
              ' + window.DateUtils.formatDate(s.entry_date) + ' \u2014 ' +
              (s.exit_date ? window.DateUtils.formatDate(s.exit_date) : '<span class="stay-badge-active">noch da</span>') + '\
            </div>\
            <div class="stay-item-days">' + days + ' Tage' + (isOpen ? ' (laufend)' : '') + '</div>\
            ' + (s.notes ? '<div class="stay-item-notes">' + s.notes + '</div>' : '') + '\
          </div>\
          <button class="stay-item-delete" data-id="' + s.id + '" title="L\u00f6schen">\u00d7</button>\
        </div>';
    }).join('');

    container.querySelectorAll('.stay-item-delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.id;
        if (!confirm('Aufenthalt wirklich l\u00f6schen?')) return;
        DB.deleteStay(id).then(function () {
          stays = stays.filter(function (s) { return s.id !== id; });
          renderCards();
          renderSchengenCounter();
          renderHistory();
        });
      });
    });
  }

  function openStayDialog() {
    // Remove existing dialog
    var existing = document.getElementById('stayDialogOverlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'stayDialogOverlay';
    overlay.className = 'doc-dialog-overlay';
    overlay.innerHTML = '\
      <div class="doc-dialog stay-dialog">\
        <div class="doc-dialog-title">Aufenthalt erfassen</div>\
        <label for="stayCountry">Land</label>\
        <input type="text" id="stayCountry" placeholder="Land eingeben..." autocomplete="off" required>\
        <label for="stayEntry">Einreise</label>\
        <input type="date" id="stayEntry" required>\
        <label for="stayExit">Ausreise <span style="color:var(--ink-muted);font-weight:400">(leer = noch da)</span></label>\
        <input type="date" id="stayExit">\
        <label for="stayNotes">Notiz <span style="color:var(--ink-muted);font-weight:400">(optional)</span></label>\
        <input type="text" id="stayNotes" placeholder="z.B. Visa Run, Urlaub...">\
        <div class="doc-dialog-actions">\
          <button class="doc-btn-cancel" id="stayCancelBtn">Abbrechen</button>\
          <button class="doc-btn-save" id="staySaveBtn">Speichern</button>\
        </div>\
      </div>';
    document.body.appendChild(overlay);

    // Init autocomplete on country input
    var stayCountryInput = document.getElementById('stayCountry');
    Autocomplete.create(stayCountryInput, {
      source: function (query) {
        return CountriesDB.search(query);
      },
      renderItem: function (item) {
        var badge = item.schengen ? '<span class="ac-item-badge">Schengen</span>' : '';
        return '<span class="ac-item-flag">' + item.flag + '</span>' +
               '<span class="ac-item-name">' + item.nameDE + '</span>' +
               badge;
      },
      onSelect: function (item, inputEl) {
        inputEl.value = item.nameDE;
      }
    });

    // Set default entry date to today
    var todayStr = new Date().toISOString().split('T')[0];
    document.getElementById('stayEntry').value = todayStr;

    // Close on overlay click
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.remove();
    });

    document.getElementById('stayCancelBtn').addEventListener('click', function () {
      overlay.remove();
    });

    document.getElementById('staySaveBtn').addEventListener('click', function () {
      var country = document.getElementById('stayCountry').value;
      var entryDate = document.getElementById('stayEntry').value;
      var exitDate = document.getElementById('stayExit').value;
      var notes = document.getElementById('stayNotes').value.trim();

      if (!entryDate) {
        alert('Einreise-Datum ist Pflicht.');
        return;
      }

      var stay = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        country: country,
        entry_date: entryDate,
        exit_date: exitDate || null,
        notes: notes || null
      };

      DB.saveStay(stay).then(function () {
        stays.unshift(stay);
        renderCards();
        renderSchengenCounter();
        renderHistory();
        overlay.remove();
      }).catch(function (e) {
        alert('Fehler beim Speichern: ' + e.message);
      });
    });
  }

  function render() {
    // Render cards immediately with 0 days
    renderCards();

    // Ensure Schengen counter exists
    var viewEl = document.getElementById('view-countries');
    if (!document.getElementById('schengenCounter')) {
      var counter = document.createElement('div');
      counter.id = 'schengenCounter';
      var grid = document.getElementById('countryGrid');
      viewEl.insertBefore(counter, grid);
    }
    renderSchengenCounter();

    // Ensure stay sections exist
    if (!document.getElementById('stayAddBtn')) {
      // Add button in header
      var header = viewEl.querySelector('.view-header');
      var btn = document.createElement('button');
      btn.id = 'stayAddBtn';
      btn.className = 'doc-upload-btn';
      btn.textContent = '+ Aufenthalt';
      btn.addEventListener('click', openStayDialog);
      header.appendChild(btn);
    }

    if (!document.getElementById('stayHistorySection')) {
      var section = document.createElement('section');
      section.id = 'stayHistorySection';
      section.className = 'section';
      section.style.marginTop = 'var(--sp-8)';
      section.innerHTML = '<h2 class="section-title">Aufenthalte</h2><div id="stayHistory"></div>';
      viewEl.appendChild(section);
    }

    // Load stays from Supabase and re-render
    DB.loadStays().then(function (data) {
      stays = data;
      renderCards();
      renderSchengenCounter();
      renderHistory();
    });
  }

  return { render: render };
})();
