import React, { useEffect } from 'react';
import { useState } from 'react';
import LoginButton from '../../components/LoginButton/LoginButton';
import LogoutButton from '../../components/LogoutButton/LogoutButton';
import { useAuth0 } from '@auth0/auth0-react';
import { gamble } from '../../api/api';
import type { operations, components } from '../../types/api';
const Profile = () => {
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

      <h1>Profile</h1>
    </div>
  );
};

export default Profile;
