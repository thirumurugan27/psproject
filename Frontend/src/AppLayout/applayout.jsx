import React from 'react'
import {RouterProvider , createBrowserRouter} from "react-router-dom"
import { Navigate } from 'react-router-dom'
import Login from '../components/Login/login'
import Student from '../pages/student/student'
import Faculty from '../pages/faculty/faculty'
function AppLayout() {
    
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Navigate to="/Login"/>
        },
        {
            path: "/Login",
            element: <Login/>
        },
        {
            path: "/student",
            element: <Student/>
        },
        {
            path:"/faculty",
            element: <Faculty/>
        }
    ])
    return (
        <RouterProvider router={router} />
    )
}

export default AppLayout
