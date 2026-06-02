import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';


const handleSignup=async (req,res)=>{
    try{
        const {Name,Email,Password}=req.body;

        const existingUser = await User.findOne({ Email });

            if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
            }

        if(Password.length<6)
        {
            return res.status(400).json({message:"password must atleast 6 char long"});
        }

        const hashedpass=await bcrypt.hash(Password,10);

        const userData=await User.create({Name,Email,Password:hashedpass});
        // const saveUser=await userData.save();

        res.status(201).json({data:userData});


    }
    catch(err){
        console.log(err);
    }
};

const handleLogin=async(req,res)=>{

    try{
        const {Email,Password}=req.body;

        if(!Password)
            return res.status(400).json({message:"Email or password is missing"});

       
        const user=await User.findOne({Email:Email});

        if(!user)
        {
            return res.status(400).json({message:"email not exist"});
        }

        const isPasswordCorrect = await bcrypt.compare(Password, user.Password);

        if(!isPasswordCorrect)
        {
            return res.status(400).json({message:"pass is incorrect"});
        }

        const token=jwt.sign({id:user._id,role:user.Role},
                    process.env.JWT_SECRET,
                    {expiresIn:'2d'}
            );
        
       
        return res.status(201).json({message:"login successful",token,role:user.Role});

    }
    catch(err)
    {
        console.log(err);
        return res.status(400).json({message:{err}});
    }   
};
export {handleSignup,handleLogin};