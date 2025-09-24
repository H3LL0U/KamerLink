import React, { useEffect, useState } from "react";
import LoginButton from "../../components/generic_components/LoginButton/LoginButton";
import LogoutButton from "../../components/generic_components/LogoutButton/LogoutButton";
import { useAuthenticatedUser } from "../../hooks/useAuthenticatedUser";
import type { components } from "../../api/gen/api";
import Header from "../../components/page_components/Header/Header";
import UserHeader from "../../components/page_components/UserHeader/UserHeader";
import Card from "../../components/generic_components/Card/Card";
import ColorTransition from "../../components/generic_components/ColorTransition/ColorTransition";
import { defaultScheme } from "../../main";
import Popup from "../../components/generic_components/PopUp/PopUp";



const Profile = () => {
  const { user, isAuthenticated, AuthReplacement, userInfo } =
    useAuthenticatedUser();

  const [result, setResult] = useState<components["schemas"]["GambleResults"] | null>(null);
  const colorScheme = defaultScheme;

  const SVGStyle: React.CSSProperties = {
    width: "200px",
    height: "200px",
    backgroundColor: colorScheme.first,
    borderRadius: "100%",
    padding: "10px",
    borderColor: colorScheme.third,
    borderWidth: "2px",
    borderStyle: "solid",
    cursor: "pointer", // make it clickable
  };

  const teacherSVG = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      style={SVGStyle}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>
  );

  const studentSVG = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      style={SVGStyle}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
      />
    </svg>
  );

  const adminSVG = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      style={SVGStyle}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z"
      />
    </svg>
  );

  const [curImg, setCurImg] = useState<React.ReactElement>(teacherSVG);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!userInfo) return;

    if (userInfo.role === "Student") setCurImg(studentSVG);
    else if (userInfo.role === "Teacher") setCurImg(teacherSVG);
    else if (userInfo.role === "Admin") setCurImg(adminSVG);
  }, [userInfo]);

  if (AuthReplacement) return AuthReplacement;


  return (
    <>
      <Header />
      <UserHeader
        name={userInfo?.nickname ?? "loading"}
        userInfo={userInfo}
        img_src={
          <div onClick={() => setShowPopup(true)} style={{ display: "inline-block", cursor: "pointer" }}>
            {curImg}
          </div>
        }
      >
        <Card><p>bio</p></Card>
      </UserHeader>
      <ColorTransition
        from={defaultScheme.second}
        to={defaultScheme.first}
        height="20px"
      />

      {showPopup && (
        <Popup onClose={() => setShowPopup(false)} scheme={colorScheme}>
          <h3 style={{ marginBottom: "0.5em" }}>{userInfo?.nickname}</h3>
          <hr />
          <p>Id: {userInfo?._id.$oid} </p>
          <hr />
          <p>Rol: {userInfo?.role === "Teacher" ? "Docent" : userInfo?.role}</p>
          <hr />
          <p>Punten: {userInfo?.points}</p>

        </Popup>
      )}
    </>
  );
};

export default Profile;
