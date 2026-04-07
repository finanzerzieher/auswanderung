// =============================================
// AUSWANDERUNG — App Logic (Supabase-backed)
// =============================================

(function () {
  const TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);

  // --- Helpers ---

  function daysBetween(a, b) {
    const msPerDay = 86400000;
    return Math.ceil((b - a) / msPerDay);
  }

  function parseLocalDate(dateStr) {
    // Fix: date-only strings like '2026-06-02' are parsed as UTC by new Date(),
    // which shifts the date in timezones east of UTC (e.g. Bangkok UTC+7).
    // Append T00:00:00 to force local-time interpretation.
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return new Date(dateStr + 'T00:00:00');
    }
    return new Date(dateStr);
  }

  function formatDate(dateStr) {
    const d = parseLocalDate(dateStr);
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function formatDateLong(dateStr) {
    const d = parseLocalDate(dateStr);
    return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  // --- Load persisted state from Supabase (non-blocking) ---

  DB.loadCompleted().then(completedMap => {
    let changed = false;
    DATA.actions.forEach(a => {
      if (completedMap[a.id] !== undefined && a.completed !== completedMap[a.id]) {
        a.completed = completedMap[a.id];
        changed = true;
      }
    });
    if (changed) renderCommandCenter();
  }).catch(e => console.warn('Could not load action states:', e));

  // --- Navigation ---

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.dataset.view;
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById('view-' + view).classList.add('active');
    });
  });

  // --- Current Date ---

  document.getElementById('currentDate').textContent =
    TODAY.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // --- Command Center ---

  function renderCommandCenter() {
    const departureDate = parseLocalDate('2026-06-06');
    const deregisterDate = parseLocalDate('2026-06-02');
    const llcDate = parseLocalDate('2026-06-03');
    const daysToDeparture = daysBetween(TODAY, departureDate);
    const daysToDeregister = daysBetween(TODAY, deregisterDate);
    const daysToLLC = daysBetween(TODAY, llcDate);

    const subtitleEl = document.getElementById('daysUntilDeparture');
    if (daysToDeparture > 0) {
      subtitleEl.textContent = `Noch ${daysToDeparture} Tage bis zum Abflug nach Bangkok`;
    } else {
      subtitleEl.textContent = 'Du bist unterwegs.';
    }

    const activePhase = DATA.phases.find(p => p.status === 'active');
    if (activePhase) {
      document.getElementById('currentPhaseBadge').textContent = 'Phase: ' + activePhase.name;
    }

    const countdownBar = document.getElementById('countdownBar');
    const countdowns = [
      {
        label: 'Abmeldung',
        days: daysToDeregister,
        detail: formatDateLong('2026-06-02'),
        urgency: daysToDeregister <= 14 ? 'urgent' : daysToDeregister <= 30 ? 'warning' : 'calm'
      },
      {
        label: 'LLC beauftragen',
        days: daysToLLC,
        detail: formatDateLong('2026-06-03') + ' — 1 Tag nach Abmeldung',
        urgency: daysToLLC <= 14 ? 'urgent' : daysToLLC <= 30 ? 'warning' : 'calm'
      },
      {
        label: 'Abflug Bangkok',
        days: daysToDeparture,
        detail: formatDateLong('2026-06-06'),
        urgency: daysToDeparture <= 14 ? 'urgent' : daysToDeparture <= 30 ? 'warning' : 'calm'
      }
    ];

    countdownBar.innerHTML = countdowns.map(c => `
      <div class="countdown-card">
        <div class="countdown-label">${c.label}</div>
        <div class="countdown-value ${c.urgency}">${c.days > 0 ? c.days : '—'}</div>
        <div class="countdown-unit">${c.days > 0 ? 'Tage' : 'Vergangen'}</div>
        <div class="countdown-detail">${c.detail}</div>
      </div>
    `).join('');

    const actionList = document.getElementById('nextActions');
    const sortedActions = [...DATA.actions].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return parseLocalDate(a.date) - parseLocalDate(b.date);
    });

    actionList.innerHTML = sortedActions.map(action => `
      <div class="action-item ${action.completed ? 'completed' : ''}" data-id="${action.id}">
        <div class="action-check ${action.completed ? 'checked' : ''}" data-action-id="${action.id}"></div>
        <div class="action-body">
          <div class="action-title">${action.title}</div>
          <div class="action-meta">
            ${action.date ? `<span class="action-date">${formatDate(action.date)}</span>` : ''}
            ${action.tag ? `<span class="action-tag ${action.tag}">${action.tagText}</span>` : ''}
          </div>
          ${action.dependency ? `<div class="action-dependency">${action.dependency}</div>` : ''}
        </div>
      </div>
    `).join('');

    // Toggle completed — optimistic UI update, then save to Supabase
    actionList.querySelectorAll('.action-check').forEach(check => {
      check.addEventListener('click', () => {
        const id = check.dataset.actionId;
        const action = DATA.actions.find(a => a.id === id);
        if (action) {
          action.completed = !action.completed;
          renderCommandCenter();
          // Async save — revert on error
          DB.saveCompleted(id, action.completed).catch(() => {
            action.completed = !action.completed;
            renderCommandCenter();
            alert('Speichern fehlgeschlagen. Änderung wurde rückgängig gemacht.');
          });
        }
      });
    });

    // Open items
    const openItemsEl = document.getElementById('openItems');
    openItemsEl.innerHTML = DATA.openItems.map(item => `
      <div class="open-item">
        <div class="open-item-title">${item.title}</div>
        <div class="open-item-desc">${item.desc}</div>
        <div class="open-item-status ${item.status}">${item.statusText}</div>
      </div>
    `).join('');

    // Progress
    const progressEl = document.getElementById('progressOverview');
    progressEl.innerHTML = DATA.phases.map(phase => {
      const pct = Math.round(phase.progress * 100);
      return `
        <div class="progress-row">
          <div class="progress-label">${phase.name}</div>
          <div class="progress-track">
            <div class="progress-fill ${pct === 100 ? 'complete' : ''}" style="width: ${pct}%"></div>
          </div>
          <div class="progress-value">${pct}%</div>
        </div>
      `;
    }).join('');
  }

  // --- Timeline ---

  function renderTimeline() {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = DATA.milestones.map(m => {
      const dotClass = m.status === 'completed' ? 'completed' :
                       m.status === 'active' ? 'active' : 'upcoming';
      return `
        <div class="timeline-item">
          <div class="timeline-dot ${dotClass}"></div>
          <div class="timeline-date">${formatDateLong(m.date)}</div>
          <div class="timeline-title">${m.title}${m.critical ? ' ⚠' : ''}</div>
          <div class="timeline-desc">${m.desc}</div>
          ${m.deps ? `<div class="timeline-deps">Abhängig von: ${m.deps}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  // --- Countries ---

  function renderCountries() {
    const grid = document.getElementById('countryGrid');
    grid.innerHTML = DATA.countries.map(c => {
      const pct = Math.round((c.daysUsed / c.maxStay) * 100);
      const fillClass = pct < 60 ? 'safe' : pct < 85 ? 'caution' : 'danger';
      const remaining = c.maxStay - c.daysUsed;
      return `
        <div class="country-card">
          <div class="country-header">
            <div class="country-name">${c.name}</div>
            <div class="country-flag">${c.flag}</div>
          </div>
          <div class="country-stay">
            <div class="country-stay-bar">
              <div class="country-stay-fill ${fillClass}" style="width: ${pct}%"></div>
            </div>
            <div class="country-stay-text">
              <span>${c.daysUsed} von ${c.maxStay} ${c.stayUnit}</span>
              <span>${remaining} übrig</span>
            </div>
          </div>
          <div class="country-rules">
            ${c.rules.map(r => `
              <div class="country-rule">
                <span class="country-rule-label">${r.label}</span>
                <span class="country-rule-value">${r.value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  // --- Structure ---

  function renderStructure() {
    const layout = document.getElementById('structureLayout');
    const eu = DATA.structure.einzelunternehmen;
    const llc = DATA.structure.llc;
    const conn = DATA.structure.connector;

    layout.innerHTML = `
      <div class="structure-card">
        <div class="structure-card-title">${eu.title}</div>
        <div class="structure-card-subtitle">${eu.subtitle}</div>
        <div class="structure-rows">
          ${eu.rows.map(r => `
            <div class="structure-row">
              <div class="structure-row-label">${r.label}</div>
              <div class="structure-row-value">${r.value}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="structure-card">
        <div class="structure-card-title">${llc.title}</div>
        <div class="structure-card-subtitle">${llc.subtitle}</div>
        <div class="structure-rows">
          ${llc.rows.map(r => `
            <div class="structure-row">
              <div class="structure-row-label">${r.label}</div>
              <div class="structure-row-value">${r.value}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="structure-connector">
        <div class="structure-connector-title">${conn.title}</div>
        <div class="structure-connector-desc">${conn.desc}</div>
      </div>
    `;
  }

  // --- Documents ---

  const DOC_CATEGORIES = [
    { id: 'identity', name: 'Identität & Reise' },
    { id: 'certificates', name: 'Urkunden & Bescheinigungen' },
    { id: 'business', name: 'Geschäftlich' },
    { id: 'llc', name: 'LLC & Ausland' },
    { id: 'insurance', name: 'Versicherungen' },
    { id: 'other', name: 'Sonstiges' }
  ];

  const REQUIRED_DOCS = [
    { id: 'reisepass', name: 'Reisepass', keywords: ['reisepass', 'passport'], note: 'Gültig bis?' },
    { id: 'perso', name: 'Personalausweis', keywords: ['personalausweis', 'ausweis', 'perso'], note: 'Gültig bis 2034' },
    { id: 'fuehrerschein', name: 'Internationaler Führerschein', keywords: ['führerschein', 'fuehrerschein', 'führerschein', 'driving', 'license', 'international'], note: 'vorhanden' },
    { id: 'geburtsurkunde', name: 'Geburtsurkunde + Apostille', keywords: ['geburtsurkunde', 'apostille', 'birth'], note: 'Übersetzt und beglaubigt' },
    { id: 'abmeldung', name: 'Abmeldebestätigung', keywords: ['abmelde', 'deregistration'], note: 'Ab 02.06. — mehrfach sichern!' },
    { id: 'gewerbe', name: 'Gewerbeschein', keywords: ['gewerbeschein', 'gewerbe'], note: 'Einzelunternehmen' },
    { id: '34d', name: '§34d-Zulassung / IHK', keywords: ['34d', 'ihk', 'zulassung', 'erlaubnis'], note: 'Muss aktiv bleiben' },
    { id: 'haftpflicht', name: 'Berufshaftpflicht-Police', keywords: ['berufshaftpflicht', 'haftpflicht', 'vsh', 'vermögensschaden'], note: 'NICHT kündigen' },
    { id: 'llc-oa', name: 'LLC Operating Agreement', keywords: ['operating', 'agreement', 'llc'], note: 'Nach Gründung (ab ~06.06.)' },
    { id: 'ein', name: 'EIN-Bestätigung', keywords: ['ein', 'tax id', 'steuernummer'], note: 'US-Steuernummer der LLC' },
    { id: 'dba', name: 'DBA-Registrierung', keywords: ['dba', 'doing business', 'trade name'], note: '"Viktor Frickel" ohne LLC' },
    { id: 'wise', name: 'Wise Business Dokumente', keywords: ['wise', 'business'], note: 'Belgische IBAN' },
    { id: 'int-kv', name: 'Internationale KV-Police', keywords: ['international', 'safetywing', 'foyer', 'passportcard', 'krankenversicherung'], note: 'Vor Kündigung der deutschen KV' },
    { id: 'flug', name: 'Flugticket Bangkok', keywords: ['flug', 'flight', 'boarding', 'bangkok', 'ticket'], note: '06.06.2026 — Nachweis Ausreise' },
  ];

  function isDocPresent(reqDoc, docs) {
    const names = docs.map(d => d.name.toLowerCase());
    return reqDoc.keywords.some(kw => names.some(n => n.includes(kw)));
  }

  function renderDocuments(docs, docNotes) {
    // Can be called with cached data or freshly loaded
    if (!docs && !docNotes) {
      // Load from Supabase, then re-render
      Promise.all([DB.loadDocs(), DB.loadDocNotes()])
        .then(([d, n]) => renderDocuments(d, n))
        .catch(e => {
          console.warn('renderDocuments load error:', e);
          renderDocuments([], {});
        });
      docs = [];
      docNotes = {};
    }
    const container = document.getElementById('docCategories');

    // --- Required docs checklist ---
    const presentCount = REQUIRED_DOCS.filter(r => isDocPresent(r, docs)).length;
    const totalCount = REQUIRED_DOCS.length;

    let html = `
      <div class="doc-checklist-section">
        <div class="doc-checklist-header">
          <div class="doc-category-title">Benötigte Dokumente</div>
          <div class="doc-checklist-count">${presentCount} von ${totalCount} hinterlegt</div>
        </div>
        <div class="doc-checklist-bar">
          <div class="doc-checklist-fill" style="width: ${Math.round(presentCount / totalCount * 100)}%"></div>
        </div>
        <div class="doc-checklist">
          ${REQUIRED_DOCS.map(req => {
            const present = isDocPresent(req, docs);
            const userNote = docNotes[req.id];
            const displayNote = userNote || req.note;
            return `
              <div class="doc-checklist-item ${present ? 'present' : 'missing'}" data-req-id="${req.id}">
                <div class="doc-checklist-icon">${present ? '✓' : '○'}</div>
                <div class="doc-checklist-body">
                  <div class="doc-checklist-name">${req.name}</div>
                  <div class="doc-checklist-note" data-note-id="${req.id}">${displayNote}</div>
                </div>
                <div class="doc-checklist-edit" data-edit-id="${req.id}" title="Notiz bearbeiten">✎</div>
                <div class="doc-checklist-status">${present ? 'Hinterlegt' : 'Fehlt'}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // --- Uploaded docs by category ---
    const catHtml = DOC_CATEGORIES
      .filter(cat => docs.some(d => d.category === cat.id))
      .map(cat => {
        const catDocs = docs.filter(d => d.category === cat.id);
        return `
          <div class="doc-category">
            <div class="doc-category-title">${cat.name}</div>
            <div class="doc-grid">
              ${catDocs.map(doc => `
                <div class="doc-card" data-doc-id="${doc.id}">
                  <button class="doc-card-delete" data-delete-id="${doc.id}" data-storage-path="${doc.storagePath}" title="Löschen">&times;</button>
                  <div class="doc-card-preview">
                    ${doc.type.startsWith('image/')
                      ? `<img src="${doc.url}" alt="${doc.name}">`
                      : `<span class="doc-pdf-icon">PDF</span>`
                    }
                  </div>
                  <div class="doc-card-name">${doc.name}</div>
                  <div class="doc-card-meta">${formatFileSize(doc.size)} · ${new Date(doc.uploaded).toLocaleDateString('de-DE')}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');

    container.innerHTML = html + catHtml;

    // Click to open document
    container.querySelectorAll('.doc-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.doc-card-delete')) return;
        const doc = docs.find(d => d.id === card.dataset.docId);
        if (doc) {
          window.open(doc.url, '_blank');
        }
      });
    });

    // Delete document
    container.querySelectorAll('.doc-card-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('Dokument wirklich löschen?')) return;
        const id = btn.dataset.deleteId;
        const storagePath = btn.dataset.storagePath;
        await DB.deleteDoc(id, storagePath);
        renderDocuments();
      });
    });

    // Edit notes on checklist items
    container.querySelectorAll('.doc-checklist-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.editId;
        const req = REQUIRED_DOCS.find(r => r.id === id);
        const current = docNotes[id] || req.note;

        const noteEl = container.querySelector(`.doc-checklist-note[data-note-id="${id}"]`);
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'doc-checklist-input';
        input.value = current;
        noteEl.replaceWith(input);
        input.focus();
        input.select();

        async function save() {
          const val = input.value.trim();
          const noteToSave = (val && val !== req.note) ? val : null;
          await DB.saveDocNote(id, noteToSave);
          renderDocuments();
        }

        input.addEventListener('blur', save);
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { input.blur(); }
          if (e.key === 'Escape') { input.value = current; input.blur(); }
        });
      });
    });
  }

  // --- Upload flow ---

  let pendingFiles = [];

  document.getElementById('docFileInput').addEventListener('change', (e) => {
    pendingFiles = Array.from(e.target.files);
    if (pendingFiles.length === 0) return;
    showUploadDialog(0);
    e.target.value = '';
  });

  function showUploadDialog(index) {
    if (index >= pendingFiles.length) {
      renderDocuments();
      return;
    }

    const file = pendingFiles[index];
    const overlay = document.createElement('div');
    overlay.className = 'doc-dialog-overlay';

    const nameWithoutExt = file.name.replace(/\.[^.]+$/, '');
    const counter = `${index + 1}/${pendingFiles.length}`;

    overlay.innerHTML = `
      <div class="doc-dialog">
        <div class="doc-dialog-title">Dokument einordnen ${pendingFiles.length > 1 ? `(${counter})` : ''}</div>
        <label for="docName">Name</label>
        <input type="text" id="docDialogName" value="${nameWithoutExt}">
        <label for="docCategory">Kategorie</label>
        <select id="docDialogCategory">
          ${DOC_CATEGORIES.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
        </select>
        <label for="docRequiredMatch">Pflichtdokument zuordnen</label>
        <select id="docRequiredMatch">
          <option value="">— Keins / Automatisch —</option>
          ${REQUIRED_DOCS.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
        </select>
        <div class="doc-dialog-actions">
          <button class="doc-btn-cancel" id="docDialogCancel">Abbrechen</button>
          <button class="doc-btn-save" id="docDialogSave">Speichern</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const nameInput = overlay.querySelector('#docDialogName');
    nameInput.focus();
    nameInput.select();

    // Auto-detect category
    const lower = file.name.toLowerCase();
    if (lower.includes('ausweis') || lower.includes('passport') || lower.includes('reisepass') || lower.includes('fuehrerschein') || lower.includes('führerschein')) {
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

    overlay.querySelector('#docDialogCancel').addEventListener('click', () => {
      overlay.remove();
    });

    // Auto-select required doc match based on filename
    const lowerName = nameWithoutExt.toLowerCase();
    for (const req of REQUIRED_DOCS) {
      if (req.keywords.some(kw => lowerName.includes(kw))) {
        overlay.querySelector('#docRequiredMatch').value = req.id;
        break;
      }
    }

    const saveBtn = overlay.querySelector('#docDialogSave');
    saveBtn.addEventListener('click', async () => {
      let name = overlay.querySelector('#docDialogName').value.trim() || nameWithoutExt;
      const category = overlay.querySelector('#docDialogCategory').value;
      const requiredMatch = overlay.querySelector('#docRequiredMatch').value;

      // If a required doc was selected, ensure the name contains a matching keyword
      if (requiredMatch) {
        const req = REQUIRED_DOCS.find(r => r.id === requiredMatch);
        if (req && !req.keywords.some(kw => name.toLowerCase().includes(kw))) {
          name = req.name + ' — ' + name;
        }
      }

      saveBtn.textContent = 'Wird hochgeladen...';
      saveBtn.disabled = true;

      const result = await DB.uploadDoc(file, name, category);
      if (result === null) {
        // Upload fehlgeschlagen — Fehlermeldung anzeigen
        saveBtn.textContent = 'Speichern';
        saveBtn.disabled = false;
        let errorMsg = overlay.querySelector('.doc-dialog-error');
        if (!errorMsg) {
          errorMsg = document.createElement('div');
          errorMsg.className = 'doc-dialog-error';
          errorMsg.style.cssText = 'color: var(--burgundy); background: var(--burgundy-subtle); padding: 8px 12px; border-radius: 4px; font-size: 13px; margin-top: 8px;';
          overlay.querySelector('.doc-dialog-actions').before(errorMsg);
        }
        errorMsg.innerHTML = 'Upload fehlgeschlagen. <button class="doc-btn-retry" style="background:none;border:none;color:var(--passport);cursor:pointer;font-weight:600;font-size:13px;text-decoration:underline;padding:0;margin-left:4px;">Erneut versuchen</button>';
        errorMsg.querySelector('.doc-btn-retry').addEventListener('click', () => saveBtn.click());
        return;
      }
      overlay.remove();
      showUploadDialog(index + 1);
    });

    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveBtn.click();
    });
  }

  // --- Init (render immediately, load cloud data in background) ---

  renderCommandCenter();
  renderTimeline();
  renderCountries();
  renderStructure();
  renderDocuments();
})();
