import { useHistory } from 'react-router-dom';

import { functions } from '../res/firebase';

function Login(props: { setUsername: (username: string) => void; username: string }) {
  const { username, setUsername } = props;

  let history = useHistory();

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const addPlayer = functions.httpsCallable('addPlayer');
    const loginAsync = async () => {
      try {
        await addPlayer({ username });
      } catch (err) {
        console.warn(err);
        // if (res.data) {
        //   console.log(res.data);
        // }
      }
      history.push('/stocks');
    }
    loginAsync();
  };

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
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <button
          onClick={(e) => (username ? handleLogin(e) : null)}
          className={
            username ? 'btn btn-primary btn-ghost' : 'btn btn-error btn-ghost'
          }
        >
          log in
        </button>
      </fieldset>
    </form>
  );
}

export default Login;
