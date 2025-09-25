import { NavLink, Outlet } from 'react-router-dom'

export default function RootLayout() {
  return (
    <>
      <nav>
        <ul>
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/palettes">Color Palettes</NavLink></li>
          <li><NavLink to="/filters">Filters</NavLink></li>
          <li><NavLink to="/me">My Page</NavLink></li>
          <li><NavLink to="/admin">Admin</NavLink></li>
        </ul>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  )
}

