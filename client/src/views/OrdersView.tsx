import React, { FunctionComponent, useState, useRef } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';

import { ViewProps } from '../res/interfaces';
import { functions } from '../res/firebase';

interface OrdersViewParams {
  symbol?: string;
}

// interface Order {
//   isBid: boolean;
//   symbol: string;
//   price: number;
//   amount: number;
//   playerID: number;
// }

const OrdersView: FunctionComponent<ViewProps> = (props) => {
  const { prices, holdings, player } = props;
  const { symbol } = useParams<OrdersViewParams>();

  const history = useHistory();

  const newTrade = useRef<{[field: string]: string | number | boolean}>({
    isBid: true,
    symbol: symbol || '',
    price: prices.find(price => price.symbol === symbol)?.currentPrice || 0.01,
    amount: 1,
    playerID: player!.id,
  });

  const getTotalCost = () => Number(newTrade.current.price) * Number(newTrade.current.amount);

  const [totalCost, setTotalCost] = useState(getTotalCost);

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const submit = async () => {
      if (newTrade.current['isBid']) {
        if (getTotalCost() > player!.buyingPower) {
          window.alert('Not enough buying power.');
          return;
        }
      } else {
        if (newTrade.current['amount'] > holdings[String(newTrade.current['symbol'])]?.shares || 0) {
          window.alert('Not enough shares.');
          return;
        }
      }
      const addOrder = functions.httpsCallable('addOrder');
      try {
        addOrder(newTrade.current);
        newTrade.current = {
          isBid: true,
          symbol: symbol || '',
          price: prices.find(price => price.symbol === symbol)?.currentPrice || 0,
          amount: 0,
          playerID: player!.id,
        };
        history.push('/stocks');
      } catch (err) {
        console.warn(err);
      }
    };
    submit();
  };

  const updateField = (field: string, value: any) => {
    newTrade.current[field] = value;
    console.log(newTrade.current);
    setTotalCost(getTotalCost());
  };
  
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ flexGrow: 1, marginRight: 50, marginLeft: 50 }}>
        <header>
          <h2> current prices </h2>
        </header>
        <table>
          <thead>
            <tr>
              <th>symbol</th>
              <th>price</th>
            </tr>
          </thead>
          <tbody>
            {prices.map(({ symbol, currentPrice }) => (
              <tr key={symbol}>
                <td>{symbol}</td>
                <td>${currentPrice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ flexGrow: 3, marginLeft: 50, marginRight: 50 }}>
        <div className="terminal-alert terminal-alert-primary">
          <b>buying power</b>: ${player ? player.buyingPower.toFixed(2) : '--.--'}
        </div>
        <form>
          <fieldset>
            <legend>submit a trade</legend>
            <div className="form-group">
              <label htmlFor={'select'}>trade type</label>
              <br />
              <input
                type={'radio'}
                id={'bid'}
                name={'type'}
                onChange={e => updateField('isBid', true)}
              />
              <label htmlFor={'bid'}>bid</label>
              &nbsp;&nbsp;&nbsp;
              <input
                type={'radio'}
                id={'ask'}
                name={'type'}
                onChange={e => updateField('isBid', false)}
              />
              <label htmlFor={'ask'}>ask</label>
              <br />
              <label htmlFor="symbol">symbol</label>
              <input
                type="text"
                id="symbol"
                minLength={1}
                defaultValue={symbol}
                onChange={e => updateField('symbol', e.target.value)}
              />
              <label htmlFor="price">price</label>
              <input
                id="price"
                type="number"
                min={0.01}
                step={0.01}
                defaultValue={Math.round((prices.find(price => price.symbol === symbol)?.currentPrice || 0) * 100) / 100}
                onChange={e => updateField('price', Number(e.target.value))}
              />
              <label htmlFor="quantity">quantity</label>
              <input
                id="quantity"
                type="number"
                min={1}
                step={1}
                defaultValue={1}
                onChange={e => updateField('amount', Number(e.target.value))}
              />
              <h2>Total cost: <u>${totalCost}</u></h2>
            </div>
            <button
              className={true ? 'btn btn-ghost' : 'btn btn-error btn-ghost'}
              onClick={handleSubmit}
            >
              trade
            </button>
          </fieldset>
        </form>
        <hr />
        <h2>current holdings</h2>
        <span>
          &nbsp;&middot;&nbsp;
        </span>
        {Object.keys(holdings).map((s) => (
          <span key={s}>
            <Link to={`/orders/${s}`}>{s}</Link>&nbsp;&middot;&nbsp;
          </span>
        ))}
        <br />
        <br />
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {Object.entries(holdings).map(([symbol, holding]) => (
            <div key={symbol}>
              <div className="terminal-card">
                <header>{symbol}</header>
                <div>
                  Number of shares: {holding.shares}
                  <br />
                  Total equity: ${(
                    (prices.find(price => price.symbol === holding.symbol)?.currentPrice || 0) * holding.shares
                  ).toFixed(2)}
                </div>
              </div>
              <br />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersView;
