// src/components/superAdmin/DashboardLayout.tsx
import { NavLink, Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h2>Super Admin Dashboard</h2>
        <nav>
          <ul>
            <li>
              <NavLink to="/super_admin/dashboard" end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/super_admin/dashboard/organizations">
                Organizations
              </NavLink>
            </li>
            <li>
              <NavLink to="/super_admin/dashboard/users">Users</NavLink>
            </li>
            {/* Add more nav links as needed */}
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
