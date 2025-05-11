import React from 'react'
import ps from '../../assets/ps.png'
import logout from '../../assets/logout.png'
import { useNavigate } from 'react-router-dom'
import userPS from '../../assets/userPS.png'
import Stars from '../../components/stars_edit/stars'
import { ArrowBigLeft, ArrowBigLeftDash, ArrowBigRight, ArrowLeft } from 'lucide-react'
import StaticStar from '../../components/stars_static/StaticStar'
function MentorReview() {
    const navigate = useNavigate();
const mentorReviews = {
  "Aarav Kumar": [
    {
      mentee_name: "Isha Malhotra",
      mentee_email: "isha.malhotra@example.com",
      rating: 4,
      review: "Aarav explained Python loops very well. Grateful for his help!",
      request_id: "REQ007"
    },
    {
      mentee_name: "Kunal Verma",
      mentee_email: "kunal.verma@example.com",
      rating: 5,
      review: "Loved the clarity on Python functions. Highly recommended.",
      request_id: "REQ008"
    },
    {
      mentee_name: "Neha Joshi",
      mentee_email: "neha.joshi@example.com",
      rating: 4,
      review: "Great support in debugging Python code.",
      request_id: "REQ009"
    },
    {
      mentee_name: "Rajat Singh",
      mentee_email: "rajat.singh@example.com",
      rating: 3,
      review: "Session was useful but a bit fast-paced.",
      request_id: "REQ010"
    },
    {
      mentee_name: "Pooja Shah",
      mentee_email: "pooja.shah@example.com",
      rating: 5,
      review: "Very patient and helped me understand concepts from scratch.",
      request_id: "REQ011"
    },
    {
      mentee_name: "Aman Kapoor",
      mentee_email: "aman.kapoor@example.com",
      rating: 4,
      review: "Good experience with object-oriented concepts.",
      request_id: "REQ012"
    },
    {
      mentee_name: "Sneha Reddy",
      mentee_email: "sneha.reddy@example.com",
      rating: 5,
      review: "Very knowledgeable and friendly!",
      request_id: "REQ004"
    },
    {
      mentee_name: "Aarav Kumar",
      mentee_email: "aarav.kumar@example.com",
      rating: 4,
      review: "Helpful with Python basics.",
      request_id: "REQ001"
    },
    {
      mentee_name: "Tanvi Nair",
      mentee_email: "tanvi.nair@example.com",
      rating: 5,
      review: "Loved the hands-on examples in Python.",
      request_id: "REQ013"
    },
    {
      mentee_name: "Rishabh Jain",
      mentee_email: "rishabh.jain@example.com",
      rating: 4,
      review: "Explained Python recursion clearly.",
      request_id: "REQ014"
    }
  ],
  "Vikram Singh": [
    {
      mentee_name: "Diya Sharma",
      mentee_email: "diya.sharma@example.com",
      rating: 3,
      review: "The Java session was decent, but could use more examples.",
      request_id: "REQ002"
    },
    {
      mentee_name: "Vikram Singh",
      mentee_email: "vikram.singh@example.com",
      rating: 4,
      review: "Good explanation on async concepts in JavaScript.",
      request_id: "REQ003"
    },
    {
      mentee_name: "Manav Desai",
      mentee_email: "manav.desai@example.com",
      rating: 5,
      review: "Excellent session on JavaScript ES6 features.",
      request_id: "REQ015"
    },
    {
      mentee_name: "Alisha Rana",
      mentee_email: "alisha.rana@example.com",
      rating: 4,
      review: "Good pacing and covered basics thoroughly.",
      request_id: "REQ016"
    },
    {
      mentee_name: "Farhan Khan",
      mentee_email: "farhan.khan@example.com",
      rating: 3,
      review: "Would appreciate more interactive examples.",
      request_id: "REQ017"
    },
    {
      mentee_name: "Simran Kaur",
      mentee_email: "simran.kaur@example.com",
      rating: 5,
      review: "Very friendly and explained concepts clearly.",
      request_id: "REQ018"
    },
    {
      mentee_name: "Kabir Yadav",
      mentee_email: "kabir.yadav@example.com",
      rating: 4,
      review: "Great intro to DOM manipulation.",
      request_id: "REQ019"
    },
    {
      mentee_name: "Niharika Tiwari",
      mentee_email: "niharika.tiwari@example.com",
      rating: 4,
      review: "Helped me with async/await and callbacks.",
      request_id: "REQ020"
    },
    {
      mentee_name: "Rohan Mehta",
      mentee_email: "rohan.mehta@example.com",
      rating: 5,
      review: "Really appreciated the debugging tips in JavaScript.",
      request_id: "REQ021"
    },
    {
      mentee_name: "Sanya Batra",
      mentee_email: "sanya.batra@example.com",
      rating: 3,
      review: "Session was a bit rushed but content was solid.",
      request_id: "REQ022"
    }
  ],
  "Diya Sharma": [
    {
      mentee_name: "Rahul Mehta",
      mentee_email: "rahul.mehta@example.com",
      rating: 5,
      review: "Fantastic session on Go concurrency. Highly recommend!",
      request_id: "REQ005"
    },
    {
      mentee_name: "Ananya Iyer",
      mentee_email: "ananya.iyer@example.com",
      rating: 4,
      review: "The Rust overview was detailed and helpful.",
      request_id: "REQ006"
    },
    {
      mentee_name: "Irfan Qureshi",
      mentee_email: "irfan.qureshi@example.com",
      rating: 5,
      review: "She made Rust easy to follow. Great mentor!",
      request_id: "REQ023"
    },
    {
      mentee_name: "Meera Jain",
      mentee_email: "meera.jain@example.com",
      rating: 4,
      review: "Good structure and clear code samples.",
      request_id: "REQ024"
    },
    {
      mentee_name: "Zaid Shaikh",
      mentee_email: "zaid.shaikh@example.com",
      rating: 5,
      review: "The Go session was very practical and helpful.",
      request_id: "REQ025"
    },
    {
      mentee_name: "Vidya Krishnan",
      mentee_email: "vidya.krishnan@example.com",
      rating: 4,
      review: "Liked the hands-on approach to Rust.",
      request_id: "REQ026"
    },
    {
      mentee_name: "Aditya Bansal",
      mentee_email: "aditya.bansal@example.com",
      rating: 5,
      review: "Loved the clarity on Go interfaces.",
      request_id: "REQ027"
    },
    {
      mentee_name: "Ritika Paul",
      mentee_email: "ritika.paul@example.com",
      rating: 4,
      review: "Diya made learning Go enjoyable.",
      request_id: "REQ028"
    },
    {
      mentee_name: "Tanishq Rawat",
      mentee_email: "tanishq.rawat@example.com",
      rating: 5,
      review: "Fantastic explanations and mentorship.",
      request_id: "REQ029"
    },
    {
      mentee_name: "Divya Sharma",
      mentee_email: "divya.sharma@example.com",
      rating: 4,
      review: "Great energy and good feedback throughout.",
      request_id: "REQ030"
    }
  ]
};

    const filtered_data = mentorReviews[localStorage.getItem("mentor_review")] || [];
    
return (
<div className="bg-[#EEF1F9] w-full min-h-screen">
    <div className="flex items-center bg-white h-16 px-4 shadow-md justify-between fixed w-full">
        <div className="flex items-center">
            <img className="w-11 h-11 mr-3" src={ps} alt="ps" />
            <h4 className="text-lg font-semibold">PS Mentorship</h4>
        </div>
        <div className="cursor-pointer" onClick={() => { navigate('/Login'); localStorage.clear(); }}>
            <img className="w-6 h-6" src={logout} alt="logout" />
        </div>
    </div>
    <div className='w-full pt-21'>
        <div className='w-fit flex flex-row py-2 px-5'>
            <ArrowLeft className='self-center hover:cursor-pointer' onClick={()=>navigate('/login/faculty')}/>
            <div>
                <h1 className='pl-3 text-2xl lg:text-3xl font-bold'>Review</h1>
                <p className='pl-3 text-gray-500'>{localStorage.getItem("mentor_review")}</p>
            </div>
        </div>
        
    </div>
    <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4 px-7 pb-5'>
        {
        filtered_data.map(
                (data, id) => (
            <div key={id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
                <div className="flex flex-row">
                <img src={userPS}  alt="user" className="w-17 h-17 m-2 bg-gray-300 rounded-full"/>
                <div className="flex flex-col justify-center sm:ml-4">
                    <h3 className="text-xl font-semibold">{data.mentee_name}</h3>
                    <p className="text-base text-gray-600">{data.mentee_email}</p>                                        {/*this is for setting mentor_review*/}
                    <StaticStar count={data.rating}/>
                    
                </div>
                </div>
                    <div>
                        <p className='text-base text-gray-600 pt-2'>"{data.review}"</p>
                    </div>
            </div>
    )
)
    }
    </div>
</div>

)
}

export default MentorReview
