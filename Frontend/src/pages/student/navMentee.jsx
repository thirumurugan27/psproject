import React, {useEffect, useState} from "react";
import Navbar from "../../components/navbar/navbar";
import userPS from "../../assets/userPS.png";
import axios from "axios";
import Stars from "../../components/stars_edit/stars.jsx";

function NavMentee() {
  const [mentee_list, setMentee_list] = useState([]);
  const [showVenuePopup, setShowVenuePopup] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [slotPopup, setSlotPopup] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [currentMentee, setCurrentMentee] = useState(null);

  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackMentee, setFeedbackMentee] = useState(null);

  const timeSlots = [
    "08:45:00",
    "10:30:00",
    "11:40:00",
    "14:20:00",
    "15:30:00",
  ];

  useEffect(() => {
    const controller = new AbortController();

    async function GetMenteeDetails() {
      try {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("email");

        const response = await axios.get(
          `http://localhost:5000/mentor/menteeslist/${email}`,
          {
            headers: {Authorization: `Bearer ${token}`},
            signal: controller.signal,
          }
        );

        setMentee_list(response.data);
        console.log("mentee_list for mentor: ", response.data);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Request cancelled");
        } else {
          console.error(
            "Error fetching mentee list:",
            err.response?.data || err.message
          );
        }
      }
    }

    GetMenteeDetails();

    return () => controller.abort();
  }, []);

  const handleOpenSlotPopup = (mentee) => {
    setCurrentMentee(mentee);
    setSlotPopup(true);
  };

  const handleBookSlot = async () => {
    if (!selectedSlot || !currentMentee) {
      alert("Please select a slot first.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/mentor/slot",
        {
          mentor_email: localStorage.getItem("email"),
          mentee_email: currentMentee.mentee_email,
          language_name: currentMentee.language_name,
          level: currentMentee.mentee_current_level,
          start_time: selectedSlot,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Slot booked successfully!");
      setSlotPopup(false);
      setSelectedSlot("");
      setCurrentMentee(null);

      // Refresh list
      const refreshed = await axios.get(
        `http://localhost:5000/mentor/menteeslist/${localStorage.getItem(
          "email"
        )}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        }
      );
      setMentee_list(refreshed.data);
    } catch (err) {
      console.error("Booking failed:", err.response?.data || err.message);
      alert("Failed to book slot.");
    }
  };

  const handleViewVenue = (data) => {
    setSelectedVenue(data);
    setShowVenuePopup(true);
  };

  const handleOpenFeedback = (mentee) => {
    setFeedbackMentee(mentee);
    setFeedbackText("");
    setFeedbackRating(0);
    setShowFeedbackPopup(true);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackRating || !feedbackText.trim()) {
      alert("Please provide both rating and feedback.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/mentor/feedback",
        {
          mentor_email: localStorage.getItem("email"),
          mentee_email: feedbackMentee.mentee_email,
          language_name: feedbackMentee.language_name,
          rating: feedbackRating,
          feedback: feedbackText,
        },
        {
          headers: {Authorization: `Bearer ${token}`},
        }
      );

      alert("Feedback submitted successfully!");
      setShowFeedbackPopup(false);

      // Refresh list
      const refreshed = await axios.get(
        `http://localhost:5000/mentor/menteeslist/${localStorage.getItem(
          "email"
        )}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        }
      );
      setMentee_list(refreshed.data);
    } catch (err) {
      console.error("Feedback error:", err.response?.data || err.message);
      alert("Error submitting feedback.");
    }
  };

  return (
    <div className="flex w-full h-screen">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <header className="h-[64px] bg-white px-10 lg:px-6 py-4 shadow text-xl font-semibold sticky top-0 z-10">
          PS Mentorship
        </header>

        <main
          className={`p-6 overflow-y-auto bg-gray-100 flex-1 w-full h-full ${
            mentee_list.length === 0
              ? "flex lg:items-center justify-center"
              : ""
          }`}
        >
          {mentee_list.length === 0 ? (
            <p className="text-[#5F6388] text-center text-lg">
              No mentorship history found
            </p>
          ) : (
            <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 lg:px-7 pb-5">
              {mentee_list.map((data, id) => {
                const isBooked = data.slot_booked === "yes";
                return (
                  <div
                    key={id}
                    className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between"
                  >
                    <div className="flex flex-row">
                      <img
                        src={userPS}
                        alt="user"
                        className="w-17 h-17 m-2 bg-gray-300 rounded-full"
                      />
                      <div className="flex flex-col justify-center sm:ml-4">
                        <h3 className="text-xl font-semibold">
                          {data.mentee_name}
                        </h3>
                        <p className="text-base text-gray-600">
                          {data.mentee_email}
                        </p>
                        <p className="text-base">Mentee applied for</p>
                        <p className="font-medium flex text-[16px] my-1">
                          {data.language_name}
                          <span className="pl-1">
                            level {data.mentee_current_level}
                          </span>
                        </p>

                        {isBooked && (
                          <div>
                            <span
                              className={`w-fit mt-1 px-4 py-1 rounded-full font-semibold text-sm ${
                                data.level_cleared === "ongoing"
                                  ? "bg-green-100 text-green-700"
                                  : data.level_cleared === "no" ||
                                    data.level_cleared === "expired"
                                  ? "bg-red-500 text-white"
                                  : "bg-green-700 text-white"
                              }`}
                            >
                              {data.level_cleared === "no"
                                ? "Slot: Failed"
                                : data.level_cleared === "yes"
                                ? "Slot: Completed"
                                : data.level_cleared === "expired"
                                ? "Slot: Expired"
                                : "Slot: Ongoing"}
                            </span>
                            {data.mentorf === "yes" && (
                              <span className="w-fit mt-1 px-4 py-1 rounded-full font-semibold text-sm bg-emerald-500 text-white ml-2">
                                Feedback Sent
                              </span>
                            )}
                            {data.level_cleared === "ongoing" && (
                              <p
                                className="text-gray-700 hover:underline mt-3 hover:cursor-pointer"
                                onClick={() => handleViewVenue(data)}
                              >
                                View Venue
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {!isBooked && (
                      <div className="mt-4">
                        <button
                          className="w-full text-white bg-[#7D53F6] hover:bg-[#683FE0] hover:cursor-pointer py-2 rounded"
                          onClick={() => handleOpenSlotPopup(data)}
                        >
                          Book a Slot
                        </button>
                      </div>
                    )}

                    {isBooked &&
                      (data.level_cleared === "yes" ||
                        data.level_cleared === "no") &&
                      data.mentorf === "no" && (
                        <div
                          className="mt-4 rounded-sm bg-[#7D53F6] hover:cursor-pointer p-2 text-center text-white"
                          onClick={() => handleOpenFeedback(data)}
                        >
                          Feedback
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Slot Popup */}
      {slotPopup && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50"
          onClick={() => {
            setSlotPopup(false);
            setSelectedSlot("");
            setCurrentMentee(null);
          }}
        >
          <div
            className="bg-white rounded-lg p-6 w-[90%] max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Book Slot</h2>
            <label className="block mb-2 text-gray-700 font-medium">
              Slot Timings
            </label>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4 bg-[#F3F4F6]"
            >
              <option value="">Select a time</option>
              {timeSlots.map((time, idx) => (
                <option key={idx} value={time}>
                  {`${time.slice(0, 5)} - ${(parseInt(time.slice(0, 2)) + 1)
                    .toString()
                    .padStart(2, "0")}:${time.slice(3, 5)}`}
                </option>
              ))}
            </select>
            <div className="flex justify-between gap-4">
              <button
                className="flex-1 bg-[#7D53F6] text-white py-2 px-4 rounded w-1/2 hover:cursor-pointer"
                onClick={handleBookSlot}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Venue Popup */}
      {showVenuePopup && selectedVenue && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50"
          onClick={() => setShowVenuePopup(false)}
        >
          <div
            className="bg-white rounded-lg p-6 lg:w-1/3"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold mb-4">Venue Details</h2>
            <p>
              <strong>Booking Date:</strong> {selectedVenue.slot_date}
            </p>
            <p>
              <strong>Start Time:</strong> {selectedVenue.start_time}
            </p>
            <p>
              <strong>End Time:</strong> {selectedVenue.end_time}
            </p>
            <p>
              <strong>Level:</strong> {selectedVenue.slot_booked_level}
            </p>
            <p>
              <strong>Venue:</strong> {selectedVenue.venue}
            </p>
            <button
              className="mt-4 w-full bg-[#7D53F6] text-white py-2 rounded hover:cursor-pointer"
              onClick={() => setShowVenuePopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Feedback Popup */}
      {showFeedbackPopup && feedbackMentee && (
        <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-md">
            <h2 className="text-xl font-semibold mb-4">Provide Feedback</h2>
            <p>
              <strong>Mentee:</strong> {feedbackMentee.mentee_email}
            </p>
            <p>
              <strong>Language:</strong> {feedbackMentee.language_name}
            </p>

            <div className="my-4">
              <label className="block text-gray-700 mb-1">Rating</label>
              <Stars value={feedbackRating} onChange={setFeedbackRating} />
            </div>

            <div className="my-4">
              <label className="block text-gray-700 mb-1">Feedback</label>
              <textarea
                className="w-full border border-gray-300 rounded p-2"
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              ></textarea>
            </div>

            <div className="flex justify-between gap-4">
              <button
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded w-1/2"
                onClick={() => setShowFeedbackPopup(false)}
              >
                Cancel
              </button>
              <button
                className="bg-[#7D53F6] text-white py-2 px-4 rounded w-1/2"
                onClick={handleSubmitFeedback}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NavMentee;
