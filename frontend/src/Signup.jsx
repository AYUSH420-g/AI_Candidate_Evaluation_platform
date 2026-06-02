import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SignUp() {
    const [name, setname] = useState("");
    const [email, setemail] = useState("");
    const [pass, setpass] = useState("");
    const [ans, setans] = useState("");

    const navigate = useNavigate();

    async function authSignup(e) {
        e.preventDefault();

        try {
            const res = await axios.post("http://localhost:5010/auth/signup", {
                Name: name,
                Email: email,
                Password: pass,
            });

            const response = res.data;
            setans(response);

            navigate("/Login");
            
            

            console.log(response);
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    Sign Up
                </h1>

                <form onSubmit={authSignup} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setname(e.target.value)}
                        required
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setemail(e.target.value)}
                        required
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={pass}
                        onChange={(e) => setpass(e.target.value)}
                        required
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
                    >
                        Sign Up
                    </button>
                </form>

                {ans && (
                    <p className="mt-4 text-center text-sm text-green-600">
                        Signup successful!
                    </p>
                )}
            </div>
        </div>
    );
}

export default SignUp;