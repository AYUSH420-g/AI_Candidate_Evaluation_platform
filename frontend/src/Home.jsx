import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  function handleAuth() {
    navigate("/Signup");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-10 text-center max-w-lg w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Welcome to AI Candidate Evaluator
        </h1>

        

        <button
          onClick={handleAuth}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
        >
          Sign Up
        </button>
        <p>already have an account? <Link to="/Login" className="text-blue-600 hover:underline">Login</Link> </p>
      </div>
    </div>
  );
}

export default Home;