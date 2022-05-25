import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.scss';
import { HeaderNav } from '../components/NavBar/HeaderNav';
import {Button} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
  return (
    <div className = {styles.home}>
      <HeaderNav />

      <main className={styles.main}>
        <h1 className={styles.title}>
          Paper Stonks Bot! A Discord Paper Trading Bot.
        </h1>
        <h2 className = {styles.bot_description}>A bot that allows users in your server to buy and sell stocks with paper money using real-time prices.</h2>
        <p className={styles.description}>
          
          <Button
            onClick={() =>
              window.open('http://localhost:4000/auth/discord', '_self')
            }
          >
            Add To Server
          </Button>
        </p>
      </main>

      <footer className={styles.footer}>
        <a
          href='https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app'
          target='_blank'
          rel='noopener noreferrer'
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src='/vercel.svg' alt='Vercel Logo' width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}
