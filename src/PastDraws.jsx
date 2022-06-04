import {useEffect, useState} from 'react';

import {Card} from './Card';
import {LotteryContext} from './LotteryContext';
import {SectionTitle} from './SectionTitle';


const DrawList = ({lottery}) => {
  const [draws, setDraws] = useState([]);
  useEffect(() => {
    (async () => {
      const data = await Promise.all([-1, -2, -3].map(async round => {
        try {
          return await lottery.getDrawnNumbers(round);
        } catch (e) {
          return null;
        }
      }));
      setDraws(data.filter(draw => !!draw));
    })();
  }, [lottery]);
  return (
    <section className="draws d-flex justify-content-start align-items-center flex-column flex-lg-row align-items-lg-start">
      {draws.map(({date, numbers}, index) => (
        <Card key={index} date={date} numbers={numbers}/>
      ))}
    </section>
  );
};


export const PastDraws = ({lottery}) => (
  <section className="past-draws">
    <div className="container">
      <SectionTitle title="Past Draws"/>
      <LotteryContext.Consumer>{lottery => lottery ? (
        <DrawList lottery={lottery}/>
      ) : null}</LotteryContext.Consumer>
    </div>
  </section>
);
