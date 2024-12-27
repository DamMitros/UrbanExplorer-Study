const baseUrl = 'http://localhost:5500';

const app = document.getElementById('app');

function createSection(title, content){
  const section = document.createElement('div');
  section.classList.add('section');
  const header = document.createElement('h2');
  header.textContent = title;
  section.appendChild(header);
  section.appendChild(content);
  return section;
}

// Wyszukiwanie miejsc
const searchForm = document.createElement('form');
searchForm.innerHTML = `
  <input type='text' name='search' placeholder='Wpisz nazwę miejsca'>
  <button type='submit'>Szukaj</button>`;
const searchResults = document.createElement('div');
searchResults.classList.add('search-results');
searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(searchForm);
  const search = formData.get('search');
  try{
    const response = await fetch(`${baseUrl}/search/${search}`);
    const places = await response.json();
    searchResults.innerHTML = '';
    searchResult.innerHTML = places
      .map((place) => `<p>ID: ${place.id} | Name: ${place.name} | Description: ${place.description}</p>`)
      .join('');
  } catch(error){
    console.error(`Błąd w trakcie wyszukiwania miejsc: ${error}`);
  }
});
app.appendChild(createSection('Wyszukiwanie miejsc', searchForm));

// Dodawanie nowego miejsca
const addPlaceForm = document.createElement('form');
addPlaceForm.innerHTML = `
  <input type='text' name='name' placeholder='Nazwa miejsca'>
  <input type='text' name='description' placeholder='Opis miejsca'>
  <button type='submit'>Dodaj miejsce</button>`;
addPlaceForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(addPlaceForm);
  const name = formData.get('name');
  const description = formData.get('description');
  try{
    const response = await fetch(`${baseUrl}/places`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({name, description}),
    });
    const place = await response.json();
    console.log(`Dodano nowe miejsce: ${place.name}`);
  } catch(error){
    console.error(`Błąd w trakcie dodawania nowego miejsca: ${error}`);
  }
}); 
app.appendChild(createSection('Dodawanie nowego miejsca', addPlaceForm));

// Odczytywanie wszystkich miejsc
const readButton = document.createElement('button');
readButton.textContent = 'Pokaż wszystkie miejsca';
const placesList = document.createElement('div');
placesList.classList.add('places-list');
readButton.addEventListener('click', async () => {
  try{
    const response = await fetch(`${baseUrl}/places`);
    const places = await response.json();
    placesList.innerHTML = places
      .map((place) => `<p>ID: ${place.id} | Name: ${place.name} | Description: ${place.description}</p>`)
      .join('');
  } catch(error){
    console.error(`Błąd w trakcie odczytywania miejsc: ${error}`);
  }
});
app.appendChild(createSection('Odczytywanie wszystkich miejsc', readButton));
// app.appendChild(placesList); ???

// Aktualizacja miejsca
const updatePlaceForm = document.createElement('form');
updatePlaceForm.innerHTML = `
  <input type='number' name='id' placeholder='ID miejsca'>
  <input type='text' name='name' placeholder='Nowa nazwa miejsca'>
  <input type='text' name='description' placeholder='Nowy opis miejsca'>
  <button type='submit'>Aktualizuj miejsce</button>`;
updatePlaceForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(updatePlaceForm);
  const id = formData.get('id');
  const name = formData.get('name');
  const description = formData.get('description');
  try{
    const response = await fetch(`${baseUrl}/places/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({name, description}),
    });
    const place = await response.json();
    console.log(`Zaktualizowano miejsce: ${place.name}`);
  } catch(error){
    console.error(`Błąd w trakcie aktualizacji miejsca: ${error}`);
  }
});
app.appendChild(createSection('Aktualizacja miejsca', updatePlaceForm));

// Usuwanie miejsca
const deletePlaceForm = document.createElement('form');
deletePlaceForm.innerHTML = `
  <input type='number' name='id' placeholder='ID miejsca'>
  <button type='submit'>Usuń miejsce</button>`;
deletePlaceForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(deletePlaceForm);
  const id = formData.get('id');
  try{
    const response = await fetch(`${baseUrl}/places/${id}`, {
      method: 'DELETE',
    });
    const place = await response.json();
    console.log(`Usunięto miejsce: ${place.name}`);
  } catch(error){
    console.error(`Błąd w trakcie usuwania miejsca: ${error}`);
  }
});
app.appendChild(createSection('Usuwanie miejsca', deletePlaceForm));

// Dodawanie nowego zdjęcia
const addPhotoForm = document.createElement('form');
addPhotoForm.innerHTML = `
  <input type='number' name='placeId' placeholder='ID miejsca'>
  <input type='text' name='url' placeholder='URL zdjęcia'>
  <button type='submit'>Dodaj zdjęcie</button>`;
addPhotoForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(addPhotoForm);
  const placeId = formData.get('placeId');
  const url = formData.get('url');
  try{
    const response = await fetch(`${baseUrl}/places/${placeId}/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({url}),
    });
    const photo = await response.json();
    console.log(`Dodano nowe zdjęcie: ${photo.url}`);
  } catch(error){
    console.error(`Błąd w trakcie dodawania nowego zdjęcia: ${error}`);
  }
});
app.appendChild(createSection('Dodawanie nowego zdjęcia', addPhotoForm));

// Odczytywanie wszystkich zdjęć
const readPhotosButton = document.createElement('button');
readPhotosButton.textContent = 'Pokaż wszystkie zdjęcia';
const photosList = document.createElement('div');
photosList.classList.add('photos-list');
readPhotosButton.addEventListener('click', async () => {
  try{
    const response = await fetch(`${baseUrl}/photos`);
    const photos = await response.json();
    photosList.innerHTML = photos
      .map((photo) => `<p>ID: ${photo.id} | URL: ${photo.url}</p>`)
      .join('');
  } catch(error){
    console.error(`Błąd w trakcie odczytywania zdjęć: ${error}`);
  }
});
app.appendChild(createSection('Odczytywanie wszystkich zdjęć', readPhotosButton));

// Usuwanie zdjecia
const deletePhotoForm = document.createElement('form');
deletePhotoForm.innerHTML = `
  <input type='number' name='id' placeholder='ID zdjęcia'>
  <button type='submit'>Usuń zdjęcie</button>`;
deletePhotoForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(deletePhotoForm);
  const id = formData.get('id');
  try{
    const response = await fetch(`${baseUrl}/photos/${id}`, {
      method: 'DELETE',
    });
    const photo = await response.json();
    console.log(`Usunięto zdjęcie: ${photo.url}`);
  } catch(error){
    console.error(`Błąd w trakcie usuwania zdjęcia: ${error}`);
  }
});
app.appendChild(createSection('Usuwanie zdjęcia', deletePhotoForm));

// Logowanie
const loginForm = document.createElement('form');
loginForm.innerHTML = `
  <input type='text' name='username' placeholder='Nazwa użytkownika'>
  <input type='password' name='password' placeholder='Hasło'>
  <button type='submit'>Zaloguj</button>`;
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const username = formData.get('username');
  const password = formData.get('password');
  try{
    const response = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username, password}),
    });
    const user = await response.json();
    console.log(`Zalogowano jako: ${user.username}`);
  } catch(error){
    console.error(`Błąd w trakcie logowania: ${error}`);
  }
});
app.appendChild(createSection('Logowanie', loginForm));

const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = (message) => {
  console.log(`Otrzymano wiadomość od WebSocket: ${message.data}`);

  const messageData = document.createElement('div');
  messageData.textContent = `Nowa wiadomość: ${message.data}`;
  document.body.appendChild(messageData);
};

setInterval(() => {
  ws.send('Hello, WebSocket!');
}, 1000);