'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser } from '@/context/UserContext';
import { connectMQTT } from '@/utils/mqtt';

export default function NotificationsHandler() {
  const [notifications, setNotifications] = useState([]);
  const { user } = useUser();
  const [client, setClient] = useState(null);
  const subscribedTopics = useRef(new Set());

  useEffect(() => {
    if (!user) return;

    const initMQTT = async () => {
      const mqttClient = await connectMQTT();
      setClient(mqttClient);

      if (mqttClient) {
        const topics = ['chats/#', 'blogs/#', 'posts/#', 'comments/#', 'places/#'];
        
        topics.forEach(topic => {
          if (!subscribedTopics.current.has(topic)) {
            subscribedTopics.current.add(topic);
            mqttClient.subscribe(topic, { qos: 1 }, (err) => {
              if (err) console.error(`Błąd subskrypcji ${topic}:`, err);
              else console.log(`Zasubskrybowano ${topic}`);
            });
          }
        });

        mqttClient.on('message', (topic, message) => {
          console.log('Otrzymano wiadomość na temat:', topic);
          try {
            const msgData = JSON.parse(message.toString());
            const notification = {
              id: Date.now() + Math.random(),
              title: msgData.title || 'Nowe powiadomienie',
              message: msgData.message,
              timestamp: new Date().toISOString(),
              type: msgData.type || 'general',
              read: false
            };
            setNotifications(prev => {
              const isDuplicate = prev.some(n => 
                n.title === notification.title && 
                n.message === notification.message &&
                Math.abs(new Date(n.timestamp) - new Date(notification.timestamp)) < 1000
              );
              if (isDuplicate) return prev;
              return [notification, ...prev];
            });
          } catch (error) {
            console.error('Błąd przetwarzania wiadomości:', error);
          }
        });
      }
    };

    initMQTT();

    return () => {
      if (client) {
        subscribedTopics.current.forEach(topic => {
          client.unsubscribe(topic);
        });
        subscribedTopics.current.clear();
        client.end();
        setClient(null);
      }
    };
  }, [user]);

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const clearAll = () => setNotifications([]);

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  useEffect(() => {
    const timeouts = notifications.map(notification => {
      return setTimeout(() => {
        removeNotification(notification.id);
      }, 120000);
    });

    return () => timeouts.forEach(timeout => clearTimeout(timeout));
  }, [notifications]);

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out hover:scale-102 ${notification.read ? 'opacity-60' : ''}`}>
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                <p className="mt-1 text-xs text-gray-400">{new Date(notification.timestamp).toLocaleTimeString()}</p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button onClick={() => removeNotification(notification.id)} className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <span className="sr-only">Zamknij</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
