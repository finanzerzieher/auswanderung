// =============================================
// AUSWANDERUNG — View: Structure
// =============================================

window.Views = window.Views || {};
window.Views.structure = (function () {
  function render() {
    var layout = document.getElementById('structureLayout');
    var eu = DATA.structure.einzelunternehmen;
    var llc = DATA.structure.llc;
    var conn = DATA.structure.connector;

    layout.innerHTML = '\
      <div class="structure-card">\
        <div class="structure-card-title">' + eu.title + '</div>\
        <div class="structure-card-subtitle">' + eu.subtitle + '</div>\
        <div class="structure-rows">\
          ' + eu.rows.map(function (r) {
            return '\
            <div class="structure-row">\
              <div class="structure-row-label">' + r.label + '</div>\
              <div class="structure-row-value">' + r.value + '</div>\
            </div>';
          }).join('') + '\
        </div>\
      </div>\
      <div class="structure-card">\
        <div class="structure-card-title">' + llc.title + '</div>\
        <div class="structure-card-subtitle">' + llc.subtitle + '</div>\
        <div class="structure-rows">\
          ' + llc.rows.map(function (r) {
            return '\
            <div class="structure-row">\
              <div class="structure-row-label">' + r.label + '</div>\
              <div class="structure-row-value">' + r.value + '</div>\
            </div>';
          }).join('') + '\
        </div>\
      </div>\
      <div class="structure-connector">\
        <div class="structure-connector-title">' + conn.title + '</div>\
        <div class="structure-connector-desc">' + conn.desc + '</div>\
      </div>';
  }

  return { render: render };
})();
