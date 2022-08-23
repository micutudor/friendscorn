const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://tudor:54iZ0e3XFYfO9QNm@cluster0.ui1htjd.mongodb.net/?retryWrites=true&w=majority');

const reviewSchema = mongoose.Schema({
    text: String,
    rating: {
        type: Number,
        min: [1, "Rating minim 1"],
        max: [5, "Rating maxim 5"]
    },
    authorId: mongoose.Types.ObjectId,
    movieId: Number,
    createdAt: {
        type: Date,
        default: () => Date.now(),
    }
});

module.exports = mongoose.model('Review', reviewSchema);