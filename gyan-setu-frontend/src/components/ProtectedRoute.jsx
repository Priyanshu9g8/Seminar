import { Navigate } from "react-router-dom"
import { getCurrentUser } from "../utils/auth"

export default function ProtectedRoute({children, role}){

    const user = getCurrentUser()

    if(!user){
        return <Navigate to="/login" />
    }

    if(role && user.role !== role){
        return <Navigate to="/login" />
    }

    return children
}