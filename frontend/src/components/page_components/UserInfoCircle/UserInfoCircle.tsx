import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { defaultScheme } from "../../../main";
import type { components } from "../../../api/gen/api";
import Popup from "../../generic_components/PopUp/PopUp";

type UserInfo = components["schemas"]["UserInfo"];

interface UserInfoCircleProps {
    userInfo: UserInfo | null;
    onClick?: () => void;
    style?: React.CSSProperties;
    behavior?: "showUserInfo" | "redirectToUserPage";
    children?: React.ReactNode;
}

const UserInfoCircle: React.FC<UserInfoCircleProps> = ({
    userInfo,
    onClick,
    style,
    behavior = "showUserInfo",
    children
}) => {
    const colorScheme = defaultScheme;
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();

    const SVGStyle: React.CSSProperties = {
        width: "160px",
        height: "160px",
        backgroundColor: colorScheme.first,
        borderRadius: "50%",

        borderColor: colorScheme.third,
        borderWidth: "2px",
        borderStyle: "solid",
        cursor: onClick || userInfo ? "pointer" : "default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
    };

    const role = userInfo?.role;

    let svg;
    if (role === "Student") {
        svg = (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                style={{ width: "100%", height: "100%" }}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                />
            </svg>
        );
    } else if (role === "Teacher") {
        svg = (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                style={{ width: "100%", height: "100%" }}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
            </svg>
        );
    } else if (role === "Admin") {
        svg = (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                style={{ width: "100%", height: "100%" }}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z"
                />
            </svg>
        );
    } else {
        svg = null;
    }

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (onClick) {
            onClick();
        } else if (userInfo && !showPopup) {
            if (behavior === "showUserInfo") {
                setShowPopup(true);
            } else if (behavior === "redirectToUserPage") {
                navigate(`/user/profile?type=${userInfo._id.$oid}`);
            }
        }
    };

    return (
        <>
            <div
                style={{ display: "flex", alignItems: "center", gap: "1em", cursor: onClick || userInfo ? "pointer" : "default" }}
                onClick={handleClick}
            >
                <div style={SVGStyle}>
                    {svg}
                </div>
                {children}
            </div>
            {showPopup && userInfo && (
                <Popup
                    onClose={() => setShowPopup(false)}
                    scheme={colorScheme}
                >
                    <h3 style={{ marginBottom: "0.5em" }}>{userInfo.nickname}</h3>
                    <hr />
                    <p>Id: {userInfo._id.$oid} </p>
                    <hr />
                    <p>Rol: {userInfo.role === "Teacher" ? "Docent" : userInfo.role}</p>
                    <hr />
                    <p>Punten: {userInfo.points}</p>
                    <hr />
                    <p>Gekregen Punten {userInfo.received_points ?? 0}</p>
                    <hr />
                    <p>Gekregen Likes {userInfo.received_likes ?? 0}</p>
                </Popup>
            )}
        </>
    );
};

export default UserInfoCircle;