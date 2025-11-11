/**
 * Konversi string ke slug URL-friendly
 * @param {string} text - Text yang akan dijadikan slug
 * @returns {string} Slug yang sudah di-normalize
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces dengan -
    .replace(/\s+/g, '-')
    // Hapus karakter yang tidak valid
    .replace(/[^\w\-]+/g, '')
    // Replace multiple - dengan single -
    .replace(/\-\-+/g, '-')
    // Hapus - di awal dan akhir
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Generate unique slug dengan menambahkan suffix jika perlu
 * @param {string} text - Text yang akan dijadikan slug
 * @param {Function} checkExists - Callback untuk cek apakah slug sudah ada
 * @returns {string} Unique slug
 */
async function uniqueSlugify(text, checkExists) {
  let slug = slugify(text);
  let counter = 1;
  let finalSlug = slug;

  while (await checkExists(finalSlug)) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }

  return finalSlug;
}

module.exports = { slugify, uniqueSlugify };
