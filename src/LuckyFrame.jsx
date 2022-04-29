import {useEffect, useState} from 'react';

import Web3 from 'web3';
import {useWeb3Context} from 'web3-react';

import {LotteryContext} from './LotteryContext';
import {ModalContext, Modal} from './Modals';
import {getTimeOfNextDraw, range, COMBINATIONS} from './Utilities';


const Picker = ({numbers, onClick}) => (
  <div className="lucky-picker d-none d-lg-block">
    <div className="picker-table">
      {range(9).map(i => range(10).map(j => {
        const number = i * 10 + j + 1;
        const active = numbers.includes(number);
        return (
          <span key={number} className={`picker-table__item ${
              active && 'picker-table__item--active'}`}>
            <span className="picker-table__item-in" onClick={() => onClick(number)}>
              <span className="picker-table__text">{number}</span>
            </span>
          </span>
        );
      }))}
    </div>
  </div>
);


const NumberList = ({numbers, splice}) => (
  <div className="list-activated d-flex justify-content-start flex-wrap">
    {numbers.map((number, index) => (
      <div key={index} className="list-activated__item" onClick={() => splice(index)}>
        <div className="list-activated__item-in">
          <span className="list-activated__text">{number}</span>
        </div>
      </div>
    ))}
  </div>
);


const NumberStats = ({lottery, numbers}) => {
  const [price, setPrice] = useState(null);
  useEffect(() => {
    (async () => {
      setPrice(null);
      if (lottery && numbers.length >= 6) {
        const priceValue = parseFloat(Web3.utils.fromWei(await lottery.getTicketPrice(numbers)));
        setPrice(Math.round(priceValue * 100) / 100);
      }
    })();
  }, [lottery, numbers]);
  return (
    <div className="lucky-statistic d-flex justify-content-around align-items-center">
      <div className="lucky-statistic__total">
        <div className="lucky-statistic__title">Total Numbers</div>
        <div className="lucky-statistic__subtitle">{numbers.length}</div>
      </div>
      <div className="lucky-statistic__played">
        <div className="lucky-statistic__title">Played Combinations</div>
        <div className="lucky-statistic__subtitle">
          {(numbers.length < 6) ? 0 : COMBINATIONS[numbers.length - 6]}
        </div>
      </div>
      <div className="lucky-statistic__cost">
        <div className="lucky-statistic__title">Price (MATIC)</div>
        <div className="lucky-statistic__subtitle">{price}</div>
      </div>
    </div>
  );
};


const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];


const PlayButton = ({numbers, onPlayed}) => {
  const context = useWeb3Context();

  const [nextDraw, setNextDraw] = useState(new Date(getTimeOfNextDraw()));

  useEffect(() => {
    const updateTime = () => {
      setNextDraw(new Date(getTimeOfNextDraw()));
    };
    const interval = window.setInterval(updateTime, 60000);
    updateTime();
    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const playNumbers = async (lottery) => {
    if (numbers.length < 6) {
      return null;
    }
    try {
      return await lottery.buyTicket(numbers, context.account);
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  return (
    <ModalContext.Consumer>{({showModal}) => (
      <LotteryContext.Consumer>{lottery => (
        <div className="lucky-list__buttons">
          <button className="btn-s btn-play" onClick={async () => {
            if (context.account) {
              const receipt = await playNumbers(lottery);
              if (receipt) {
                onPlayed();
                showModal('receipt', numbers, receipt);
              }
            } else {
              showModal('wallet');
            }
          }}>
            <span className="btn-s__frame btn-play__frame">
              <span className="btn-s__text">Play</span>
              <span className="btn-play-in btn-s">
                <span className="btn-play-in__frame btn-s__frame">
                  <span className="btn-play-in__text">
                    {MONTHS[nextDraw.getMonth()]} <b>{nextDraw.getDate()}</b>, <b>{nextDraw.getFullYear()}</b> Drawing
                  </span>
                </span>
              </span>
            </span>
          </button>
        </div>
      )}</LotteryContext.Consumer>
    )}</ModalContext.Consumer>
  );
};


const LuckyList = ({numbers, splice, onPlayed}) => (
  <div className="lucky-list">
    <NumberList numbers={numbers} splice={splice}/>
    <LotteryContext.Consumer>{lottery => (
      <NumberStats lottery={lottery} numbers={numbers}/>
    )}</LotteryContext.Consumer>
    <PlayButton numbers={numbers} onPlayed={onPlayed}/>
  </div>
);


export const LuckyFrame = () => {
  const [numbers, setNumbers] = useState([]);
  return (
    <div className="lucky-frame__wrap">
      <div className="lucky-titles d-flex justify-content-between">
        <div className="lucky-titles__left">
          <div className="two-rows-title d-none d-lg-inline-block">
            <div className="two-rows-title__top-frame">
              <div className="two-rows-title__top-frame-clip"></div>
            </div>
            <div className="two-rows-title__frame">
              <div className="two-rows-title__frame-in">
                <div className="two-rows-title__main-text">
                  Pick Your Lucky Numbers
                </div>
                <div className="two-rows-title__sub-text">
                  Min 6 - Max {COMBINATIONS.length + 5}
                </div>
              </div>
            </div>
          </div>
          <div className="one-row-title d-lg-none">
            <div className="one-row-title__top-frame">
              <div className="one-row-title__top-frame-clip"></div>
            </div>
            <div className="one-row-title__frame">
              <div className="one-row-title__frame-in">
                <div className="one-row-title__main-text">
                  Pick Your Lucky Numbers
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lucky-titles__right d-none d-lg-block">
          <div className="one-row-title">
            <div className="one-row-title__top-frame">
              <div className="one-row-title__top-frame-clip"></div>
            </div>
            <div className="one-row-title__frame">
              <div className="one-row-title__frame-in">
                <div className="one-row-title__main-text">Your Lucky List</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lucky-frame__shadow">
        <div className="lucky-frame d-flex justify-content-between align-items-start">
          <Picker numbers={numbers} onClick={number => {
            const i = numbers.indexOf(number);
            if (i < 0) {
              if (numbers.length < COMBINATIONS.length + 5) {
                numbers.push(number);
              }
            } else {
              numbers.splice(i, 1);
            }
            setNumbers(numbers.slice());
          }}/>
          <LuckyList
              numbers={numbers}
              splice={index => {
                const newNumbers = numbers.slice();
                newNumbers.splice(index, 1);
                setNumbers(newNumbers);
              }}
              onPlayed={() => {
                setNumbers([]);
              }}/>
        </div>
      </div>
      <div className="lucky-frame__shadow-double"></div>
    </div>
  );
};


export const ReceiptModal = () => (
  <ModalContext.Consumer>{({name, params: [numbers, receipt]}) => name !== 'receipt' ? null : (
    <Modal name="receipt" className="modal-ticket-submitted" title="Ticket Submitted!">
      <div className="my-numbers">
        <div className="my-numbers__title">You played the following numbers:</div>
        <div className="my-numbers__body">
          {numbers.map((number, index) => (
            <div className="my-numbers__item" key={index}>
              <span className="my-numbers__text">{number}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="transactions-final">
        <div className="transactions-final__in">
          <div className="transactions-final__item">
            <div>Transaction: <a href={`https://polygonscan.com/tx/${receipt.transactionHash}`} target="_blank" rel="noreferrer" className="transactions-final__trans-id">{receipt.transactionHash}</a></div>
          </div>
        </div>
      </div>
    </Modal>
  )}</ModalContext.Consumer>
);
