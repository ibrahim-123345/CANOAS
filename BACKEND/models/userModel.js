const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    NIDA: {
        type: String,
        required: true,
        unique: true},
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);


const createUser=(fullName,NIDA,email,password)=>{
    const newUser = new User({ fullName,NIDA, email, password });
    return newUser.save();


}

module.exports = {User , createUser};