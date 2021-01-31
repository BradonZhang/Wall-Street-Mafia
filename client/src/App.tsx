import React, { useState, useEffect } from 'react';
import Ticker from 'react-ticker';
import {
  BrowserRouter as Router,
  Switch,
  Link,
  Route,
  Redirect,
} from 'react-router-dom';

import LoginView from './views/LoginView';
import StocksView from './views/StocksView';
import OrdersView from './views/OrdersView';
import { db } from './res/firebase';
import { Stock, Holding, Player, HoldingMap } from './res/interfaces';

function App() {
  const [username, setUsername] = useState('');
  
  const [prices, setPrices] = useState<Array<Stock>>([]);
  const [holdings, setHoldings] = useState<HoldingMap>({});
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    return db.collection('stocks').onSnapshot(querySnapshot => {
      const docs = [] as Array<Stock>;
      querySnapshot.forEach(doc => docs.push(doc.data() as Stock))
      setPrices(docs);
      console.log(docs);
    });
  }, []);

  useEffect(() => {
    if (!username) {
      setPlayer(null);
      return;
    };
    return db.collection('players').where('username', '==', username).onSnapshot(query => {
      const doc = query.docs[0];
      if (!doc) return;
      setPlayer(doc.data() as Player || null);
    });
  }, [username]);

  useEffect(() => {
    return db.collection('players').doc(String(player?.id)).collection('holdings').onSnapshot(querySnapshot => {
      const holdings = {} as HoldingMap;
      querySnapshot.forEach(doc => {
        const holding = doc.data() as Holding;
        holdings[holding.symbol] = holding;
      });
      setHoldings(holdings);
      console.log(holdings);
    });
  }, [player]);

  const handleLogin = (username: string) => {
    setUsername(username);
  };

  const viewProps = { prices, holdings, player };

  return (
    <Router>
      {username ? null : <Redirect to="/login" />}
      <div
        className="terminal"
        style={{ display: 'flex', height: '100%', flexDirection: 'column' }}
      >
        <div
          className="terminal-nav"
          style={{
            alignItems: 'flex-start',
            marginLeft: 100,
            marginRight: 100,
          }}
        >
          <header className="terminal-logo">
            <div className="logo terminal-prompt">wall street mafia</div>
            <blockquote>
              <small>
                the markets can remain irrational longer than you can remain
                solvent
              </small>
            </blockquote>
          </header>
          <nav className="terminal-menu">
            <ul>
              <li>
                <Link to="/stocks">
                  <a href={'.'}>stocks</a>
                </Link>
              </li>
              <li>
                <Link to="/orders">
                  <a href={'.'}>orders</a>
                </Link>
              </li>
              <li>{username ? username : <b>not logged in</b>}</li>
            </ul>
          </nav>
        </div>
        <div
          className="container"
          style={{
            padding: 0,
            flex: 1,
            overflow: 'auto',
            paddingBottom: '10%',
          }}
        >
          <Switch>
            <Route path="/login">
              <LoginView onLogin={handleLogin} />
            </Route>
            <Route path="/stocks">
              {username ? <StocksView {...viewProps} /> : <Redirect to={'/login'} />}
            </Route>
            <Route path="/orders/:symbol">
              {username ? <OrdersView {...viewProps} /> : <Redirect to={'/login'} />}
            </Route>
            <Route path="/orders">
              {username ? <OrdersView {...viewProps} /> : <Redirect to={'/login'} />}
            </Route>
            <Route path="/">
              <Redirect to="/login" />
            </Route>
          </Switch>
        </div>
        <div
          className="terminal-alert"
          style={{
            bottom: 0,
            position: 'fixed',
            width: '100%',
            backgroundColor: '#000000',
            color: '#3db818',
            margin: 0,
            padding: 0,
            borderWidth: 0,
            borderTopWidth: 1,
          }}
        >
          <Ticker offset={'run-in'}>
            {() => prices.length ? 
              prices.map(({ symbol: s, currentPrice: p }) => (
                <h1 key={s} style={{ color: '#7ee460' }} >
                  {s} ${p.toFixed(2)}&nbsp;&middot;&nbsp;
                </h1>
              )) : <h1>&nbsp;</h1>
            }
          </Ticker>
        </div>
      </div>
    </Router>
  );
}

export default App;
