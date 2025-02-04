"use client";

import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ConfirmDialog from '../../components/ConfirmDialogs';

export default function AdminUsers() {
  const { user } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    async function fetchUsers() {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Błąd podczas pobierania użytkowników:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, [user]);

  const handleDeleteUser = (userId) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleteDialogOpen(false);
    if (!userToDelete) return;

    try {
      const res = await fetch(`/api/users/${userToDelete}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setUsers(users.filter(user => user._id !== userToDelete));
      }
    } catch (error) {
      console.error('Błąd podczas usuwania użytkownika:', error);
    }
    setUserToDelete(null);
  };

  const handleChangeRole = async (userId, currentRole) => {
    try {
      const newRole = getNextRole(currentRole);
      
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: newRole
        })
      });

      if (res.ok) {
        setUsers(users.map(user => {
          if (user._id === userId) {
            return { ...user, role: newRole };
          }
          return user;
        }));
      }
    } catch (error) {
      console.error('Błąd podczas zmiany roli:', error);
    }
  };

  const getNextRole = (currentRole) => {
    const roles = ['user', 'guide', 'admin'];
    const currentIndex = roles.indexOf(currentRole);
    return roles[(currentIndex + 1) % roles.length];
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'guide': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleButtonColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-red-500 hover:bg-red-600';
      case 'guide': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Ładowanie...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-red-600">Brak dostępu</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Zarządzanie użytkownikami</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Statystyki</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-500">Wszyscy użytkownicy</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-500">Przewodnicy</p>
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'guide').length}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-500">Administratorzy</p>
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <h2 className="text-xl font-semibold p-4 bg-gray-50">Lista użytkowników</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nazwa użytkownika</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rola</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>{user.role || 'user'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => handleChangeRole(user._id, user.role)} className={`${getRoleButtonColor(user.role)} text-white px-3 py-1 rounded-md transition-colors`}>Zmień rolę</button>
                      <button onClick={() => handleDeleteUser(user._id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-colors">Usuń użytkownika</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        message="Czy na pewno chcesz usunąć tego użytkownika?"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
      />
    </div>
  );
}