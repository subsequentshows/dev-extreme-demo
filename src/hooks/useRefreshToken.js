import { localApi } from '../api/api';
import useAuth from './useAuth';

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    const response = await localApi.get('/refreshtoken', {
      withCredentials: true
    });
    setAuth(prev => {
      console.log(JSON.stringify(prev));
      console.log(response.data.accessToken);

      // Overwrite old to new access token
      return { ...prev, accessToken: response.data.accessToken }
    });
    return response.data.accessToken;
  }
  return refresh;
};

export default useRefreshToken;