import {useEffect, useState} from 'react';

import {Link} from 'react-router-dom';

import {Container} from 'react-bootstrap';

import stockImage from './images/stock.jpg';

import {loadIndex} from './Articles';
import {SectionTitle} from './SectionTitle';
import {deepCompare} from './Utilities';


export const Blog = () => {
  const [index, setIndex] = useState([]);
  useEffect(() => {
    (async () => {
      const newIndex = await loadIndex();
      newIndex.reverse();
      if (!deepCompare(index, newIndex)) {
        setIndex(newIndex);
      }
    })();
  }, [index]);
  return (
    <section className="blog">
      <Container>
        <SectionTitle title="Blog"/>
        <div className="blog-items d-flex justify-content-start align-items-start flex-wrap">
          {index.map(({id, title, date, excerpt}, index) => (
            <div key={index} className="blog-items__item">
              <div className="blog-items__frame-pic">
                <div className="blog-items__date">{date}</div>
                <div className="blog-items__pic">
                  <img src={stockImage} alt=""/>
                </div>
              </div>
              <div className="blog-items__title">{title}</div>
              <div className="blog-items__descr">{excerpt}</div>
              <div className="blog-items__button">
                <Link to={`/articles/${id}`} className="btn btn-details">
                  <span className="btn-details__text">Read More</span>
                  <span className="btn-details__shadow"></span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
