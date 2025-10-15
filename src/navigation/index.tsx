import { createBrowserRouter, Navigate } from 'react-router-dom'
import urls from './urls'
import Auth from '@/pages/Auth'
import EquipmentCatalog from '@/pages/EquipmentLot/pages/EquipmentCatalog'
import AuthGate from '@/pages/Auth/components/AuthGate'

const router = createBrowserRouter([
  {
    path: urls.auth,
    element: <Auth />,
  },
  {
    path: urls.home,
    element: <Navigate to={urls.catalog} replace={true} />,
  },
  {
    path: urls.catalog,
    element: (
      <AuthGate>
        <EquipmentCatalog />
      </AuthGate>
    ),
  },
])

export default router
