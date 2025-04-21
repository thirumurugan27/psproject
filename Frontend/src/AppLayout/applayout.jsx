import React from 'react'
import {RouterProvider , createBrowserRouter} from "react-router-dom"
import { Navigate } from 'react-router-dom'
import Login from '../components/Login/login'
import Student from '../pages/student/student'
import Faculty from '../pages/faculty/faculty'
import Protected_s from '../components/ProtectedRoutes/protected'
import Protected_f from '../components/ProtectedRoutes/protected_f'

function AppLayout() {
    
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Navigate to="/Login"/>
        },
        {
            path: "/login",
            element: <Login/>
        },
        {
            path: "/login/student",
            element:<Protected_s>
                    <Student/>
                    </Protected_s>
        },
        {
            path:"/login/faculty",
            element:<Protected_f>
                    <Faculty/>
                    </Protected_f>
        }
    ])
    return (
        <RouterProvider router={router} />
    )
}

export default AppLayout
