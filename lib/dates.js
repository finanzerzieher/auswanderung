// =============================================
// AUSWANDERUNG — Date Utilities
// =============================================

window.DateUtils = (function () {
  function parseLocalDate(dateStr) {
    // Fix: date-only strings like '2026-06-02' are parsed as UTC by new Date(),
    // which shifts the date in timezones east of UTC (e.g. Bangkok UTC+7).
    // Append T00:00:00 to force local-time interpretation.
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return new Date(dateStr + 'T00:00:00');
    }
    return new Date(dateStr);
  }

  function daysBetween(a, b) {
    var msPerDay = 86400000;
    return Math.ceil((b - a) / msPerDay);
  }

  function formatDate(dateStr) {
    var d = parseLocalDate(dateStr);
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function formatDateLong(dateStr) {
    var d = parseLocalDate(dateStr);
    return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  return {
    parseLocalDate: parseLocalDate,
    daysBetween: daysBetween,
    formatDate: formatDate,
    formatDateLong: formatDateLong,
    formatFileSize: formatFileSize
  };
})();
