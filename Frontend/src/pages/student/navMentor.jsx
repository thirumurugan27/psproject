import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/navbar';
import userPS from '../../assets/userPS.png';
import axios from 'axios';
import Stars from '../../components/stars_edit/stars';

function NavMentor() {
  const [mentor_details, SetMentor_details] = useState([]);
  const [mentorBooked_slot, setMentorBooked_slot] = useState([]);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(0);
  const [warning, setWarning] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const mentee_email = localStorage.getItem('email');

  useEffect(() => {
    async function GetMentorDetail() {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:5000/mentee/mentor-detail/${mentee_email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        SetMentor_details(response.data);
        console.log("Mentor details:", response.data);
      } catch (err) {
        console.error(
          "Error fetching mentor details:",
          err.response?.data || err.message
        );
      }
    }

    async function GetMenteeSlot() {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:5000/mentee/slot/${mentee_email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("slot get:",response.data);
        
        setMentorBooked_slot(response.data);
        console.log("Mentee slot:", response.data);
      } catch (err) {
        console.error(
          "Error fetching slot:",
          err.response?.data || err.message
        );
      }
    }

    GetMentorDetail();
    GetMenteeSlot();
  }, [mentee_email]);
  
  async function PostFeedback_to_mentor(payload) {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:5000/mentee/feedback`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Feedback submitted:", response.data);
      setShowFeedbackPopup(false);
      setFeedbackText("");
      setRating(0);
      window.location.reload();
    } catch (err) {
      console.error("Feedback error:", err.response?.data || err.message);
    }
  }
  

  const handleSubmitFeedback = () => {
    if (feedbackText.trim() === '' || rating === 0) {
      setWarning(true);
      return;
    }

    const payload = {
      mentor_email: selectedVenue?.mentor_email,
      mentee_email: selectedVenue?.mentee_email,
      language_name: selectedVenue?.language,
      feedback: feedbackText,
      rating: rating
    };

    PostFeedback_to_mentor(payload);
  };

  return (
    <div className="flex h-screen w-full">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <header className="h-[64px] bg-white px-10 lg:px-6 py-4 shadow text-xl font-semibold sticky top-0 z-10">
          PS Mentorship
        </header>

        <main className="p-6 overflow-y-auto bg-gray-100 flex-1 flex justify-center lg:items-center flex-col">
          {mentor_details.length === 0 && (
            <p className="text-[#5F6388] text-lg">
              No mentorship history found.
            </p>
          )}

          {showPopup && (
            <div
              className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50"
              onClick={() => setShowPopup(false)}
            >
              <div
                className="bg-white rounded-lg p-6 lg:w-1/3 w-full mx-5 lg:mx-0"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-semibold mb-4">Venue Details</h2>
                <p>
                  <strong>Booking Date: </strong>
                  {new Date(mentorBooked_slot[0]?.date).toLocaleDateString(
                    "en-GB"
                  )}
                </p>
                <p>
                  <strong>Start Time:</strong>{" "}
                  {mentorBooked_slot[0]?.start_time}
                </p>
                <p>
                  <strong>End Time:</strong> {mentorBooked_slot[0]?.end_time}
                </p>
                <p>
                  <strong>Level:</strong> {mentorBooked_slot[0]?.level}
                </p>
                <p>
                  <strong>Venue:</strong> {mentorBooked_slot[0]?.slot_venue}
                </p>
                <button
                  className="mt-4 w-full bg-[#7D53F6] text-white py-2 rounded hover:cursor-pointer"
                  onClick={() => setShowPopup(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {mentor_details.map((data, id) => (
            <div
              key={id}
              className="bg-white rounded-xl shadow-md p-6 w-full max-w-md mx-auto mb-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center">
                <img
                  src={userPS}
                  alt="Mentor"
                  className="w-20 h-20 rounded-full border border-gray-300 shadow-sm mx-auto sm:mx-0"
                />
                <div className="sm:ml-5 mt-4 sm:mt-0 text-center sm:text-left">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {data.mentor_name}
                  </h3>
                  <p className="text-sm text-gray-600">{data.mentor_email}</p>
                  <div className="mt-3 text-sm text-gray-700">
                    <p className="font-semibold">Duration of Mentorship:</p>
                    <p className="text-gray-600">
                      {data.start_date} to {data.end_date}
                    </p>
                  </div>
                  <p className="text-sm mt-2 text-gray-700">
                    <span className="font-semibold">Skill:</span>{" "}
                    <span className="text-indigo-600 font-medium">
                      {data.language_name}
                    </span>{" "}
                    | <span className="font-semibold">Level:</span>{" "}
                    <span className="font-medium">{data.mentor_level}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-around items-center mt-4 gap-2 text-sm">
                <span
                  className={`px-4 py-1 rounded-full font-semibold ${
                    data.status === "ongoing"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {data.status === "ongoing"
                    ? "Mentorship: Ongoing"
                    : "Mentorship: Ended"}
                </span>

                <span className="flex items-center space-x-2">
                  <p className="text-gray-700 font-medium">Mentee slot:</p>
                  <span
                    className={`px-4 py-1 rounded-full font-semibold ${
                      mentorBooked_slot[0]?.level_cleared === "ongoing"
                        ? "bg-green-100 text-green-700"
                        : mentorBooked_slot[0]?.level_cleared === "no"
                        ? "bg-red-600 text-white"
                        : mentorBooked_slot[0]?.level_cleared === "yes"
                        ? "bg-green-700 text-white"
                        : "bg-orange-500 text-white"
                    }`}
                  >
                    {mentorBooked_slot[0]?.level_cleared === "no"
                      ? "Failed"
                      : mentorBooked_slot[0]?.level_cleared === "yes"
                      ? "Completed"
                      : mentorBooked_slot[0]?.level_cleared === "ongoing"
                      ? "ongoing"
                      : "not booked"}
                  </span>
                </span>

                {mentorBooked_slot[0]?.level_cleared === "ongoing" && (
                  <p
                    className="text-gray-700 hover:underline mt-3 hover:cursor-pointer"
                    onClick={() => setShowPopup(true)}
                  >
                    View Venue
                  </p>
                )}
              </div>

              {mentor_details[0]?.menteef === "no" &&
                (mentorBooked_slot[0]?.level_cleared === "yes" ||
                  mentorBooked_slot[0]?.level_cleared === "no") && (
                  <div className="mt-5">
                    <button
                      onClick={() => {
                        setSelectedVenue({
                          mentor_email: data.mentor_email,
                          mentee_email: mentee_email,
                          language: data.language_name,
                        });
                        setShowFeedbackPopup(true);
                      }}
                      className="w-full bg-[#7D53F6] hover:bg-[#744ee5] text-white py-2 rounded-md font-semibold transition duration-200"
                    >
                      Feedback
                    </button>
                  </div>
                )}
              {mentorBooked_slot[0]?.menteef === "yes" && (
                <span>
                  <p className="text-gray-700 mt-3">Feedback given</p>
                </span>
              )}
            </div>
          ))}

          {/* Feedback Popup */}
          {showFeedbackPopup && selectedVenue && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)]"
              onClick={() => {
                setShowFeedbackPopup(false);
                setWarning(false);
              }}
            >
              <div
                className="bg-white rounded-xl px-6 py-4 shadow-xl w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <h1 className="text-xl font-medium pt-2 pb-4">Feedback</h1>
                <p className="text-[#727272] text-lg">
                  Mentor Email:{" "}
                  <span className="text-black pl-2">
                    {selectedVenue.mentor_email}
                  </span>
                </p>
                <p className="text-[#727272] text-lg">
                  Mentee Email:{" "}
                  <span className="text-black pl-2">
                    {selectedVenue.mentee_email}
                  </span>
                </p>
                <p className="text-[#727272] text-lg">
                  Skill:{" "}
                  <span className="text-black pl-2">
                    {selectedVenue.language}
                  </span>
                </p>

                <div className="mt-3">
                  <p className="text-[#727272] text-lg mb-1">Rating</p>
                  <Stars value={rating} onChange={setRating} />
                </div>

                <div className="mt-3">
                  <p className="text-[#727272] text-lg mb-1">Feedback</p>
                  <textarea
                    className="w-full h-[150px] bg-[#EEF1F9] border-none focus:outline-none p-2"
                    placeholder="Write your feedback here..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                  />
                </div>

                {warning && (
                  <p className="text-center text-red-500 mt-2">
                    Please provide both rating and feedback.
                  </p>
                )}

                <div
                  className="bg-[#8A64F7] text-center p-2 rounded-sm text-white mt-4 hover:cursor-pointer hover:bg-[#744FE1]"
                  onClick={handleSubmitFeedback}
                >
                  Submit
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default NavMentor;
