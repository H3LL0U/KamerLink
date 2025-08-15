import React, { useEffect } from 'react';
import { useState } from 'react';
import LoginButton from '../components/LoginButton/LoginButton';
import LogoutButton from '../components/LogoutButton/LogoutButton';
import { useAuth0 } from '@auth0/auth0-react';
import { gamble } from '../api/api';
import type { operations, components } from '../types/api';
const Home = () => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
    const [result, setResult] = useState<components["schemas"]["GambleResults"] | null>(null);
  

  async function handleSpin() {



    try {
      const input: components["schemas"]["Gamble"] = {
          gamble_type: "Slots", 
      };
      const res = await gamble(input,await getAccessTokenSilently())
      setResult(res);
    } catch (err) {
      console.error(err);
      alert('Error spinning slots');
    }
  }
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {!isAuthenticated && <LoginButton />}
      {isAuthenticated && <LogoutButton />}

      <h1>Home</h1>
      {isAuthenticated && (
        <div>
          <button onClick={handleSpin}>Spin the slots</button>
          <p>Welcome, {user?.name || 'Loading...'}</p>
          <p>{result?.slots ?? ''}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
