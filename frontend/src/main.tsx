import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import RootLayout from './routes/RootLayout'
import MainPage from './routes/MainPage'
import PalettePage from './routes/PalettePage'
import FiltersPage from './routes/FiltersPage'
import MyPage from './routes/MyPage'
import AboutPage from './routes/AboutPage'
import AdminPage from './routes/AdminPage'
import LoginPage from './routes/LoginPage.tsx'
import RequireAdmin from './routes/RequireAdmin.tsx'
import SignUpPage from './routes/SignUpPage.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <MainPage /> },
      { path: 'palettes', element: <PalettePage /> },
      { path: 'filters', element: <FiltersPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'me', element: <MyPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignUpPage /> },
      {
        path: 'admin', element: (
          <RequireAdmin>
            <AdminPage />
          </RequireAdmin>
        )
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
