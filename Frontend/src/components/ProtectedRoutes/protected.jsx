import React, { Children } from 'react'
import { Navigate } from 'react-router-dom';
function Protected_s({children}) {

    const role = localStorage.getItem("role");
    if (role === "student")
        return children
    else if (!role || role === "")
        return <Navigate to="/login"/>
    else
        return <Navigate to="/"/>
}

export default Protected_s
