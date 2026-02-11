import { Route, Routes, BrowserRouter } from "react-router-dom";
import "../css/App.css";
import Home from "./Home";
import { AuthProvider } from "../component/AuthProvider";
import NavBar from "../component/Navbar";
import Login from "./Login";
import Register from "./Register";
import Adm_query from "./admin_query";
import AdminRoute from "../component/AdminRoute";
import UserRoute from "../component/UserRoute";
import New_req from "./new_req";

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
            <Route path="/register" element={<Register />} />
            <Route
              path="/query"
              element={
                <AdminRoute>
                  <Adm_query />
                </AdminRoute>
              }
            />
            <Route
              path="/new-request"
              element={
                <UserRoute>
                  <New_req />
                </UserRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
