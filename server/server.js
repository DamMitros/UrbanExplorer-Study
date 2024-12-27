const mqtt=require('mqtt');
const ws=require('ws');

const client = mqtt.connect('mqtt://localhost:1883');
const wss = new ws.Server({ port: 8080 });

client.on('connect', () => {
  console.log(`Połączono z brokerem MQTT`);
  
  client.subscribe('urbanexplorer/places', (err) => {
    if (!err) {
      console.log(`Zasubskrybowano temat urbanexplorer/places`);
    }
  });

  setInterval(() => {
    const message = JSON.stringify({
      place: 'Kościół Mariacki',
      description: 'Kościół Mariacki w Gdańsku to jeden z najważniejszych zabytków miasta. Jest to kościół gotycki, który wzniesiono w XIV wieku. Wewnątrz kościoła znajduje się słynny ołtarz Wita Stwosza.'
    });
    client.publish('urbanexplorer/places', message);
    console.log(`Wysłano wiadomość: ${message}`);
  }, 5000);
});

wss.on('connection', (ws) => {

  client.on('message', function (topic, message) {
    console.log(`Otrzymano wiadomość z tematu ${topic}: ${message.toString()}`);
  });

  wss.on('message', (message) => {
    console.log(`Otrzymano wiadomość od WebSocket: ${message}`);
  });
});