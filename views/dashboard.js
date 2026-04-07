// =============================================
// AUSWANDERUNG — View: Dashboard
// Was braucht JETZT Aufmerksamkeit?
// =============================================

window.Views = window.Views || {};
window.Views.dashboard = (function () {
  var TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);

  function calcPhaseProgress(phaseId) {
    var phaseActions = DATA.actions.filter(function (a) { return a.phase === phaseId; });
    if (phaseActions.length === 0) return 0;
    var completed = phaseActions.filter(function (a) { return a.completed; }).length;
    return completed / phaseActions.length;
  }

  function getNextComplianceDate() {
    var now = new Date();
    var currentYear = now.getFullYear();

    var items = DATA.compliance.map(function (c) {
      var item = { firm: c.firm, task: c.task, interval: c.interval, note: c.note, dueDate: null, dueDateStr: '' };
      if (c.dueMonth !== null && c.dueDay !== null) {
        var year = currentYear;
        var candidate = new Date(year, c.dueMonth - 1, c.dueDay);
        candidate.setHours(0, 0, 0, 0);
        if (candidate < now) {
          year++;
          candidate = new Date(year, c.dueMonth - 1, c.dueDay);
          candidate.setHours(0, 0, 0, 0);
        }
        item.dueDate = candidate;
        item.dueDateStr = DateUtils.formatDate(
          candidate.getFullYear() + '-' +
          String(candidate.getMonth() + 1).padStart(2, '0') + '-' +
          String(candidate.getDate()).padStart(2, '0')
        );
      } else {
        item.dueDate = null;
        item.dueDateStr = 'Datum offen';
      }
      return item;
    });

    // Sort: items with date first
    items.sort(function (a, b) {
      if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate;
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      return 0;
    });

    // Return only the next one with a date
    return items.find(function (i) { return i.dueDate; }) || items[0] || null;
  }

  function buildWarnings(stays) {
    var warnings = [];
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    // Schengen < 30 Tage
    if (window.Schengen) {
      var schengen = window.Schengen.calculate(stays);
      if (schengen.daysRemaining < 30) {
        warnings.push({
          type: schengen.daysRemaining < 14 ? 'danger' : 'warning',
          text: 'Schengen: Nur noch ' + schengen.daysRemaining + ' von 90 Tagen verbleibend!'
        });
      }
    }

    // Overstay in einem Land
    stays.forEach(function (s) {
      if (!s.exit_date) {
        var country = DATA.countries.find(function (c) { return c.name === s.country; });
        if (country) {
          var entry = DateUtils.parseLocalDate(s.entry_date);
          var days = DateUtils.daysBetween(entry, today);
          if (days > 0) days = days + 1;
          else if (days === 0) days = 1;
          if (days > country.maxStay) {
            warnings.push({
              type: 'danger',
              text: 'OVERSTAY in ' + country.flag + ' ' + s.country + '! ' + (days - country.maxStay) + ' Tage \u00fcber dem Limit.'
            });
          }
        }
      }
    });

    // Deadline < 7 Tage
    DATA.actions.forEach(function (a) {
      if (!a.completed && a.date) {
        var actionDate = DateUtils.parseLocalDate(a.date);
        var daysUntil = DateUtils.daysBetween(today, actionDate);
        if (daysUntil < 0) {
          warnings.push({
            type: 'danger',
            text: '\u00dcberf\u00e4llig: ' + a.title
          });
        } else if (daysUntil < 7) {
          warnings.push({
            type: 'warning',
            text: 'In ' + daysUntil + ' Tagen f\u00e4llig: ' + a.title
          });
        }
      }
    });

    // Vergessene Ausreise > 90 Tage
    stays.forEach(function (s) {
      if (!s.exit_date) {
        var entry = DateUtils.parseLocalDate(s.entry_date);
        var days = DateUtils.daysBetween(entry, today);
        if (days > 90) {
          warnings.push({
            type: 'warning',
            text: 'Aufenthalt in ' + s.country + ' seit ' + (days + 1) + ' Tagen offen. Ausreise vergessen?'
          });
        }
      }
    });

    // Steuer-Schwelle naht
    DATA.countries.forEach(function (c) {
      if (!c.taxThreshold) return;
      var taxWarnThreshold = Math.max(0, c.taxThreshold - 30);
      var currentYear = today.getFullYear();

      var countryStays = stays.filter(function (s) { return s.country === c.name; });
      if (countryStays.length === 0) return;

      var daysToCheck = 0;
      var taxType = c.taxThresholdType || 'calendar_year';

      if (taxType === 'rolling_year') {
        var windowStart = new Date(today);
        windowStart.setDate(windowStart.getDate() - 365);
        countryStays.forEach(function (s) {
          var entry = DateUtils.parseLocalDate(s.entry_date);
          var exit = s.exit_date ? DateUtils.parseLocalDate(s.exit_date) : today;
          if (exit < windowStart) return;
          if (entry < windowStart) entry = windowStart;
          if (exit > today) exit = today;
          var d = DateUtils.daysBetween(entry, exit);
          if (d > 0) daysToCheck += d + 1;
          else if (d === 0) daysToCheck += 1;
        });
      } else {
        var yearStart = new Date(currentYear, 0, 1);
        yearStart.setHours(0, 0, 0, 0);
        var yearEnd = new Date(currentYear, 11, 31);
        yearEnd.setHours(0, 0, 0, 0);
        countryStays.forEach(function (s) {
          var entry = DateUtils.parseLocalDate(s.entry_date);
          var exit = s.exit_date ? DateUtils.parseLocalDate(s.exit_date) : today;
          if (exit < yearStart || entry > yearEnd) return;
          var start = entry < yearStart ? yearStart : entry;
          var end = exit > yearEnd ? yearEnd : exit;
          var d = DateUtils.daysBetween(start, end);
          if (d > 0) daysToCheck += d + 1;
          else if (d === 0) daysToCheck += 1;
        });
      }

      if (daysToCheck > taxWarnThreshold) {
        warnings.push({
          type: 'warning',
          text: c.flag + ' ' + c.name + ': ' + daysToCheck + ' von ' + c.taxThreshold + ' Tagen \u2014 Steuerresidenz-Schwelle naht!'
        });
      }
    });

    return warnings;
  }

  function render() {
    var esc = DateUtils.escapeHtml;
    var viewEl = document.getElementById('view-dashboard');

    DB.loadStays().then(function (stays) {
      var html = '';

      // 1. Standort-Banner
      var openStay = stays.find(function (s) { return !s.exit_date; });
      if (openStay) {
        var entry = DateUtils.parseLocalDate(openStay.entry_date);
        var daysSince = DateUtils.daysBetween(entry, TODAY);
        if (daysSince > 0) daysSince = daysSince + 1;
        else if (daysSince === 0) daysSince = 1;
        else daysSince = 0;
        var country = DATA.countries.find(function (c) { return c.name === openStay.country; });
        var flag = country ? country.flag : '';
        var maxStay = country ? country.maxStay : '?';
        html += '<div class="current-location-banner active">Aktuell: ' + flag + ' ' + esc(openStay.country) + ' \u2014 Tag ' + daysSince + ' von ' + maxStay + '</div>';
      } else {
        html += '<div class="current-location-banner inactive">Kein aktiver Aufenthalt eingetragen</div>';
      }

      // 1b. Deutschland-Besuch-Rechner
      var currentYear = TODAY.getFullYear();
      if (window.Schengen) {
        var schengenResult = window.Schengen.calculate(stays);
        var schengenRemaining = schengenResult.daysRemaining;

        // DE-Tage im Kalenderjahr berechnen
        var deCalYear = 0;
        var cyStart = new Date(currentYear, 0, 1);
        cyStart.setHours(0, 0, 0, 0);
        var cyEnd = new Date(currentYear, 11, 31);
        cyEnd.setHours(0, 0, 0, 0);
        stays.forEach(function (s) {
          if (s.country !== 'Deutschland') return;
          var entry = DateUtils.parseLocalDate(s.entry_date);
          var exit = s.exit_date ? DateUtils.parseLocalDate(s.exit_date) : TODAY;
          if (exit < cyStart || entry > cyEnd) return;
          var start = entry < cyStart ? cyStart : entry;
          var end = exit > cyEnd ? cyEnd : exit;
          var days = DateUtils.daysBetween(start, end);
          if (days > 0) deCalYear += days + 1;
          else if (days === 0) deCalYear += 1;
        });

        var deRemaining = Math.max(0, 30 - deCalYear);
        var canVisit = Math.min(schengenRemaining, deRemaining);
        var visitColorClass = canVisit > 14 ? 'de-visit-green' : canVisit >= 7 ? 'de-visit-yellow' : canVisit > 0 ? 'de-visit-red' : 'de-visit-zero';

        html += '<div class="de-visit-block ' + visitColorClass + '">';
        if (canVisit > 0) {
          html += '<div class="de-visit-number">' + canVisit + ' Tage</div>';
          html += '<div class="de-visit-subtitle">kannst du nach Deutschland</div>';
        } else {
          html += '<div class="de-visit-number">0</div>';
          html += '<div class="de-visit-subtitle">Aktuell kein Deutschland-Besuch m\u00f6glich</div>';
        }
        html += '<div class="de-visit-details">Schengen: ' + schengenResult.daysUsed + '/90 | Deutschland ' + currentYear + ': ' + deCalYear + '/30</div>';
        html += '</div>';
      }

      // 1c. Offline-Banner
      if (DB.isUsingCache()) {
        var cacheTs = DB._getCacheTimestamp('stays');
        var cacheTimeStr = cacheTs ? new Date(cacheTs).toLocaleString('de-DE') : 'unbekannt';
        html += '<div class="offline-banner">Offline-Modus \u2014 Daten vom ' + esc(cacheTimeStr) + '. Verbindung wird gepr\u00fcft...</div>';
      }

      // 2. Warnungen
      var warnings = buildWarnings(stays);
      if (warnings.length > 0) {
        html += '<div class="dash-warnings">';
        warnings.forEach(function (w) {
          html += '<div class="dash-warning dash-warning-' + w.type + '">' + esc(w.text) + '</div>';
        });
        html += '</div>';
      }

      // 3. (Schengen + DE-Counter sind jetzt im Deutschland-Besuch-Rechner oben)

      // 5. N\u00e4chste Aktionen (Top 5 unerledigte, nach Dringlichkeit)
      var upcoming = DATA.actions.filter(function (a) { return !a.completed; }).slice().sort(function (a, b) {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return DateUtils.parseLocalDate(a.date) - DateUtils.parseLocalDate(b.date);
      }).slice(0, 5);

      if (upcoming.length > 0) {
        html += '<section class="section"><h2 class="section-title">N\u00e4chste Schritte</h2><div class="action-list">';
        upcoming.forEach(function (action) {
          var urgentClass = '';
          if (action.date) {
            var daysUntil = DateUtils.daysBetween(TODAY, DateUtils.parseLocalDate(action.date));
            if (daysUntil < 0) urgentClass = ' overdue';
            else if (daysUntil < 7) urgentClass = ' urgent';
          }
          html += '\
            <div class="action-item' + urgentClass + '" data-id="' + action.id + '">\
              <div class="action-check ' + (action.completed ? 'checked' : '') + '" data-action-id="' + action.id + '"></div>\
              <div class="action-body">\
                <div class="action-title">' + esc(action.title) + '</div>\
                <div class="action-meta">\
                  ' + (action.date ? '<span class="action-date">' + DateUtils.formatDate(action.date) + '</span>' : '') + '\
                  ' + (action.tag ? '<span class="action-tag ' + action.tag + '">' + esc(action.tagText) + '</span>' : '') + '\
                  ' + (urgentClass === ' overdue' ? '<span class="action-tag critical">\u00dcberf\u00e4llig</span>' : '') + '\
                  ' + (urgentClass === ' urgent' ? '<span class="action-tag critical">Dringend</span>' : '') + '\
                </div>\
                ' + (action.dependency ? '<div class="action-dependency">' + esc(action.dependency) + '</div>' : '') + '\
              </div>\
            </div>';
        });
        html += '</div></section>';
      }

      // 6. N\u00e4chste Compliance-Frist
      var nextCompliance = getNextComplianceDate();
      if (nextCompliance) {
        var daysUntilCompliance = '';
        if (nextCompliance.dueDate) {
          var d = DateUtils.daysBetween(TODAY, nextCompliance.dueDate);
          daysUntilCompliance = d < 0 ? ' (\u00fcberf\u00e4llig!)' : ' (in ' + d + ' Tagen)';
        }
        html += '<section class="section"><h2 class="section-title">N\u00e4chste Compliance-Frist</h2>';
        html += '<div class="compliance-item"><div class="compliance-firm">' + esc(nextCompliance.firm) + '</div>';
        html += '<div class="compliance-body"><div class="compliance-task">' + esc(nextCompliance.task) + '</div>';
        html += '<div class="compliance-meta"><span class="compliance-date">' + esc(nextCompliance.dueDateStr) + daysUntilCompliance + '</span>';
        html += '<span class="compliance-interval">' + esc(nextCompliance.interval) + '</span></div>';
        if (nextCompliance.note) html += '<div class="compliance-note">' + esc(nextCompliance.note) + '</div>';
        html += '</div></div></section>';
      }

      viewEl.querySelector('.dash-content').innerHTML = html;

      // Action checkbox handlers
      viewEl.querySelectorAll('.action-check').forEach(function (check) {
        check.addEventListener('click', function () {
          var id = check.dataset.actionId;
          var action = DATA.actions.find(function (a) { return a.id === id; });
          if (action) {
            action.completed = !action.completed;
            render();
            DB.saveCompleted(id, action.completed).catch(function () {
              action.completed = !action.completed;
              render();
              alert('Speichern fehlgeschlagen. \u00c4nderung wurde r\u00fcckg\u00e4ngig gemacht.');
            });
          }
        });
      });
    }).catch(function () {
      // Fallback when stays can't load
      viewEl.querySelector('.dash-content').innerHTML = '<div class="current-location-banner inactive">Daten werden geladen...</div>';
    });
  }

  return { render: render };
})();
