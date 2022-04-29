import {useState} from 'react';

import {Container} from 'react-bootstrap';

import MathJax from 'react-mathjax-preview';

import {MainDropdown} from './Dropdowns';
import {SectionTitle} from './SectionTitle';
import Table from './Tables';

import {choose, COMBINATIONS} from './Utilities';


export const OddsCalculator = () => {
  const [playedNumbers, setPlayedNumbers] = useState(6);
  const calculateInverse = (k, i) => {
    const denominator = choose(90, 6) / (choose(k, i) * choose(90 - k, 6 - i));
    return Math.round(denominator * 100) / 100;
  };
  const calculateTotalInverse = k => {
    const denominator = 1 / [6, 5, 4, 3, 2]
        .map(i => 1 / calculateInverse(k, i))
        .reduce((a, b) => a + b, 0);
    return Math.round(denominator * 100) / 100;
  };
  return (
    <section className="blog odds">
      <Container>
        <SectionTitle title="Odds Calculator"/>
        <div className="probability">
          <div className="probability__header">
            <div className="probability__top">
              <div className="probability__top-shape">
                <div className="probability__top-title">
                  Probability of winning by playing
                </div>
                <MainDropdown
                    variant="secondary"
                    text={playedNumbers}
                    onSelect={key => setPlayedNumbers(key)}
                >
                  {COMBINATIONS.map((combinations, index) => (
                    <MainDropdown.Item
                        key={index}
                        text={index + 6}
                        active={index + 6 === playedNumbers}
                        eventKey={index + 6}/>
                  ))}
                </MainDropdown>
                <div className="probability__top-title">numbers</div>
              </div>
            </div>
          </div>
          <div className="probability__table">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Cell>Matches</Table.Cell>
                  <Table.Cell>Probability</Table.Cell>
                  <Table.Cell>Calculation</Table.Cell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {[6, 5, 4, 3, 2].map(i => (
                  <Table.Row key={i}>
                    <Table.Cell>{i}</Table.Cell>
                    <Table.Cell className="main-table__text--blue">
                      1 : {calculateInverse(playedNumbers, i)}
                    </Table.Cell>
                    <Table.Cell>
                      <MathJax math={`$
                        \\frac{
                          {${playedNumbers} \\choose ${i}}
                          \\cdot
                          {{90 - ${playedNumbers}} \\choose {6 - ${i}}}
                        }{90 \\choose 6} = \\frac{
                          ${choose(playedNumbers, i)}
                          \\cdot
                          ${choose(90 - playedNumbers, 6 - i)}
                        }{${choose(90, 6)}}
                      $`}/>
                    </Table.Cell>
                  </Table.Row>
                ))}
                <Table.Row>
                  <Table.Cell>2+</Table.Cell>
                  <Table.Cell className="main-table__text--blue">
                    1 : {calculateTotalInverse(playedNumbers)}
                  </Table.Cell>
                  <Table.Cell>
                    <MathJax math={`$
                      \\sum_{i = 2}^{6}{
                        \\frac{
                          {${playedNumbers} \\choose i}
                          \\cdot
                          {{90 - ${playedNumbers}} \\choose {6 - i}}
                        }{90 \\choose 6}
                      }
                    $`}/>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </div>
          <div className="probability__descr">
            In general, calculating the probability to match <em>i</em> of the 6 drawn numbers by
            playing a <em>k</em>-number ticket is done using the following formula:
          </div>
          <div className="probability__expression">
            <MathJax math={`$$
              \\frac{
                {k \\choose i} \\cdot {{90 - k} \\choose {6 - i}}
              }{
                {90 \\choose 6}
              }
            $$`}/>
          </div>
          <div className="probability__descr">
            That is the probability of matching <em>exactly i</em> of the drawn numbers. For the
            probability of winning at least 1 prize (that is, matching <em>at least 2</em> of the
            drawn numbers, as per last row of the table) we need to add up all the above
            probabilities.
          </div>
        </div>
      </Container>
    </section>
  );
};
