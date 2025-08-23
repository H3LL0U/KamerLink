import React from 'react'
import LoginButton from '../../generic_components/LoginButton/LoginButton'
import Sidebar from '../Sidebar/Sidebar';
// Default color scheme

/* COLOR SCHEME

#041562 // DARK BLUE
#11468F // BLUE
#DA1212 // RED
#EEEEEE // WHITE

*/


interface ColorScheme {
    first: string,
    second: string,
    third: string,
    fourth: string
}

interface HeaderProps {
  scheme?: ColorScheme;
}

const defaultScheme = {
    first: "#041562",
    second: "#11468F",
    third: "#DA1212",
    fourth: "#EEEEEE"
  };

function Header({ scheme = defaultScheme }: HeaderProps) {

  return (<>
<div
  style={{
    
    width: "100%",
    height: "75px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between", // space between header and sidebar
    backgroundColor: scheme.fourth,
    padding: "1rem",
    boxSizing: "border-box",
  }}
>
  {/* Header */}
  <h1 style={{ margin: 0, textAlign: "center", flexGrow: 1 }}>
    <span style={{ color: scheme.third }}>Kamer</span>
    <span style={{ color: scheme.second }}>Link</span>
  </h1>

  {/* Sidebar */}
  <div>
    
<Sidebar sidebar_offset="75px">
  <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
    <div
      style={{ width: "100%", padding: "1rem", cursor: "pointer", borderBottom: "1px solid #ccc", backgroundColor: scheme.second }}
      onClick={() => (window.location.href = "/user/profile")}
    >
      Profiel
    </div>

    <div
      style={{ width: "100%", padding: "1rem", cursor: "pointer", borderBottom: "1px solid #ccc", backgroundColor: scheme.second }}
      onClick={() => (window.location.href = "/user/new_post")}
    >
      Maak een post
    </div>

    <div
      style={{ width: "100%", padding: "1rem", cursor: "pointer", borderBottom: "1px solid #ccc", backgroundColor: scheme.second }}
      onClick={() => (window.location.href = "/posts")}
    >
      Bekijk posts
    </div>

    <div
      style={{ width: "100%", padding: "1rem", cursor: "pointer", borderBottom: "1px solid #ccc", backgroundColor: scheme.second }}
      onClick={() => (window.location.href = "/contact")}
    >
      Contact
    </div>

    <div
      style={{ width: "100%", padding: "1rem", cursor: "pointer", borderBottom: "1px solid #ccc", backgroundColor: scheme.second }}
      onClick={() => (window.location.href = "/vragen")}
    >
      Vragen
    </div>
  </div>
</Sidebar>

  </div>
</div>


    
    </>
)
}

export default Header