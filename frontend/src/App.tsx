import { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Profile from './pages/user/profile';
import PostPage from './pages/user/postpage';
import PostViewPage from './pages/posts';

import Redirect from './pages/redirect';
import Vragen from './pages/vragen';
import ViewPost from './pages/posts/view';
import { defaultScheme } from './main';
import Leaderboard from './pages/leaderboard';
import NotFound from './pages/REPLACEMENTS/not_found';



function App() {
  const bgColor = defaultScheme.first;
  return (
    <BrowserRouter>
      <div style={{ backgroundColor: bgColor, minHeight: "100vh" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts" element={<PostViewPage />} />
          <Route path="/posts/view" element={<ViewPost />} />
          <Route path="/user/profile" element={<Profile />} />
          <Route path="/user/new_post" element={<PostPage />} />
          <Route path="/vragen" element={<Vragen />} />
          <Route path="/redirect" element={<Redirect />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
