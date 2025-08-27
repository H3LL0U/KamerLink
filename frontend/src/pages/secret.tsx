import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import type { components } from "../api/gen/api";
import { gamble } from "../api/gamble";
import { useAuth0ClientConfig } from "../api/gen/clients";
const SecretPage: React.FC = () => {
  const [result, setResult] = useState<components["schemas"]["GambleResults"] | null>(null);
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  useAuth0ClientConfig()
  async function handleSpin() {
    try {
      
      const input: components["schemas"]["Gamble"] = {
        gamble_type: "Slots",
      };
      const res = (await gamble(input)).data;
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Error spinning slots");
    }
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated) {
    return <p>Please log in to access this page.</p>;
  }

  return (
    <div>
      <button onClick={handleSpin}>Spin the slots</button>
      <p>Welcome, {user?.name ?? "Loading..."}</p>
      <p>{result?.slots ?? ""}</p>
    </div>
  );
};

export default SecretPage;
