import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './Home';
import SignUp from './Signup';
import Login from "./Login";
import Opening from "./admin/Opening";
import Project from "./recruiter/Project";

function App() {
  
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Signup" element={<SignUp/>}/>
        <Route path="/Login" element={<Login/>}/>
        <Route path="/Opening" element={<Opening/>}/>
        <Route path="/Project" element={<Project/>}/>
      </Routes>
    </BrowserRouter>
  );
  
}

export default App;
