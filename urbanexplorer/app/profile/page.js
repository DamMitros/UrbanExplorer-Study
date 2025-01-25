"use client";

import { useUser } from "../../context/UserContext";
import { useRouter } from "next/navigation";
import PostsList from "../components/PostsList";

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();

  if (!user) {
    router.push("/login");
    return <p>Przekierowywanie do strony logowania...</p>;
  }

  return (
    <div>
      <h1>Profil użytkownika</h1>
      <div>
        <h2>Informacje o koncie</h2>
        <p>Nazwa użytkownika: {user.username}</p>
        <p>Email: {user.email}</p>
        <p>Rola: {user.role || "Użytkownik"}</p>
      </div>

      <div>
        <h2>Twoje posty</h2>
        <PostsList user123={user} />
      </div>

      <div>
        <button onClick={() => router.push("/profile/settings")}>Ustawienia konta</button>
      </div>
    </div>
  );
}