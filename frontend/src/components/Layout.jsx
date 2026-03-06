import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  return (
    <div className="app">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        unreadCount={unreadCount}
      />
      <div className={`main-content${collapsed ? " collapsed" : ""}`}>
        <Topbar unreadCount={unreadCount} />
        <Outlet context={{ unreadCount, setUnreadCount }} />
      </div>
    </div>
  )
}