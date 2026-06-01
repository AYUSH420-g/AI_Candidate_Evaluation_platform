import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function SignUp()
{
        const [name,setname]=useState("");
        const [email,setemail]=useState("");
        const [pass,setpass]=useState("");
        const [ans,setans]=useState("");
        const navigate=useNavigate();

        async function authSignup (e){


            e.preventDefault();
            try{
            const res=await axios.post("http://localhost:5010/auth",{

                Name:name,
                Email:email,
                Password:pass

            });

            const response=await res.data;
            setans(response);

            if(response.role==='user')
                navigate("/");
            console.log(ans);
        }
        catch(err){
            console.log(err);
        }

        }

    return(
        <div>
            <div>

                <h1>Signup page</h1>
            </div>

            <div>
                <form onSubmit={authSignup}>
                    <input type="text" placeholder="Enter your name.."
                        value={name}
                        onChange={(e)=>setname(e.target.value)}
                        required/>
                        <br></br>

                         <input type="text" placeholder="Enter your email.."
                        value={email}
                        onChange={(e)=>setemail(e.target.value)}
                        required/>
                        
                        <br></br>
                         <input type="text" placeholder="Enter your password.."
                        value={pass}
                        onChange={(e)=>setpass(e.target.value)}
                        required/>
                        
                        <input type="submit"
                        value="subbmit" />
                        
                </form>
            </div>
        </div>
    );
}
export default SignUp;