import React, { useState, useEffect } from 'react'
import ps from "../../assets/ps.png"
import userPS from "../../assets/userPS.png"
import logout from "../../assets/logout.png"
import axios from "axios"
import { useNavigate } from "react-router-dom"

// dummy
const dummydata = [
{
"student_name": "Aarav Kumar",
"student_email": "aarav.kumar@example.com",
"language_name": "Python",
"level": "1",
"request_id": "REQ001"
},
{
"student_name": "Diya Sharma",
"student_email": "diya.sharma@example.com",
"language_name": "Java",
"level": "2",
"request_id": "REQ002"
},
{
"student_name": "Vikram Singh",
"student_email": "vikram.singh@example.com",
"language_name": "JavaScript",
"level": "3",
"request_id": "REQ003"
},
{
"student_name": "Sneha Reddy",
"student_email": "sneha.reddy@example.com",
"language_name": "C++",
"level": "1",
"request_id": "REQ004"
},
{
"student_name": "Rahul Mehta",
"student_email": "rahul.mehta@example.com",
"language_name": "Go",
"level": "2",
"request_id": "REQ005"
},
{
"student_name": "Ananya Iyer",
"student_email": "ananya.iyer@example.com",
"language_name": "Rust",
"level": "3",
"request_id": "REQ006"
}
]

function Faculty() {
const [email, setEmail] = useState("");
const [course, setCourse] = useState("");
const [level, setLevel] = useState("");
const [name, setName] = useState("");
const [status, setStatus] = useState("");
const [data, setData] = useState([]);
const navigate = useNavigate();
const [displayTime, setDisplayTime] = useState(true);

async function GetDetails() {
try {
    const response = await axios.get("http://localhost:5000/mentorrequests");
    const email = response.data.student_email;
    const course = response.data.language_name;
    const level = response.data.level;
    const name = response.data.student_name;
    setData(response.data);
    setEmail(email);
    setLevel(level);
    setCourse(course);
    setName(name);
} catch (err) {
    console.error("500 Error from DataBase!!! " + err);
}
}

useEffect(() => {
GetDetails();
}, []);

async function HandleApprove(request_id) {
const status = "approved";
try {
    const response = await axios.put("http://localhost:5000/update-request-status", { request_id, status });
    setStatus(response.data.message);
    GetDetails();
} catch (err) {
    console.error(err || "DB error");
}
}

async function HandleReject(request_id) {
const status = "rejected";
try {
    const response = await axios.put("http://localhost:5000/update-request-status", { request_id, status });
    setStatus(response.data.message);
    GetDetails();
} catch (err) {
    console.error(err || "DB error");
}
}

useEffect(() => {
if (status.length > 0) {
    setDisplayTime(true);
    const timer = setTimeout(() => {
        setDisplayTime(false);
    }, 2000);
    return () => clearTimeout(timer);
}
}, [status]);

return (
<div className="bg-[#EEF1F9] w-full min-h-screen">
{/* Header */}
<div className="flex items-center bg-white h-16 px-4 shadow-md justify-between">
<div className="flex items-center">
    <img className="w-11 h-11 mr-3" src={ps} alt="ps" />
    <h4 className="text-lg font-semibold">PS Mentorship</h4>
</div>
<div
    className="cursor-pointer"
    onClick={() => {
    navigate('/');
    localStorage.clear();
    }}
>
    <img className="w-6 h-6" src={logout} alt="logout" />
</div>
</div>

{/* Status Message */}
<div className="w-full text-center mt-4">
{displayTime && (
    <p
    className={`font-medium ${
        status.includes('rejected') ? 'text-red-600' : 'text-green-600'
    }`}
    >
    {status}
    </p>
)}
</div>

{/* Cards Grid */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
{dummydata.map(
    ({ student_name, student_email, language_name, level, request_id }, id) => (
    <div key={id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
        <div className="flex flex-row items-center">
        <img src={userPS}  alt="user" className="w-24 h-24 rounded-md m-2"/>
        <div className="flex flex-col justify-center sm:ml-4">
            <h3 className="text-xl font-semibold">{student_name}</h3>
            <p className="text-base text-gray-600">{student_email}</p>
            <p className="text-xs mt-2 text-gray-500">Mentorship applied for</p>
            <h4 className="text-lg font-medium">{`${language_name} level-${level}`}</h4>
            <p>Review</p>
        </div>
        </div>

        {/* Buttons */}
        <div className="flex mt-4 gap-2">
        <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded-sm" onClick={() => HandleApprove(request_id)} >
            Approve
        </button>
        <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded-sm" onClick={() => HandleReject(request_id)}>
            Reject
        </button>
        </div>
    </div>
    )
)}
</div>
</div>

)
}

export default Faculty;
