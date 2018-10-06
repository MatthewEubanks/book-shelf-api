const mongoose = require('mongoose');

const bookSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    review: {
      type: String,
      default: 'n/a',
    },
    pages: {
      type: String,
      default: 'n/a',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    price: {
      type: String,
      default: 'n/a',
    },
    ownerId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

bookSchema.methods.serialize = function() {
  return {
    name: this.name,
    author: this.author,
    review: this.review,
    pages: this.pages,
    rating: this.rating,
    price: this.price,
    ownerId: this.ownerId,
  };
};

const Book = mongoose.model('Book', bookSchema);

module.exports = { Book };
