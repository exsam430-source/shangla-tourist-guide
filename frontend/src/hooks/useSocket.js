import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { addAlert } from '@/store/slices/alertsSlice';

export const useSocket = () => {
  const socketRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    socketRef.current = io(
      import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
      { transports: ['websocket', 'polling'] }
    );

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('new_alert', (alert) => {
      dispatch(addAlert(alert));
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  const joinPlaceRoom = (placeId) => {
    socketRef.current?.emit('join_place', placeId);
  };

  const leavePlaceRoom = (placeId) => {
    socketRef.current?.emit('leave_place', placeId);
  };

  return { socket: socketRef.current, joinPlaceRoom, leavePlaceRoom };
};