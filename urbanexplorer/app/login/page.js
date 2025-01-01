"use client";

import Login from "../components/Login";

export default function LoginPage() {
  const handleClickRegister = (event) => {
    event.preventDefault();
    window.location.href = "login/register";
  };
  return (
    <div>
      <h1>Zaloguj się</h1>
      <Login />
      {/* <form action="/api/auth" method="POST">
        <label htmlFor="username">Nazwa:</label>
        <input type="text" id="username" name="username" required />
        <label htmlFor="password">Hasło:</label>
        <input type="password" id="password" name="password" required />
        <button type="submit">Zaloguj się</button>
      </form>
      <section>
        <h2>Logowanie za pomocą:</h2>
        <a href="/api/auth/google">Google</a>
        <a href="/api/auth/facebook">Facebook</a>
      </section> */}
      <section>
        <p>Nie masz jeszcze konta? Nie martw się! Zarejestruj się!</p>
        <button onClick={handleClickRegister}>Zarejestruj się</button>
      </section>
    </div>
  );
}
