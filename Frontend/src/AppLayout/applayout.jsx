import React from 'react'
import {RouterProvider , createBrowserRouter} from "react-router-dom"
import { Navigate } from 'react-router-dom'
import Login from '../components/Login/login'
import Student from '../pages/student/student'
import Faculty from '../pages/faculty/faculty'
import Protected_s from '../components/ProtectedRoutes/protected'
import Protected_f from '../components/ProtectedRoutes/protected_f'
import FileNotFound from '../pages/fileNotFound/fileNotFound'
import NavMentor from '../pages/student/navMentor'
import NavMentee from '../pages/student/navMentee'
import Profile from '../pages/student/profile'
import MentorReview from '../pages/faculty/mentorReview'
import Mentee_Request from '../pages/student/menteeReq'
import Mentor_Request from '../pages/student/mentorRej'

function AppLayout() {
    
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Navigate to="/Login"/>,
            errorElement:<FileNotFound/>
        },
        {
            path: "/login",
            element: <Login/>
        },
        {
            path: "/login/student/mycourses",
            element:<Protected_s>
                    <Student/>
                    </Protected_s>
        },
        {
            path:"/login/student/mentor",
            element:<Protected_s>
                    <NavMentor/>
                    </Protected_s>
        },
        {
            path:"/login/student/mentee",
            element:<Protected_s>
                    <NavMentee/>
                    </Protected_s>
        },
        {
            path:"/login/student/profile",
            element:<Protected_s>
                    <Profile/>
                    </Protected_s>
        },
        {
            path:"/login/student/mycourses/mentee_request",
            element:<Protected_s>
                    <Mentee_Request/>
                    </Protected_s>
        },
        {
            path:"/login/student/mycourses/mentor_request",
            element:<Protected_s>
                    <Mentor_Request/>
                    </Protected_s>
        },
        {
            path:"/login/faculty",
            element:<Protected_f>
                    <Faculty/>
                    </Protected_f>
        },
        {
            path:'/login/faculty/review',
            element:<Protected_f>
                    <MentorReview/>
                    </Protected_f>
        }
    ])
    return (
        <RouterProvider router={router} />
    )
}

export default AppLayout
