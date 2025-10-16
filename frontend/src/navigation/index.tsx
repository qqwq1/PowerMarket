import { createBrowserRouter, Navigate } from 'react-router-dom'
import urls from './urls'
import Auth from '../pages/Auth'
import EquipmentCatalog from '../pages/EquipmentLot/pages/EquipmentCatalog'
import AuthGate from '../pages/Auth/components/AuthGate'
import EquipmentLotPage from '../pages/EquipmentLot/pages/EquipmentLotPage'

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
  {
    path: urls.catalog,
    element: (
      <AuthGate>
        <EquipmentCatalog />
      </AuthGate>
    ),
  },
  {
    path: urls.equipmentLot + '/:id',
    element: (
      <AuthGate>
        <EquipmentLotPage />
      </AuthGate>
    ),
  },
])

export default router
