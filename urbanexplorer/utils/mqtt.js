import mqtt from 'mqtt';

let client;
let connectRetries = 0;
const MAX_RETRIES = 5;
let subscriptions = new Map();

const connectWithRetry = () => {
  try {
    client = mqtt.connect('mqtt://localhost:1883', {
      reconnectPeriod: 5000,
      connectTimeout: 30000,
    });

    client.on('connect', () => {
      console.log('Połączono z brokerem MQTT');
      connectRetries = 0;
    });

    client.on('error', (error) => {
      console.error('Błąd MQTT:', error);
      if (connectRetries < MAX_RETRIES) {
        connectRetries++;
        setTimeout(connectWithRetry, 5000);
      }
    });

    client.on('offline', () => {
      console.log('Klient MQTT offline');
    });

  } catch (error) {
    console.error('Błąd połączenia MQTT:', error);
  }
};

connectWithRetry();

export const publishMessage = (topic, message) => {
  if (client && client.connected) {
    client.publish(topic, JSON.stringify(message));
  } else {
    console.warn('Klient MQTT nie jest połączony, wiadomość nie została wysłana');
  }
};

export const subscribeToTopic = (topic, callback) => {
  if (client && client.connected) {
    client.subscribe(topic, { qos: 1 }, (err) => {
      if (!err) {
        if (!subscriptions.has(topic)) {
          subscriptions.set(topic, new Set());
        }
        subscriptions.get(topic).add(callback);
        
        client.on('message', (receivedTopic, message) => {
          if (receivedTopic === topic) {
            try {
              const parsedMessage = JSON.parse(message.toString());
              callback(parsedMessage);
            } catch (error) {
              console.error('Błąd podczas parsowania wiadomości MQTT:', error);
            }
          }
        });
      }
    });
  }
};

export const unsubscribeFromTopic = (topic, callback) => {
  if (client && client.connected) {
    if (subscriptions.has(topic)) {
      subscriptions.get(topic).delete(callback);
      if (subscriptions.get(topic).size === 0) {
        client.unsubscribe(topic);
        subscriptions.delete(topic);
      }
    }
  }
};

export default client;