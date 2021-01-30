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
      <div className="container">
        <div className="terminal-nav">
          <header className="terminal-logo">
            <div className="logo terminal-prompt">
              wall street mafia
            </div>
            <blockquote>
                <small>the markets can remain irrational longer than you can remain solvent</small>
            </blockquote>
          </header>
        </div>
        {loggedIn ? null : <Login user={user} setUser={setUser} logIn={() => setLoggedIn(true)}/>}
      </div>
      {loggedIn ? <Home /> : null }
    </div>
  );
}

export default App;
