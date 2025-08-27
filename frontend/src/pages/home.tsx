import React, { useEffect } from 'react';
import { useState } from 'react';
import LoginButton from '../components/generic_components/LoginButton/LoginButton';
import LogoutButton from '../components/generic_components/LogoutButton/LogoutButton';
import { useAuth0 } from '@auth0/auth0-react';

import Header from '../components/page_components/Header/Header';

import type { components } from '../../api/gen/api';
import { type ColorScheme } from '../main';
import ColorTransition from '../components/generic_components/ColorTransition/ColorTransition';
import Card from '../components/generic_components/Card/Card';
import TextImage from '../components/generic_components/TextImage/TextImage';
import InDevelopment from '../components/generic_components/InDevelopmentHeader/InDevelopmentHeader';
import SquigglyWrapper from '../components/generic_components/SquigglyWrapper/SquigglyWrapper';
import WithSmoothAppearance from '../components/animations/WithSmoothAppearance/WithSmoothAppearance';
/* images */
import onderzoekimg from '../assets/onderzoek.jpg'
import reageerimg from '../assets/Reageer.webp'
import create_posts from '../assets/posts.webp'
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
  const defaultScheme: ColorScheme = {
    first: '#041562',
    second: '#11468F',
    third: '#DA1212',
    fourth: '#EEEEEE'
  } 




  return (
    <>
    <div style={{marginBottom:'50px'}}>
    <Header></Header>
    <ColorTransition from={ defaultScheme.fourth} to= {defaultScheme.first} height='5px'
    />
    
    <div style={{display:"flex", justifyContent:"center" , flexDirection:"column", alignItems:"center"}}>
      
      <Card style={{width:"70%", backgroundColor:"white", padding:"10px", textAlign:"center", marginTop:"30px"}}>
        <h2 style={{color:"black"}}><span style={{color:defaultScheme.second}}>Link</span> met jouw <span style={{color:defaultScheme.third}}>kameraden</span></h2>
      </Card>

      <div style={{width:"85%"}}>
      <p style={{textAlign:"center"}}><span style={{ color: defaultScheme.third }}>Kamer</span><span style={{ color: defaultScheme.second }}>Link</span> is een platform voor alle studenten en docenten van Kamerlingh Onnes. Hiermee deel en ontvang je nieuws over school en kun je initiatieven creëren om onze school te verbeteren.
      </p>
      </div>
      <div style={{margin:"20px"}}>
      <LoginButton login_text='Log in met jouw school email'></LoginButton>
      </div>
    
    <ColorTransition from={defaultScheme.first} to={defaultScheme.second}></ColorTransition>
    <div style={{display:"flex", justifyContent:"center" , flexDirection:"column", alignItems:"center", backgroundColor:defaultScheme.second, width:"100%"} }>
      
    </div>

    <div style={{backgroundColor: defaultScheme.second, width:"100%"}}>
      <WithSmoothAppearance>
        <SquigglyWrapper wavyLineStyle={{backgroundColor:defaultScheme.first, borderColor:defaultScheme.fourth, width:"30%"}}
        side='right'
        hideBelow={600}>
        <TextImage
        title ={ <h1>Maak posts</h1>}
        description = {<p>Maak eenvoudig posts om schoolprojecten, activiteiten en initiatieven te delen. Inspireer anderen door jouw ideeën en gebeurtenissen zichtbaar te maken. Zo kunnen we samen ons school verbeteren</p>}
        imageAlign='center'
        containerStyle={{backgroundColor:defaultScheme.second, color:"white"} }
        imageUrl={create_posts}
        ></TextImage>
        </SquigglyWrapper>
      </WithSmoothAppearance>
    </div>
    
    <div style={{backgroundColor: defaultScheme.second, width:"100%"}}>
      <WithSmoothAppearance>
      <SquigglyWrapper wavyLineStyle={{backgroundColor:defaultScheme.first, borderColor:defaultScheme.fourth, width:"30%"}}
      side='left'
      hideBelow={600}>
      <TextImage 

      title ={ <h1>Reageer</h1>}
      description = {<p>
        Reageer op de initiatieven door opmerkingen te plaatsen, likes te geven en je dagelijkse Kamerlink-punten te besteden. Zo laat je zien wat jij en jouw schoolgenoten echt belangrijk vinden en help je de meest waardevolle ideeën te ondersteunen!
      </p>}
      imageAlign='center'
      containerStyle={{backgroundColor:defaultScheme.second, color:"white"} }
      imageUrl={reageerimg}
      ></TextImage>
      </SquigglyWrapper>
      </WithSmoothAppearance>
    </div>

    <InDevelopment
    message='In Ontwikkeling'
    />

    <div style={{backgroundColor: defaultScheme.second, width:"100%"}}>
      <WithSmoothAppearance>
      <SquigglyWrapper wavyLineStyle={{backgroundColor:defaultScheme.first, borderColor:defaultScheme.fourth, width:"30%"}}
      hideBelow={600}>
      <TextImage
      title ={ <h1>Onderzoek eenvoudig</h1>}
      description = {<p>In de toekomst kun je met Kamerlink eenvoudig onderzoeken uitvoeren door zelf formulieren aan te maken die anderen kunnen invullen. Zo verzamel je snel feedback en inzichten van medestudenten en docenten.</p>}
      imageAlign='center'
      containerStyle={{backgroundColor:defaultScheme.second, color:"white"} }
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
  
  <LoginButton style={{backgroundColor: defaultScheme.second}} text_style={{fontSize:"clamp(2rem, 4vw + 1rem, 4rem)"}} login_text='Doe nu mee!' logout_text='Log out'></LoginButton>


</Card>

    <ColorTransition
    from={defaultScheme.first}
    to={defaultScheme.second}
    height='10px'
    >
    
    </ColorTransition>

</>


}

<footer style={{ backgroundColor: defaultScheme.second, width:"100%", margin:0}}>
    Copyright H3LL_0U ©

</footer>

    </div>
    

    </div>

    </>
  );
};

export default Home;
