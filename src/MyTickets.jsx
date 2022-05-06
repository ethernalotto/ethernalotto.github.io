import {useEffect, useState} from 'react';

import {useWeb3Context} from 'web3-react';

import {LotteryContext} from './LotteryContext';
import {SectionTitle} from './SectionTitle';


const Ticket = ({date, numbers, txid}) => (
  <div className="draws__item">
    <div className="draws__frame">
      <div className="draws__date">12.05.21</div>
      <div className="draws__main-shadow">
        <div className="draws__main">
          <div className="my-numbers__out">
            <div className="my-numbers">
              <div className="my-numbers__title">Numbers</div>
              <div className="my-numbers__body">
                {numbers.map(number => (
                  <div className="my-numbers__item">
                    <span className="my-numbers__text">{number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div class="prize prize--empty">
            <div class="prize__transaction">
              Transaction: <a href={`https://polygonscan.com/transaction/${txid}`} target="_blank" rel="noreferrer">{txid}</a>
            </div>
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
      {tickets.map(({date, numbers, receipt}) => (
        <Ticket date={date} numbers={numbers} txid={receipt.transactionHash}/>
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
