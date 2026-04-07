// =============================================
// AUSWANDERUNG — View: Aufenthalte (Stay Management)
// =============================================

window.Views = window.Views || {};
window.Views.stays = (function () {
  var stays = [];

  // ---- Calculation Functions (shared via window for dashboard) ----

  function calcDaysInCalendarYear(countryName, year) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var yearStart = new Date(year, 0, 1);
    yearStart.setHours(0, 0, 0, 0);
    var yearEnd = new Date(year, 11, 31);
    yearEnd.setHours(0, 0, 0, 0);
    var total = 0;
    stays.forEach(function (s) {
      if (s.country !== countryName) return;
      var entry = window.DateUtils.parseLocalDate(s.entry_date);
      var exit = s.exit_date ? window.DateUtils.parseLocalDate(s.exit_date) : today;
      if (exit < yearStart || entry > yearEnd) return;
      var start = entry < yearStart ? yearStart : entry;
      var end = exit > yearEnd ? yearEnd : exit;
      var days = window.DateUtils.daysBetween(start, end);
      if (days > 0) total += days + 1;
      else if (days === 0) total += 1;
    });
    return total;
  }

  function calcDaysInRollingYear(countryName) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var countryStays = stays.filter(function (s) { return s.country === countryName; });
    if (countryStays.length === 0) return 0;
    var windowStart = new Date(today);
    windowStart.setDate(windowStart.getDate() - 365);
    var total = 0;
    countryStays.forEach(function (s) {
      var entry = window.DateUtils.parseLocalDate(s.entry_date);
      var exit = s.exit_date ? window.DateUtils.parseLocalDate(s.exit_date) : today;
      if (exit < windowStart) return;
      if (entry < windowStart) entry = windowStart;
      if (exit > today) exit = today;
      var days = window.DateUtils.daysBetween(entry, exit);
      if (days > 0) total += days + 1;
      else if (days === 0) total += 1;
    });
    return total;
  }

  function calcDaysUsed(countryName) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var country = DATA.countries.find(function (c) { return c.name === countryName; });
    var ruleType = country ? (country.ruleType || 'total') : 'total';
    var countryStays = stays.filter(function (s) { return s.country === countryName; });

    if (ruleType === 'per_entry') {
      var current = countryStays.find(function (s) { return !s.exit_date; });
      if (current) {
        var days = window.DateUtils.daysBetween(
          window.DateUtils.parseLocalDate(current.entry_date), today);
        return Math.max(0, days > 0 ? days + 1 : (days === 0 ? 1 : 0));
      }
      if (countryStays.length === 0) return 0;
      var sorted = countryStays.slice().sort(function (a, b) {
        return new Date(b.entry_date) - new Date(a.entry_date);
      });
      var last = sorted[0];
      var entry = window.DateUtils.parseLocalDate(last.entry_date);
      var exit = window.DateUtils.parseLocalDate(last.exit_date);
      var days = window.DateUtils.daysBetween(entry, exit);
      return Math.max(0, days > 0 ? days + 1 : (days === 0 ? 1 : 0));
    }

    if (ruleType === 'rolling') {
      var windowDays = (country && country.windowDays) || 180;
      var windowStart = new Date(today);
      windowStart.setDate(windowStart.getDate() - windowDays);
      var total = 0;
      countryStays.forEach(function (s) {
        var entry = window.DateUtils.parseLocalDate(s.entry_date);
        var exit = s.exit_date ? window.DateUtils.parseLocalDate(s.exit_date) : today;
        if (exit < windowStart) return;
        if (entry < windowStart) entry = windowStart;
        if (exit > today) exit = today;
        var days = window.DateUtils.daysBetween(entry, exit);
        if (days > 0) total += days + 1;
      });
      return total;
    }

    if (ruleType === 'continuous') {
      var current = countryStays.find(function (s) { return !s.exit_date; });
      if (current) {
        var days = window.DateUtils.daysBetween(
          window.DateUtils.parseLocalDate(current.entry_date), today);
        return Math.max(0, days > 0 ? days + 1 : (days === 0 ? 1 : 0));
      }
      return 0;
    }

    if (ruleType === 'calendar_year') {
      return calcDaysInCalendarYear(countryName, today.getFullYear());
    }

    var total = 0;
    countryStays.forEach(function (s) {
      var entry = window.DateUtils.parseLocalDate(s.entry_date);
      var exit = s.exit_date ? window.DateUtils.parseLocalDate(s.exit_date) : today;
      var days = window.DateUtils.daysBetween(entry, exit);
      if (days > 0) total += days + 1;
    });
    return total;
  }

  function calcTotalDays(countryName) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var total = 0;
    stays.forEach(function (s) {
      if (s.country !== countryName) return;
      var entry = window.DateUtils.parseLocalDate(s.entry_date);
      var exit = s.exit_date ? window.DateUtils.parseLocalDate(s.exit_date) : today;
      var days = window.DateUtils.daysBetween(entry, exit);
      if (days > 0) total += days + 1;
    });
    return total;
  }

  function getStays() { return stays; }

  // ---- Country Info Dialog ----

  function showCountryInfo(countryName) {
    var esc = window.DateUtils.escapeHtml;
    var country = DATA.countries.find(function (c) { return c.name === countryName; });
    var dbEntry = window.CountriesDB ? window.CountriesDB.getByName(countryName) : null;
    var flag = country ? country.flag : (dbEntry ? dbEntry.flag : '');
    var isSchengen = (country && country.schengen) || (window.Schengen && window.Schengen.isSchengen(countryName));
    var totalDays = calcDaysUsed(countryName);

    var rulesHtml = '';
    if (country && country.rules) {
      rulesHtml = country.rules.map(function (r) {
        return '<div class="info-rule"><span class="info-rule-label">' + esc(r.label) + '</span><span class="info-rule-value">' + esc(r.value) + '</span></div>';
      }).join('');
    } else {
      rulesHtml = '<div class="info-no-rules">Keine Visa-Infos hinterlegt f\u00fcr dieses Land.</div>';
    }

    var maxStayHtml = '';
    if (country && country.maxStay) {
      var pct = Math.round((totalDays / country.maxStay) * 100);
      if (pct > 100) pct = 100;
      var fillClass = pct < 60 ? 'safe' : pct < 85 ? 'caution' : 'danger';
      maxStayHtml = '\
        <div class="info-stay-bar">\
          <div class="country-stay-bar"><div class="country-stay-fill ' + fillClass + '" style="width:' + pct + '%"></div></div>\
          <div class="country-stay-text"><span>' + totalDays + ' von ' + country.maxStay + ' ' + (country.stayUnit || 'Tage') + '</span><span>' + Math.max(0, country.maxStay - totalDays) + ' \u00fcbrig</span></div>\
        </div>';
    }

    var overlay = document.createElement('div');
    overlay.className = 'doc-dialog-overlay';
    overlay.innerHTML = '\
      <div class="doc-dialog info-dialog">\
        <div class="info-header">\
          <span class="info-flag">' + flag + '</span>\
          <span class="info-title">' + esc(countryName) + '</span>\
          ' + (isSchengen ? '<span class="ac-item-badge">Schengen</span>' : '') + '\
        </div>\
        ' + maxStayHtml + '\
        <div class="info-section-title">Visa & Regeln</div>\
        <div class="info-rules">' + rulesHtml + '</div>\
        <div class="info-stats">\
          <div class="info-stat"><span class="info-stat-value">' + totalDays + '</span><span class="info-stat-label">Tage gesamt</span></div>\
          <div class="info-stat"><span class="info-stat-value">' + stays.filter(function(s){ return s.country === countryName; }).length + '</span><span class="info-stat-label">Aufenthalte</span></div>\
        </div>\
        <div class="doc-dialog-actions">\
          <button class="doc-btn-cancel" id="infoCloseBtn">Schlie\u00dfen</button>\
        </div>\
      </div>';
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.remove();
    });
    document.getElementById('infoCloseBtn').addEventListener('click', function () {
      overlay.remove();
    });
  }

  // ---- Stay Dialog ----

  function openStayDialog(editStay) {
    var existing = document.getElementById('stayDialogOverlay');
    if (existing) existing.remove();

    var isEdit = !!editStay;

    var overlay = document.createElement('div');
    overlay.id = 'stayDialogOverlay';
    overlay.className = 'doc-dialog-overlay';
    overlay.innerHTML = '\
      <div class="doc-dialog stay-dialog">\
        <div class="doc-dialog-title">' + (isEdit ? 'Aufenthalt bearbeiten' : 'Aufenthalt erfassen') + '</div>\
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

    if (isEdit) {
      stayCountryInput.value = editStay.country;
      document.getElementById('stayEntry').value = editStay.entry_date;
      document.getElementById('stayExit').value = editStay.exit_date || '';
      document.getElementById('stayNotes').value = editStay.notes || '';
    } else {
      var todayStr = new Date().toISOString().split('T')[0];
      document.getElementById('stayEntry').value = todayStr;
    }

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

      var openInOther = stays.find(function (s) {
        return !s.exit_date && s.country !== country && (!isEdit || s.id !== editStay.id);
      });
      var closePromise = Promise.resolve();
      if (openInOther) {
        var closeIt = confirm('Du hast noch einen offenen Aufenthalt in ' + openInOther.country + '. Soll dieser auf gestern geschlossen werden?');
        if (closeIt) {
          var yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          var yesterdayStr = yesterday.toISOString().split('T')[0];
          openInOther.exit_date = yesterdayStr;
          closePromise = DB.saveStay(openInOther);
        }
      }

      var stay = {
        id: isEdit ? editStay.id : Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        country: country,
        entry_date: entryDate,
        exit_date: exitDate || null,
        notes: notes || null
      };

      closePromise.then(function () {
        return DB.saveStay(stay);
      }).then(function () {
        if (isEdit) {
          var idx = stays.findIndex(function (s) { return s.id === stay.id; });
          if (idx >= 0) stays[idx] = stay;
        } else {
          stays.unshift(stay);
        }
        renderContent();
        overlay.remove();
        // Also re-render dashboard if visible
        if (Views.dashboard) Views.dashboard.render();
      }).catch(function (e) {
        alert('Fehler beim Speichern: ' + e.message);
      });
    });
  }

  // ---- Render Current Stay + History ----

  function renderContent() {
    var esc = window.DateUtils.escapeHtml;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var container = document.getElementById('staysContent');
    if (!container) return;

    var html = '';

    // Current Stay
    var openStay = stays.find(function (s) { return !s.exit_date; });
    if (openStay) {
      var entry = DateUtils.parseLocalDate(openStay.entry_date);
      var daysSince = DateUtils.daysBetween(entry, today);
      if (daysSince > 0) daysSince = daysSince + 1;
      else if (daysSince === 0) daysSince = 1;
      var country = DATA.countries.find(function (c) { return c.name === openStay.country; });
      var flag = country ? country.flag : (window.CountriesDB ? window.CountriesDB.getFlag(openStay.country) : '');
      var maxStay = country ? country.maxStay : null;
      var pct = maxStay ? Math.min(100, Math.round((daysSince / maxStay) * 100)) : 0;
      var fillClass = pct < 60 ? 'safe' : pct < 85 ? 'caution' : 'danger';
      var isSchengen = (country && country.schengen) || (window.Schengen && window.Schengen.isSchengen(openStay.country));

      html += '<div class="stay-current-card">';
      html += '<div class="stay-current-header"><span class="stay-current-flag">' + flag + '</span>';
      html += '<span class="stay-current-name">' + esc(openStay.country) + '</span>';
      if (isSchengen) html += '<span class="schengen-badge">Schengen</span>';
      html += '</div>';
      html += '<div class="stay-current-dates">Einreise: ' + DateUtils.formatDate(openStay.entry_date) + '</div>';
      html += '<div class="stay-current-days">Tag ' + daysSince + (maxStay ? ' von ' + maxStay : '') + '</div>';
      if (maxStay) {
        html += '<div class="country-stay"><div class="country-stay-bar"><div class="country-stay-fill ' + fillClass + '" style="width:' + pct + '%"></div></div>';
        html += '<div class="country-stay-text"><span>' + daysSince + ' von ' + maxStay + ' Tage</span><span>' + Math.max(0, maxStay - daysSince) + ' \u00fcbrig</span></div></div>';
      }
      if (openStay.notes) html += '<div class="stay-item-notes">' + esc(openStay.notes) + '</div>';
      html += '</div>';
    }

    // History grouped by month
    if (stays.length === 0) {
      html += '<div class="stay-empty">Noch keine Aufenthalte erfasst.</div>';
    } else {
      var grouped = {};
      stays.forEach(function (s) {
        var d = DateUtils.parseLocalDate(s.entry_date);
        var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        var label = d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
        if (!grouped[key]) grouped[key] = { label: label, stays: [] };
        grouped[key].stays.push(s);
      });

      var keys = Object.keys(grouped).sort().reverse();

      html += '<section class="section"><h2 class="section-title">Aufenthalts-Historie</h2>';
      keys.forEach(function (key) {
        var group = grouped[key];
        html += '<div class="stay-month-group"><div class="stay-month-label">' + esc(group.label) + '</div>';
        group.stays.forEach(function (s) {
          var entry = DateUtils.parseLocalDate(s.entry_date);
          var exit = s.exit_date ? DateUtils.parseLocalDate(s.exit_date) : today;
          var days = DateUtils.daysBetween(entry, exit);
          if (days > 0) days = days + 1;
          else if (days === 0) days = 1;
          else days = 0;
          var isOpen = !s.exit_date;
          var country = DATA.countries.find(function (c) { return c.name === s.country; });
          var flag = country ? country.flag : (window.CountriesDB ? window.CountriesDB.getFlag(s.country) : '');
          var isSchengen = (country && country.schengen) || (window.Schengen && window.Schengen.isSchengen(s.country));

          var forgottenWarning = '';
          if (isOpen && days > 90) {
            forgottenWarning = '<div class="stay-forgotten-warning">Bist du noch in ' + esc(s.country) + '? Dieser Aufenthalt ist seit ' + days + ' Tagen offen.</div>';
          }

          var overstayWarning = '';
          if (country && country.maxStay && days > country.maxStay) {
            var overDays = days - country.maxStay;
            overstayWarning = '<div class="overstay-warning">OVERSTAY! ' + overDays + ' Tage \u00fcber dem Limit von ' + country.maxStay + ' Tagen!</div>';
          }

          html += '\
            <div class="stay-item" data-stay-id="' + s.id + '">\
              <div class="stay-item-main">\
                <div class="stay-item-country">' + flag + ' ' + esc(s.country);
          if (isSchengen) html += ' <span class="schengen-badge" style="font-size:9px">S</span>';
          html += '</div>\
                <div class="stay-item-dates">\
                  ' + DateUtils.formatDate(s.entry_date) + ' \u2014 ' +
                  (s.exit_date ? DateUtils.formatDate(s.exit_date) : '<span class="stay-badge-active">noch da</span>') + '\
                </div>\
                <div class="stay-item-days">' + days + ' Tage' + (isOpen ? ' (laufend)' : '') + '</div>\
                ' + (s.notes ? '<div class="stay-item-notes">' + esc(s.notes) + '</div>' : '') + '\
                ' + forgottenWarning + '\
                ' + overstayWarning + '\
              </div>\
              <div class="stay-item-actions">\
                <button class="stay-item-edit" data-id="' + s.id + '" title="Bearbeiten">\u270E</button>\
                <button class="stay-item-delete" data-id="' + s.id + '" title="L\u00f6schen">\u00d7</button>\
              </div>\
            </div>';
        });
        html += '</div>';
      });
      html += '</section>';
    }

    container.innerHTML = html;

    // Event listeners
    container.querySelectorAll('.stay-item').forEach(function (item) {
      item.addEventListener('click', function (e) {
        if (e.target.closest('.stay-item-edit') || e.target.closest('.stay-item-delete')) return;
        var stayId = item.dataset.stayId;
        var stay = stays.find(function (s) { return s.id === stayId; });
        if (stay) showCountryInfo(stay.country);
      });
    });

    container.querySelectorAll('.stay-item-edit').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = btn.dataset.id;
        var stay = stays.find(function (s) { return s.id === id; });
        if (stay) openStayDialog(stay);
      });
    });

    container.querySelectorAll('.stay-item-delete').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = btn.dataset.id;
        if (!confirm('Aufenthalt wirklich l\u00f6schen?')) return;
        DB.deleteStay(id).then(function () {
          stays = stays.filter(function (s) { return s.id !== id; });
          renderContent();
          if (Views.dashboard) Views.dashboard.render();
        });
      });
    });
  }

  var _firstLoad = true;

  function render() {
    var viewEl = document.getElementById('view-stays');

    if (!DB.isOnline()) {
      var offlineBanner = document.getElementById('offlineBannerStays');
      if (!offlineBanner) {
        offlineBanner = document.createElement('div');
        offlineBanner.id = 'offlineBannerStays';
        offlineBanner.className = 'offline-warning';
        offlineBanner.innerHTML = '\u26A0 Offline \u2014 Daten nicht verf\u00fcgbar.';
        viewEl.querySelector('.view-header').after(offlineBanner);
      }
    }

    if (_firstLoad) {
      var content = document.getElementById('staysContent');
      if (content) content.innerHTML = '<div class="stay-empty">Daten werden geladen...</div>';
    }

    DB.loadStays().then(function (data) {
      _firstLoad = false;
      stays = data;
      renderContent();
    });
  }

  function initAddButton() {
    var btn = document.getElementById('stayAddBtn');
    if (btn) {
      btn.addEventListener('click', function () { openStayDialog(); });
    }
  }

  return {
    render: render,
    initAddButton: initAddButton,
    getStays: getStays,
    calcDaysUsed: calcDaysUsed,
    calcTotalDays: calcTotalDays,
    calcDaysInCalendarYear: calcDaysInCalendarYear,
    calcDaysInRollingYear: calcDaysInRollingYear,
    showCountryInfo: showCountryInfo
  };
})();
