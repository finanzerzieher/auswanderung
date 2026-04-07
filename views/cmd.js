// =============================================
// AUSWANDERUNG — View: Command Center
// =============================================

window.Views = window.Views || {};
window.Views.cmd = (function () {
  var TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);

  function calcPhaseProgress(phaseId) {
    var phaseActions = DATA.actions.filter(function (a) { return a.phase === phaseId; });
    if (phaseActions.length === 0) return 0;
    var completed = phaseActions.filter(function (a) { return a.completed; }).length;
    return completed / phaseActions.length;
  }

  function getNextComplianceDates() {
    var now = new Date();
    var currentYear = now.getFullYear();
    var currentMonth = now.getMonth() + 1;
    var currentDay = now.getDate();

    return DATA.compliance.map(function (c) {
      var item = { firm: c.firm, task: c.task, interval: c.interval, note: c.note, dueDate: null, dueDateStr: '' };

      if (c.dueMonth !== null && c.dueDay !== null) {
        // Festes Datum — nächstes Vorkommen berechnen
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
        // Kein festes Datum
        item.dueDate = null;
        item.dueDateStr = 'Datum offen';
      }
      return item;
    });
  }

  function renderCurrentLocation(viewEl) {
    var container = document.getElementById('currentLocationBanner');
    if (!container) {
      container = document.createElement('div');
      container.id = 'currentLocationBanner';
      container.className = 'current-location-banner';
      viewEl.insertBefore(container, viewEl.firstChild);
    }

    DB.loadStays().then(function (stays) {
      var openStay = stays.find(function (s) { return !s.exit_date; });
      if (openStay) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var entry = DateUtils.parseLocalDate(openStay.entry_date);
        var daysSince = DateUtils.daysBetween(entry, today);
        if (daysSince > 0) daysSince = daysSince + 1;
        else if (daysSince === 0) daysSince = 1;
        else daysSince = 0;
        var country = DATA.countries.find(function (c) { return c.name === openStay.country; });
        var flag = country ? country.flag : '';
        var maxStay = country ? country.maxStay : '?';
        container.innerHTML = '<span class="location-text">Aktuell: ' + flag + ' ' + openStay.country + ' \u2014 Tag ' + daysSince + ' von ' + maxStay + '</span>';
        container.className = 'current-location-banner active';
      } else {
        container.innerHTML = '<span class="location-text">Kein aktiver Aufenthalt eingetragen</span>';
        container.className = 'current-location-banner inactive';
      }
    });
  }

  function render() {
    var parseLocalDate = DateUtils.parseLocalDate;
    var daysBetween = DateUtils.daysBetween;
    var formatDate = DateUtils.formatDate;
    var formatDateLong = DateUtils.formatDateLong;

    var countdownData = DATA.countdowns;

    // Compute countdown cards from data
    var countdowns = countdownData.map(function (c) {
      var target = parseLocalDate(c.date);
      var days = daysBetween(TODAY, target);
      var detail = formatDateLong(c.date);
      if (c.detail) detail += ' — ' + c.detail;
      return {
        label: c.label,
        days: days,
        detail: detail,
        urgency: days <= 14 ? 'urgent' : days <= 30 ? 'warning' : 'calm'
      };
    });

    // Find departure countdown for subtitle
    var departureCountdown = countdowns.find(function (c, i) {
      return countdownData[i].id === 'departure';
    });
    var daysToDeparture = departureCountdown ? departureCountdown.days : 0;

    var subtitleEl = document.getElementById('daysUntilDeparture');
    if (daysToDeparture > 0) {
      subtitleEl.textContent = 'Noch ' + daysToDeparture + ' Tage bis zum Abflug nach Bangkok';
    } else {
      subtitleEl.textContent = 'Du bist unterwegs.';
    }

    var activePhase = DATA.phases.find(function (p) { return p.status === 'active'; });
    if (activePhase) {
      document.getElementById('currentPhaseBadge').textContent = 'Phase: ' + activePhase.name;
    }

    var countdownBar = document.getElementById('countdownBar');
    countdownBar.innerHTML = countdowns.map(function (c) {
      return '\
        <div class="countdown-card">\
          <div class="countdown-label">' + c.label + '</div>\
          <div class="countdown-value ' + c.urgency + '">' + (c.days > 0 ? c.days : '\u2014') + '</div>\
          <div class="countdown-unit">' + (c.days > 0 ? 'Tage' : 'Vergangen') + '</div>\
          <div class="countdown-detail">' + c.detail + '</div>\
        </div>';
    }).join('');

    // COMP-01: Deadline-Warnungen berechnen
    var actionList = document.getElementById('nextActions');
    var sortedActions = DATA.actions.slice().sort(function (a, b) {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return parseLocalDate(a.date) - parseLocalDate(b.date);
    });

    actionList.innerHTML = sortedActions.map(function (action) {
      var urgentClass = '';
      if (!action.completed && action.date) {
        var actionDate = parseLocalDate(action.date);
        var daysUntil = daysBetween(TODAY, actionDate);
        if (daysUntil < 0) {
          urgentClass = ' overdue';
        } else if (daysUntil < 7) {
          urgentClass = ' urgent';
        }
      }
      return '\
        <div class="action-item ' + (action.completed ? 'completed' : '') + urgentClass + '" data-id="' + action.id + '">\
          <div class="action-check ' + (action.completed ? 'checked' : '') + '" data-action-id="' + action.id + '"></div>\
          <div class="action-body">\
            <div class="action-title">' + action.title + '</div>\
            <div class="action-meta">\
              ' + (action.date ? '<span class="action-date">' + formatDate(action.date) + '</span>' : '') + '\
              ' + (action.tag ? '<span class="action-tag ' + action.tag + '">' + action.tagText + '</span>' : '') + '\
              ' + (urgentClass === ' overdue' ? '<span class="action-tag critical">\u00dcberf\u00e4llig</span>' : '') + '\
              ' + (urgentClass === ' urgent' ? '<span class="action-tag critical">Dringend</span>' : '') + '\
            </div>\
            ' + (action.dependency ? '<div class="action-dependency">' + action.dependency + '</div>' : '') + '\
          </div>\
        </div>';
    }).join('');

    // Toggle completed — optimistic UI update, then save to Supabase
    actionList.querySelectorAll('.action-check').forEach(function (check) {
      check.addEventListener('click', function () {
        var id = check.dataset.actionId;
        var action = DATA.actions.find(function (a) { return a.id === id; });
        if (action) {
          action.completed = !action.completed;
          render();
          // Async save — revert on error
          DB.saveCompleted(id, action.completed).catch(function () {
            action.completed = !action.completed;
            render();
            alert('Speichern fehlgeschlagen. \u00c4nderung wurde r\u00fcckgg\u00e4ngig gemacht.');
          });
        }
      });
    });

    // Open items
    var openItemsEl = document.getElementById('openItems');
    openItemsEl.innerHTML = DATA.openItems.map(function (item) {
      return '\
        <div class="open-item">\
          <div class="open-item-title">' + item.title + '</div>\
          <div class="open-item-desc">' + item.desc + '</div>\
          <div class="open-item-status ' + item.status + '">' + item.statusText + '</div>\
        </div>';
    }).join('');

    // COMP-02: Auto-Progress aus Actions berechnen
    var progressEl = document.getElementById('progressOverview');
    progressEl.innerHTML = DATA.phases.map(function (phase) {
      var pct = Math.round(calcPhaseProgress(phase.id) * 100);
      return '\
        <div class="progress-row">\
          <div class="progress-label">' + phase.name + '</div>\
          <div class="progress-track">\
            <div class="progress-fill ' + (pct === 100 ? 'complete' : '') + '" style="width: ' + pct + '%"></div>\
          </div>\
          <div class="progress-value">' + pct + '%</div>\
        </div>';
    }).join('');

    // COMP-04: Compliance-Sektion rendern
    renderCompliance();

    // FIX 5: Aktueller Standort
    var viewEl = document.getElementById('view-command-center');
    renderCurrentLocation(viewEl);

    // FIX 6: Export-Button
    renderExportButton(viewEl);
  }

  function renderExportButton(viewEl) {
    if (document.getElementById('exportSection')) return;
    var section = document.createElement('section');
    section.id = 'exportSection';
    section.className = 'section';
    section.innerHTML = '<h2 class="section-title">Daten</h2>' +
      '<a href="#" id="exportDataBtn" class="export-data-link">Daten exportieren (JSON)</a>';
    viewEl.appendChild(section);

    document.getElementById('exportDataBtn').addEventListener('click', function (e) {
      e.preventDefault();
      var btn = e.target;
      btn.textContent = 'Exportiere...';
      btn.style.pointerEvents = 'none';

      Promise.all([
        DB.loadCompleted(),
        DB.loadStays(),
        DB.loadDocNotes(),
        DB.loadCosts(),
        DB.loadDocs()
      ]).then(function (results) {
        var exportData = {
          exported_at: new Date().toISOString(),
          action_states: results[0],
          stays: results[1],
          doc_notes: results[2],
          costs: results[3],
          documents: results[4]
        };
        var json = JSON.stringify(exportData, null, 2);
        var blob = new Blob([json], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'auswanderung-export-' + new Date().toISOString().split('T')[0] + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        btn.textContent = 'Daten exportieren (JSON)';
        btn.style.pointerEvents = '';
      }).catch(function (err) {
        alert('Export fehlgeschlagen: ' + err.message);
        btn.textContent = 'Daten exportieren (JSON)';
        btn.style.pointerEvents = '';
      });
    });
  }

  function renderCompliance() {
    var container = document.getElementById('complianceSection');
    if (!container) {
      // Sektion erstellen
      var viewEl = document.getElementById('view-command-center');
      var section = document.createElement('section');
      section.id = 'complianceSection';
      section.className = 'section';
      section.innerHTML = '<h2 class="section-title">Compliance-Pflichten</h2><div id="complianceList"></div>';
      viewEl.appendChild(section);
    }

    var items = getNextComplianceDates();
    // Sortieren: Einträge mit Datum zuerst (nach Datum), dann ohne Datum
    items.sort(function (a, b) {
      if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate;
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      return 0;
    });

    var list = document.getElementById('complianceList');
    list.innerHTML = items.map(function (item) {
      var daysUntil = '';
      var urgencyClass = '';
      if (item.dueDate) {
        var days = DateUtils.daysBetween(TODAY, item.dueDate);
        if (days < 0) {
          daysUntil = '\u00fcberf\u00e4llig';
          urgencyClass = ' compliance-overdue';
        } else if (days < 30) {
          daysUntil = 'in ' + days + ' Tagen';
          urgencyClass = ' compliance-soon';
        } else {
          daysUntil = 'in ' + days + ' Tagen';
        }
      }
      return '\
        <div class="compliance-item' + urgencyClass + '">\
          <div class="compliance-firm">' + item.firm + '</div>\
          <div class="compliance-body">\
            <div class="compliance-task">' + item.task + '</div>\
            <div class="compliance-meta">\
              <span class="compliance-date">' + item.dueDateStr + (daysUntil ? ' (' + daysUntil + ')' : '') + '</span>\
              <span class="compliance-interval">' + item.interval + '</span>\
            </div>\
            ' + (item.note ? '<div class="compliance-note">' + item.note + '</div>' : '') + '\
          </div>\
        </div>';
    }).join('');
  }

  return { render: render };
})();
