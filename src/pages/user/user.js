import { useState, useEffect } from "react";
// import useAxiosPrivate from "../hooks/useAxiosPrivate";
import localApi from "../../api/api";
import { useNavigate, useLocation } from "react-router-dom";
import useRefreshToken from "../../hooks/useRefreshToken";

const Users = () => {
  const [users, setUsers] = useState();
  // const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const refreshToken = useRefreshToken();

  useEffect(() => {
    let isMounted = true;

    // Cancel request if compoment unmounted(cancel pending request)
    const controller = new AbortController();

    const getUsers = async () => {
      try {
        const response = await localApi.get('/api/NguoiDung/Get?ma_nam_hoc=2022&Id=1', {
          signal: controller.signal
        });
        console.log(response.data);

        // isMounted == true
        isMounted && setUsers(response.data);
      } catch (err) {
        console.error(err);
        navigate('/login', { state: { from: location }, replace: true });
      }
    }
    getUsers();

    // Clean up func
    return () => {
      isMounted = false;
      controller.abort();
    }
  }, [])

  return (
    <article>
      <h2>Users List</h2>
      {users?.length
        ? (
          <ul>
            {users.map((user, i) => <li key={i}>{user?.username}</li>)}
          </ul>
        ) : <p>No users to display</p>
      }
      <button onClick={() => refreshToken()}>refreshToken</button>
    </article>
  );
};

export default Users;