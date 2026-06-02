import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './Home';
import SignUp from './Signup';

function App() {
  
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Signup" element={<SignUp/>}/>
      </Routes>
    </BrowserRouter>
  );
  
}

export default App;
