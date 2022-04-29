import {useEffect, useState} from 'react';
import {useWeb3Context} from 'web3-react';

import Web3 from 'web3';

import {MainDropdown} from './Dropdowns';
import {LotteryContext} from './LotteryContext';
import {USDPriceFeed, NonUSDPriceFeed} from './PriceFeeds';
import {getTimeOfNextDraw} from './Utilities';


const currencies = {
  'USD': {
    name: 'USD',
    symbol: '$',
    getPriceFeed: web3 => new USDPriceFeed(web3),
  },
  'EUR': {
    name: 'EUR',
    symbol: '€',
    getPriceFeed: web3 => new NonUSDPriceFeed(web3, process.env.REACT_APP_EUR_USD_PRICE_FEED),
  },
  'GBP': {
    name: 'GBP',
    symbol: '£',
    getPriceFeed: web3 => new NonUSDPriceFeed(web3, process.env.REACT_APP_GBP_USD_PRICE_FEED),
  },
};


const JackpotConversion = ({jackpot}) => {
  const {library} = useWeb3Context();
  const [currency, setCurrency] = useState('USD');
  const [converted, setConverted] = useState(null);
  useEffect(() => {
    (async () => {
      setConverted(null);
      const priceFeed = currencies[currency].getPriceFeed(library);
      const converted = jackpot * (await priceFeed.getLatestPrice());
      setConverted(Math.floor(converted * 100) / 100);
    })();
  }, [currency, jackpot, library]);
  return (
    <div className="jackpot__currency">
      <div className="jackpot__currency-shadow">
        <div className="jackpot__currency-shadow-clip"></div>
      </div>
      <div className="jackpot__currency-wrap">
        <div className="jackpot__currency-select">
          <MainDropdown text={currencies[currency].symbol} onSelect={key => setCurrency(key)}>
            {Object.values(currencies).map(({name, symbol}) => (
              <MainDropdown.Item
                  key={name}
                  text={symbol}
                  active={currency === name}
                  eventKey={name}/>
            ))}
          </MainDropdown>
        </div>
        <div className="jackpot__currency-selected">{converted}</div>
      </div>
      <div className="jackpot__currency-descr">
        *based on <span>current MATIC market price</span>
      </div>
    </div>
  );
};


const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const ONE_MINUTE_IN_MS = 60 * 1000;


const NextDraw = () => {
  const [timeToDraw, setTimeToDraw] = useState(null);
  useEffect(() => {
    const updateTime = () => {
      setTimeToDraw(getTimeOfNextDraw() - Date.now());
    };
    const interval = window.setInterval(updateTime, ONE_MINUTE_IN_MS);
    updateTime();
    return () => {
      window.clearInterval(interval);
    };
  }, []);
  const getDays = () => {
    if (timeToDraw) {
      return Math.floor((timeToDraw % ONE_WEEK_IN_MS) / ONE_DAY_IN_MS);
    } else {
      return '';
    }
  };
  const getHours = () => {
    if (timeToDraw) {
      return Math.floor((timeToDraw % ONE_DAY_IN_MS) / ONE_HOUR_IN_MS);
    } else {
      return '';
    }
  };
  const getMinutes = () => {
    if (timeToDraw) {
      return Math.floor((timeToDraw % ONE_HOUR_IN_MS) / ONE_MINUTE_IN_MS);
    } else {
      return '';
    }
  };
  return (
    <div className="next-draw">
      <div className="next-draw__title">Next Draw</div>
      <div className="next-draw__timeline">
        <div className="row">
          <div className="col-4 next-draw__item">
            <div className="next-draw__item-in">
              <div className="next-draw__item-title">{getDays()}</div>
              <div className="next-draw__item-sub">Days</div>
            </div>
          </div>
          <div className="col-4 next-draw__item">
            <div className="next-draw__item-in">
              <div className="next-draw__item-title">{getHours()}</div>
              <div className="next-draw__item-sub">Hours</div>
            </div>
          </div>
          <div className="col-4 next-draw__item">
            <div className="next-draw__item-in">
              <div className="next-draw__item-title">{getMinutes()}</div>
              <div className="next-draw__item-sub">Minutes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const JackpotInner = ({lottery}) => {
  const [jackpot, setJackpot] = useState(null);
  useEffect(() => {
    if (lottery) {
      const subscription = lottery.subscribeToJackpot(jackpot => {
        setJackpot(parseFloat(Web3.utils.fromWei(jackpot)));
      });
      return () => {
        subscription.cancel();
      };
    }
  }, [lottery]);
  return (
    <div className="jackpot">
      <div className="jackpot__main-shadow">
        <div className="jackpot__title">
          <div className="one-row-title">
            <div className="one-row-title__top-frame">
              <div className="one-row-title__top-frame-clip"></div>
            </div>
            <div className="one-row-title__frame">
              <div className="one-row-title__frame-in">
                <div className="one-row-title__main-text">Current Jackpot</div>
              </div>
            </div>
          </div>
        </div>
        <div className="jackpot__main">
          <div className="jackpot__top-win">
            {(jackpot !== null) && `${Math.floor(jackpot * 100) / 100}`}
          </div>
          {(jackpot !== null) && (<JackpotConversion jackpot={jackpot}/>)}
          <NextDraw/>
        </div>
      </div>
    </div>
  );
};


export const Jackpot = () => (
  <LotteryContext.Consumer>{lottery => (
    <JackpotInner lottery={lottery}/>
  )}</LotteryContext.Consumer>
);
