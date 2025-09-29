import React, { useRef, useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";

interface ColorScheme {
  first: string;
  second: string;
  third: string;
  fourth: string;
}

interface HeaderProps {
  scheme?: ColorScheme;
}

const defaultScheme: ColorScheme = {
  first: "#041562",
  second: "#11468F",
  third: "#DA1212",
  fourth: "#EEEEEE",
};

// Reusable menu item
function MenuItem({
  label,
  link,
  bgColor,
}: {
  label: string;
  link: string;
  bgColor: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        padding: "1rem",
        cursor: "pointer",
        borderBottom: "1px solid #ccc",
        backgroundColor: bgColor,
      }}
      onClick={() => (window.location.href = link)}
    >
      <p style={{ margin: 0, lineHeight: "normal" }}>{label}</p>
    </div>
  );
}

function Header({ scheme = defaultScheme }: HeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [sidebarOffset, setSidebarOffset] = useState<number>(0);

  // Track header height
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }

    const handleResize = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div
        ref={headerRef}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: scheme.fourth,
          padding: "1rem",
          boxSizing: "border-box",
          marginBottom: `${sidebarOffset}px`, // dynamically push content down
          transition: "margin-bottom 0.3s ease", // smooth animation
        }}
      >
        <a href="/" style={{ margin: 0, textAlign: "center", flexGrow: 1 }}>
          <h1 style={{ margin: 0, textAlign: "center", flexGrow: 1 }}>
            <span style={{ color: scheme.third }}>Kamer</span>
            <span style={{ color: scheme.second }}>Link</span>
          </h1>
        </a>

        <Sidebar
          sidebar_offset={`${headerHeight}px`}
          onHeightChange={(height: number) => setSidebarOffset(height)} // track sidebar height
        >
          <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <MenuItem label="Profiel" link="/user/profile" bgColor={scheme.second} />
            <MenuItem label="Maak een post" link="/user/new_post" bgColor={scheme.second} />
            <MenuItem label="Bekijk posts" link="/posts" bgColor={scheme.second} />
            <MenuItem label="Vragen" link="/vragen" bgColor={scheme.second} />
          </div>
        </Sidebar>
      </div>
    </>
  );
}

export default Header;
