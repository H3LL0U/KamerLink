import React from 'react';
import LoginButton from '../components/LoginButton/LoginButton';
import LogoutButton from '../components/LogoutButton/LogoutButton';
import { useAuth0 } from '@auth0/auth0-react';

const Home = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

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
          <p>Welcome, {user?.name || 'Loading...'}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
