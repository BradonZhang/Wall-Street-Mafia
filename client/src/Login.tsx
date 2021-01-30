import 'terminal.css';

function Login(props: { setUser: (arg0: string) => void; user: string; logIn: () => void}) {
    return (
        <form>
          <fieldset>
            <legend>enter the market</legend>
            <div className="form-group">
              <label htmlFor="username">name</label>
              <input id="username" minLength={1} type="text" onChange={(e) => props.setUser(e.target.value)}></input>
            </div>
            <button onClick={props.logIn} className={props.user ? "btn btn-primary btn-ghost" : "btn btn-error btn-ghost"}>log in</button>
          </fieldset>
        </form>
    )
}

export default Login;