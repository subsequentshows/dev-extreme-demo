import React from 'react';
import { useState, useEffect } from "react";
import usePrivateLocalApi from "../../hooks/usePrivateLocalApi";
import { useNavigate, useLocation } from "react-router-dom";
import useRefreshToken from "../../hooks/useRefreshToken";
import "./users.scss"

const Users = () => {
  const [users, setUsers] = useState();
  const privateLocalApi = usePrivateLocalApi();
  const navigate = useNavigate();
  const prevLocation = useLocation();
  const refreshToken = useRefreshToken();

  useEffect(() => {
    let isMounted = true;

    // Cancel request if compoment unmounted(cancel pending request)
    const controller = new AbortController();

    const getUsers = async () => {
      try {
        const response = await privateLocalApi.get('/api/NguoiDung/Get?ma_nam_hoc=2022&Id=1', {
          signal: controller.signal
        });
        console.log(response.data);

        // isMounted == true
        isMounted && setUsers(response.data);
      } catch (err) {
        console.error(err);

        // After kicked form expired login, take user back to their previous link location
        // navigate('/login', { state: { from: prevLocation }, replace: true });
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
      <h2 className={'content-block'}>Users List</h2>
      {users?.length
        ? (
          <ul>
            {/* {users.map((user, i) => <li key={i}>{user?.username}</li>)} */}
          </ul>
        ) : <p>No users to display</p>
      }
      <button onClick={() => refreshToken()}>refreshToken</button>
    </article>
  );
}

export default Users;