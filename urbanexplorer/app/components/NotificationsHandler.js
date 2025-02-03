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

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md">
      <div className="bg-white shadow-lg rounded-lg p-4">
        {!client ? (
          <div>Łączenie z systemem powiadomień...</div>
        ) : (
          <>
            {notifications.length === 0 ? (
              <div>Brak nowych powiadomień</div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className={`mb-2 p-3 rounded border ${notification.read ? 'opacity-60' : ''}`}>
                  <h4 className="font-bold">{notification.title}</h4>
                  <p className="text-sm">{notification.message}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                    <span>{new Date(notification.timestamp).toLocaleTimeString()}</span>
                    {!notification.read && (
                      <button onClick={() => markAsRead(notification.id)} className="text-blue-500 hover:text-blue-600">Oznacz jako przeczytane</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
