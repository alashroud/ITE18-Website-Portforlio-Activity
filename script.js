// Simple inline editor with localStorage persistence
(function () {
  const STORAGE_KEY = 'siteInlineEdits.v1';

  /**
   * Map of editable targets.
   * key: user-facing label
   * value: CSS selector to a single element whose textContent is editable
   */
  const EDITABLE_TARGETS = {
    'Hero title': '#intro-title',
    'Hero lead': '.lead',
    'About paragraph': '#about p',
    'Project 1 title': '#projects .card:nth-of-type(1) h3',
    'Project 1 description': '#projects .card:nth-of-type(1) p',
    'Project 2 title': '#projects .card:nth-of-type(2) h3',
    'Project 2 description': '#projects .card:nth-of-type(2) p',
    'Project 3 title': '#projects .card:nth-of-type(3) h3',
    'Project 3 description': '#projects .card:nth-of-type(3) p',
    'Skills list': '#skills .chips',
    'Contact email text': '#contact .contact-list li:nth-of-type(1) a',
    'Footer name': '.site-footer span:nth-of-type(2)'
  };

  function loadEdits() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function saveEdits(edits) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
    } catch (_) {
      // ignore quota errors
    }
  }

  function applyEdits() {
    const edits = loadEdits();
    Object.entries(edits).forEach(([selector, value]) => {
      const el = document.querySelector(selector);
      if (!el) return;
      if (selector.includes('.chips')) {
        // Allow comma-separated values to become list items
        el.innerHTML = '';
        String(value)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((text) => {
            const li = document.createElement('li');
            li.textContent = text;
            el.appendChild(li);
          });
      } else {
        el.textContent = value;
      }
    });
  }

  function promptSelect(options, title) {
    const labels = Object.keys(options);
    const numbered = labels.map((label, i) => `${i + 1}. ${label}`).join('\n');
    const input = prompt(`${title}\n\n${numbered}\n\nEnter number:`);
    if (!input) return null;
    const idx = Number(input) - 1;
    if (Number.isNaN(idx) || idx < 0 || idx >= labels.length) return null;
    return labels[idx];
  }

  function handleEditFlow() {
    // Step 1: choose section group
    const groups = {
      'Hero': ['Hero title', 'Hero lead'],
      'About': ['About paragraph'],
      'Projects': [
        'Project 1 title', 'Project 1 description',
        'Project 2 title', 'Project 2 description',
        'Project 3 title', 'Project 3 description'
      ],
      'Skills': ['Skills list'],
      'Contact': ['Contact email text'],
      'Footer': ['Footer name']
    };

    const groupLabel = promptSelect(groups, 'Select a section to edit');
    if (!groupLabel) return;

    const parts = groups[groupLabel];
    const partMap = parts.reduce((acc, label) => { acc[label] = EDITABLE_TARGETS[label]; return acc; }, {});
    const partLabel = promptSelect(partMap, `Select which part of ${groupLabel} to edit`);
    if (!partLabel) return;

    const selector = EDITABLE_TARGETS[partLabel];
    const el = document.querySelector(selector);
    if (!el) {
      alert('Sorry, that element was not found on the page.');
      return;
    }

    const currentValue = selector.includes('.chips')
      ? Array.from(el.querySelectorAll('li')).map((li) => li.textContent).join(', ')
      : el.textContent;

    const userValue = prompt('Enter the new content' + (selector.includes('.chips') ? ' (comma-separated list)' : ''), currentValue || '');
    if (userValue == null) return;

    const edits = loadEdits();
    edits[selector] = userValue;
    saveEdits(edits);
    applyEdits();
  }

  function handleReset() {
    if (!confirm('This will remove all your edits. Continue?')) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  function init() {
    applyEdits();
    const editBtn = document.getElementById('edit-button');
    const resetBtn = document.getElementById('reset-button');
    if (editBtn) editBtn.addEventListener('click', handleEditFlow);
    if (resetBtn) resetBtn.addEventListener('click', handleReset);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


