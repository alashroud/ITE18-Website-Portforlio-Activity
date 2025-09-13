// Inline editor with contenteditable and localStorage persistence
(function () {
  const STORAGE_KEY = 'siteInlineEdits.v1';
  const THEME_KEY = 'siteTheme.v1';
  let isEditMode = false;

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

  function toggleEditMode() {
    isEditMode = !isEditMode;
    const editBtn = document.getElementById('edit-button');
    
    if (isEditMode) {
      editBtn.textContent = 'Exit Edit';
      editBtn.style.background = '#e53e3e';
      enableInlineEditing();
    } else {
      editBtn.textContent = 'Edit content';
      editBtn.style.background = 'linear-gradient(90deg, #4299e1, #3182ce)';
      disableInlineEditing();
    }
  }

  function enableInlineEditing() {
    // Add edit mode class to body
    document.body.classList.add('edit-mode');
    
    // Make all editable elements contenteditable
    Object.values(EDITABLE_TARGETS).forEach(selector => {
      const el = document.querySelector(selector);
      if (el) {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('data-original-content', el.textContent);
        
        // Add event listeners for real-time saving
        el.addEventListener('blur', () => saveElementContent(el, selector));
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            el.blur();
          }
        });
      }
    });
  }

  function disableInlineEditing() {
    // Remove edit mode class from body
    document.body.classList.remove('edit-mode');
    
    // Remove contenteditable from all elements
    Object.values(EDITABLE_TARGETS).forEach(selector => {
      const el = document.querySelector(selector);
      if (el) {
        el.removeAttribute('contenteditable');
        el.removeAttribute('data-original-content');
        
        // Remove event listeners
        el.removeEventListener('blur', () => saveElementContent(el, selector));
        el.removeEventListener('keydown', () => {});
      }
    });
  }

  function saveElementContent(element, selector) {
    const edits = loadEdits();
    
    if (selector.includes('.chips')) {
      // Handle skills list specially
      const text = element.textContent.trim();
      edits[selector] = text;
    } else {
      edits[selector] = element.textContent;
    }
    
    saveEdits(edits);
  }

  function handleReset() {
    if (!confirm('This will remove all your edits. Continue?')) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    
    // Update theme icon
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
  }

  function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update theme icon
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
  }

  function init() {
    loadTheme();
    applyEdits();
    const editBtn = document.getElementById('edit-button');
    const resetBtn = document.getElementById('reset-button');
    const themeBtn = document.getElementById('theme-toggle');
    if (editBtn) editBtn.addEventListener('click', toggleEditMode);
    if (resetBtn) resetBtn.addEventListener('click', handleReset);
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();



