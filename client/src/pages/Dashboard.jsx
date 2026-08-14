import React, { useEffect } from 'react'
import { dummyAdminDashboardData, dummyEmployeeDashboardData } from '../assets/assets'
import Loading from '../components/Loading';
import EmployeeDashboard from '../components/EmployeeDashboard';
import AdminDashboard from '../components/AdminDashboard';


const Dashboard = () => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);


  useEffect(() => {
    setData(dummyAdminDashboardData);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  },[])
  

  if(loading) return <Loading />
  if(!data) return <p className="text-slate-400 text-center py-12">No data available</p>


  if(data.role === "ADMIN") {
    return <AdminDashboard data={data} />
  } else {
    return <EmployeeDashboard data={data} />
  }
}


export default Dashboard