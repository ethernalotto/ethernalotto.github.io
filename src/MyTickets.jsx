import {useEffect, useState} from 'react';

import {useWeb3Context} from 'web3-react';

import {LotteryContext} from './LotteryContext';
import {SectionTitle} from './SectionTitle';


function formatNumber(value: number): string {
  return ('0' + value).slice(-2);
}


const Ticket = ({date, numbers}) => (
  <div className="draws__item">
    <div className="draws__frame">
      <div className="draws__date">
        {formatNumber(date.getDate())}.{formatNumber(date.getMonth() + 1)}.{formatNumber(date.getFullYear())}
      </div>
      <div className="draws__main-shadow">
        <div className="draws__main">
          <div className="my-numbers__out">
            <div className="my-numbers">
              <div className="my-numbers__title">Numbers</div>
              <div className="my-numbers__body">
                {numbers.map((number, index) => (
                  <div key={index} className="my-numbers__item">
                    <span className="my-numbers__text">{number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="prize">
          </div>
        </div>
      </div>
    </div>
  </div>
);


const TicketList = ({lottery, account}) => {
  const [tickets, setTickets] = useState([]);
  useEffect(() => {
    (async () => {
      setTickets(await lottery.getTickets(account));
    })();
  }, [account, lottery]);
  return (
    <section className="draws d-flex justify-content-start align-items-center flex-column flex-lg-row align-items-lg-start">
      {tickets.map(({date, numbers}, index) => (
        <Ticket key={index} date={date} numbers={numbers}/>
      ))}
    </section>
  );
};


export const MyTickets = () => {
  const {account} = useWeb3Context();
  return (
    <section className="past-draws">
      <div className="container">
        <SectionTitle title="My Tickets"/>
        {account ? (
          <LotteryContext.Consumer>{lottery => (
            <TicketList lottery={lottery} account={account}/>
          )}</LotteryContext.Consumer>
        ) : (
          <article>
            <p className="past-draws__descr">Please connect your wallet.</p>
          </article>
        )}
      </div>
    </section>
  );
};
