import { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Profile from './pages/user/profile';
import PostPage from './pages/user/postpage';
import PostViewPage from './pages/posts';
import TextImage from './components/generic_components/TextImage/TextImage';
import SecretPage from './pages/secret';
import Redirect from './pages/redirect';
import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { client, configureClient } from './api/gen/clients';



function App() {
  
  
  return (
    <BrowserRouter>
      <Routes>
      
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<PostViewPage />} />
        <Route path="/user/profile" element={<Profile/>} />
        <Route path='/user/new_post' element = { <PostPage/>} />
        <Route path='/secret' element = { <SecretPage/>} />
      
        {/* Used for redirecting to the same page as where the login button was pressed */ }
        <Route path='/redirect' element = {<Redirect/>}/>
      
      </Routes>
    </BrowserRouter>
  );
}

export default App;
