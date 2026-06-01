import { useNavigate } from "react-router-dom"
function Home(){

    const navigate=useNavigate();
    function handleAuth()
  {
    navigate("/Signup");
  }
return(
    <div>
      <div>
        <h1>welcome to AI Candidate Evaluator</h1>
      </div>

      <div>
        <button onClick={handleAuth}>SignUp</button>
      </div>

    </div>
);
}
export default Home;

  