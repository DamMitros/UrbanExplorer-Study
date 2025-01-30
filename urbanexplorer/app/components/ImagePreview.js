'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ImagePreview({ src, alt }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!src) return null;

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        <Image
          src={src}
          alt={alt || 'Preview image'}
          width={200}
          height={200}
          className="rounded-lg object-cover transition-transform hover:scale-105"
        />
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={() => setIsOpen(false)}>
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <Image
              src={src}
              alt={alt || 'Full size image'}
              width={1200}
              height={800}
              className="max-h-[90vh] w-auto object-contain"
              priority
            />
            <button className="absolute top-4 right-4 bg-white rounded-full p-2 text-black hover:bg-gray-200" onClick={() => setIsOpen(false)}>×</button>
          </div>
        </div>
      )}
    </>
  );
}