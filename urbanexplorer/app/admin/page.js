"use client";
import { useUser } from "../../context/UserContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminPanel() {
  const { user } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
    }
  }, [user]);

  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    }
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      setUsers(users.filter(user => user._id !== userId));
    }
  };

  const handleToggleAdmin = async (userId, currentRole) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: currentRole === 'admin' ? 'user' : 'admin'
      })
    });
    if (res.ok) {
      setUsers(users.map(user => {
        if (user._id === userId) {
          return { ...user, role: currentRole === 'admin' ? 'user' : 'admin' };
        }
        return user;
      }));
    }
  };

  if (!user || user.role !== 'admin') {
    return <p>Brak dostępu</p>;
  }

  return (
    <div>
      <h1>Panel administratora</h1>
      <section>
        <h2>Użytkownicy</h2>
        <table>
          <thead>
            <tr>
              <th>Nazwa użytkownika</th>
              <th>Email</th>
              <th>Rola</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => handleToggleAdmin(user._id, user.role)}>
                    {user.role === 'admin' ? 'Usuń admina' : 'Nadaj admina'}
                  </button>
                  <button onClick={() => handleDeleteUser(user._id)}>Usuń użytkownika</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}