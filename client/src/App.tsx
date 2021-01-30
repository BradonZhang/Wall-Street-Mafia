import React, { useState, useEffect } from 'react';
import Ticker from 'react-ticker';
import {
  BrowserRouter as Router,
  Switch,
  Link,
  Route,
  Redirect,
  useHistory,
} from 'react-router-dom';

import Login from './views/Login';
import Stocks from './views/Stocks';
import Orders from './views/Orders';
import { db } from './res/firebase';

interface Price {
  symbol: string;
  currentPrice: number;
}

function App() {
  const [user, setUser] = useState('');
  const [prices, setPrices] = useState<Array<Price>>([]);
  const history = useHistory();
  
  useEffect(() => {
    const unsubscribe = db.collection('stocks').onSnapshot(querySnapshot => {
      const docs = [] as Array<Price>;
      querySnapshot.forEach(doc => docs.push(doc.data() as Price))
      setPrices(docs);
      console.log(docs);
    });
    return unsubscribe;
  }, []);
  return (
    <Router>
      {user ? null : <Redirect to="/login" />}
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
            {/* <blockquote>
              <small>
                the markets can remain irrational longer than you can remain
                solvent
              </small>
            </blockquote> */}
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
              <li>{user ? user : 'not logged in'}</li>
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
              <Login setUser={setUser} user={user} />
            </Route>
            <Route path="/stocks">
              {user ? <Stocks /> : <Redirect to="/login" />}
            </Route>
            <Route path="/orders">
              {user ? <Orders /> : <Redirect to="/login" />}
            </Route>
            <Route path="/:symbol"></Route>
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
            backgroundColor: '#3db818',
            margin: 0,
          }}
        >
          <Ticker offset={'run-in'}>
            {() => prices.length ? 
              prices.map(({ symbol: s, currentPrice: p }) => (
                <h1 key={s}>
                  {s} ${p}&nbsp;&middot;&nbsp;
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
