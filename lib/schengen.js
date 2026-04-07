// =============================================
// AUSWANDERUNG — Schengen 90/180 Calculator
// =============================================

window.Schengen = (function () {
  // Fallback list for when CountriesDB is not yet loaded
  var SCHENGEN_COUNTRIES = [
    'Österreich', 'Belgien', 'Tschechien', 'Dänemark', 'Estland',
    'Finnland', 'Frankreich', 'Deutschland', 'Griechenland', 'Ungarn',
    'Island', 'Italien', 'Lettland', 'Liechtenstein', 'Litauen',
    'Luxemburg', 'Malta', 'Niederlande', 'Norwegen', 'Polen',
    'Portugal', 'Slowakei', 'Slowenien', 'Spanien', 'Schweden',
    'Schweiz', 'Kroatien'
  ];

  function isSchengen(countryName) {
    // Use CountriesDB if available
    if (window.CountriesDB) {
      return window.CountriesDB.isSchengen(countryName);
    }
    return SCHENGEN_COUNTRIES.indexOf(countryName) !== -1;
  }

  function calculate(stays, referenceDate) {
    var refDate = referenceDate || new Date();
    if (typeof refDate === 'string') {
      refDate = window.DateUtils.parseLocalDate(refDate);
    }
    refDate.setHours(0, 0, 0, 0);

    // Window: 180 days back from referenceDate
    var windowStart = new Date(refDate);
    windowStart.setDate(windowStart.getDate() - 179); // 180-day window inclusive
    windowStart.setHours(0, 0, 0, 0);

    var windowEnd = new Date(refDate);
    windowEnd.setHours(0, 0, 0, 0);

    // Filter Schengen stays
    var schengenStays = stays.filter(function (s) {
      return isSchengen(s.country);
    });

    var trips = [];
    var daysUsed = 0;

    schengenStays.forEach(function (s) {
      var entry = window.DateUtils.parseLocalDate(s.entry_date);
      var exit = s.exit_date ? window.DateUtils.parseLocalDate(s.exit_date) : new Date(refDate);
      exit.setHours(0, 0, 0, 0);
      entry.setHours(0, 0, 0, 0);

      // Clamp to window
      var start = entry < windowStart ? new Date(windowStart) : new Date(entry);
      var end = exit > windowEnd ? new Date(windowEnd) : new Date(exit);

      if (start > windowEnd || end < windowStart) return; // Outside window

      // Ein-/Ausreisetag zählen beide => days = daysBetween + 1
      var days = window.DateUtils.daysBetween(start, end) + 1;
      if (days < 1) days = 0;

      if (days > 0) {
        daysUsed += days;
        trips.push({
          country: s.country,
          entry_date: s.entry_date,
          exit_date: s.exit_date,
          daysInWindow: days
        });
      }
    });

    var daysRemaining = 90 - daysUsed;
    if (daysRemaining < 0) daysRemaining = 0;

    return {
      daysUsed: daysUsed,
      daysRemaining: daysRemaining,
      windowStart: windowStart,
      windowEnd: windowEnd,
      trips: trips
    };
  }

  return {
    isSchengen: isSchengen,
    calculate: calculate,
    SCHENGEN_COUNTRIES: SCHENGEN_COUNTRIES
  };
})();
