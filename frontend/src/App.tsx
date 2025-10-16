import './styles/sanitize.css'
import './styles/variables.css'
import './styles/base.css'
import './styles/text.css'
import { RouterProvider } from 'react-router-dom'
import { RecoilRoot } from 'recoil'
import router from './navigation'

function App() {
  return (
    <RecoilRoot>
      <RouterProvider router={router} />
    </RecoilRoot>
  )
}

export default App
