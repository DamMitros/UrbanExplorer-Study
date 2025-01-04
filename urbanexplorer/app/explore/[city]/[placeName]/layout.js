import { UserProvider} from "../../../../context/UserContext";

export default function PlaceLayout({ children }) {
  return (
    <div>
      <header>
        <h2>O miejscu</h2>
      </header>
      <UserProvider>{children}</UserProvider>
    </div>
  );
}
