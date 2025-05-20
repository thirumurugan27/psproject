import ps from "../../assets/ps.png";
import userPS from "../../assets/userPS.png";
import logout from "../../assets/logout.png";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StaticStar from "../../components/stars_static/StaticStar";
import { ToastContainer, toast, Bounce } from "react-toastify";

function Faculty() {
  const navigate = useNavigate();
  const [rejectPopup, setRejectPopup] = useState(false);
  const [Rej_Mentor, setRej_Mentor] = useState("");
  const [Rej_Mentor_Email, setRej_Mentor_Email] = useState("");
  const [Rej_Skill, setRej_Skill] = useState("");
  const [Rej_Level, setRej_Level] = useState("");
  const [feedBack, setFeedBack] = useState("");
  const [warning, setWarning] = useState(false);
  const [mentorList, setMentorList] = useState([]);
  const [avgStars, setAvgStars] = useState({});
  const [req_id, setReq_id] = useState("");
  const token = localStorage.getItem("token"); // Assuming token is stored in localStorage

  // Fetch mentor requests
  async function GetDetails() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/faculty/requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("faculty seeing mentors req: ", response.data);
      setMentorList(response.data);
    } catch (err) {
      console.error(
        "500 Error from DataBase!!!",
        err.response?.data || err.message
      );
    }
  }
  

  // Fetch avg star for a specific mentor
  async function GetAvgStar(email, language) {
    try {
      const token = localStorage.getItem("token"); // get token from storage

      const response = await axios.get(
        `http://localhost:5000/mentee/avg-rating/${email}/${language}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // set Bearer token here
          },
        }
      );

      const avgStar = response.data ?? 0;
      console.log(`mentor avg star for ${email}-${language}: `, avgStar);
      setAvgStars((prev) => ({
        ...prev,
        [`${email}-${language}`]: avgStar,
      }));
    } catch (err) {
      console.error(
        `Failed to get avg star for ${email} - ${language}:`,
        err.response?.data || err.message
      );
    }
  }
  

  // Initial fetch
  useEffect(() => {
    GetDetails();
  }, []);

  // Fetch avg stars for all mentors once mentorList is loaded
  useEffect(() => {
    mentorList.forEach(({student_email, language_name}) => {
      GetAvgStar(student_email, language_name);
    });
  }, [mentorList]);

  async function HandleApprove(request_id) {
    const status = "approved";
    toast.success("Mentor approved", {
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
      const token = localStorage.getItem("token"); // get the token

      const response = await axios.put(
        "http://localhost:5000/faculty/update-status",
        {
          request_id,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // add token here
          },
        }
      );

      console.log("Approval response:", response.data);
      window.location.reload();
    } catch (err) {
      console.error("Error approving mentor: ", err);
    }
    
  }

  async function HandleReject() {
    toast.error("Mentor rejected", {
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
      const status = "rejected";
      const token = localStorage.getItem("token"); // get token

      const response = await axios.put(
        "http://localhost:5000/faculty/update-status",
        {
          request_id: req_id,
          status,
          rejection_reason: feedBack,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // add token header
          },
        }
      );

      console.log("Rejection response: ", response.data);

      window.location.reload();
    } catch (err) {
      console.log(err);
    }
    
  }

  function HandlePopUp(name, email, skill, level, request_id) {
    setRejectPopup(true);
    setRej_Mentor(name);
    setRej_Mentor_Email(email);
    setRej_Skill(skill);
    setRej_Level(level);
    setFeedBack("");
    setReq_id(request_id);
  }

  return (
    <div className="bg-[#EEF1F9] w-full min-h-screen overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center bg-white h-16 px-4 shadow-md justify-between fixed w-full z-10">
        <div className="flex items-center">
          <img className="w-11 h-11 mr-3" src={ps} alt="ps" />
          <h4 className="text-lg font-semibold">PS Mentorship</h4>
        </div>
        <div
          className="cursor-pointer"
          onClick={() => {
            navigate("/");
            localStorage.clear();
          }}
        >
          <img className="w-6 h-6" src={logout} alt="logout" />
        </div>
      </div>

      <ToastContainer />

      {/* Reject Popup */}
      {rejectPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)]"
          onClick={() => {
            setRejectPopup(false);
            setWarning(false);
          }}
        >
          <div
            className="bg-white rounded-xl px-6 py-4 shadow-xl w-sm lg:w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="text-xl font-medium pt-2 pb-4">PS Mentorship</h1>
            <h1 className="flex text-[#727272] text-lg">
              Name: <span className="pl-2 text-black">{Rej_Mentor}</span>
            </h1>
            <h1 className="flex text-[#727272] text-lg">
              Email: <span className="pl-2 text-black">{Rej_Mentor_Email}</span>
            </h1>
            <h1 className="flex text-[#727272] text-lg">
              Skill: <span className="pl-2 text-black">{Rej_Skill}</span>
            </h1>
            <h1 className="flex text-[#727272] text-lg">
              Level: <span className="pl-2 text-black">{Rej_Level}</span>
            </h1>
            <hr className="mt-2 text-[#727272]" />
            <h1 className="mt-3 text-[#727272] text-lg">Reason</h1>
            <textarea
              className="w-full h-[150px] bg-[#EEF1F9] border-none focus:outline-none p-2"
              placeholder="Enter reason"
              value={feedBack}
              onChange={(e) => setFeedBack(e.target.value)}
            />
            {warning && (
              <p className="text-center text-red-500">
                Feedback can't be empty
              </p>
            )}
            <div
              className="bg-[#8A64F7] text-center p-2 rounded-sm text-white mt-2 hover:cursor-pointer hover:bg-[#744FE1]"
              onClick={() => {
                if (feedBack.trim().length > 0) {
                  HandleReject();
                  setRejectPopup(false);
                } else {
                  setWarning(true);
                }
              }}
            >
              Submit
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="pt-20 px-4 pb-6">
        {mentorList.length === 0 ? (
          <div className="w-full min-h-[calc(100vh-64px)] flex flex-col items-center lg:justify-center">
            <p className="text-gray-500 text-lg text-center lg:absolute lg:top-1/2 lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:-translate-y-1/2">
              No mentor requests yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {mentorList.map(
              (
                {student_name, student_email, language_name, level, request_id},
                id
              ) => (
                <div
                  key={id}
                  className="bg-white rounded-lg shadow-md p-4 flex flex-col"
                >
                  <div className="flex flex-row">
                    <img
                      src={userPS}
                      alt="user"
                      className="w-22 h-22 rounded-md m-2"
                    />
                    <div className="flex flex-col justify-center sm:ml-4">
                      <h3 className="text-xl font-semibold">{student_name}</h3>
                      <p className="text-base text-gray-600">{student_email}</p>
                      <p className="text-xs mt-2 text-gray-500">
                        Mentorship applied for
                      </p>
                      <h4 className="text-lg">{`${language_name} level-${level}`}</h4>
                      <StaticStar
                        count={
                          avgStars[`${student_email}-${language_name}`] || 0
                        }
                      />
                      <p
                        className="text-gray-500 hover:cursor-pointer hover:underline w-fit"
                        onClick={() => {
                          localStorage.setItem(
                            "mentor_language",
                            language_name
                          );
                          localStorage.setItem("mentor_email", student_email);
                          navigate("/login/faculty/review");
                        }}
                      >
                        Review
                      </p>
                    </div>
                  </div>
                  <div className="flex mt-4 gap-2">
                    <button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded-sm"
                      onClick={() => HandleApprove(request_id)}
                    >
                      Approve
                    </button>
                    <button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded-sm"
                      onClick={() =>
                        HandlePopUp(
                          student_name,
                          student_email,
                          language_name,
                          level,
                          request_id
                        )
                      }
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Faculty;
