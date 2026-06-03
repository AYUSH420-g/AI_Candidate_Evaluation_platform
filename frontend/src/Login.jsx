import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
function Login()
{

    const [email, setemail] = useState("");
    const [pass, setpass] = useState("");
    const navigate=useNavigate();

    async function handleLogin(e) {
        
            e.preventDefault();

            try{
                const res=await axios.post("http://localhost:5010/auth/login",{
                    
                        Email:email,
                        Password:pass
                    
                })
                
                const {token,role}=res.data;
                localStorage.setItem("token",token);
                localStorage.setItem("role",role);

                if (role === "admin") {
                    navigate("/Opening");
                }
                else if(role === "recruiter")
                {
                    navigate("/Project");
                }
                
            }
            catch(err)
            {
                console.log(err);
            }
    }
    return (
  <div className="flex min-h-screen items-center justify-center bg-gray-100">
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
      
      <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
        Login
      </h1>

      <form onSubmit={handleLogin} className="space-y-4">

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            placeholder="Enter your email"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={pass}
            onChange={(e) => setpass(e.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Login
        </button>

      </form>
    </div>
  </div>
);
}
export default Login;