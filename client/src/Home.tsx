import 'terminal.css';

function Home() {
    return (
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div style={{flexGrow: 2}}>
                <header>
                    <h2>current prices</h2>
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

                        </tr>
                    </tbody>
                </table>
            </div>
            <div style={{flexGrow: 1}} />
            <div style={{flexGrow: 6}}>
                asdfasdf
            </div>
        </div>
    )
}

export default Home;