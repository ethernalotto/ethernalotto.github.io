import {useEffect, useState} from 'react';

import {useWeb3Context} from 'web3-react';

import {Card} from './Card';
import {LotteryContext} from './LotteryContext';
import {SectionTitle} from './SectionTitle';


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
        <Card key={index} date={date} numbers={numbers}/>
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
