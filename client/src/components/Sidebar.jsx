import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import {
    ChevronRightIcon,
    MenuIcon,
    XIcon,
    LayoutGridIcon,
    UsersIcon,
    CalendarIcon,
    FileTextIcon,
    DollarSignIcon,
    SettingsIcon,
    LogOutIcon,
    Loader2
} from 'lucide-react'

const Sidebar = () => {

const { pathname } = useLocation()
const [userName, setUserName] = React.useState("")
const [mobileOpen, setMobileOpen] = React.useState(false)

const { user, loading, logout } = useAuth()

React.useEffect(() => {
  if (!user) return
  api.get('/profile')
    .then((res) => {
      const profile = res.data
      const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
      setUserName(fullName || profile.email || "")
    })
    .catch(() => {
      setUserName(user.email || "")
    })
}, [user])

// Close mobile sidebar when route changes
React.useEffect(() => {
  setMobileOpen(false)
}, [pathname])

const role = user?.role

const navItems = [
{name: "Dashboard", path: "/dashboard", icon: LayoutGridIcon},
role === "ADMIN" ?
{name: "Employees", path: "/employees", icon: UsersIcon}:
{name: "Attendance", path: "/attendance", icon: CalendarIcon},
{name: "Leave", path: "/leave", icon: FileTextIcon},
{name: "Payslips", path: "/payslips", icon: DollarSignIcon},
{name: "Settings", path: "/settings", icon: SettingsIcon},
]

const handleLogout = () => {
    if (logout) {
        logout()
    } else {
        window.location.href = "/login"
    }
}


const sidebarContent = (
<>
{/* Brand Header */}

<div className="px-5 py-5">
  <h1 className="text-lg font-bold text-white">Employee MS</h1>
  <p className="text-xs text-slate-400">Management System</p>
</div>

{/* Close button for mobile */}
<button
onClick={() => setMobileOpen(false)}
className="lg:hidden text-slate-400 hover:text-white p-1"
>
<XIcon className="w-5 h-5" />
</button>

{/* User profile card */}
{userName && (
  <div className="mx-3 mt-4 mb-1 p-3 rounded-lg bg-white/3 border border-white/4">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center ring-1 ring-white/10 shrink-0">
        <span className="text-slate-400 text-xs font-semibold">
          {userName.charAt(0).toUpperCase() + (userName.charAt(1) || "").toUpperCase()}
        </span>
      </div>

      <div className="min-w-0">
        <p className="text-[13px] font-medium text-slate-200 truncate">
          {userName}
        </p>

        <p className="text-[11px] text-slate-500 truncate">
          {role === "ADMIN" ? "Administrator" : "Employee"}
        </p>
      </div>
    </div>
  </div>
)}

{/* Section label */}
<div className="px-5 pt-5 pb-2">
  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-[0.12em] ">
    Navigation
  </p>
</div>

{/* Navigation List */}
<div className="flex-1 px-3 space-y-0.5 overflow-y-auto">

  {loading ? (
    <div className="flex items-center gap-2 px-3 py-2 text-slate-400">
      <Loader2 className="animate-spin w-4 h-4" />
      <span className="text-sm">Loading...</span>
    </div>
  ) : (
    navItems.map((item) => {
      const isActive = pathname.startsWith(item.path)
      const Icon = item.icon

      return (
        <Link
          key={item.path}
          to={item.path}
          className={`relative group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
            isActive
              ? 'bg-indigo-500/10 text-white'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          }`}
        >

          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-indigo-500"/>
          )}

          <Icon
            className={`w-[17px] h-[17px] shrink-0 ${
              isActive
                ? 'text-indigo-300'
                : 'text-slate-400 group-hover:text-slate-300'
            }`}
          />

          <span className="flex-1">{item.name}</span>

          {isActive && (
            <ChevronRightIcon className="text-indigo-500/50 w-3.5 h-3.5 " />
          )}

        </Link>
      )
    })
  )}

</div>

{/* Logout */}
<div className="p-3 border-t border-white/6 ">
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-[13px] font-medium text-slate-400 hover:bg-rose-700 hover:text-rose-50 transition-all duration-150"
    >
        <LogOutIcon className="w-[17px] h-[17px] " />
        <span>Log out</span>
    </button>
</div>

</>
)

return (
<>
{/* Mobile hamburger button */}
<button
onClick={() => setMobileOpen(true)}
className="lg:hidden p-2 fixed top-4 left-4 z-50 bg-slate-900 text-white rounded-lg shadow-lg border border-white/10"
>
<MenuIcon className="w-5 h-5" />
</button>

{/* Mobile Overlay */}
{mobileOpen && (
  <div
    className="lg:hidden fixed inset-0 bg-black/50 z-40"
    onClick={() => setMobileOpen(false)}
  />
)}

{/* Sidebar - desktop */}
<aside className="hidden lg:flex flex-col h-full w-64 bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 text-white shrink-0 border-r border-white/4">
  {sidebarContent}
</aside>

{/* Sidebar - mobile */}
<aside
  className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 text-white z-50 flex flex-col transition-transform duration-300 ${
    mobileOpen ? 'translate-x-0' : '-translate-x-full'
  }`}
>
  {sidebarContent}
</aside>
</>
)
}

export default Sidebar