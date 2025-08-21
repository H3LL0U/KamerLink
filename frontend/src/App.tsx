import { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Profile from './pages/user/Profile';
import TitledNavbar from './components/TiltedNavBar/TiltedNavBar';
import PostPage from './pages/user/PostPage';
import PostViewPage from './pages/posts';

function App() {
  
  
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<PostViewPage />} />
        <Route path="/user/profile" element={<Profile/>} />
        <Route path='user/new_post' element = { <PostPage/>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
