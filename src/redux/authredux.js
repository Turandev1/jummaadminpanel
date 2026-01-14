// src/hooks/useAuth.js
import { useSelector, useDispatch } from "react-redux";
import { setauthdata,  logout } from "./store";

const useAuth = () => {
  const { user, role, accessToken } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return {
    user,
    role,
    accessToken,
    setAuthData: (data) => dispatch(setauthdata(data)),
    logout: () => dispatch(logout()),
  };
};

export default useAuth;
