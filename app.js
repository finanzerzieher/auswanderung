// =============================================
// AUSWANDERUNG — App Orchestrator
// =============================================

(function () {
  var TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);

  // --- Load persisted state from Supabase (non-blocking) ---

  DB.loadCompleted().then(function (completedMap) {
    var changed = false;
    DATA.actions.forEach(function (a) {
      if (completedMap[a.id] !== undefined && a.completed !== completedMap[a.id]) {
        a.completed = completedMap[a.id];
        changed = true;
      }
    });
    if (changed) {
      Views.dashboard.render();
      Views.timeline.render();
    }
  }).catch(function (e) { console.warn('Could not load action states:', e); });

  // --- Navigation ---

  document.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var view = link.dataset.view;
      document.querySelectorAll('.nav-link').forEach(function (l) { l.classList.remove('active'); });
      link.classList.add('active');
      document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('active'); });
      document.getElementById('view-' + view).classList.add('active');
    });
  });

  // --- Current Date ---

  document.getElementById('currentDate').textContent =
    TODAY.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // --- Init (render immediately, load cloud data in background) ---

  Views.stays.render();
  Views.stays.initAddButton();
  Views.dashboard.render();
  Views.timeline.render();
  Views.countries.render();
  Views.documents.render();
  Views.documents.initUpload();
  Views.finances.render();
  Views.finances.initAddButton();
})();
