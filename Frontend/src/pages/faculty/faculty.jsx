import ps from "../../assets/ps.png"
import userPS from "../../assets/userPS.png"
import logout from "../../assets/logout.png"

import React, { useState, useEffect } from 'react'
import axios from "axios"
import { useNavigate } from "react-router-dom"
import StaticStar from '../../components/stars_static/StaticStar'
import { ToastContainer,toast,Bounce } from "react-toastify"

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


// ahora -- 10-05-2025
const [rejectPopup,setRejectPopup] = useState(false);
const [Rej_Mentor,setRej_Mentor] = useState("");
const [Rej_Mentor_Email,setRej_Mentor_Email] = useState("");
const [Rej_Skill,setRej_Skill] = useState("");
const [Rej_Level,setRej_Level] = useState("");
const [feedBack , setFeedBack] = useState("");
const [warning ,setWarning] = useState(false);

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

// toast success notification
    toast.success('Mentor approved', {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Bounce,
    });

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
    toast.error('Mentor rejected', {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Bounce,
    });
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


// Faculty reject Handle pop up:

function HandlePopUp(name , email ,skill ,level)
{
    setRejectPopup(true);
    setRej_Mentor(name);
    setRej_Mentor_Email(email);
    setRej_Skill(skill);
    setRej_Level(level);
}
return (
<div className="bg-[#EEF1F9] w-full min-h-screen">

    <div className="flex items-center bg-white h-16 px-4 shadow-md justify-between fixed w-full">
        <div className="flex items-center">
            <img className="w-11 h-11 mr-3" src={ps} alt="ps" />
            <h4 className="text-lg font-semibold">PS Mentorship</h4>
        </div>
        <div className="cursor-pointer" onClick={() => { navigate('/'); localStorage.clear(); }}>
            <img className="w-6 h-6" src={logout} alt="logout" />
        </div>
    </div>

    {/* accept and reject */}
    <ToastContainer
    position="top-center"
    autoClose={5000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick={false}
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light"
    transition={Bounce}
    />

{rejectPopup && 
<div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)] bg-opacity-50" onClick={() => {setRejectPopup(false),setWarning(false)}}>
<div className="bg-white rounded-xl px-6 py-4 shadow-xl w-sm lg:w-xl" onClick={(e) => e.stopPropagation()}>
    <h1 className="text-xl font-medium pt-2 pb-4">PS Mentorship</h1>
    <h1 className="flex text-[#727272] text-lg  ">Name: <span><h1 className="pl-2 text-black  ">{Rej_Mentor}</h1></span></h1>
    <h1 className="flex text-[#727272] text-lg  ">Email: <span><h1 className="pl-2 text-black  ">{Rej_Mentor_Email}</h1></span></h1>
    <h1 className="flex text-[#727272] text-lg  ">Skill: <span><h1 className="pl-2 text-black  ">{Rej_Skill}</h1></span></h1>
    <h1 className="flex text-[#727272] text-lg  ">Level: <span><h1 className="pl-2 text-black  ">{Rej_Level}</h1></span></h1>
    <hr className="mt-2 text-[#727272]"/>
    <h1 className="mt-3 text-[#727272] text-lg">Reason</h1>
    <textarea className="w-full h-[150px] bg-[#EEF1F9] border-none focus:outline-none p-2" placeholder="Enter reason" onChange={(e)=>setFeedBack(e)}/>
        {warning && <p className="text-center text-red-500">Feedback can't be empty</p>}
    <div className="bg-[#8A64F7] text-center p-2 rounded-sm text-white mt-2 hover:cursor-pointer hover:bg-[#744FE1]" onClick={()=> {feedBack.length !==0 && HandleReject() , feedBack.length!==0 && setRejectPopup(false), feedBack.length===0 && setWarning(true)}}>Submit</div>
</div>
</div>
}



{/* Status Message
<div className="w-full text-center pt-18">
{displayTime && (
    <p
    className={`font-medium ${
        status.includes('rejected') ? 'text-red-600' : 'text-green-600'
    }`}
    >
    {status}
    </p>
)}
</div> */}

{/* Cards Grid */}
<div className="pt-30 mt-2 grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
{dummydata.map(
    ({ student_name, student_email, language_name, level, request_id }, id) => (
    <div key={id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
        <div className="flex flex-row">
        <img src={userPS}  alt="user" className="w-22 h-22 rounded-md m-2"/>
        <div className="flex flex-col justify-center sm:ml-4">
            <h3 className="text-xl font-semibold">{student_name}</h3>
            <p className="text-base text-gray-600">{student_email}</p>
            <p className="text-xs mt-2 text-gray-500">Mentorship applied for</p>
            <h4 className="text-lg  ">{`${language_name} level-${level}`}</h4>                                         {/*this is for setting mentor_review*/}
            <StaticStar count={4}/>
            <p className='text-gray-500 hover:cursor-pointer hover:underline w-fit' onClick={()=>{localStorage.setItem("mentor_review",student_name); navigate('/login/faculty/review')}}>Review</p>
        </div>
        </div>

        {/* Buttons */}
        <div className="flex mt-4 gap-2">
        <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded-sm hover:cursor-pointer"  onClick={() => HandleApprove(request_id)}>
            Approve
        </button>
        <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded-sm hover:cursor-pointer"  onClick={() =>{ HandlePopUp(student_name,student_email,language_name,level) ,setFeedBack("")}}>
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
