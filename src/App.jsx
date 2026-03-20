import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SectionPage from './pages/SectionPage'

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/section/:idx" element={<SectionPage />} />
      <Route path="*" element={<NotFound/>} />
    </Routes>
  )
}

function NotFound(){
  return (
    <div style={{padding:40}}>
      <h2>Not Found</h2>
      <p>页面不存在，请回到 <a href="/">首页</a>。</p>
    </div>
  )
}

