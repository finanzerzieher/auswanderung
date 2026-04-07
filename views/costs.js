// =============================================
// AUSWANDERUNG — View: Costs
// =============================================

window.Views = window.Views || {};
window.Views.costs = (function () {
  var FIRMS = [
    { id: 'einzelunternehmen', name: 'Einzelunternehmen' },
    { id: 'llc', name: 'LLC (Wyoming)' },
    { id: 'pt-infra', name: 'PT-Infrastruktur' }
  ];

  var INTERVALS = [
    { id: 'monthly', name: 'Monatlich' },
    { id: 'yearly', name: 'J\u00e4hrlich' },
    { id: 'once', name: 'Einmalig' }
  ];

  var costs = [];
  var fmt = Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

  function tocents(amount) {
    return Math.round(Number(amount) * 100);
  }

  function calcSummary() {
    var monthlyCents = 0;
    var yearlyCents = 0;
    var onceCents = 0;

    costs.forEach(function (c) {
      var cents = tocents(c.amount);
      if (c.interval === 'monthly') {
        monthlyCents += cents;
        yearlyCents += cents * 12;
      } else if (c.interval === 'yearly') {
        yearlyCents += cents;
        monthlyCents += Math.round(cents / 12);
      } else if (c.interval === 'once') {
        onceCents += cents;
      }
    });

    return {
      monthly: monthlyCents / 100,
      yearly: yearlyCents / 100,
      once: onceCents / 100
    };
  }

  function intervalLabel(id) {
    var found = INTERVALS.find(function (i) { return i.id === id; });
    return found ? found.name : id;
  }

  function firmLabel(id) {
    var found = FIRMS.find(function (f) { return f.id === id; });
    return found ? found.name : id;
  }

  function render() {
    DB.loadCosts().then(function (data) {
      costs = data;
      renderUI();
    }).catch(function () {
      costs = [];
      renderUI();
    });
  }

  function renderUI() {
    var container = document.getElementById('costContainer');
    if (!container) return;

    var summary = calcSummary();

    // Summary section
    var html = '\
      <div class="cost-summary">\
        <div class="cost-summary-card">\
          <div class="cost-summary-label">Monatliche Kosten</div>\
          <div class="cost-summary-value">' + fmt.format(summary.monthly) + '</div>\
        </div>\
        <div class="cost-summary-card">\
          <div class="cost-summary-label">J\u00e4hrliche Kosten</div>\
          <div class="cost-summary-value">' + fmt.format(summary.yearly) + '</div>\
        </div>\
        <div class="cost-summary-card">\
          <div class="cost-summary-label">Einmalige Kosten</div>\
          <div class="cost-summary-value">' + fmt.format(summary.once) + '</div>\
        </div>\
      </div>';

    // Groups by firm
    FIRMS.forEach(function (firm) {
      var firmCosts = costs.filter(function (c) { return c.firm === firm.id; });
      html += '\
        <div class="cost-group">\
          <div class="cost-group-header">\
            <div class="cost-group-title">' + DateUtils.escapeHtml(firm.name) + '</div>\
            <div class="cost-group-count">' + firmCosts.length + ' Posten</div>\
          </div>';

      if (firmCosts.length === 0) {
        html += '<div class="cost-empty">Keine Kosten erfasst</div>';
      } else {
        firmCosts.forEach(function (c) {
          var esc = DateUtils.escapeHtml;
          html += '\
            <div class="cost-item" data-cost-id="' + c.id + '">\
              <div class="cost-item-main">\
                <div class="cost-item-label">' + esc(c.label) + '</div>\
                <div class="cost-item-meta">\
                  <span class="cost-item-interval">' + esc(intervalLabel(c.interval)) + '</span>\
                  ' + (c.notes ? '<span class="cost-item-notes">' + esc(c.notes) + '</span>' : '') + '\
                </div>\
              </div>\
              <div class="cost-item-amount">' + fmt.format(Number(c.amount)) + '</div>\
              <button class="cost-item-delete" data-delete-id="' + c.id + '" title="L\u00f6schen">&times;</button>\
            </div>';
        });
      }

      html += '</div>';
    });

    container.innerHTML = html;

    // Delete handlers
    container.querySelectorAll('.cost-item-delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!confirm('Kostenposten wirklich l\u00f6schen?')) return;
        var id = btn.dataset.deleteId;
        DB.deleteCost(id).then(function () {
          render();
        }).catch(function () {
          alert('L\u00f6schen fehlgeschlagen.');
        });
      });
    });
  }

  function showAddDialog() {
    var overlay = document.createElement('div');
    overlay.className = 'doc-dialog-overlay';

    overlay.innerHTML = '\
      <div class="doc-dialog cost-dialog">\
        <div class="doc-dialog-title">Kostenposten hinzuf\u00fcgen</div>\
        <label>Firma</label>\
        <select id="costFirm">\
          ' + FIRMS.map(function (f) { return '<option value="' + f.id + '">' + f.name + '</option>'; }).join('') + '\
        </select>\
        <label>Bezeichnung</label>\
        <input type="text" id="costLabel" placeholder="z.B. Berufshaftpflicht">\
        <label>Betrag (EUR)</label>\
        <input type="number" id="costAmount" step="0.01" min="0" placeholder="0,00">\
        <label>Intervall</label>\
        <select id="costInterval">\
          ' + INTERVALS.map(function (i) { return '<option value="' + i.id + '">' + i.name + '</option>'; }).join('') + '\
        </select>\
        <label>Notiz (optional)</label>\
        <input type="text" id="costNotes" placeholder="">\
        <div class="doc-dialog-actions">\
          <button class="doc-btn-cancel" id="costCancel">Abbrechen</button>\
          <button class="doc-btn-save" id="costSave">Speichern</button>\
        </div>\
      </div>';

    document.body.appendChild(overlay);

    var labelInput = overlay.querySelector('#costLabel');
    labelInput.focus();

    overlay.querySelector('#costCancel').addEventListener('click', function () {
      overlay.remove();
    });

    overlay.querySelector('#costSave').addEventListener('click', function () {
      var firm = overlay.querySelector('#costFirm').value;
      var label = overlay.querySelector('#costLabel').value.trim();
      var amount = overlay.querySelector('#costAmount').value;
      var interval = overlay.querySelector('#costInterval').value;
      var notes = overlay.querySelector('#costNotes').value.trim();

      if (!label) { alert('Bezeichnung ist erforderlich.'); return; }
      if (!amount || Number(amount) <= 0) { alert('Betrag muss gr\u00f6\u00dfer als 0 sein.'); return; }

      var id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      var cost = {
        id: id,
        firm: firm,
        label: label,
        amount: Number(amount).toFixed(2),
        interval: interval,
        notes: notes || null
      };

      var saveBtn = overlay.querySelector('#costSave');
      saveBtn.textContent = 'Wird gespeichert...';
      saveBtn.disabled = true;

      DB.saveCost(cost).then(function () {
        overlay.remove();
        render();
      }).catch(function () {
        saveBtn.textContent = 'Speichern';
        saveBtn.disabled = false;
        alert('Speichern fehlgeschlagen.');
      });
    });

    labelInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') overlay.querySelector('#costSave').click();
    });
  }

  function initAddButton() {
    var btn = document.getElementById('costAddBtn');
    if (btn) {
      btn.addEventListener('click', function () {
        showAddDialog();
      });
    }
  }

  return {
    render: render,
    initAddButton: initAddButton
  };
})();
