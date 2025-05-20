import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/navbar.jsx';
import axios from 'axios';
import userPS from '../../assets/userPS.png';
import StaticStar from '../../components/stars_static/StaticStar.jsx';

function Mentor_Request() {
    const [mentorList, setMentorList] = useState([]);
    const [avgStars, setAvgStars] = useState({});
    const [filtered_data, SetFiltered_data] = useState([]);
    const [mentor_email, setMentor_email] = useState('');
    const [mentor_language, setMentor_language] = useState('');
    const [popup, setPopup] = useState(false);

    // Fetch avg star for a specific mentor
    async function GetAvgStar(email, language) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/mentee/avg-rating/${email}/${language}`,
          {
            headers: {Authorization: `Bearer ${token}`},
          }
        );
        setAvgStars((prev) => ({
          ...prev,
          [`${email}-${language}`]: response.data,
        }));
      } catch (err) {
        console.log(`Error fetching avg star for ${email}-${language}:`, err);
      }
    }

    // Fetch available mentors on mount
    useEffect(() => {
      async function GetAvailableMentors() {
        try {
          const token = localStorage.getItem("token");
          const email = localStorage.getItem("email");
          const language = localStorage.getItem("language_name");
          const response = await axios.get(
            `http://localhost:5000/mentee/mentors/${email}/${language}`,
            {
              headers: {Authorization: `Bearer ${token}`},
            }
          );
          setMentorList(response.data);
          console.log("mentor list: ", response.data);
        } catch (err) {
          console.log("Error fetching mentors:", err);
        }
      }
      GetAvailableMentors();
    }, []);

    // Fetch average stars once mentorList changes
    useEffect(() => {
      if (mentorList.length === 0) return;
      mentorList.forEach(({mentor_email, language_name}) => {
        GetAvgStar(mentor_email, language_name);
      });
    }, [mentorList]);

    // Fetch mentor feedback and show popup
    async function GetMentee_review(email, language) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/faculty/mentor-feedback/${email}/${language}`,
          {
            headers: {Authorization: `Bearer ${token}`},
          }
        );
        SetFiltered_data(response.data);
        setMentor_email(email);
        setMentor_language(language);
        setPopup(true);
      } catch (err) {
        console.log(err);
      }
    }

    // Send mentor request
    async function PostMentee_req_to_mentor(mentor_email, language) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          "http://localhost:5000/mentee/request",
          {
            student_email: localStorage.getItem("email"),
            mentor_email,
            language_name: language,
          },
          {
            headers: {Authorization: `Bearer ${token}`},
          }
        );
        console.log("mentor request sent status...", response.data);
        window.location.reload();
      } catch (err) {
        console.log(err);
      }
    }
    
    return (
        <div className="flex h-screen w-full">
            <Navbar />
            <div className="flex-1 flex flex-col">
                <header className="h-[64px] bg-white px-10 py-4 shadow text-xl font-semibold sticky top-0 z-10">
                    PS Mentorship
                </header>

                <main className={`p-6 overflow-y-auto bg-gray-100 flex-1 ${mentorList.length === 0 && 'flex lg:items-center justify-center'}`}>
                    {mentorList.length === 0 && (
                        <p className='text-gray-700 text-center lg:text-lg'>No Mentors Available</p>
                    )}


                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                        {mentorList.map((data, id) => {
                            const avgKey = `${data.mentor_email}-${data.language_name}`;
                            const avgRating = avgStars[avgKey] || 0;

                            return (
                                <div key={id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
                                    <div className="flex flex-row">
                                        <img src={userPS} alt="user" className="w-17 h-17 m-2 bg-gray-300 rounded-full" />
                                        <div className="flex flex-col justify-center sm:ml-4">
                                            <h3 className="text-xl font-semibold">{data.mentor_name}</h3>
                                            <p className="text-base text-gray-600">{data.mentor_email}</p>
                                            <p className="text-base text-black font-medium my-1">
                                                {data.language_name}{" Level- "}
                                                <span className="font-medium text-violet-700">{data.mentor_level}</span>
                                            </p>
                                            {!avgRating || avgRating === 0 ? "-" : <StaticStar count={avgRating} />}
                                            <p
                                                className='text-gray-600 hover:underline hover:cursor-pointer mb-2 w-fit'
                                                onClick={() => GetMentee_review(data.mentor_email, data.language_name)}
                                            >
                                                View Feedback
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`text-white rounded-sm bg-[#7D53F6] p-2 hover:cursor-pointer text-center ${!avgRating || avgRating===0 ? 'mt-4':'mt-2'}`} 
                                    onClick={()=>PostMentee_req_to_mentor(data.mentor_email , data.language_name)}
                                    >Request to mentor</div>

                                </div>
                            );
                        })}
                    </div>

                    {/* Feedback popup */}
                    {popup && (
                        <div className="px-3 lg:px-0 fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-30 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
                                <h2 className="text-lg font-semibold mb-4">Mentee Feedback for {mentor_email}</h2>
                                {filtered_data.length === 0 ? (
                                    <p>No feedback available.</p>
                                ) : (
                                    <ul className="list-disc ml-5 text-gray-800 space-y-1">
                                        {filtered_data.map((item, index) => (
                                            <li key={index}>{item.feedback}</li>
                                        ))}
                                    </ul>
                                )}
                                <button
                                    className="mt-4 bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700 hover:cursor-pointer"
                                    onClick={() => setPopup(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default Mentor_Request;