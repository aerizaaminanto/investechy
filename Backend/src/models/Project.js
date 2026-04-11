// src/models/Project.js
import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  description: { type: String },
  nominal: { type: Number, default: 0 } // AI sekarang akan mengisi nilai ini dengan estimasi
}, { _id: false });

const componentsSchema = new mongoose.Schema({
  capex: [itemSchema],
  opex: [itemSchema],
  tangibleBenefits: [itemSchema],
  intangibleBenefits: [itemSchema]
}, { _id: false });

// Sub-schema untuk menyimpan riwayat simulasi
const simulationSchema = new mongoose.Schema({
  scenarioName: { type: String, default: "Simulasi" }, // cth: "Skenario Optimis", "Skenario Pesimis"
  simulatedData: componentsSchema,
  reportPdfStorageKey: { type: String, default: null },
  reportPdfFileName: { type: String, default: null },
  simulationSettings: {
    inflationRate: Number,
    taxRate: Number,
    discountRate: Number,
    years: Number
  },
  financialResults: {
    npv: Number,
    roi: Number,
    paybackPeriod: Number,
    breakEvenYear: Number,
    breakEvenAnalysisDetail: [mongoose.Schema.Types.Mixed],
    ieScore: Number,
    feasibilityStatus: String
  },
  calculatedAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectName: { type: String, required: true },
  industry: { type: String, required: true },
  scale: { type: String, required: true },
  plan: { type: String, required: true },
  location: { type: String, required: true },
  
  // Field-field domain dari input (required semua dan bertipe Number/float/decimal)
  businessDomain: {
    SM: { type: Number, required: true },
    CA: { type: Number, required: true },
    MI: { type: Number, required: true },
    CR: { type: Number, required: true },
    OR: { type: Number, required: true },
  },
  technologyDomain: {
    SA: { type: Number, required: true },
    DU: { type: Number, required: true },
    TU: { type: Number, required: true },
    IR: { type: Number, required: true },
  },
  currentIT: { type: [Number], required: true },
  futureIT: { type: [Number], required: true },
  DM: { type: [Number], required: true },
  RE: { type: [Number], required: true },

  // Penambahan untuk menyimpan hasil kalkulasi mcfarlan
  mcfarlan: {
    averages: {
      currentIT: Number,
      futureIT: Number,
      DM: Number,
      RE: Number
    },
    coordinates: {
      x: Number,
      y: Number
    },
    quadrant: String
  },

  status: { 
    type: String, 
    enum: ['DRAFTING', 'WAITING_USER_INPUT', 'CALCULATED', 'ERROR'], 
    default: 'DRAFTING' 
  },
  
  // Batasan waktu 7 hari
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
  },

  // Snapshot murni dari AI (termasuk estimasi harganya)
  llmBaseDraft: componentsSchema,
  
  // Array untuk menyimpan berbagai percobaan kalkulasi user
  simulationHistory: [simulationSchema],

}, { timestamps: true });

// Middleware Mongoose untuk mengecek apakah proyek sudah expired
projectSchema.methods.isExpired = function() {
  return Date.now() > this.expiresAt;
};

export default mongoose.model('Project', projectSchema);
