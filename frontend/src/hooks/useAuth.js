import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe, logout } from '@/store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (token && !user) {
      dispatch(getMe());
    }
  }, [token, user, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return { user, token, isAuthenticated, isLoading, error, logout: handleLogout };
};