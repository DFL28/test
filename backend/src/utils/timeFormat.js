/**
 * Format waktu menjadi format relatif (x menit/jam/hari yang lalu)
 * @param {string|Date} dateTime - Waktu yang akan diformat
 * @returns {string} Formatted time string
 */
function timeAgo(dateTime) {
  const now = new Date();
  const past = new Date(dateTime);
  const diffMs = now - past;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return 'baru saja';
  } else if (minutes < 60) {
    return `${minutes} menit yang lalu`;
  } else if (hours < 24) {
    return `${hours} jam yang lalu`;
  } else if (days < 30) {
    return `${days} hari yang lalu`;
  } else if (months < 12) {
    return `${months} bulan yang lalu`;
  } else {
    return `${years} tahun yang lalu`;
  }
}

/**
 * Format waktu menjadi format singkat (untuk manga card)
 * @param {string|Date} dateTime - Waktu yang akan diformat
 * @returns {string} Formatted time string (short version)
 */
function timeAgoShort(dateTime) {
  const now = new Date();
  const past = new Date(dateTime);
  const diffMs = now - past;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'baru';
  } else if (minutes < 60) {
    return `${minutes}m`;
  } else if (hours < 24) {
    return `${hours}h`;
  } else {
    return `${days}d`;
  }
}

/**
 * Format tanggal ke format lokal
 * @param {string|Date} dateTime - Waktu yang akan diformat
 * @returns {string} Formatted date string
 */
function formatDate(dateTime) {
  const date = new Date(dateTime);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('id-ID', options);
}

module.exports = {
  timeAgo,
  timeAgoShort,
  formatDate
};
