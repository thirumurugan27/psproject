import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/navbar';
import profilePic from '../../assets/userPS.png'; 
import axios from 'axios';
function Profile() {
const [profileData , setProfileData] = useState([]);
const [menteeContribution ,setMenteeContribution] = useState([]);
const [contributionPopup , setContributionPopup] = useState(false);

useEffect(() => {
  async function GetRP() {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/student/rp/${localStorage.getItem("email")}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Profile:", response.data);
      setProfileData(response.data);
    } catch (err) {
      console.error(
        "Error fetching profile data:",
        err.response?.data || err.message
      );
    }
  }

  async function Get_mentee_Contribution() {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/mentor/mentorshiprp/${localStorage.getItem(
          "email"
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Mentee contribution: ", response.data);
      setMenteeContribution(response.data.mentees);
    } catch (err) {
      console.error(
        "Error fetching mentee contribution:",
        err.response?.data || err.message
      );
    }
  }

  GetRP();
  Get_mentee_Contribution();
}, []);
  
return (
<div className='flex w-full h-screen bg-gray-100'>
    <Navbar />
    <div className="flex-1 flex flex-col">
        <header className="h-[64px] bg-white px-10 py-4 shadow text-xl font-semibold sticky top-0 z-10 ml">
            PS Mentorship
        </header>
    {
        contributionPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)] bg-opacity-50"  onClick={() => setContributionPopup(false)} >
            <div className="bg-white rounded-xl px-6 py-4 shadow-xl w-sm lg:w-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Student Contribution Details</h2>
            
            {/* Scrollable container */}
            <div className="overflow-x-auto scrollbar-hide pb-5">
                <table className="w-full min-w-[600px] text-sm text-left border">
                <thead>
                    <tr className="bg-[#685DFF] text-white">
                    <th className="p-2">Name</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Skill</th>
                    <th className="p-2">Level</th>
                    <th className="p-2">Reward Points</th>
                    </tr>
                </thead>
                <tbody>
                    {menteeContribution.map((data, index) => (
                    <tr key={index} className={`border-t border-gray-500 ${index%2 !== 0 && 'bg-gray-200'}`}>
                        <td className="p-2">{data.mentee_name}</td>
                        <td className="p-2">{data.mentee_email}</td>
                        <td className="p-2">{data.language_name}</td>
                        <td className="p-2">{data.level}</td>
                        <td className="p-2">{data.level_rp}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
        </div>
        )
    }



    <div className='p-4 overflow-y-auto flex justify-center items-center h-fit'>
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden">

            {/* Profile Header */}
            <div className="bg-gradient-to-r from-[#7D53F6] to-indigo-500 p-6 text-white flex flex-col lg:flex-row items-center lg:items-end justify-between">
            
            {/* Profile Info */}
            <div className="flex flex-col items-center lg:flex-row lg:items-center gap-6">
                <img
                src={profilePic}
                alt="Profile"
                className="w-24 h-24 lg:w-28 lg:h-28 rounded-full border-4 border-white shadow-md"
                />
                <div className="text-center lg:text-left">
                <h2 className="text-2xl lg:text-3xl font-bold">{localStorage.getItem('name')}</h2>
                <p className="text-sm lg:text-base text-gray-200">{profileData.student_email}</p>
                </div>
            </div>
            </div>

            {/* Reward Points Table */}
            <div className="px-6 pt-6">
                    <div className="my-2 mx-1 space-y-6 text-gray-700 text-center lg:text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-2 lg:p-4 rounded-lg shadow">
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-lg font-medium">{localStorage.getItem('name')}</p>
                </div>
                <div className="bg-gray-50 p-2 lg:p-4 rounded-lg shadow">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg font-medium">{profileData.student_email}</p>
                </div>
            </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3 mt-4">Reward Points Overview</h3>
            <div className="overflow-x-auto rounded-lg pb-6">
                <table className="min-w-full text-sm text-gray-700 border border-gray-200 rounded-lg shadow">
                <thead className="bg-gradient-to-r from-[#7D53F6] to-indigo-500  text-white">
                    <tr>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-right">Points</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                    <td className="px-4 py-3 font-medium">Reward points</td>
                    <td className="px-4 py-3 text-right">{profileData.normal_rp}</td>
                    </tr>
                    <tr>
                    <td className="px-4 py-3 font-medium hover:underline hover:cursor-pointer" onClick={()=>setContributionPopup(true)}>Mentorship Points & Summary</td>
                    <td className="px-4 py-3 text-right">{profileData.mentorship_rp}</td>
                    </tr>
                    <tr className="bg-gray-100 font-bold">
                    <td className="px-4 py-3">Total Points</td>
                    <td className="px-4 py-3 text-right">
                        {profileData.normal_rp && (Number(profileData.normal_rp) + Number(profileData.mentorship_rp))}
                    </td>
                    </tr>
                </tbody>
                </table>
            </div>
            </div>



        </div>
    </div>

    </div>
</div>

);
}

export default Profile;
