import mongoose from "mongoose";

const user=new mongoose.Schema({

    Name:{
        type: String,
        required: true

    },

    Email:{
        type: String,
        unique: true,
        required: true

    },

    Password:{
        type: String,
        required: true,
        minlength: [6,'Min length should be 6 characters']
    },

    Role:{

    }

});

const User=mongoose.model('User',user);
export default User;