import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import RootLayout from './routes/RootLayout'
import MainPage from './routes/MainPage'
import PalettePage from './routes/PalettePage'
import FiltersPage from './routes/FiltersPage'
import MyPage from './routes/MyPage'
import AdminPage from './routes/AdminPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <MainPage /> },
      { path: 'palettes', element: <PalettePage /> },
      { path: 'filters', element: <FiltersPage /> },
      { path: 'me', element: <MyPage /> },
      { path: 'admin', element: <AdminPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
