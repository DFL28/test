/**
 * Generate pagination data (model 3-hal)
 * @param {number} currentPage - Halaman saat ini
 * @param {number} totalPages - Total halaman
 * @returns {object} Data pagination untuk view
 */
function generatePagination(currentPage, totalPages) {
  const pages = [];

  // Model 3-hal:
  // Page 1: (1) 2 3 >
  // Page 2: < 1 (2) 3 >
  // Page 3: < 2 (3) 4 >

  // Tentukan range (3 halaman: prev, current, next)
  let startPage = Math.max(1, currentPage - 1);
  let endPage = Math.min(totalPages, currentPage + 1);

  // Jika di halaman pertama, tampilkan 3 pertama
  if (currentPage === 1) {
    startPage = 1;
    endPage = Math.min(3, totalPages);
  }
  // Jika di halaman terakhir, tampilkan 3 terakhir
  else if (currentPage === totalPages) {
    startPage = Math.max(1, totalPages - 2);
    endPage = totalPages;
  }

  // Generate array pages
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return {
    currentPage,
    totalPages,
    pages,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
    prevPage: currentPage - 1,
    nextPage: currentPage + 1
  };
}

module.exports = { generatePagination };
