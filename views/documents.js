// =============================================
// AUSWANDERUNG — View: Documents
// =============================================

window.Views = window.Views || {};
window.Views.documents = (function () {
  var DOC_CATEGORIES = [
    { id: 'identity', name: 'Identit\u00e4t & Reise' },
    { id: 'certificates', name: 'Urkunden & Bescheinigungen' },
    { id: 'business', name: 'Gesch\u00e4ftlich' },
    { id: 'llc', name: 'LLC & Ausland' },
    { id: 'insurance', name: 'Versicherungen' },
    { id: 'other', name: 'Sonstiges' }
  ];

  var REQUIRED_DOCS = [
    { id: 'reisepass', name: 'Reisepass', keywords: ['reisepass', 'passport'], note: 'G\u00fcltig bis?' },
    { id: 'perso', name: 'Personalausweis', keywords: ['personalausweis', 'ausweis', 'perso'], note: 'G\u00fcltig bis 2034' },
    { id: 'fuehrerschein', name: 'Internationaler F\u00fchrerschein', keywords: ['f\u00fchrerschein', 'fuehrerschein', 'f\u00fchrerschein', 'driving', 'license', 'international'], note: 'vorhanden' },
    { id: 'geburtsurkunde', name: 'Geburtsurkunde + Apostille', keywords: ['geburtsurkunde', 'apostille', 'birth'], note: '\u00dcbersetzt und beglaubigt' },
    { id: 'abmeldung', name: 'Abmeldebest\u00e4tigung', keywords: ['abmelde', 'deregistration'], note: 'Ab 02.06. \u2014 mehrfach sichern!' },
    { id: 'gewerbe', name: 'Gewerbeschein', keywords: ['gewerbeschein', 'gewerbe'], note: 'Einzelunternehmen' },
    { id: '34d', name: '\u00a734d-Zulassung / IHK', keywords: ['34d', 'ihk', 'zulassung', 'erlaubnis'], note: 'Muss aktiv bleiben' },
    { id: 'haftpflicht', name: 'Berufshaftpflicht-Police', keywords: ['berufshaftpflicht', 'haftpflicht', 'vsh', 'verm\u00f6gensschaden'], note: 'NICHT k\u00fcndigen' },
    { id: 'llc-oa', name: 'LLC Operating Agreement', keywords: ['operating', 'agreement', 'llc'], note: 'Nach Gr\u00fcndung (ab ~06.06.)' },
    { id: 'ein', name: 'EIN-Best\u00e4tigung', keywords: ['ein', 'tax id', 'steuernummer'], note: 'US-Steuernummer der LLC' },
    { id: 'dba', name: 'DBA-Registrierung', keywords: ['dba', 'doing business', 'trade name'], note: '"Viktor Frickel" ohne LLC' },
    { id: 'wise', name: 'Wise Business Dokumente', keywords: ['wise', 'business'], note: 'Belgische IBAN' },
    { id: 'int-kv', name: 'Internationale KV-Police', keywords: ['international', 'safetywing', 'foyer', 'passportcard', 'krankenversicherung'], note: 'Vor K\u00fcndigung der deutschen KV' },
    { id: 'flug', name: 'Flugticket Bangkok', keywords: ['flug', 'flight', 'boarding', 'bangkok', 'ticket'], note: '06.06.2026 \u2014 Nachweis Ausreise' },
    { id: 'verbrauch', name: 'Verbrauchsrechnungen (Strom/Internet/Miete)', keywords: ['verbrauch', 'strom', 'internet', 'miete', 'rechnung', 'utility', 'nebenkosten'], note: 'Letzte Rechnungen Dortmund \u2014 f\u00fcr KYC/Bankkonten im Ausland' },
    { id: 'impfpass', name: 'Impfpass / Impfausweis', keywords: ['impf', 'vaccination', 'gelb', 'yellow'], note: 'Gelbfieberimpfung f\u00fcr S\u00fcdostasien/S\u00fcdamerika pr\u00fcfen' },
    { id: 'bankauszug', name: 'Kontoausz\u00fcge / Bankabrechnungen', keywords: ['kontoauszug', 'bankauszug', 'bankabrechnung', 'bank statement', 'kontoausz\u00fcge'], note: 'Letzte 3-6 Monate \u2014 f\u00fcr KYC, Kontoverlagerung, Nachweis Geldherkunft' },
    { id: 'kreditkarte', name: 'Kreditkartenabrechnungen', keywords: ['kreditkarte', 'credit card', 'visa card', 'mastercard', 'abrechnung'], note: 'Letzte Abrechnungen \u2014 f\u00fcr KYC und Nachweis Zahlungshistorie' },
    { id: 'wohnung', name: 'Wohnungsabmeldung / Vermieter-Best\u00e4tigung', keywords: ['wohnung', 'mietvertrag', 'vermieter', 'auszug', 'k\u00fcndigung'], note: 'Best\u00e4tigung dass du nicht mehr im Mietvertrag stehst' }
  ];

  var pendingFiles = [];

  function isDocPresent(reqDoc, docs) {
    var names = docs.map(function (d) { return d.name.toLowerCase(); });
    return reqDoc.keywords.some(function (kw) {
      return names.some(function (n) { return n.includes(kw); });
    });
  }

  function render(docs, docNotes) {
    var formatFileSize = DateUtils.formatFileSize;

    // Can be called with cached data or freshly loaded
    if (!docs && !docNotes) {
      // Load from Supabase, then re-render
      Promise.all([DB.loadDocs(), DB.loadDocNotes()])
        .then(function (results) { render(results[0], results[1]); })
        .catch(function (e) {
          console.warn('renderDocuments load error:', e);
          render([], {});
        });
      docs = [];
      docNotes = {};
    }
    var container = document.getElementById('docCategories');

    // --- Required docs checklist ---
    var presentCount = REQUIRED_DOCS.filter(function (r) { return isDocPresent(r, docs); }).length;
    var totalCount = REQUIRED_DOCS.length;

    var html = '\
      <div class="doc-checklist-section">\
        <div class="doc-checklist-header">\
          <div class="doc-category-title">Ben\u00f6tigte Dokumente</div>\
          <div class="doc-checklist-count">' + presentCount + ' von ' + totalCount + ' hinterlegt</div>\
        </div>\
        <div class="doc-checklist-bar">\
          <div class="doc-checklist-fill" style="width: ' + Math.round(presentCount / totalCount * 100) + '%"></div>\
        </div>\
        <div class="doc-checklist">\
          ' + REQUIRED_DOCS.map(function (req) {
            var present = isDocPresent(req, docs);
            var userNote = docNotes[req.id];
            var displayNote = userNote || req.note;
            return '\
              <div class="doc-checklist-item ' + (present ? 'present' : 'missing') + '" data-req-id="' + req.id + '">\
                <div class="doc-checklist-icon">' + (present ? '\u2713' : '\u25cb') + '</div>\
                <div class="doc-checklist-body">\
                  <div class="doc-checklist-name">' + req.name + '</div>\
                  <div class="doc-checklist-note" data-note-id="' + req.id + '">' + displayNote + '</div>\
                </div>\
                <div class="doc-checklist-edit" data-edit-id="' + req.id + '" title="Notiz bearbeiten">\u270e</div>\
                <div class="doc-checklist-status">' + (present ? 'Hinterlegt' : 'Fehlt') + '</div>\
              </div>';
          }).join('') + '\
        </div>\
      </div>';

    // --- Uploaded docs by category ---
    var catHtml = DOC_CATEGORIES
      .filter(function (cat) { return docs.some(function (d) { return d.category === cat.id; }); })
      .map(function (cat) {
        var catDocs = docs.filter(function (d) { return d.category === cat.id; });
        return '\
          <div class="doc-category">\
            <div class="doc-category-title">' + cat.name + '</div>\
            <div class="doc-grid">\
              ' + catDocs.map(function (doc) {
                return '\
                <div class="doc-card" data-doc-id="' + doc.id + '">\
                  <button class="doc-card-delete" data-delete-id="' + doc.id + '" data-storage-path="' + doc.storagePath + '" title="L\u00f6schen">&times;</button>\
                  <div class="doc-card-preview">\
                    ' + (doc.type.startsWith('image/')
                      ? '<img src="' + doc.url + '" alt="' + doc.name + '">'
                      : '<span class="doc-pdf-icon">PDF</span>') + '\
                  </div>\
                  <div class="doc-card-name">' + doc.name + '</div>\
                  <div class="doc-card-meta">' + formatFileSize(doc.size) + ' \u00b7 ' + new Date(doc.uploaded).toLocaleDateString('de-DE') + '</div>\
                </div>';
              }).join('') + '\
            </div>\
          </div>';
      }).join('');

    container.innerHTML = html + catHtml;

    // Click to open document
    container.querySelectorAll('.doc-card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('.doc-card-delete')) return;
        var doc = docs.find(function (d) { return d.id === card.dataset.docId; });
        if (doc) {
          window.open(doc.url, '_blank');
        }
      });
    });

    // Delete document
    container.querySelectorAll('.doc-card-delete').forEach(function (btn) {
      btn.addEventListener('click', async function (e) {
        e.stopPropagation();
        if (!confirm('Dokument wirklich l\u00f6schen?')) return;
        var id = btn.dataset.deleteId;
        var storagePath = btn.dataset.storagePath;
        await DB.deleteDoc(id, storagePath);
        render();
      });
    });

    // Edit notes on checklist items
    container.querySelectorAll('.doc-checklist-edit').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = btn.dataset.editId;
        var req = REQUIRED_DOCS.find(function (r) { return r.id === id; });
        var current = docNotes[id] || req.note;

        var noteEl = container.querySelector('.doc-checklist-note[data-note-id="' + id + '"]');
        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'doc-checklist-input';
        input.value = current;
        noteEl.replaceWith(input);
        input.focus();
        input.select();

        async function save() {
          var val = input.value.trim();
          var noteToSave = (val && val !== req.note) ? val : null;
          await DB.saveDocNote(id, noteToSave);
          render();
        }

        input.addEventListener('blur', save);
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { input.blur(); }
          if (e.key === 'Escape') { input.value = current; input.blur(); }
        });
      });
    });
  }

  // --- Upload flow ---

  function initUpload() {
    document.getElementById('docFileInput').addEventListener('change', function (e) {
      pendingFiles = Array.from(e.target.files);
      if (pendingFiles.length === 0) return;
      showUploadDialog(0);
      e.target.value = '';
    });
  }

  function showUploadDialog(index) {
    if (index >= pendingFiles.length) {
      render();
      return;
    }

    var file = pendingFiles[index];
    var overlay = document.createElement('div');
    overlay.className = 'doc-dialog-overlay';

    var nameWithoutExt = file.name.replace(/\.[^.]+$/, '');
    var counter = (index + 1) + '/' + pendingFiles.length;

    overlay.innerHTML = '\
      <div class="doc-dialog">\
        <div class="doc-dialog-title">Dokument einordnen ' + (pendingFiles.length > 1 ? '(' + counter + ')' : '') + '</div>\
        <label for="docName">Name</label>\
        <input type="text" id="docDialogName" value="' + nameWithoutExt + '">\
        <label for="docCategory">Kategorie</label>\
        <select id="docDialogCategory">\
          ' + DOC_CATEGORIES.map(function (c) { return '<option value="' + c.id + '">' + c.name + '</option>'; }).join('') + '\
        </select>\
        <label for="docRequiredMatch">Pflichtdokument zuordnen</label>\
        <select id="docRequiredMatch">\
          <option value="">\u2014 Keins / Automatisch \u2014</option>\
          ' + REQUIRED_DOCS.map(function (r) { return '<option value="' + r.id + '">' + r.name + '</option>'; }).join('') + '\
        </select>\
        <div class="doc-dialog-actions">\
          <button class="doc-btn-cancel" id="docDialogCancel">Abbrechen</button>\
          <button class="doc-btn-save" id="docDialogSave">Speichern</button>\
        </div>\
      </div>';

    document.body.appendChild(overlay);

    var nameInput = overlay.querySelector('#docDialogName');
    nameInput.focus();
    nameInput.select();

    // Auto-detect category
    var lower = file.name.toLowerCase();
    if (lower.includes('ausweis') || lower.includes('passport') || lower.includes('reisepass') || lower.includes('fuehrerschein') || lower.includes('f\u00fchrerschein')) {
      overlay.querySelector('#docDialogCategory').value = 'identity';
    } else if (lower.includes('geburt') || lower.includes('apostille') || lower.includes('abmelde') || lower.includes('urkunde')) {
      overlay.querySelector('#docDialogCategory').value = 'certificates';
    } else if (lower.includes('gewerbe') || lower.includes('ihk') || lower.includes('34d') || lower.includes('haftpflicht')) {
      overlay.querySelector('#docDialogCategory').value = 'business';
    } else if (lower.includes('llc') || lower.includes('ein') || lower.includes('operating') || lower.includes('dba')) {
      overlay.querySelector('#docDialogCategory').value = 'llc';
    } else if (lower.includes('versicherung') || lower.includes('insurance') || lower.includes('kv')) {
      overlay.querySelector('#docDialogCategory').value = 'insurance';
    }

    overlay.querySelector('#docDialogCancel').addEventListener('click', function () {
      overlay.remove();
    });

    // Auto-select required doc match based on filename
    var lowerName = nameWithoutExt.toLowerCase();
    for (var i = 0; i < REQUIRED_DOCS.length; i++) {
      var req = REQUIRED_DOCS[i];
      if (req.keywords.some(function (kw) { return lowerName.includes(kw); })) {
        overlay.querySelector('#docRequiredMatch').value = req.id;
        break;
      }
    }

    var saveBtn = overlay.querySelector('#docDialogSave');
    saveBtn.addEventListener('click', async function () {
      var name = overlay.querySelector('#docDialogName').value.trim() || nameWithoutExt;
      var category = overlay.querySelector('#docDialogCategory').value;
      var requiredMatch = overlay.querySelector('#docRequiredMatch').value;

      // If a required doc was selected, ensure the name contains a matching keyword
      if (requiredMatch) {
        var reqDoc = REQUIRED_DOCS.find(function (r) { return r.id === requiredMatch; });
        if (reqDoc && !reqDoc.keywords.some(function (kw) { return name.toLowerCase().includes(kw); })) {
          name = reqDoc.name + ' \u2014 ' + name;
        }
      }

      saveBtn.textContent = 'Wird hochgeladen...';
      saveBtn.disabled = true;

      var result = await DB.uploadDoc(file, name, category);
      if (result === null) {
        // Upload fehlgeschlagen
        saveBtn.textContent = 'Speichern';
        saveBtn.disabled = false;
        var errorMsg = overlay.querySelector('.doc-dialog-error');
        if (!errorMsg) {
          errorMsg = document.createElement('div');
          errorMsg.className = 'doc-dialog-error';
          errorMsg.style.cssText = 'color: var(--burgundy); background: var(--burgundy-subtle); padding: 8px 12px; border-radius: 4px; font-size: 13px; margin-top: 8px;';
          overlay.querySelector('.doc-dialog-actions').before(errorMsg);
        }
        errorMsg.innerHTML = 'Upload fehlgeschlagen. <button class="doc-btn-retry" style="background:none;border:none;color:var(--passport);cursor:pointer;font-weight:600;font-size:13px;text-decoration:underline;padding:0;margin-left:4px;">Erneut versuchen</button>';
        errorMsg.querySelector('.doc-btn-retry').addEventListener('click', function () { saveBtn.click(); });
        return;
      }
      overlay.remove();
      showUploadDialog(index + 1);
    });

    nameInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') saveBtn.click();
    });
  }

  return {
    render: render,
    initUpload: initUpload
  };
})();
