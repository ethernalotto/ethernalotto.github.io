import {useEffect, useState} from 'react';

import {Container} from 'react-bootstrap';
import {Link, useParams} from 'react-router-dom';

import ReactMarkdown from 'react-markdown';

import {unified} from 'unified';
import gfm from 'remark-gfm';
import frontmatter from 'remark-frontmatter';
import rehypeRaw from 'rehype-raw';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';

import YAML from 'yaml';

import {PartnerStatus} from './PartnerStatus';


const components = {
  a: ({children, href, ...props}) => {
    if (/^[^/]+:/.test(href)) {
      // external link
      return (
        <a href={href} {...props} target="_blank" rel="noreferrer">
          {children}
        </a>
      );
    } else {
      return (
        <Link to={href} {...props}>{children}</Link>
      );
    }
  },
  object: ({name}) => {
    switch (name) {
    case 'account-status':
      return (<PartnerStatus/>);
    default:
      return null;
    }
  },
};


export const Article = ({path, children}) => {
  const [markdown, setMarkdown] = useState('');
  const [date, setDate] = useState('');
  const parseFrontMatter = node => {
    if ('root' === node.type && node.children.length > 0) {
      const child = node.children[0];
      if ('yaml' === child.type) {
        const parsed = YAML.parse(child.value);
        setDate(parsed.date || '');
      }
    }
  };
  useEffect(() => {
    (async () => {
      const response = await window.fetch(`/${path}.md`, {
        headers: {
          'Content-Type': 'text/markdown',
        },
      });
      const markdown = await response.text();
      setMarkdown(markdown);
      unified()
          .use(remarkParse)
          .use(remarkStringify)
          .use(frontmatter)
          .use(() => parseFrontMatter)
          .process(markdown);
    })();
  }, [path]);
  return (
    <section className="article">
      <Container>
        <div className="article__wrap d-flex justify-content-start align-items-start flex-column flex-lg-row">
          <aside className="article__sidebar">
            <div className="article__date">{date}</div>
          </aside>
          <article className="article__body text">
            <ReactMarkdown
                remarkPlugins={[gfm, frontmatter]}
                rehypePlugins={[rehypeRaw]}
                components={components}
                children={markdown}/>
          </article>
        </div>
      </Container>
    </section>
  );
};


export const BlogArticle = () => {
  const {id} = useParams();
  return (<Article path={`articles/${id}`}/>);
};


export async function loadIndex() {
  const response = await window.fetch('articles/index.json', {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
}
