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
import CartPage from './routes/CartPage'
import FavoritesPage from './routes/FavoritesPage'
import ColorDetailPage from './routes/ColorDetailPage'
import FilterDetailPage from './routes/FilterDetailPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <MainPage /> },
      { path: 'palettes', element: <PalettePage /> },
      { path: 'palettes/:id', element: <ColorDetailPage /> },
      { path: 'filters', element: <FiltersPage /> },
      { path: 'filters/:id', element: <FilterDetailPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'me', element: <MyPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
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
