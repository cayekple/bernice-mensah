import React from 'react';

export default function Maintenance() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center text-gray-800 dark:bg-gray-900 dark:text-gray-100 p-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold mb-3">We’ll be right back</h1>
        <p className="text-base md:text-lg opacity-80 max-w-xl">
          Our site is currently undergoing scheduled maintenance. Please check back soon.
        </p>
      </div>
    </div>
  );
}
