import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/navbar';
import userPS from '../../assets/userPS.png';
import axios from 'axios';

function NavMentee() {
  const [mentee_list, setMentee_list] = useState([]);
  const [showVenuePopup, setShowVenuePopup] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [slotPopup, setSlotPopup] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [currentMentee, setCurrentMentee] = useState(null);

  const timeSlots = [
    "08:45:00", "10:30:00", "11:40:00", "14:20:00", "15:30:00",
  ];

  useEffect(() => {
    async function GetMenteeDetails() {
      try {
        const response = await axios.get(
          `http://localhost:5000/mentor/menteeslist/${localStorage.getItem('email')}`
        );
        console.log('Mentee details for mentor: ', response.data);
        setMentee_list(response.data);
      } catch (err) {
        console.log(err);
      }
    }
    GetMenteeDetails();
  }, []);

  const openSlotPopup = (mentee) => {
    setCurrentMentee(mentee);
    setSlotPopup(true);
  };

  const handleBookSlot = async () => {
    if (!currentMentee || !selectedSlot) {
      alert("⚠️ Please select a slot time.");
      return;
    }

    const payload = {
      mentor_email: localStorage.getItem('email'),
      mentee_email: currentMentee.mentee_email,
      language_name: currentMentee.language_name,
      start_time: selectedSlot,
    };

    try {
      const res = await axios.post('http://localhost:5000/mentor/slot', payload);
      const venueInfo = res.data;

      // Update mentee_list to reflect updated slot info
      setMentee_list((prevList) =>
        prevList.map((mentee) =>
          mentee.mentee_email === currentMentee.mentee_email
            ? {
                ...mentee,
                slot_booked: 'yes',
                start_time: venueInfo.start_time,
                end_time: venueInfo.end_time,
                slot_date: venueInfo.booking_date,
                venue: venueInfo.venue,
                slot_booked_level: venueInfo.level
              }
            : mentee
        )
      );

      setSlotPopup(false);
      setSelectedSlot('');
      setCurrentMentee(null);
    } catch (error) {
      console.error('Error booking slot:', error);
      alert('❌ Failed to book slot. Please try again.');
    }
  };

  const handleViewVenue = (mentee) => {
    setSelectedVenue({
      booking_date: mentee.slot_date,
      start_time: mentee.start_time,
      end_time: mentee.end_time,
      level: mentee.slot_booked_level,
      venue: mentee.venue,
    });
    setShowVenuePopup(true);
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
            mentee_list.length === 0 ? 'flex lg:items-center justify-center' : ''
          }`}
        >
          {mentee_list.length === 0 ? (
            <p className="text-[#5F6388] text-center text-lg">No mentorship history found</p>
          ) : (
            <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 lg:px-7 pb-5">
              {mentee_list.map((data, id) => {
                const isBooked = data.slot_booked === 'yes';
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
                        <h3 className="text-xl font-semibold">{data.mentee_name}</h3>
                        <p className="text-base text-gray-600">{data.mentee_email}</p>
                        <p className="text-base">Mentee applied for</p>
                        <p className="font-medium flex text-[16px]">
                          {data.language_name}
                          <span className="pl-1">level {data.mentee_current_level}</span>
                        </p>

                        {isBooked && (
                          <p
                            className="text-gray-700 hover:underline mt-3 hover:cursor-pointer"
                            onClick={() => handleViewVenue(data)}
                          >
                            View Venue
                          </p>
                        )}
                      </div>
                    </div>

                    {!isBooked && (
                      <div className="mt-4">
                        <button
                          className="w-full text-white bg-[#7D53F6] hover:bg-[#683FE0] py-2 rounded"
                          onClick={() => openSlotPopup(data)}
                        >
                          Book a Slot
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Slot Booking Popup */}
      {slotPopup && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-md">
            <h2 className="text-xl font-semibold mb-4">Book Slot</h2>
            <label className="block mb-2 text-gray-700 font-medium">Slot Timings</label>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
            >
              <option value="">Select a time</option>
              {timeSlots.map((time, idx) => (
                <option key={idx} value={time}>
                  {`${time.slice(0, 5)} - ${(
                    parseInt(time.slice(0, 2)) + 1
                  ).toString().padStart(2, '0')}:${time.slice(3, 5)}`}
                </option>
              ))}
            </select>
            <div className="flex justify-between gap-4">
              <button
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded w-1/2"
                onClick={() => {
                  setSlotPopup(false);
                  setSelectedSlot('');
                  setCurrentMentee(null);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-[#7D53F6] text-white py-2 px-4 rounded w-1/2"
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
        <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 lg:w-1/3 ">
            <h2 className="text-2xl font-semibold mb-4">Venue Details</h2>
            <p><strong>Booking Date:</strong> {selectedVenue.booking_date}</p>
            <p><strong>Start Time:</strong> {selectedVenue.start_time}</p>
            <p><strong>End Time:</strong> {selectedVenue.end_time}</p>
            <p><strong>Level:</strong> {selectedVenue.level}</p>
            <p><strong>Venue:</strong> {selectedVenue.venue}</p>
            <button
              className="mt-4 w-full bg-[#7D53F6] text-white py-2 rounded"
              onClick={() => setShowVenuePopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NavMentee;
