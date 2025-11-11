// Mobile search functionality
document.addEventListener('DOMContentLoaded', function() {
  const mobileSearchBtn = document.getElementById('mobileSearchBtn');
  const mobileSearchBox = document.getElementById('mobileSearchBox');
  const mobileSearchInput = document.getElementById('mobileSearchInput');

  if (mobileSearchBtn && mobileSearchBox && mobileSearchInput) {
    // Toggle search box
    mobileSearchBtn.addEventListener('click', function() {
      mobileSearchBox.classList.toggle('active');
      if (mobileSearchBox.classList.contains('active')) {
        mobileSearchInput.focus();
      }
    });

    // Debounce timer
    let debounceTimer;

    // AJAX search on input
    mobileSearchInput.addEventListener('input', function() {
      const query = this.value.trim();

      clearTimeout(debounceTimer);

      if (query.length < 2) {
        return;
      }

      debounceTimer = setTimeout(async function() {
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await response.json();

          // Display results (simple implementation)
          // For production, you'd want to inject manga cards into the page
          console.log('Search results:', data.results);

          // Redirect to search page for now
          if (data.results.length > 0) {
            window.location.href = `/search?q=${encodeURIComponent(query)}`;
          }
        } catch (error) {
          console.error('Search error:', error);
        }
      }, 300);
    });

    // Submit on enter
    mobileSearchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const query = this.value.trim();
        if (query) {
          window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }
      }
    });
  }
});
