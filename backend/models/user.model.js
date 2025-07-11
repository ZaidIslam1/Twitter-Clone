import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: true
    },

    username: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
        minLength: 6
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],

    profileImg: {
        type: String,
        default: "",
    },

    coverImg: {
        type: String,
        default: "",
    },

    bio: {
        type: String,
        default: "",
    },

    link: {
        type: String,
        default: "",
    },

    likedPosts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },  
    ]


}, {timestamps: true, default: { followers: [], following: [], likedPosts: [] }})

const User = mongoose.model("User", userSchema);

export default User;