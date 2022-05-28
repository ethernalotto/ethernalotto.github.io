import {useEffect, useState} from 'react';

import {
  BrowserRouter as Router,
  Link,
  Route,
  Routes,
  matchPath,
  useLocation,
  useMatch,
} from 'react-router-dom';

import {Container} from 'react-bootstrap';

import ReactGA from 'react-ga';

import {useWeb3Context} from 'web3-react';

import {Lottery} from './Lottery';

import {Article, BlogArticle} from './Articles';
import {Blog} from './Blog';
import {ConnectButton, ConnectionProvider, WalletModal} from './Connection';
import {MenuDropdown} from './Dropdowns';
import {ModalContainer} from './Modals';
import {MyTickets} from './MyTickets';
import {OddsCalculator} from './OddsCalculator';
import {Jackpot} from './Jackpot';
import {LotteryContext} from './LotteryContext';
import {LuckyFrame, ReceiptModal} from './LuckyFrame';

import logoImage from './images/logo.png';


ReactGA.initialize(process.env.REACT_APP_ANALYTICS_TRACKER);
ReactGA.pageview(window.location.pathname + window.location.search);


const Logo = () => (
  <Link to="/" className="logo d-flex align-items-center">
    <img src={logoImage} className="logo__img" alt=""/>
    <span className="logo__text"><span className="logo__text-colored">Etherna</span>Lotto</span>
  </Link>
);


const navigationMenuItems: {
  caption: string,
  target: string,
  visible: 'always'|'never'|'account',
}[] = [
  {
    caption: 'How to Play',
    target: '/howtoplay',
    visible: 'always',
  }, {
    caption: 'Past Draws',
    target: '/',
    visible: 'always',
  }, {
    caption: 'My Tickets',
    target: '/tickets',
    visible: 'account',
  }, {
    caption: 'Odds',
    target: '/odds',
    visible: 'always',
  }, {
    caption: 'Whitepaper',
    target: '/whitepaper',
    visible: 'always',
  }, {
    caption: 'Blog',
    target: '/blog',
    visible: 'always',
  }, {
    caption: 'Blog',
    target: '/articles/:id',
    visible: 'never',
  }, {
    caption: 'Partners',
    target: '/partners',
    visible: 'always',
  }, {
    caption: 'Privacy Policy',
    target: '/pp',
    visible: 'never',
  },
];


const NavigationMenuItem = ({caption, target}) => {
  const match = useMatch(target);
  return (
    <li className={`top-menu__item ${match && 'top-menu__item--active'}`}>
      <Link to={target} className="top-menu__link">
        <span className="top-menu__text-el">{caption}</span>
        <span className="top-menu__line"></span>
      </Link>
    </li>
  );
};


const NavigationMenu = () => {
  const {account} = useWeb3Context();
  return (
    <div className="d-none d-lg-block">
      <ul className="top-menu">
        {navigationMenuItems
            .filter(({visible}) => visible === 'always' || (visible === 'account' && account))
            .map(({caption, target}, index) => (
              <NavigationMenuItem key={index} caption={caption} target={target}/>
            ))
        }
      </ul>
    </div>
  );
};


const DropdownNavigationMenu = () => {
  const location = useLocation();
  const matches = navigationMenuItems
      .map(({caption, target}) => ({
        caption: caption,
        match: matchPath({
          path: target,
          caseSensitive: true,
          end: true,
        }, location.pathname),
      }))
      .filter(({match}) => !!match);
  const {account} = useWeb3Context();
  return (
    <MenuDropdown type="menu" text={matches[0].caption}>
      {navigationMenuItems
          .filter(({visible}) => visible === 'always' || (visible === 'account' && account))
          .map(({caption, target}, index) => (
            <MenuDropdown.Item key={index} text={caption} target={target}/>
          ))
      }
    </MenuDropdown>
  );
};


const MainSection = () => (
  <div className="main-section d-flex justify-content-between flex-column flex-md-row">
    <Jackpot/>
    <LuckyFrame/>
  </div>
);


const Header = () => (
  <div className="header-out">
    <Container>
      <div className="header d-flex justify-content-between align-items-start">
        <Logo/>
        <NavigationMenu/>
        <DropdownNavigationMenu/>
        <ConnectButton/>
      </div>
      <MainSection/>
    </Container>
  </div>
);


const ArticleHeader = () => (
  <div className="header-out header-out--article">
    <Container>
      <div className="header d-flex justify-content-between align-items-start">
        <Logo/>
        <NavigationMenu/>
        <DropdownNavigationMenu/>
        <ConnectButton/>
      </div>
    </Container>
  </div>
);


const LotteryContextProvider = ({children}) => {
  const context = useWeb3Context();
  const [lottery, setLottery] = useState(null);
  useEffect(() => {
    if (context.active) {
      setLottery(new Lottery({
        web3: context.library,
        address: process.env.REACT_APP_LOTTERY_ADDRESS,
      }));
    } else {
      context.setConnector('Network');
    }
  }, [context, context.active]);
  return (
    <LotteryContext.Provider value={lottery}>
      {children}
    </LotteryContext.Provider>
  );
};


const MainBody = () => (
  <LotteryContextProvider>
    <ModalContainer>
      <div className="main-body">
        <Routes>
          <Route exact path="/howtoplay" element={<ArticleHeader/>}/>
          <Route exact path="/" element={<Header/>}/>
          <Route exact path="/tickets" element={<Header/>}/>
          <Route exact path="/odds" element={<Header/>}/>
          <Route exact path="/whitepaper" element={<ArticleHeader/>}/>
          <Route exact path="/blog" element={<Header/>}/>
          <Route exact path="/articles/:id" element={<ArticleHeader/>}/>
          <Route exact path="/partners" element={<ArticleHeader/>}/>
          <Route exact path="/pp" element={<ArticleHeader/>}/>
        </Routes>
        <Routes>
          <Route exact path="/howtoplay" element={<Article path="howtoplay"/>}/>
          <Route exact path="/" element={null}/>
          <Route exact path="/tickets" element={<MyTickets/>}/>
          <Route exact path="/odds" element={<OddsCalculator/>}/>
          <Route exact path="/whitepaper" element={<Article path="whitepaper"/>}/>
          <Route exact path="/blog" element={<Blog/>}/>
          <Route exact path="/articles/:id" element={<BlogArticle/>}/>
          <Route exact path="/partners" element={<Article path="partners"/>}/>
          <Route exact path="/pp" element={<Article path="pp"/>}/>
        </Routes>
      </div>
      <WalletModal/>
      <ReceiptModal/>
    </ModalContainer>
  </LotteryContextProvider>
);


const App = () => (
  <Router>
    <ConnectionProvider>
      <MainBody/>
    </ConnectionProvider>
  </Router>
);


export default App;
