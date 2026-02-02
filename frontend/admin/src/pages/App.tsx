import { Route, Routes, BrowserRouter } from "react-router-dom";
import "../css/App.css";
import Home from "./Home";
import { AuthProvider } from "../component/AuthProvider";
import NavBar from "../component/Navbar";
import Login from "./Login";

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <div className="nav-block">
            <NavBar />
          </div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
