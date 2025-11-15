// src/hooks/useDeliveryTracking.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const useDeliveryTracking = () => {
  const [orders, setOrders] = useState([]);
  const [driverLocations, setDriverLocations] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to delivery tracking server');
      setIsConnected(true);
      setError(null);
      // Request active orders on connect
      socket.emit('get_active_orders');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
      setError(err.message || 'Connection error');
    });

    socket.on('connected', (data) => {
      console.log('Server confirmation:', data);
    });

    // Order events
    socket.on('active_orders', (activeOrders) => {
      console.log('Active orders received:', activeOrders);
      setOrders(activeOrders);
    });

    socket.on('new_order', (order) => {
      console.log('New order created:', order);
      setOrders(prev => [...prev, order]);
    });

    socket.on('order_status_update', (update) => {
      console.log('Order status update:', update);
      setOrders(prev =>
        prev.map(order =>
          order.id === update.order_id
            ? { ...order, status: update.new_status }
            : order
        )
      );
    });

    socket.on('status_changed', (updatedOrder) => {
      console.log('Order status changed:', updatedOrder);
      setOrders(prev =>
        prev.map(order =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
    });

    socket.on('driver_assigned', (data) => {
      console.log('Driver assigned:', data);
      setOrders(prev =>
        prev.map(order =>
          order.id === data.order_id
            ? { ...order, driver_id: data.driver_id }
            : order
        )
      );
      if (data.driver_location) {
        setDriverLocations(prev => ({
          ...prev,
          [data.driver_id]: data.driver_location
        }));
      }
    });

    socket.on('driver_location_update', (location) => {
      console.log('Driver location update:', location);
      setDriverLocations(prev => ({
        ...prev,
        [location.driver_id]: location
      }));
    });

    socket.on('driver_location', (location) => {
      setDriverLocations(prev => ({
        ...prev,
        [location.driver_id]: location
      }));
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Track specific order
  const trackOrder = useCallback((orderId) => {
    if (socketRef.current) {
      socketRef.current.emit('track_order', { order_id: orderId });
    }
  }, []);

  // Stop tracking order
  const stopTracking = useCallback((orderId) => {
    if (socketRef.current) {
      socketRef.current.emit('stop_tracking', { order_id: orderId });
    }
  }, []);

  // Create new order
  const createOrder = useCallback(async (orderData) => {
    try {
      const response = await fetch(`${SOCKET_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to create order');
      throw err;
    }
  }, []);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId, status) => {
    try {
      const response = await fetch(`${SOCKET_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update order status');
      throw err;
    }
  }, []);

  // Simulate delivery (for testing)
  const simulateDelivery = useCallback((orderId) => {
    if (socketRef.current) {
      socketRef.current.emit('simulate_delivery', { order_id: orderId });
    }
  }, []);

  // Assign driver to order
  const assignDriver = useCallback(async (orderId, driverId) => {
    try {
      const response = await fetch(`${SOCKET_URL}/api/orders/${orderId}/assign-driver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driver_id: driverId })
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error assigning driver:', err);
      setError('Failed to assign driver');
      throw err;
    }
  }, []);

  // Refresh orders
  const refreshOrders = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('get_active_orders');
    }
  }, [isConnected]);

  // Confirm delivery
  const confirmDelivery = useCallback((orderId) => {
    if (socketRef.current) {
      socketRef.current.emit('confirm_delivery', { order_id: orderId });
    }
  }, []);

  return {
    orders,
    driverLocations,
    isConnected,
    error,
    trackOrder,
    stopTracking,
    createOrder,
    updateOrderStatus,
    simulateDelivery,
    assignDriver,
    refreshOrders,
    confirmDelivery
  };
};