import { Chat, Rental, Service } from '@/types'

const common = {
  main: '/main',
  profile: '/profile',
  chats: '/chat',
  chatPage: (id: Chat['id']) => `/chat/${id}`,
  rentals: '/rentals',
  detailRentalPage: (id: Rental['id']) => `/rentals/${id}`,
}

const supplier = {
  services: '/services',
  servicesCreate: '/services/create',
  servicesEdit: (id: Service['id']) => `/services/${id}/edit`,
  dashboard: '/dashboard',
}

const tenant = {
  catalog: '/browse',
  catalogServicePage: (id: Service['id']) => `/browse/${id}`,
}

const urls = { common, supplier, tenant }

export default urls
