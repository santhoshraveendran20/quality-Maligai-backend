import mongoose from 'mongoose';
//added
export const LIMITS = {
  nameMin: 2,
  nameMax: 40,
  placeMax: 40,
  textMin: 10,
  textMax: 300,
};

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: LIMITS.nameMin, maxlength: LIMITS.nameMax },
    place: { type: String, trim: true, maxlength: LIMITS.placeMax, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
    text: { type: String, required: true, trim: true, minlength: LIMITS.textMin, maxlength: LIMITS.textMax },
    approved: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

reviewSchema.index({ approved: 1, createdAt: -1 });

// Shape sent to the website: the same fields the React app already uses.
reviewSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id.toString(),
    name: this.name,
    place: this.place,
    rating: this.rating,
    text: this.text,
    createdAt: this.createdAt.toISOString(),
  };
};

export const Review = mongoose.model('Review', reviewSchema);
