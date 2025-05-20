import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import image from "../../assets/ps.png";
import google from "../../assets/google.png";

function Login() {
    
localStorage.clear();
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState(null);
const navigate = useNavigate();

const handlelogin = async (e) => {
e.preventDefault();
try {
    const response = await axios.post("http://localhost:5000/auth/login", {
    email,
    password,
    });

    if (response.data) {
    const { role, id, name, email,token } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("student_id", id);
    localStorage.setItem("name", name);
    localStorage.setItem("email", email);

    if (role === "student") navigate("/login/student/mycourses");
    else if (role === "faculty") navigate("/login/faculty");
    } else {
    setError("Invalid username or password");
    }
} catch (error) {
    setError(error.response?.data?.message || "An error occurred during login");
}
};

return (
<div className="flex justify-center items-center min-h-screen bg-[#EEF1F9] px-4">
    <div className="bg-white shadow-md rounded-xl w-full max-w-md p-6 sm:p-8">
    {/* Header */}
    <div className="flex justify-center items-center space-x-3 mb-5">
        <img src={image} alt="logo" className="h-10 w-10" />
        <h4 className="text-lg font-semibold text-black">PS Mentorship</h4>
    </div>

    {/* Welcome Back */}
    <h1 className="text-xl font-semibold text-[#8057F6] text-center mb-6">Hi, Welcome Back!</h1>

    {/* Form */}
    <form onSubmit={handlelogin} className="space-y-4">
        <div>
        <label className="block text-sm text-black mb-1">Username</label>
        <input
            type="text"
            placeholder="Enter your username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-[#ECEEF5] bg-[#EEF1F9] text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#7D53F6]"
        />
        </div>
        <div>
        <label className="block text-sm text-black mb-1">Password</label>
        <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-[#ECEEF5] bg-[#EEF1F9] text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#7D53F6]"
        />
        </div>

        {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
        type="submit"
        className="hover:cursor-pointer w-full h-11 bg-[#7D53F6] text-white text-lg rounded-md hover:opacity-90 transition"
        >
        Login
        </button>
    </form>

    {/* Or */}
    <div className="flex justify-center my-4">
        <p className="text-gray-500">or</p>
    </div>

    {/* Google Button */}
    <div className="flex justify-center">
        <button
        type="button"
        className="flex items-center border border-[#ECEEF5] rounded-md px-4 py-2 bg-white hover:shadow-md transition"
        >
        <img src={google} alt="google" className="w-5 h-5" />
        <span className="ml-2 text-sm text-black">Sign in with Google</span>
        </button>
    </div>
    </div>
</div>
);
}

export default Login;
