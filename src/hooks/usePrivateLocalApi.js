
import { useEffect } from "react";
import { privateLocalApi } from "../api/api";

import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";

const usePrivateLocalApi = () => {
  const refresh = useRefreshToken();
  const { auth } = useAuth();

  useEffect(() => {

    // Attach interceptors to request
    const requestIntercept = privateLocalApi.interceptors.request.use(
      config => {
        if (!config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${auth?.accessToken}`;
        }

        return config;
      }, (error) => Promise.reject(error)
    );

    // Attach interceptors to response
    const responseIntercept = privateLocalApi.interceptors.response.use(
      // Check if response is good
      response => response,

      // Handle error
      async (error) => {
        const prevRequest = error?.config;

        if (error?.response?.status === 403 && !prevRequest?.sent) {
          prevRequest.sent = true;
          const newAccessToken = await refresh();
          prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

          return privateLocalApi(prevRequest);
        }


        return Promise.reject(error);
      }
    );

    // Clean up
    return () => {
      privateLocalApi.interceptors.request.eject(requestIntercept);
      privateLocalApi.interceptors.response.eject(responseIntercept);
    }
  }, [auth, refresh])

  return privateLocalApi;
}

export default usePrivateLocalApi;