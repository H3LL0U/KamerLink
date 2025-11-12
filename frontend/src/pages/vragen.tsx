import { Accordion } from "../components/generic_components/Accordion/Accordion";
import Card from "../components/generic_components/Card/Card";
import ColorTransition from "../components/generic_components/ColorTransition/ColorTransition";
import CrystalButton from "../components/generic_components/Buttons/CrystalButton/CrystalButton";
import Header from "../components/page_components/Header/Header";
import { defaultScheme } from "../main";
import LoginButton from "../components/generic_components/Buttons/LoginButton/LoginButton";
// Images
import LoginInstruction from "../assets/vragen/login.png";
import PostInstruction from "../assets/vragen/post.png";
import StatusBulb from "../components/generic_components/StatusBulb/StatusBulb";
import { useAuthenticatedUser } from "../hooks/useAuthenticatedUser";
import { API_BASE_URL } from "../api/api";
import puntenVoorbeeld from "../assets/vragen/punten_uitgeven_voorbeeld.png";
import { useAuth0 } from "@auth0/auth0-react";
import signUpVoorbeeld from "../assets/vragen/sign_up_example.png";
const Vragen = () => {
  const scheme = defaultScheme;
  const { isAuthenticated, } = useAuth0();
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
        <h1>Veelgestelde vragen</h1>
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
          text="Dienst"
          hoverIntensity={0}
          size={300}
          onClick={() => {
            const el = document.getElementById("dienst");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        />
        <CrystalButton
          text="Account"
          hoverIntensity={0}
          size={300}
          onClick={() => {
            const el = document.getElementById("account");
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
              <li><p>Log in met jouw school e-mail als je dat nog niet gedaan hebt</p>

                {!isAuthenticated && <LoginButton></LoginButton>}

                <p>Als dat niet lukt bekijk ook <a href="#register">Hoe registreer ik een account</a></p>

              </li>
              <li>Bezoek de <a href="/user/new_post">maak een post</a> pagina</li>
              <li>
                <p>Beschrijf jouw suggestie en selecteer de meest passende tags. </p>
                <img src={PostInstruction} alt="Instructies om een post te maken" width={"100%"} style={{ borderRadius: "5px" }} />
              </li>
              <li>
                Als jouw suggestie de website betreft, voeg een "Website suggestie" tag toe
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

        <Accordion
          title={<p style={{ margin: "0px" }}>Wat zijn Kamerlink-punten en hoe verkrijg ik ze?</p>}
        >
          <Card style={{ textAlign: "left" }}>

            <p>
              Kamerlink-punten zijn punten die je aan posts kunt uitgeven.
            </p>
            <img src={puntenVoorbeeld} alt="Punten voorbeeld" style={{ borderRadius: "5px", margin: "10px" }} />

            <p>
              Door punten uit te geven wordt het duidelijker welke ideeën leerlingen en docenten het beste vinden.
              Ze vormen een alternatief voor likes. In plaats van simpelweg aan te geven of je een bericht leuk vindt of niet, kun je een waarde toewijzen die laat zien in welke mate je het ermee eens bent.

            </p>
            <p>
              Kamerlink-punten worden elke dag om <strong >19:00</strong>  gereset tot <strong> 100 punten.</strong> (als je niet meer dan 100 punten hebt)
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
              <li>Bezoek de registreer pagina:
                <br />
                {!isAuthenticated && <div style={{ textAlign: "center" }}><LoginButton login_text="Registreren" style={{ margin: "auto", marginTop: "10px" }}></LoginButton></div>}
                <div style={{ textAlign: "center" }}><img src={signUpVoorbeeld} style={{ borderRadius: "5px", margin: "auto", marginTop: "10px", maxWidth: "600px" }} alt="Instructies om een account te registreren" width={"100%"} /></div>
              </li>

              <li>Klik op "Sign up"</li>
              <li>
                Typ jouw school e-mail in en selecteer een sterk wachtwoord.
                <br />
                <strong style={{ color: "red" }}>
                  BELANGRIJK: gebruik jouw school e-mail dus een e-mail die eindigt op o2g2.nl. Je kunt dus geen persoonlijke  e-mail gebruiken.
                </strong>
              </li>
              <li>
                Verifieer jouw account door de e-mail te openen en op de verificatielink
                te klikken
              </li>
              <li>Je bent nu ingelogd en mag Kamerlink gebruiken</li>
              <li>
                Als het niet lukt om in te loggen, stuur een e-mail{" "}
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
