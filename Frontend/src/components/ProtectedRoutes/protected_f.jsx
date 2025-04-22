import React from 'react'
import { Navigate } from 'react-router-dom';
function Protected_f({children}) {
    const role = localStorage.getItem("role");
    if (role === "faculty")
        return children
    else if (!role || role === "")
        return <Navigate to="/login"/>
    else
        return <Navigate to="/"/>
return (children)
}

export default Protected_f
