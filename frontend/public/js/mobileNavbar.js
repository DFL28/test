// Mobile navbar & sidebar toggle
document.addEventListener('DOMContentLoaded', function() {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (sidebarToggle && sidebar && sidebarOverlay) {
    // Toggle sidebar
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('active');
      sidebarOverlay.classList.toggle('active');
    });

    // Close sidebar when clicking overlay
    sidebarOverlay.addEventListener('click', function() {
      sidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
    });
  }

  // Auto hide/show navbar on scroll (for reader page)
  if (document.body.classList.contains('reader-body')) {
    let lastScrollY = window.scrollY;
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', function() {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        navbar.classList.add('hidden');
      } else {
        // Scrolling up
        navbar.classList.remove('hidden');
      }

      lastScrollY = currentScrollY;
    });
  }
});
