"use client";

import { useState, useEffect } from 'react';

const NOTIFICATION_CATEGORIES = {
  chats: "Czaty i wiadomości",
  blogs: "Blogi",
  posts: "Posty",
  comments: "Komentarze",
  places: "Miejsca"
};

const STORAGE_KEY = 'notificationSettings';

export default function NotificationSettings() {
  const [categories, setCategories] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    }
    return Object.keys(NOTIFICATION_CATEGORIES).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {});
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  const handleToggle = (category) => {
    setCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Ustawienia powiadomień</h3>
      <div className="space-y-4">
        {Object.entries(NOTIFICATION_CATEGORIES).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-gray-700">{label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={categories[key]}
                onChange={() => handleToggle(key)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}