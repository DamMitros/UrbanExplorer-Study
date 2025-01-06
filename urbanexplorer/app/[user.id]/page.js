"use client";

import { useUser } from "../../context/UserContext";
import PostsList from "../components/PostsList";

export default function UserIdPage() {
  const { user } = useUser();
  console.log(`nazwa: ${user}`)
  // Nie znajduje user --- zwraca unfined 
  return (
    <div>
      <h1>Lista postów użytkownika</h1>
      <PostsList user={user} />
    </div>
  );
}
