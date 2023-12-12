import { useRef, useState, useEffect, useContext } from 'react';
import useAuth from '../../hooks/useAuth';
import AuthContext from '../../contexts/authProvider';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import localApi from '../../api/api';
// const LOGIN_URL = '/auth';
const LOGIN_URL = '/login';

const Login = () => {
  // const { setAuth } = useAuth();
  const { setAuth } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    userRef.current.focus();
  }, [])

  useEffect(() => {
    setErrMsg('');
  }, [user, password])

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await localApi.post(LOGIN_URL,
        JSON.stringify({
          username: user,
          password: password,
          ma_so_gd: "01",
          ma_truong: "0001",
          ma_khoi: "09",
          ma_phong_gd: "01"
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );
      console.log(JSON.stringify(response?.data));
      //console.log(JSON.stringify(response));

      const accessToken = response?.data?.accessToken;
      const roles = response?.data?.roles;

      setAuth({ user, password, roles, accessToken });
      setUser('');
      setPassword('');
      navigate(from, { replace: true });
    } catch (err) {
      if (!err?.response) {
        setErrMsg('No Server Response');
      } else if (err.response?.status === 400) {
        setErrMsg('Missing Username or Password');
      } else if (err.response?.status === 401) {
        setErrMsg('Unauthorized');
      } else {
        setErrMsg('Login Failed');
      }
      errRef.current.focus();
    }
  }

  return (
    <>
      {/* {success ? (
        <p>logged in</p>
      ) : (

      )
      } */}
      <section>
        <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            ref={userRef}
            autoComplete="off"
            onChange={(e) => setUser(e.target.value)}
            value={user}
            required
          />

          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
          />
          <button>Sign In</button>
        </form>
        <p>
          Need an Account?<br />
          <span className="line">
            <Link to="/register">Sign Up</Link>
          </span>
        </p>
      </section>
    </>
  )
}

export default Login