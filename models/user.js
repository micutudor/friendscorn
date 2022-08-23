const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://tudor:54iZ0e3XFYfO9QNm@cluster0.ui1htjd.mongodb.net/?retryWrites=true&w=majority');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        unique: [true, "Username in use!"],
    },
    password: { 
        type: String,
        minLength: [6, "Password must have minimum 6 characters!"]
    },
    email: {
        type: String,
        unique: [true, "Email in use!"],
    },
    friendships: [mongoose.Schema.Types.ObjectId],
    createdAt: {
        type: Date,
        default: () => Date.now(),
    },
    updatedAt: {
        type: Date,
        default: () => Date.now(),
    },
});

module.exports = mongoose.model('User', userSchema);