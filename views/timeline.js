// =============================================
// AUSWANDERUNG — View: Zeitplan (erweitert)
// Countdowns + Compliance + Meilensteine + Offene Punkte + Alle Aktionen
// =============================================

window.Views = window.Views || {};
window.Views.timeline = (function () {
  var milestoneNotes = {};
  var TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);

  function milestoneId(m) {
    return (m.date + '-' + m.title).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 80);
  }

  function getNextComplianceDates() {
    var now = new Date();
    var currentYear = now.getFullYear();

    return DATA.compliance.map(function (c) {
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
  }

  function render() {
    var esc = DateUtils.escapeHtml;
    var parseLocalDate = DateUtils.parseLocalDate;
    var daysBetween = DateUtils.daysBetween;
    var formatDate = DateUtils.formatDate;
    var formatDateLong = DateUtils.formatDateLong;
    var container = document.getElementById('timelineContent');

    var html = '';

    // 1. Countdown-Karten
    var countdowns = DATA.countdowns.map(function (c) {
      var target = parseLocalDate(c.date);
      var days = daysBetween(TODAY, target);
      var detail = formatDateLong(c.date);
      if (c.detail) detail += ' \u2014 ' + c.detail;
      return {
        label: c.label,
        days: days,
        detail: detail,
        urgency: days <= 14 ? 'urgent' : days <= 30 ? 'warning' : 'calm'
      };
    });

    html += '<section class="section"><h2 class="section-title">Countdowns</h2>';
    html += '<div class="countdown-bar">';
    countdowns.forEach(function (c) {
      html += '\
        <div class="countdown-card">\
          <div class="countdown-label">' + c.label + '</div>\
          <div class="countdown-value ' + c.urgency + '">' + (c.days > 0 ? c.days : '\u2014') + '</div>\
          <div class="countdown-unit">' + (c.days > 0 ? 'Tage' : 'Vergangen') + '</div>\
          <div class="countdown-detail">' + c.detail + '</div>\
        </div>';
    });
    html += '</div></section>';

    // 2. Compliance-Kalender
    var compItems = getNextComplianceDates();
    compItems.sort(function (a, b) {
      if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate;
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      return 0;
    });

    html += '<section class="section"><h2 class="section-title">Compliance-Pflichten</h2>';
    html += '<div id="complianceListTimeline">';
    compItems.forEach(function (item) {
      var daysUntil = '';
      var urgencyClass = '';
      if (item.dueDate) {
        var days = daysBetween(TODAY, item.dueDate);
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
      html += '\
        <div class="compliance-item' + urgencyClass + '">\
          <div class="compliance-firm">' + esc(item.firm) + '</div>\
          <div class="compliance-body">\
            <div class="compliance-task">' + esc(item.task) + '</div>\
            <div class="compliance-meta">\
              <span class="compliance-date">' + esc(item.dueDateStr) + (daysUntil ? ' (' + esc(daysUntil) + ')' : '') + '</span>\
              <span class="compliance-interval">' + esc(item.interval) + '</span>\
            </div>\
            ' + (item.note ? '<div class="compliance-note">' + esc(item.note) + '</div>' : '') + '\
          </div>\
        </div>';
    });
    html += '</div></section>';

    // 3. Meilensteine (Timeline)
    html += '<section class="section"><h2 class="section-title">Meilensteine</h2>';
    html += '<div class="timeline" id="timelineMilestones">';
    DATA.milestones.forEach(function (m) {
      var id = milestoneId(m);
      var dotClass = m.status === 'completed' ? 'completed' :
                     m.status === 'active' ? 'active' : 'upcoming';
      var existingNote = milestoneNotes[id] || '';
      html += '\
        <div class="timeline-item">\
          <div class="timeline-dot ' + dotClass + '"></div>\
          <div class="timeline-date">' + formatDateLong(m.date) + '</div>\
          <div class="timeline-title">' + esc(m.title) + (m.critical ? ' \u26a0' : '') + '</div>\
          <div class="timeline-desc">' + esc(m.desc) + '</div>\
          ' + (m.deps ? '<div class="timeline-deps">Abh\u00e4ngig von: ' + esc(m.deps) + '</div>' : '') + '\
          <div class="milestone-note-section" data-milestone-id="' + id + '" data-milestone-title="' + m.title.replace(/"/g, '&quot;') + '">\
            ' + (existingNote ? '<div class="milestone-note-text">' + esc(existingNote) + '</div>' : '') + '\
            <button class="milestone-note-btn" data-milestone-id="' + id + '">' + (existingNote ? 'Notiz bearbeiten' : 'Notiz') + '</button>\
          </div>\
        </div>';
    });
    html += '</div></section>';

    // 4. Offene Punkte
    html += '<section class="section"><h2 class="section-title">Offene Punkte</h2>';
    html += '<div class="open-items">';
    DATA.openItems.forEach(function (item) {
      html += '\
        <div class="open-item">\
          <div class="open-item-title">' + esc(item.title) + '</div>\
          <div class="open-item-desc">' + esc(item.desc) + '</div>\
          <div class="open-item-status ' + item.status + '">' + esc(item.statusText) + '</div>\
        </div>';
    });
    html += '</div></section>';

    // 5. Alle Aktionen
    var sortedActions = DATA.actions.slice().sort(function (a, b) {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return parseLocalDate(a.date) - parseLocalDate(b.date);
    });

    html += '<section class="section"><h2 class="section-title">Alle Aktionen</h2>';
    html += '<div class="action-list">';
    sortedActions.forEach(function (action) {
      var urgentClass = '';
      if (!action.completed && action.date) {
        var actionDate = parseLocalDate(action.date);
        var daysUntil = daysBetween(TODAY, actionDate);
        if (daysUntil < 0) urgentClass = ' overdue';
        else if (daysUntil < 7) urgentClass = ' urgent';
      }
      html += '\
        <div class="action-item ' + (action.completed ? 'completed' : '') + urgentClass + '" data-id="' + action.id + '">\
          <div class="action-check ' + (action.completed ? 'checked' : '') + '" data-action-id="' + action.id + '"></div>\
          <div class="action-body">\
            <div class="action-title">' + esc(action.title) + '</div>\
            <div class="action-meta">\
              ' + (action.date ? '<span class="action-date">' + formatDate(action.date) + '</span>' : '') + '\
              ' + (action.tag ? '<span class="action-tag ' + action.tag + '">' + esc(action.tagText) + '</span>' : '') + '\
              ' + (urgentClass === ' overdue' ? '<span class="action-tag critical">\u00dcberf\u00e4llig</span>' : '') + '\
              ' + (urgentClass === ' urgent' ? '<span class="action-tag critical">Dringend</span>' : '') + '\
            </div>\
            ' + (action.dependency ? '<div class="action-dependency">' + esc(action.dependency) + '</div>' : '') + '\
          </div>\
        </div>';
    });
    html += '</div></section>';

    // Export
    html += '<section class="section"><h2 class="section-title">Daten</h2>';
    html += '<a href="#" id="exportDataBtn" class="export-data-link">Daten exportieren (JSON)</a>';
    html += '</section>';

    container.innerHTML = html;

    // ---- Event Listeners ----

    // Milestone note buttons
    container.querySelectorAll('.milestone-note-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mId = btn.dataset.milestoneId;
        var section = container.querySelector('.milestone-note-section[data-milestone-id="' + mId + '"]');
        var title = section.dataset.milestoneTitle;
        openNoteEditor(section, mId, title);
      });
    });

    // Action checkboxes
    container.querySelectorAll('.action-check').forEach(function (check) {
      check.addEventListener('click', function () {
        var id = check.dataset.actionId;
        var action = DATA.actions.find(function (a) { return a.id === id; });
        if (action) {
          action.completed = !action.completed;
          render();
          if (Views.dashboard) Views.dashboard.render();
          DB.saveCompleted(id, action.completed).catch(function () {
            action.completed = !action.completed;
            render();
            alert('Speichern fehlgeschlagen.');
          });
        }
      });
    });

    // Export button
    var exportBtn = document.getElementById('exportDataBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', function (e) {
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

    // Load milestone notes from Supabase
    DB.loadMilestoneNotes().then(function (notes) {
      milestoneNotes = notes;
      // Re-render milestone notes only (avoid full re-render loop)
      container.querySelectorAll('.milestone-note-section').forEach(function (section) {
        var mId = section.dataset.milestoneId;
        var existingNote = milestoneNotes[mId] || '';
        var noteText = section.querySelector('.milestone-note-text');
        var noteBtn = section.querySelector('.milestone-note-btn');
        if (existingNote) {
          if (!noteText) {
            var div = document.createElement('div');
            div.className = 'milestone-note-text';
            div.textContent = existingNote;
            section.insertBefore(div, noteBtn);
          } else {
            noteText.textContent = existingNote;
          }
          if (noteBtn) noteBtn.textContent = 'Notiz bearbeiten';
        }
      });
    });
  }

  function openNoteEditor(section, mId, title) {
    var existingNote = milestoneNotes[mId] || '';
    var existing = section.querySelector('.milestone-note-editor');
    if (existing) {
      existing.remove();
      return;
    }

    var btn = section.querySelector('.milestone-note-btn');
    btn.style.display = 'none';

    var editor = document.createElement('div');
    editor.className = 'milestone-note-editor';
    editor.innerHTML = '\
      <input type="text" class="milestone-note-input" value="' + existingNote.replace(/"/g, '&quot;') + '" placeholder="Notiz hinzuf\u00fcgen...">\
      <div class="milestone-note-actions">\
        <button class="milestone-note-save">Speichern</button>\
        <button class="milestone-note-cancel">Abbrechen</button>\
      </div>';
    section.appendChild(editor);

    var input = editor.querySelector('.milestone-note-input');
    input.focus();

    editor.querySelector('.milestone-note-save').addEventListener('click', function () {
      var note = input.value.trim();
      if (note) {
        milestoneNotes[mId] = note;
      } else {
        delete milestoneNotes[mId];
      }
      DB.saveMilestoneNote(mId, title, note);
      render();
    });

    editor.querySelector('.milestone-note-cancel').addEventListener('click', function () {
      editor.remove();
      btn.style.display = '';
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        editor.querySelector('.milestone-note-save').click();
      } else if (e.key === 'Escape') {
        editor.querySelector('.milestone-note-cancel').click();
      }
    });
  }

  return { render: render };
})();
