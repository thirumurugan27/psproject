import React, { useState } from "react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import image from "../../assets/ps.png"
import google from "../../assets/google.png"
import "../Login/login.css"
function Login() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState(null);
const navigate = useNavigate();

const handlelogin = async (e) => {
e.preventDefault();
try {
    const response = await axios.post("http://localhost:5000/user/login", {email,password});

    if (response.data) {
    console.log(response.data.role);

    const role = response.data.role;
    const student_id = response.data.id;
    const name = response.data.name;
    const email = response.data.email;

    localStorage.setItem("role",role);
    localStorage.setItem("student_id", student_id);
    localStorage.setItem("name", name);
    localStorage.setItem("email",email);
    
    if (role === "student")
        navigate(`/login/student`)
    else if (role === "faculty")
        navigate("/login/faculty")
    }
    else {
    setError("Invalid username or password");
    }
} catch (error) {
    setError(
    error.response?.data?.message || "An error occurred during login"
    );
}
};

return (
<div className="outer">
    <div className="loginbox">
    <div className="header">
        <img
        src={image}
        alt=""
        style={{ height: "45px", width: "40px" }}
        />
        <h4 style={{ fontWeight: 600, marginLeft: "10px", fontSize: "18px" ,color:"black" ,alignSelf:"center"}}>
        PS Mentorship
        </h4>
    </div>
    <div className="header2">
        <h1 style={{ fontWeight: 600, color: "#8057F6", fontSize: 21, fontFamily: '"Segoe UI", sans-serif' }}>
        Hi, Welcome Back!
        </h1>
    </div>
    <div className="inputbox">
        <p style={{color:"black"}}>Username</p>
        <input
        type="text"
        placeholder="Enter your username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        
        />
        <p style={{color:"black"}}>Password</p>
        <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        />
    </div>
    {error && (
        <div
        style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "2px",
        }}
        >
        <p style={{ color: "red", fontSize: "14px" }}>{error}</p>
        </div>
    )}
    <button className="loginbtn" onClick={handlelogin}>
        Login
    </button>
    <div className="footer">
        <p>or</p>
    </div>
    <div className="outgoogle">
        <div className="google">
        <img
            src={google}
            alt="google"
            style={{ height: "20px", width: "20px",alignSelf:"center" }}
        />
        <p style={{marginLeft: "5px", fontSize: "13px" ,alignSelf:"center",color:"black"}}>
            Sign in with Google
        </p>
        </div>
    </div>
    </div>
</div>
);
}

export default Login;

