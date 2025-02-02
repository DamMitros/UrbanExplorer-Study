'use client';
import { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import mqtt from 'mqtt';

export default function NotificationsHandler() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    if (!user) return;

    const client = mqtt.connect('ws://localhost:9001', {
      wsOptions: {
        reconnectPeriod: 5000,
        connectTimeout: 30000,
      }
    });
    
    client.on('connect', () => {
      console.log('Połączono z MQTT WebSocket');
      client.subscribe(`users/${user._id}/notifications`);
      client.subscribe('places/new');
      client.subscribe('places/verified');
      client.subscribe('chats/new');
    });

    client.on('error', (err) => {
      console.error('Błąd MQTT WebSocket:', err);
    });

    client.on('message', (topic, message) => {
      try {
        const notification = JSON.parse(message.toString());
        setNotifications(prev => [notification, ...prev]);

        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message
          });
        }
      } catch (error) {
        console.error('Błąd parsowania powiadomienia:', error);
      }
    });

    return () => {
      client.end();
    };
  }, [user]);

  return (
    <div className="fixed top-20 right-4 z-50">
      {notifications.map((notification, index) => (
        <div key={index} className="bg-white shadow-lg rounded-lg p-4 mb-2 animate-fade-in">
          <h4 className="font-bold">{notification.title}</h4>
          <p>{notification.message}</p>
        </div>
      ))}
    </div>
  );
}