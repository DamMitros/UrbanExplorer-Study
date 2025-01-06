import { UserProvider } from "../../context/UserContext";

export default function UserIdLayout({ children }) {
  return (
    // <UserProvider>
      <div>
        {/* <h2> Witaj na stronie użytkownika {user.username} </h2> */}
        {children}
        {/* <a href="[user.id]/posts">Twoje posty</a> */}
        <a href="[user.id]/settings">Ustawienia</a>
        <a href="/">Wróć na stronę główną</a>
      </div>
    //{/* </UserProvider> */}
  );
}
