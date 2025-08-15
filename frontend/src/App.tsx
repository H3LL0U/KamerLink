import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/home'
function App() {
  const [count, setCount] = useState(0)






  return (
    <HashRouter>
      <Routes>
        <Route path='/' element ={<Home/>} />



      </Routes>
    </HashRouter>
  )
}

export default App
