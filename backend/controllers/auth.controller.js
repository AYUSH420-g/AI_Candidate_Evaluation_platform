import User from "../models/user.model.js";
const handleSignup=async (req,res)=>{
    try{
        const {Name,Email,Password}=req.body;

        if(Password.length<6)
        {
            return res.status(400).json({message:"password must atleast 6 char long"});
        }
        const userData=new User({Name,Email,Password});
        const saveUser=await userData.save();

        res.status(201).json({data:saveUser,role:saveUser.Role});


    }
    catch(err){
        console.log(err);
    }
};
export {handleSignup};