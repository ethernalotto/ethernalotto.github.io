import {Container} from 'react-bootstrap';

import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

import {loadSource} from '../lib/Article';


export default function Page({source}) {
  return (
    <div className="main-body">
      <section className="article">
        <Container>
          <div className="article__wrap d-flex justify-content-start align-items-start flex-column flex-lg-row">
            <aside className="article__sidebar">
              <div className="article__date">25.03.2023</div>
            </aside>
            <article className="article__body text">
              <ReactMarkdown remarkPlugins={[gfm]}>{source}</ReactMarkdown>
            </article>
          </div>
        </Container>
      </section>
    </div>
  );
}


export const getStaticProps = async () => {
  return {
    props: {
      source: await loadSource('goodbye'),
    },
  };
};
