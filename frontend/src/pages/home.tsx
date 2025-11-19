
import { useState } from 'react';
import LoginButton from '../components/generic_components/Buttons/LoginButton/LoginButton';
import { useAuth0 } from '@auth0/auth0-react';
import { kamerlinkScheme } from '../main';
import Header from '../components/page_components/Header/Header';
import type { components } from '../api/gen/api';
import ColorTransition from '../components/generic_components/ColorTransition/ColorTransition';
import Card from '../components/generic_components/Card/Card';
import TextImage from '../components/generic_components/TextImage/TextImage';
import InDevelopment from '../components/generic_components/InDevelopmentHeader/InDevelopmentHeader';
import SquigglyWrapper from '../components/generic_components/SquigglyWrapper/SquigglyWrapper';
import WithSmoothAppearance from '../components/animations/WithSmoothAppearance/WithSmoothAppearance';
/* images */
import onderzoekimg from '../assets/onderzoek.jpg'
import reageerimg from '../assets/KamerlinkLogo.png'
import create_posts from '../assets/posts.webp'
import { defaultScheme } from '../main';
/*
COLOR SCHEME

#041562 // DARK BLUE
#11468F // BLUE
#DA1212 // RED
#EEEEEE // WHITE

*/

const Home = () => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [result, setResult] = useState<components["schemas"]["GambleResults"] | null>(null);




  return (
    <>
      <div style={{ marginBottom: '50px', backgroundColor: defaultScheme.first }}>
        <Header></Header>


        <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>

          <Card style={{ width: "70%", backgroundColor: defaultScheme.fourth, padding: "10px", textAlign: "center", marginTop: "30px" }}>
            <h2 style={{ color: "black" }}><span style={{ color: kamerlinkScheme.second }}>Link</span> met jouw <span style={{ color: kamerlinkScheme.third }}>kameraden</span></h2>
          </Card>

          <div style={{ width: "85%" }}>
            <p style={{ textAlign: "center" }}><span style={{ color: kamerlinkScheme.third }}>Kamer</span><span style={{ color: kamerlinkScheme.second }}>Link</span> is een platform voor alle studenten en docenten van Kamerlingh Onnes. Hiermee deel en ontvang je nieuws over school en kun je initiatieven creëren om onze school te verbeteren.
            </p>
          </div>
          <div style={{ margin: "20px", marginBottom: "20px" }}>
            <LoginButton login_text='Log in met jouw school email'></LoginButton>
          </div>
          {!isAuthenticated && !isLoading && <div style={{ width: "85%", textAlign: "center", marginBottom: "10px" }}>
            <p style={{ fontSize: "13px", margin: "1px" }}>Bekijk ook de <a href="/vragen#dienst">Registratiegids</a></p>
          </div>}


          <ColorTransition from={defaultScheme.first} to={defaultScheme.second}></ColorTransition>
          <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center", backgroundColor: defaultScheme.second, width: "100%" }}>

          </div>

          <div style={{ backgroundColor: defaultScheme.second, width: "100%" }}>
            <WithSmoothAppearance>
              <SquigglyWrapper wavyLineStyle={{ backgroundColor: defaultScheme.first, borderColor: defaultScheme.fourth, width: "30%" }}
                side='right'
                hideBelow={600}>
                <TextImage
                  title={<h1>Maak posts</h1>}
                  description={<p>Maak eenvoudig posts om schoolprojecten, activiteiten, school nieuws en andere zaken te delen. Inspireer anderen door jouw ideeën en gebeurtenissen zichtbaar te maken. Zo kunnen we samen ons school verbeteren en met elkaar socialiseren</p>}
                  imageAlign='center'
                  containerStyle={{ backgroundColor: defaultScheme.second, color: "white" }}
                  imageUrl={create_posts}
                ></TextImage>
              </SquigglyWrapper>
            </WithSmoothAppearance>
          </div>

          <div style={{ backgroundColor: defaultScheme.second, width: "100%" }}>
            <WithSmoothAppearance>
              <SquigglyWrapper wavyLineStyle={{ backgroundColor: defaultScheme.first, borderColor: defaultScheme.fourth, width: "30%" }}
                side='left'
                hideBelow={600}>
                <TextImage

                  title={<h1>Reageer</h1>}
                  description={<p>
                    Reageer op de initiatieven door opmerkingen te plaatsen, likes te geven en je dagelijkse <a href="/vragen#dienst">Kamerlink-punten</a> te besteden. Zo laat je zien wat jij en jouw schoolgenoten echt belangrijk vinden en help je de meest waardevolle ideeën te ondersteunen!
                  </p>

                  }

                  imageAlign='center'
                  containerStyle={{ backgroundColor: defaultScheme.second, color: "white", boxShadow: "none", background: "transparent", borderRadius: "50%" }}
                  imageUrl={reageerimg}
                ></TextImage>
              </SquigglyWrapper>
            </WithSmoothAppearance>
          </div>

          <InDevelopment
            message='In Ontwikkeling'
          />

          <div style={{ backgroundColor: defaultScheme.second, width: "100%" }}>
            <WithSmoothAppearance>
              <SquigglyWrapper wavyLineStyle={{ backgroundColor: defaultScheme.first, borderColor: defaultScheme.fourth, width: "30%" }}
                hideBelow={600}>
                <TextImage
                  title={<h1>Leaderboard</h1>}
                  description={<p>In de toekomst kan je een leaderboard bekijken en vergelijken wie het meest Kamerlink-punten en likes heeft gekregen! Zo komen jouw bijdragen blijkbaar over. </p>}
                  imageAlign='center'
                  containerStyle={{ backgroundColor: defaultScheme.second, color: "white" }}
                  imageUrl={onderzoekimg}
                ></TextImage>
              </SquigglyWrapper>
            </WithSmoothAppearance>
          </div>
          {!isAuthenticated &&
            <>


              <ColorTransition
                from={defaultScheme.second}
                to={defaultScheme.first}
                height='10px'
              ></ColorTransition>
              <Card>

                <LoginButton style={{ backgroundColor: defaultScheme.second }} text_style={{ fontSize: "clamp(2rem, 4vw + 1rem, 4rem)" }} login_text='Doe nu mee!' logout_text='Log out'></LoginButton>


              </Card>

              <ColorTransition
                from={defaultScheme.first}
                to={defaultScheme.second}
                height='10px'
              >

              </ColorTransition>

            </>


          }

          <footer style={{ backgroundColor: defaultScheme.second, width: "100%", margin: 0 }}>
            Copyright H3LL_0U ©

          </footer>

        </div>


      </div>

    </>
  );
};

export default Home;
