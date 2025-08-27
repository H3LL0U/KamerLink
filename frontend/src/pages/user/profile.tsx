import React, { useEffect } from 'react';
import { useState } from 'react';
import LoginButton from '../../components/generic_components/LoginButton/LoginButton';
import LogoutButton from '../../components/generic_components/LogoutButton/LogoutButton';
import { useAuth0 } from '@auth0/auth0-react';

import type { components } from '../../api/gen/api';
const Profile = () => { 
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
    const [result, setResult] = useState<components["schemas"]["GambleResults"] | null>(null);
  


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
