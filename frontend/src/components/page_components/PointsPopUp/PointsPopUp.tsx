import React, { useState, useEffect } from "react";
import Card from "../../generic_components/Card/Card";
import { type ColorScheme } from "../../../main";
import { defaultScheme } from "../../../main";
import { type SpendPoints } from "../../../api/post";
import { checkPoints } from "../../../api/post";
import type { UserInfo } from "../../../api/user";
import KamerlinkPoints from "../../../assets/KamerlinkLogo.png"
import LoginButton from "../../generic_components/Buttons/LoginButton/LoginButton";
interface PointsPopUpProps {
  remaining_points: number;
  post_id: string;
  onConfirm: (points: SpendPoints) => void;
  onClose: () => void;
  scheme?: ColorScheme;
  userInfo?: UserInfo | null;
  setUserInfo?: ((value: UserInfo | null | ((prev: UserInfo | null) => UserInfo | null)) => void) | null;
}

function PointsPopUp({ post_id, remaining_points, onConfirm, onClose, scheme = defaultScheme, userInfo = null, setUserInfo = null }: PointsPopUpProps) {
  const [selectedPoints, setSelectedPoints] = useState(0);
  const [pointsOnPost, setPointsOnPost] = useState<{ points_given: number; limit: number } | null | undefined>(undefined);




  useEffect(() => {
    async function fetchPoints() {
      try {
        const response = await checkPoints({ post_id });
        setPointsOnPost(response.data);
        setSelectedPoints(response.data.points_given);
      } catch (err) {
        console.error("Failed to fetch points_on_post:", err);
        setPointsOnPost(null); // fallback value
      }
    }
    fetchPoints();
  }, [post_id, remaining_points]);

  if (pointsOnPost === undefined) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <Card
          style={{
            backgroundColor: scheme.second,
            padding: "2rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            maxWidth: "400px",
            width: "100%",
          }}
        >
          <p>Aan het laden</p>
        </Card>
      </div>
    );
  }
  if (pointsOnPost === null) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <Card
          style={{
            backgroundColor: scheme.second,
            padding: "2rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            maxWidth: "400px",
            width: "100%",
          }}
        >
          <p>U bent helaas niet ingelogd om punten te kunnen uitgeven :(</p>
          <div style={{ display: "flex", justifyContent: "space-evenly", width: "100%" }}>
            <LoginButton style={{ backgroundColor: scheme.first }}></LoginButton>
            <button
              style={{
                flex: 1,
                backgroundColor: "#ccc",
                border: "none",
                padding: "0.75rem",
                borderRadius: "0.75rem",
                cursor: "pointer",
                fontSize: "1rem",
                color: "black",
                maxWidth: "100px",
              }}
              onClick={onClose}
            >
              Annuleren
            </button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <Card
        style={{
          backgroundColor: scheme.second,
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "400px",
          width: "100%",
        }}
      >

        <h3 style={{ margin: 0, textAlign: "center" }}>Punten uitgeven
          <img src={KamerlinkPoints} alt="⭐" height="50" style={{ verticalAlign: "middle", marginLeft: "0.3em" }} /></h3>

        <p style={{ margin: 0, textAlign: "center" }}>Nog punten: {remaining_points}</p>

        {/* Display the selected points */}
        <p style={{ textAlign: "center", fontSize: "1.2rem" }}>{selectedPoints} points</p>

        {/* Slider input */}
        <input
          type="range"
          min={0}
          max={Math.min(pointsOnPost.limit, remaining_points + pointsOnPost.points_given)}
          value={selectedPoints}
          onChange={(e) => setSelectedPoints(Number(e.target.value))}
          style={{
            width: "100%",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
          <button
            style={{
              flex: 1,
              backgroundColor: scheme.first,
              border: "none",
              padding: "0.75rem",
              borderRadius: "0.75rem",
              cursor: "pointer",
              fontSize: "1rem",
            }}
            onClick={() => {

              let delta = selectedPoints - pointsOnPost.points_given //how many points are actually spent
              if (userInfo != null) {
                const updatedUserInfo = { ...userInfo, points: userInfo.points - delta };

                if (setUserInfo) {

                  setUserInfo(updatedUserInfo)  // Set user info to update it everywhere
                }
              }
              onConfirm({ points: delta, post_id })
            }}
          //disabled={selectedPoints > remaining_points}
          >
            Bevestigen
          </button>

          <button
            style={{
              flex: 1,
              backgroundColor: "#ccc",
              border: "none",
              padding: "0.75rem",
              borderRadius: "0.75rem",
              cursor: "pointer",
              fontSize: "1rem",
              color: "black"
            }}
            onClick={onClose}
          >
            Annuleren
          </button>
        </div>
      </Card>
    </div>
  );
}

export default PointsPopUp;
