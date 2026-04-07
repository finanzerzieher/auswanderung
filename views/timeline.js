// =============================================
// AUSWANDERUNG — View: Timeline
// =============================================

window.Views = window.Views || {};
window.Views.timeline = (function () {
  var milestoneNotes = {};

  function milestoneId(m) {
    // Stabile ID aus Datum + Titel
    return (m.date + '-' + m.title).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 80);
  }

  function renderTimeline() {
    var formatDateLong = DateUtils.formatDateLong;
    var timeline = document.getElementById('timeline');
    timeline.innerHTML = DATA.milestones.map(function (m) {
      var id = milestoneId(m);
      var dotClass = m.status === 'completed' ? 'completed' :
                     m.status === 'active' ? 'active' : 'upcoming';
      var existingNote = milestoneNotes[id] || '';
      return '\
        <div class="timeline-item">\
          <div class="timeline-dot ' + dotClass + '"></div>\
          <div class="timeline-date">' + formatDateLong(m.date) + '</div>\
          <div class="timeline-title">' + m.title + (m.critical ? ' \u26a0' : '') + '</div>\
          <div class="timeline-desc">' + m.desc + '</div>\
          ' + (m.deps ? '<div class="timeline-deps">Abh\u00e4ngig von: ' + m.deps + '</div>' : '') + '\
          <div class="milestone-note-section" data-milestone-id="' + id + '" data-milestone-title="' + m.title.replace(/"/g, '&quot;') + '">\
            ' + (existingNote ? '<div class="milestone-note-text">' + DateUtils.escapeHtml(existingNote) + '</div>' : '') + '\
            <button class="milestone-note-btn" data-milestone-id="' + id + '">' + (existingNote ? 'Notiz bearbeiten' : 'Notiz') + '</button>\
          </div>\
        </div>';
    }).join('');

    // Event-Listener für Notiz-Buttons
    timeline.querySelectorAll('.milestone-note-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mId = btn.dataset.milestoneId;
        var section = timeline.querySelector('.milestone-note-section[data-milestone-id="' + mId + '"]');
        var title = section.dataset.milestoneTitle;
        openNoteEditor(section, mId, title);
      });
    });
  }

  function openNoteEditor(section, mId, title) {
    var existingNote = milestoneNotes[mId] || '';

    // Bestehenden Editor entfernen falls vorhanden
    var existing = section.querySelector('.milestone-note-editor');
    if (existing) {
      existing.remove();
      return;
    }

    // Button verstecken
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
      renderTimeline();
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

  function render() {
    renderTimeline();

    // Notizen aus Supabase laden und neu rendern
    DB.loadMilestoneNotes().then(function (notes) {
      milestoneNotes = notes;
      renderTimeline();
    });
  }

  return { render: render };
})();
