import React from 'react';
import { useState } from 'react';
import 'terminal.css';
import Login from './Login';
import Home from './Home';

function App() {
  const [user, setUser] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  return (
    <div className="terminal">
      <div className="container" style={{padding: 0}}>
        <div className="terminal-nav" style={{alignItems: 'flex-start'}}>
          <header className="terminal-logo">
            <div className="logo terminal-prompt">
              wall street mafia
            </div>
            <blockquote>
                <small>the markets can remain irrational longer than you can remain solvent</small>
            </blockquote>
          </header>
          <nav className="terminal-menu">
            <ul>
              <li>{(loggedIn && user) ? user : "not logged in"}</li>
            </ul>
          </nav>
        </div>
        {loggedIn ? null : <Login user={user} setUser={setUser} logIn={() => setLoggedIn(true)}/>}
      {loggedIn ? <Home /> : null }
        </div>
    </div>
  );
}

export default App;
