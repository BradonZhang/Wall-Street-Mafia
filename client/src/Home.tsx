import 'terminal.css';

function Home() {
    return (
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div style={{flexGrow: 1, marginRight: 50, marginLeft: 50}}>
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
                        <tr>
                            <td>AAPL</td>
                            <td>$125.64</td>
                        </tr>
                        <tr>
                            <td>AAPL</td>
                            <td>$125.64</td>
                        </tr>
                        <tr>
                            <td>AAPL</td>
                            <td>$125.64</td>
                        </tr>
                        <tr>
                            <td>AAPL</td>
                            <td>$125.64</td>
                        </tr>
                        <tr>
                            <td>AAPL</td>
                            <td>$125.64</td>
                        </tr>
                        <tr>
                            <td>AAPL</td>
                            <td>$125.64</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div style={{flexGrow: 3, marginLeft: 50, marginRight: 50}}>
                <div className='terminal-alert'>
                    buying power: $1234.56
                </div>
            </div>
        </div>
    )
}

export default Home;