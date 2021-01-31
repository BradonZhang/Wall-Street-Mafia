import React, { FunctionComponent, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { ViewProps } from '../res/interfaces';

const StocksView: FunctionComponent<ViewProps> = (props) => {
  const { prices, holdings, player } = props;
  // let stockSymbols = ['GME', 'AMC', 'MSFT', 'AAPL', 'GOOGL', 'COF', 'AXP', 'HD', 'C', 'ACN'];

  const totalEquity = useMemo(() => {
    return (player?.buyingPower || 0) + prices.reduce((accum, { currentPrice, symbol }) => (
      accum + currentPrice * (holdings[symbol]?.shares || 0)
    ), 0)
  }, [prices, holdings, player])

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', flexDirection: 'row', alignItems: "flex-start", width: '100%'}}>
      <div style={{ flexDirection: 'column' }}>
        <div className="terminal-alert terminal-alert-primary" style={{flexShrink: 5}}>
          <b>buying power</b>: ${player?.buyingPower.toFixed(2) || '--.--'}
        </div>
        <div className="terminal-alert terminal-alert-primary" style={{flexShrink: 5}}>
          <b>total equity</b>: ${totalEquity.toFixed(2) || '--.--'}
        </div>
      </div>
      <div style={{ flexGrow: 3, marginRight: 50, marginLeft: 50 }}>
        <header>
          <h2> available stocks </h2>
        </header>
        <table>
          <thead>
            <tr>
              <th>symbol</th>
              <th>last exec. price</th>
              <th>no. of shares</th>
              <th>total equity</th>
              <th>avg. cost</th>
            </tr>
          </thead>
          <tbody>
            {prices.map(({ symbol, currentPrice }) => {
              const holding = holdings[symbol];
              const shares = holding?.shares || 0;
              return (
                <tr key={symbol}>
                  <td><Link to={`/orders/${symbol}`}>{symbol}</Link></td>
                  <td>${currentPrice.toFixed(2)}</td>
                  <td>{shares}</td>
                  <td>${(currentPrice * shares).toFixed(2)}</td>
                  <td>{holding ? `$${holding.avgCost.toFixed(2)}` : '-'}</td>
                </tr>
              );
            })}
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
};

export default StocksView;
