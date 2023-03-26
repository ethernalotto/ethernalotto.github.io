import Head from 'next/head';

import {GoogleAnalytics} from "nextjs-google-analytics";

import styles from '@/styles/main.scss';


export default function App({Component, pageProps}) {
  return (
    <>
      <Head>
        <title>EthernaLotto</title>
        <link rel="icon" href="/favicon.png"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="theme-color" content="#000000"/>
        <meta name="description" content="EthernaLotto"/>
      </Head>
      <GoogleAnalytics trackPageViews/>
      <Component {...pageProps}/>
    </>
  );
}
