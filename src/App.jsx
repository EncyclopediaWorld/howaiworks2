import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SectionPage from './pages/SectionPage'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/section/:idx" element={<SectionPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

