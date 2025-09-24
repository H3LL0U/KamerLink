import "./header.css";
import React, { type ReactElement } from "react";
import { defaultScheme, type ColorScheme } from "../../../main";
import { type UserInfo } from "../../../api/user";

type HeaderProps = {
  name: string;
  userInfo?: UserInfo | null;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  img_src?: string | ReactElement; // <--- allow SVG or URL
  scheme?: ColorScheme;
};

function Header({
  name,
  children,
  style = {},
  img_src,
  userInfo,
  scheme = defaultScheme,
}: HeaderProps) {
  const fallbackSVG = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-6"
      style={{ width: "150px", height: "150px" }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
      />
    </svg>
  );

  return (
    <header
      className="header"
      style={{
        backgroundColor: scheme.second,
        color: scheme.third,
        ...style,
      }}
    >
      <div className="img-container">
        {React.isValidElement(img_src) ? (
          img_src
        ) : img_src ? (
          <img
            className="main_image"
            src={img_src}
            alt={`${name} profile picture`}
          />
        ) : (
          fallbackSVG
        )}
        <p>{userInfo?.role === "Teacher" ? "Docent" : userInfo?.role ?? "Student"}</p>
      </div>

      <div className="header-container">
        <h3 style={{ display: "block", width: "100%" }}>{name}</h3>
        {children}
      </div>
    </header>
  );
}

export default Header;
