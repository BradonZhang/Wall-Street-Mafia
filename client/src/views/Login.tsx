// import 'terminal.css';
import { useHistory } from 'react-router-dom';

function Login(props: { setUser: (arg0: string) => void; user: string }) {
  let history = useHistory();
  return (
    <form>
      <fieldset>
        <legend>enter the market</legend>
        <div className="form-group">
          <label htmlFor="username">name</label>
          <input
            id="username"
            minLength={1}
            type="text"
            onChange={(e) => props.setUser(e.target.value)}
          ></input>
        </div>
        <button
          onClick={() => (props.user ? history.push('/stocks') : null)}
          className={
            props.user ? 'btn btn-primary btn-ghost' : 'btn btn-error btn-ghost'
          }
        >
          log in
        </button>
      </fieldset>
    </form>
  );
}

export default Login;
