/**
 * Service to calculate and determine the application portfolio position 
 * in the McFarlan Strategic Grid.
 */

/**
 * Langkah 1: Fungsi Bantuan (Helper Function) untuk menghitung rata-rata
 * @param {number[]} arr - Array yang berisi skor (1-5)
 * @returns {number} Nilai rata-rata dari array
 */
const calculateAverage = (arr) => {
  if (!arr || arr.length === 0) return 0;
  const sum = arr.reduce((acc, val) => acc + val, 0);
  return sum / arr.length;
};

/**
 * Fungsi utama untuk menentukan Kuadran McFarlan
 * 
 * @param {number[]} currentIT - Array 4 nilai pertanyaan (skala 1-5)
 * @param {number[]} futureIT - Array 5 nilai pertanyaan (skala 1-5)
 * @param {number[]} DM - Digital Maturity, Array 1 nilai pertanyaan (skala 1-5)
 * @param {number[]} RE - Risk Exposure, Array 3 nilai pertanyaan (skala 1-5)
 * @returns {Object} Objek JSON berstruktur yang berisi rata-rata, koordinat, dan kuadran.
 */
const determineMcFarlanQuadrant = (currentIT, futureIT, DM, RE) => {
  // Langkah 1: Hitung Rata-rata masing-masing parameter
  const avgCurrentIT = calculateAverage(currentIT);
  const avgFutureIT = calculateAverage(futureIT);
  const avgDM = calculateAverage(DM);
  const avgRE = calculateAverage(RE);

  // Langkah 2: Tentukan Sumbu Koordinat X dan Y
  const x = (avgCurrentIT + avgRE) / 2;
  const y = (avgFutureIT + avgDM) / 2;

  // Langkah 3: Tentukan Kuadran berdasarkan titik potong di angka 3
  let quadrant = '';
  if (x <= 3 && y <= 3) {
    quadrant = 'Infrastructure';
  } else if (x > 3 && y <= 3) {
    quadrant = 'Breakthrough Management';
  } else if (x <= 3 && y > 3) {
    quadrant = 'Investment';
  } else if (x > 3 && y > 3) {
    quadrant = 'Strategic';
  }

  // Langkah 4: Format Keluaran (Return JSON Object)
  return {
    averages: {
      currentIT: Number(avgCurrentIT.toFixed(2)),
      futureIT: Number(avgFutureIT.toFixed(2)),
      DM: Number(avgDM.toFixed(2)),
      RE: Number(avgRE.toFixed(2))
    },
    coordinates: {
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2))
    },
    quadrant: quadrant
  };
};

export {
  calculateAverage,
  determineMcFarlanQuadrant
};

// ==========================================
// CONTOH PEMANGGILAN FUNGSI (MOCK DATA)
// ==========================================
/*
const mockCurrentIT = [3, 4, 3, 5]; // 4 pertanyaan
const mockFutureIT = [4, 5, 4, 4, 5]; // 5 pertanyaan
const mockDM = [4]; // 1 pertanyaan
const mockRE = [3, 2, 4]; // 3 pertanyaan

const result = determineMcFarlanQuadrant(mockCurrentIT, mockFutureIT, mockDM, mockRE);

console.log("=== Hasil Pemetaan McFarlan Strategic Grid ===");
console.log(JSON.stringify(result, null, 2));

// Output yang Diharapkan:
// === Hasil Pemetaan McFarlan Strategic Grid ===
// {
//   "averages": {
//     "currentIT": 3.75,
//     "futureIT": 4.4,
//     "DM": 4,
//     "RE": 3
//   },
//   "coordinates": {
//     "x": 3.38,
//     "y": 4.2
//   },
//   "quadrant": "Strategic"
// }
*/
