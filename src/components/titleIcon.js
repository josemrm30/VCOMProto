import Head from 'next/head';

export const TitleIcon = () => {
  return (
    <>
      <Head>
        <title>VCOM</title>
        <link rel = "icon" href ="/ondas.png" type = "image/png" sizes="32x32"/>
        <meta property="og:title" content="VCOM" key="title" />
      </Head>
    </>
  );
};