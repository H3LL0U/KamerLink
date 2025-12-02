import React, { useRef, useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import { defaultScheme, kamerlinkScheme, darkScheme } from "../../../main";
import SchemeCircle from "../../generic_components/SchemeCircle/SchemeCircle";
import { changeScheme } from "../../../main";
import { nameToScheme } from "../../../main";
interface ColorScheme {
  first: string;
  second: string;
  third: string;
  fourth: string;
}

interface HeaderProps {
  scheme?: ColorScheme;
  onSchemeChange?: (scheme: ColorScheme) => void;
}

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

function Header({ scheme = defaultScheme, onSchemeChange = (scheme) => {
  changeScheme(scheme);
} }: HeaderProps) {
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

  const availableSchemes = nameToScheme

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
          marginBottom: `${sidebarOffset}px`,
          transition: "margin-bottom 0.3s ease",
        }}
      >
        <a href="/" style={{ margin: 0, textAlign: "center", flexGrow: 1 }}>
          <h1 style={{ margin: 0, textAlign: "center", flexGrow: 1 }}>
            <span style={{ color: kamerlinkScheme.third }}>Kamer</span>
            <span style={{ color: kamerlinkScheme.second }}>Link</span>
          </h1>
        </a>

        <Sidebar
          sidebar_offset={`${headerHeight}px`}
          onHeightChange={(height: number) => setSidebarOffset(height)}
        >
          <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <MenuItem label="Profiel" link="/user/profile" bgColor={scheme.second} />
            <MenuItem label="Maak een post" link="/user/new_post" bgColor={scheme.second} />
            <MenuItem label="Bekijk posts" link="/posts" bgColor={scheme.second} />
            <MenuItem label="Leaderboard" link="/leaderboard" bgColor={scheme.second} />
            <MenuItem label="Vragen" link="/vragen" bgColor={scheme.second} />

            {/* Scheme selector */}
            <div
              style={{
                backgroundColor: scheme.second,

                display: "flex",
                justifyContent: "space-around",
                padding: "0.5rem",
                borderTop: "1px solid #ccc",
              }}
            >
              {[...availableSchemes].map(([name, scheme]) => (
                <SchemeCircle
                  key={name}
                  scheme={scheme}
                  size={50}
                  onClick={() => onSchemeChange?.(scheme)}
                />
              ))}
            </div>
          </div>
        </Sidebar>
      </div>
    </>
  );
}

export default Header;
