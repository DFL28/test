// Reader page functionality
document.addEventListener('DOMContentLoaded', function() {
  // Chapter dropdown toggle
  const chapterListBtn = document.getElementById('chapterListBtn');
  const chapterDropdown = document.getElementById('chapterDropdown');

  if (chapterListBtn && chapterDropdown) {
    chapterListBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const isVisible = chapterDropdown.style.display === 'block';
      chapterDropdown.style.display = isVisible ? 'none' : 'block';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!chapterDropdown.contains(e.target) && e.target !== chapterListBtn) {
        chapterDropdown.style.display = 'none';
      }
    });

    // Close dropdown when selecting a chapter
    const chapterOptions = chapterDropdown.querySelectorAll('.chapter-option');
    chapterOptions.forEach(option => {
      option.addEventListener('click', function() {
        chapterDropdown.style.display = 'none';
      });
    });
  }
});
