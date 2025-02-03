import mqtt from 'mqtt';

let client = null;
let subscriptions = new Map();
let isConnected = false;
let pendingSubscriptions = [];

export const connectMQTT = () => {
  if (!client) {
    client = mqtt.connect(process.env.NEXT_PUBLIC_MQTT_BROKER_URL, {
      protocol: 'ws',
      port: 9001,
      clientId: `mqttjs_${Math.random().toString(16).slice(2, 10)}`,
      keepalive: 60,
      reconnectPeriod: 1000
    });

    client.on('connect', () => {
      console.log('Połączono z MQTT');
      isConnected = true;
      
      pendingSubscriptions.forEach(({topic, callback}) => {
        subscribeToTopic(topic, callback);
      });
      pendingSubscriptions = [];

      subscriptions.forEach((callbacks, topic) => {
        client.subscribe(topic);
      });
    });

    client.on('error', (err) => {
      console.error('Błąd MQTT:', err);
    });

    client.on('close', () => {
      console.log('Rozłączono z brokerem MQTT');
      client = null;
    });

    client.on('message', (topic, message) => {
      console.log('Otrzymano wiadomość:', topic, message.toString());
      try {
        const parsedMessage = JSON.parse(message.toString());
        const callbacks = subscriptions.get(topic);
        if (callbacks) {
          callbacks.forEach(callback => callback(parsedMessage));
        }
      } catch (error) {
        console.error('Błąd podczas parsowania wiadomości MQTT:', error);
      }
    });
  }
  return client;
};

export const publishMessage = (topic, message) => {
  const mqttClient = connectMQTT();
  if (mqttClient && mqttClient.connected) {
    console.log('Publikowanie do tematu:', topic, message);
    mqttClient.publish(topic, JSON.stringify(message), { 
      qos: 1,
      retain: false 
    });
  } else {
    console.error('Klient MQTT nie jest połączony podczas próby publikacji:', topic);
  }
};

export const subscribeToTopic = (topic, callback) => {
  if (!client) {
    client = connectMQTT();
  }

  if (!subscriptions.has(topic)) {
    subscriptions.set(topic, new Set());
  }
  subscriptions.get(topic).add(callback);

  if (client.connected) {
    client.subscribe(topic);
  } else {
    pendingSubscriptions.push({ topic, callback });
  }
};

export const unsubscribeFromTopic = (topic, callback) => {
  const mqttClient = connectMQTT();
  if (mqttClient) {
    const callbacks = subscriptions.get(topic);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        subscriptions.delete(topic);
        mqttClient.unsubscribe(topic);
      }
    }
  }
};

export const getSubscribedTopics = () => {
  return Array.from(subscriptions.keys());
};

export default connectMQTT;
