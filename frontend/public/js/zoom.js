// Zoom functionality (desktop only)
document.addEventListener('DOMContentLoaded', function() {
  const zoomInBtn = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');
  const readerImages = document.getElementById('readerImages');

  if (zoomInBtn && zoomOutBtn && readerImages) {
    let zoomLevel = 100; // Default 100%
    const zoomStep = 20; // Zoom by 20%
    const minZoom = 80;
    const maxZoom = 140;

    function updateZoom() {
      readerImages.style.width = `${zoomLevel}%`;
      readerImages.style.maxWidth = `${zoomLevel}%`;
    }

    zoomInBtn.addEventListener('click', function() {
      if (zoomLevel < maxZoom) {
        zoomLevel += zoomStep;
        updateZoom();
      }
    });

    zoomOutBtn.addEventListener('click', function() {
      if (zoomLevel > minZoom) {
        zoomLevel -= zoomStep;
        updateZoom();
      }
    });
  }
});
