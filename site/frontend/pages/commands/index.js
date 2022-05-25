import Head from 'next/head';
import Image from 'next/image';
import styles from './commands.module.scss';
import { HeaderNav } from '../../components/NavBar/HeaderNav';
import {Button} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

export default function commands () {
    return(
        <div className = {styles.home}>
            <HeaderNav/>
            <main className={styles.main}>
                <h1 className={styles.title}>Commands</h1>
                <div className = {styles.table_container}>
                <table className='table table-striped'>
                    <thead className= 'table-dark'>
                        <tr>
                            <th scope='col'>Command</th>
                            <th scope='col'>Description</th>
                            <th scope='col'>Example Usage</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope='row'>/paper balance</th>
                            <td>Check your paper trading cash balance.</td>
                            <td>/paper balance</td>
                        </tr>
                        <tr>
                            <th scope='row'>/paper price</th>
                            <td>Check the real-time price of a stock.</td>
                            <td>/paper price TSLA</td>
                        </tr>
                        <tr>
                            <th scope='row'>/paper buy</th>
                            <td>Buy a stock.</td>
                            <td>/paper buy TSLA .6 or /paper buy TSLA $500</td>
                        </tr>
                        <tr>
                            <th scope='row'>/paper sell</th>
                            <td>Sell a stock.</td>
                            <td>/paper sell TSLA .6 or /paper sell TSLA $500 or /paper sell TSLA all</td>
                        </tr>
                        <tr>
                            <th scope='row'>/paper portfolio</th>
                            <td>Lists your paper trading portfolio.</td>
                            <td>/paper portfolio</td>
                        </tr>
                    </tbody>
                </table>
                </div>
                
            </main>
        </div>
    )
}