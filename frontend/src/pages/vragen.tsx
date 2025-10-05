import { Accordion } from "../components/generic_components/Accordion/Accordion";
import Card from "../components/generic_components/Card/Card";
import ColorTransition from "../components/generic_components/ColorTransition/ColorTransition";
import CrystalButton from "../components/generic_components/CrystalButton/CrystalButton";
import Header from "../components/page_components/Header/Header";
import { defaultScheme } from "../main";
import LoginButton from "../components/generic_components/LoginButton/LoginButton";
// Images
import LoginInstruction from "../assets/vragen/login.png";
import PostInstruction from "../assets/vragen/post.png";
import StatusBulb from "../components/generic_components/StatusBulb/StatusBulb";
import { API_BASE_URL } from "../api/api";



const Vragen = () => {
  const scheme = defaultScheme;

  return (
    <>
      <Header />

      {/* Page Title */}
      <div
        style={{
          width: "100%",
          textAlign: "center",
          margin: "50px auto",
          boxSizing: "border-box",
        }}
      >
        <h1>Vragen</h1>
      </div>

      {/* Top Color Bar */}
      <ColorTransition from={scheme.first} to={scheme.second} height="10px" />

      {/* Crystal Buttons */}
      <div
        style={{
          width: "100%",
          textAlign: "center",
          boxSizing: "border-box",
          backgroundColor: scheme.second,
          display: "flex",
          justifyContent: "space-evenly",
          overflow: "hidden",
          padding: "20px 0",
        }}
      >
        <CrystalButton
          text="Account"
          hoverIntensity={0}
          size={300}
          onClick={() => {
            const el = document.getElementById("account");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        />

        <CrystalButton
          text="Dienst"
          hoverIntensity={0}
          size={300}
          onClick={() => {
            const el = document.getElementById("dienst");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </div>

      <ColorTransition
        from={scheme.second}
        to={scheme.first}
        height="10px"
        style={{ marginBottom: "50px" }}
      />

      {/* Dienst Section */}
      <section style={{ textAlign: "center" }}>
        <h2 id="dienst" style={{ margin: "50px auto" }}>
          Dienst
        </h2>

        <Accordion
          title={
            <p style={{ margin: "0px" }}>
              Hoe maak ik een suggestie voor de website/school?
            </p>
          }
        >
          <Card style={{ textAlign: "left" }}>
            <ol style={{ textAlign: "left", paddingLeft: "1rem" }}>
              <li><p>Log in met jouw school e-mail</p>
                <p><LoginButton></LoginButton></p>
                <p>Als hier Log uit staat dan ben je al ingelogd</p>
                <p>Als dat niet lukt bekijk ook <a href="#register">Hoe registreer ik een account</a></p>

              </li>
              <li>Bezoek de "<a href="/user/new_post">maak een post</a>" pagina</li>
              <li>
                <p>Beschrijf uw suggestie en selecteer de meest passende tags. (nog in ontwikkeling) </p>
                <img src={PostInstruction} alt="Instructies om een post te maken" width={"100%"} />
              </li>
              <li>
                Als uw suggestie de website betreft, voeg een "Website suggestie" tag toe
              </li>
              <li>Klik op verstuur</li>
            </ol>
          </Card>
        </Accordion>

        <Accordion
          title={<p style={{ margin: "0px" }}>Problemen met posts laden en sturen</p>}
        >
          <Card style={{ textAlign: "left" }}>
            <p>
              Als er steeds Onverwachte fouten ontstaan bij het laden van een pagina is er een mogelijkheid dat het dienst op dat moment niet werkt.

            </p>
            <p>status van het dienst: </p>
            <StatusBulb endpoint={API_BASE_URL + "/docs"} style={{ display: "inline" }}></StatusBulb>
            <p>
              Als het probleem blijft bestaan, neem contact op via:{" "}
              <a href="mailto:3007651@leerling.o2g2.nl">mail</a>
            </p>
          </Card>
        </Accordion>
      </section>

      {/* Account Section */}
      <section style={{ textAlign: "center", paddingBottom: "50px" }}>
        <h2 id="account" style={{ margin: "50px auto" }}>
          Account
        </h2>
        <div id="register"></div>
        <Accordion
          title={<p style={{ margin: "0px" }}>Hoe registreer ik een account?</p>}

        >

          <Card>
            <ol style={{ textAlign: "left", paddingLeft: "1rem" }}>
              <li>Bezoek de login pagina</li>
              <li>Klik op "Sign up"</li>
              <li>
                Typ jouw school email in en selecteer een wachtwoord.
                <br />
                <strong style={{ color: "red" }}>
                  BELANGRIJK: gebruik jouw school e-mail dus een e-mail die eindigt op o2g2.nl
                </strong>
              </li>
              <li>
                Verifieer jouw account door de e-mail te openen en op de verificatielink
                te klikken
              </li>
              <li>Je bent nu ingelogd en mag Kamerlink gebruiken</li>
              <li>
                Als het niet lukt om in te kunnen loggen, stuur een email{" "}
                <a href="mailto:3007651@leerling.o2g2.nl">hier</a>
              </li>
            </ol>
          </Card>
        </Accordion>

      </section>
    </>
  );
};

export default Vragen;
