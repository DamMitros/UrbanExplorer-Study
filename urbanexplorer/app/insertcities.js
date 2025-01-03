// import { connectToDB } from "../utils/database.js";
// import City from "../models/City.js";

// async function insertCities() {
//   console.log("Próba połączenia z bazą danych...");
//   await connectToDB();

//   const cities = [
//     { name: "Trójmiasto", slug: "trojmiasto", places: [] },
//     { name: "Warszawa", slug: "warszawa", places: [] },
//     { name: "Kraków", slug: "krakow", places: [] },
//     { name: "Wrocław", slug: "wroclaw", places: [] },
//   ];

//   try {
//     await City.insertMany(cities);
//     console.log("Miasta zostały pomyślnie dodane.");
//   } catch (error) {
//     console.error("Błąd podczas dodawania miast:", error);
//   } finally {
//     process.exit(); // Zamknij proces po zakończeniu
//   }
// }

// insertCities();


// Nie działa :))) Po godzinnej (zapewne dużo dłuższej walce) -- wpisane ręcznie