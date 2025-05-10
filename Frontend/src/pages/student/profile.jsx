import React from 'react';
import Navbar from '../../components/navbar/navbar';
import profilePic from '../../assets/userPS.png'; 

function Profile() {
const user = {
name: 'Gowtham',
email: 'gowthamj.al24@bitsathy.ac.in',
points: 1200,
};

return (
<div className='flex w-full h-screen bg-gray-100'>
    <Navbar />
    <div className="flex-1 flex flex-col">
    <header className="h-[64px] bg-white px-10 py-4 shadow text-xl font-semibold sticky top-0 z-10 ml">
        PS Mentorship
    </header>

    <div className='p-4 overflow-y-auto flex justify-center items-center h-fit'>
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-[#7D53F6] to-indigo-500 p-6 text-white flex flex-col lg:flex-row items-center lg:items-end justify-between">
            <div className="flex flex-col items-center lg:flex-row lg:items-center gap-6">
            <img
                src={profilePic}
                alt="Profile"
                className="w-24 h-24 lg:w-28 lg:h-28 rounded-full border-4 border-white shadow-md"
            />
            <div className="text-center lg:text-left">
                <h2 className="text-2xl lg:text-3xl font-bold">{user.name}</h2>
                <p className="text-sm lg:text-base text-gray-200">{user.email}</p>
            </div>
            </div>

            <div className="mt-4 lg:mt-0">
            <div className="bg-white text-[#7D53F6] font-bold rounded-xl px-4 py-2 shadow text-center">
                Reward Points: {user.points}
            </div>
            </div>
        </div>

        {/* Info Section */}
        <div className="p-6 space-y-6 text-gray-700 text-center lg:text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg shadow">
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-lg font-medium">{user.name}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg font-medium">{user.email}</p>
            </div>
            </div>


        </div>
        </div>
    </div>
    </div>
</div>
);
}

export default Profile;
