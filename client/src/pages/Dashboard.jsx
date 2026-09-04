import React, { useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Loading from '../components/Loading'
import EmployeeDashboard from '../components/EmployeeDashboard'
import AdminDashboard from '../components/AdminDashboard'


const Dashboard = () => {
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)


  useEffect(() => {
    api.get('/dashboard')
      .then((res) =>
        setData(res.data)
      )
      .catch((err) =>
        toast.error(
          err.response?.data?.error ||
          err?.message ||
          "Failed to load dashboard"
        )
      )
      .finally(() =>
        setLoading(false)
      )
  }, [])


  if (loading) return <Loading />

  if (!data) {
    return (
      <p className="text-slate-400 text-center py-12">
        No data available
      </p>
    )
  }


  if (data.role === "ADMIN") {
    return <AdminDashboard data={data} />
  } else {
    return <EmployeeDashboard data={data} />
  }
}


export default Dashboard