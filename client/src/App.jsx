import { Toaster } from "react-hot-toast"
import { Navigate, Routes } from "react-router-dom"
import LoginLanding from "./pages/LoginLanding"
import Dashboard from "./pages/Dashboard"
import Employees from "./pages/Employees"
import Attendance from "./pages/Attendance"
import Leave from "./pages/Leave"
import PaySlips from "./pages/PaySlips"
import { Settings } from "lucide-react"
const App = () => {
  return (
    <>
    <Toaster />
    <Routes>
      <Route path="/login" element={ <LoginLanding />}/>
      <Route element= {<Layout />}>
      <Route path="/Dashboard" element={<Dashboard/>}/>
      <Route path="/employees" element={<Employees/>}/>
      <Route path="/attendance" element={<Attendance/>}/>
      <Route path="/leave" element={<Leave/>}/>
      <Route path="/payslips" element={<PaySlips/>}/>
      <Route path="/settings" element={<Settings/>}/>
      </Route>
      <Route path="/print/payslips/:id" element={ <PrintPayslip/>}/>

      <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
    </Routes>
    </>
  )
}

export default App
