import { createBrowserRouter, Navigate } from 'react-router-dom'
import urls from './urls'
import Auth from '@/pages/Auth'

const router = createBrowserRouter([
  {
    path: urls.auth,
    element: <Auth />,
  },
  {
    path: urls.home,
    element: <Navigate to={urls.main} replace={true} />,
  },
])

export default router
