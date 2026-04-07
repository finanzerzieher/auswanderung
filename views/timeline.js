// =============================================
// AUSWANDERUNG — View: Timeline
// =============================================

window.Views = window.Views || {};
window.Views.timeline = (function () {
  function render() {
    var formatDateLong = DateUtils.formatDateLong;
    var timeline = document.getElementById('timeline');
    timeline.innerHTML = DATA.milestones.map(function (m) {
      var dotClass = m.status === 'completed' ? 'completed' :
                     m.status === 'active' ? 'active' : 'upcoming';
      return '\
        <div class="timeline-item">\
          <div class="timeline-dot ' + dotClass + '"></div>\
          <div class="timeline-date">' + formatDateLong(m.date) + '</div>\
          <div class="timeline-title">' + m.title + (m.critical ? ' \u26a0' : '') + '</div>\
          <div class="timeline-desc">' + m.desc + '</div>\
          ' + (m.deps ? '<div class="timeline-deps">Abh\u00e4ngig von: ' + m.deps + '</div>' : '') + '\
        </div>';
    }).join('');
  }

  return { render: render };
})();
