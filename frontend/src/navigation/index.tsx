import { createBrowserRouter, Navigate } from 'react-router-dom'
import urls from './urls'
import Auth from '@/pages/Auth'
import EquipmentCatalog from '@/pages/EquipmentLot/pages/EquipmentCatalog'
import AuthGate from '@/pages/Auth/components/AuthGate'
import EquipmentLotPage from '@/pages/EquipmentLot/pages/EquipmentLotPage'
import PersonalAccount from '@/pages/User/pages/PersonalAccount'

const router = createBrowserRouter([
  {
    path: urls.auth,
    element: <Auth />,
  },
  {
    path: urls.register,
    element: <Auth />,
  },
  {
    path: urls.home,
    element: <Navigate to={urls.equipmentLots} replace={true} />,
  },
  {
    path: urls.equipmentLots,
    element: (
      <AuthGate>
        <EquipmentCatalog />
      </AuthGate>
    ),
  },
  {
    path: urls.personalAccount,
    element: (
      <AuthGate>
        <PersonalAccount />
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
