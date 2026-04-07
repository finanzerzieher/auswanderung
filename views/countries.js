// =============================================
// AUSWANDERUNG — View: Countries
// =============================================

window.Views = window.Views || {};
window.Views.countries = (function () {
  function render() {
    var grid = document.getElementById('countryGrid');
    grid.innerHTML = DATA.countries.map(function (c) {
      var pct = Math.round((c.daysUsed / c.maxStay) * 100);
      var fillClass = pct < 60 ? 'safe' : pct < 85 ? 'caution' : 'danger';
      var remaining = c.maxStay - c.daysUsed;
      return '\
        <div class="country-card">\
          <div class="country-header">\
            <div class="country-name">' + c.name + '</div>\
            <div class="country-flag">' + c.flag + '</div>\
          </div>\
          <div class="country-stay">\
            <div class="country-stay-bar">\
              <div class="country-stay-fill ' + fillClass + '" style="width: ' + pct + '%"></div>\
            </div>\
            <div class="country-stay-text">\
              <span>' + c.daysUsed + ' von ' + c.maxStay + ' ' + c.stayUnit + '</span>\
              <span>' + remaining + ' \u00fcbrig</span>\
            </div>\
          </div>\
          <div class="country-rules">\
            ' + c.rules.map(function (r) {
              return '\
              <div class="country-rule">\
                <span class="country-rule-label">' + r.label + '</span>\
                <span class="country-rule-value">' + r.value + '</span>\
              </div>';
            }).join('') + '\
          </div>\
        </div>';
    }).join('');
  }

  return { render: render };
})();
