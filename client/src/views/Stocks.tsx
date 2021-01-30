// import 'terminal.css';

function Home() {
  let stockSymbols = ['GME', 'AMC', 'MSFT', 'AAPL', 'GOOGL', 'COF', 'AXP', 'HD', 'C', 'ACN'];
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column'}}>
      <div className="terminal-alert terminal-alert-primary">
        <b>buying power</b>: $1234.56
      </div>
      <div style={{ flexGrow: 1, marginRight: 50, marginLeft: 50 }}>
        <header>
          <h2> available stocks </h2>
        </header>
        <table>
          <thead>
            <tr>
              <th>symbol</th>
              <th>last exec. price</th>
              <th>no. of shares</th>
              <th>avg. cost</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 100 }, (_, i) => i + 1).map(() => (
              <tr>
                <td><a>AAPL</a></td>
                <td>$125.64</td>
                <td>5</td>
                <td>$25.24</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* <div style={{ flexGrow: 3, marginLeft: 50, marginRight: 50 }}>
        <div className="terminal-alert terminal-alert-primary">
          <b>buying power</b>: $1234.56
        </div>
        <form>
          <fieldset>
            <legend>submit a trade</legend>
            <div className="form-group">
              <label htmlFor="username">name</label>
              <input id="username" minLength={1} type="text"></input>
            </div>
            <button
              className={true ? 'btn btn-ghost' : 'btn btn-error btn-ghost'}
            >
              trade
            </button>
          </fieldset>
        </form>
        <hr />
        <h2>current holdings</h2>
        {stockSymbols.map((s) => (
          <div style={{ display: 'inline' }}>
            <a>{s}</a>,{' '}
          </div>
        ))}
        <br />
        <br />
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {stockSymbols.map((s) => (
            <div>
              <div className="terminal-card">
                <header>{s}</header>
                <div>
                  Sample information about this stock... The number of shares...
                  The total amount of equity...
                </div>
              </div>
              <br />
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}

export default Home;
