import mongoose from 'mongoose';

const quadrantSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    enum: ['Strategic', 'Breakthrough Management', 'Investment', 'Infrastructure']
  },
  description: { type: String },
  
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
  ROI: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('Quadrant', quadrantSchema);
