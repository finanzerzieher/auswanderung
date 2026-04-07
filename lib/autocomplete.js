// =============================================
// AUSWANDERUNG — Autocomplete Component
// Custom dropdown mit Tastatur-Navigation
// =============================================

window.Autocomplete = (function () {

  function create(inputEl, options) {
    var source = options.source;
    var onSelect = options.onSelect;
    var renderItem = options.renderItem;
    var maxResults = options.maxResults || 8;
    var debounceMs = options.debounce || 100;

    var dropdown = document.createElement('div');
    dropdown.className = 'ac-dropdown';
    dropdown.style.display = 'none';

    // Position wrapper
    var wrapper = document.createElement('div');
    wrapper.className = 'ac-wrapper';
    wrapper.style.position = 'relative';
    inputEl.parentNode.insertBefore(wrapper, inputEl);
    wrapper.appendChild(inputEl);
    wrapper.appendChild(dropdown);

    var items = [];
    var activeIndex = -1;
    var debounceTimer = null;

    function positionDropdown() {
      dropdown.style.top = inputEl.offsetHeight + 2 + 'px';
      dropdown.style.left = '0';
      dropdown.style.width = inputEl.offsetWidth + 'px';
    }

    function showDropdown(results) {
      items = results.slice(0, maxResults);
      activeIndex = -1;

      if (items.length === 0) {
        dropdown.style.display = 'none';
        return;
      }

      positionDropdown();
      dropdown.innerHTML = items.map(function (item, i) {
        var html = renderItem ? renderItem(item) : '<span>' + item + '</span>';
        return '<div class="ac-item" data-index="' + i + '">' + html + '</div>';
      }).join('');

      dropdown.style.display = 'block';

      // Click handlers on items
      dropdown.querySelectorAll('.ac-item').forEach(function (el) {
        el.addEventListener('mousedown', function (e) {
          e.preventDefault(); // Prevent blur
          var idx = parseInt(el.dataset.index);
          selectItem(idx);
        });
      });
    }

    function hideDropdown() {
      dropdown.style.display = 'none';
      items = [];
      activeIndex = -1;
    }

    function selectItem(index) {
      if (index < 0 || index >= items.length) return;
      var item = items[index];
      if (onSelect) {
        onSelect(item, inputEl);
      }
      hideDropdown();
    }

    function setActive(index) {
      var allItems = dropdown.querySelectorAll('.ac-item');
      allItems.forEach(function (el) { el.classList.remove('ac-active'); });
      if (index >= 0 && index < allItems.length) {
        allItems[index].classList.add('ac-active');
        // Scroll into view
        allItems[index].scrollIntoView({ block: 'nearest' });
      }
      activeIndex = index;
    }

    inputEl.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        var query = inputEl.value.trim();
        if (query.length < 1) {
          hideDropdown();
          return;
        }
        var results = source(query);
        showDropdown(results);
      }, debounceMs);
    });

    inputEl.addEventListener('keydown', function (e) {
      if (dropdown.style.display === 'none') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        var next = activeIndex + 1;
        if (next >= items.length) next = 0;
        setActive(next);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        var prev = activeIndex - 1;
        if (prev < 0) prev = items.length - 1;
        setActive(prev);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0) {
          selectItem(activeIndex);
        }
      } else if (e.key === 'Escape') {
        hideDropdown();
      }
    });

    inputEl.addEventListener('blur', function () {
      // Small delay to allow click on dropdown item
      setTimeout(function () {
        hideDropdown();
      }, 150);
    });

    inputEl.addEventListener('focus', function () {
      var query = inputEl.value.trim();
      if (query.length >= 1) {
        var results = source(query);
        showDropdown(results);
      }
    });

    return {
      destroy: function () {
        hideDropdown();
        wrapper.parentNode.insertBefore(inputEl, wrapper);
        wrapper.remove();
      }
    };
  }

  return {
    create: create
  };
})();
