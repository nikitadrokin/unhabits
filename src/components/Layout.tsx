import React from 'react';
import { Link, Outlet } from '@tanstack/react-router';
import { Activity, PlusCircle } from 'lucide-react';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link
                to="/"
                className="flex items-center px-2 py-2 text-gray-900 hover:text-gray-600"
              >
                <Activity className="h-6 w-6 mr-2" />
                <span className="font-bold text-xl">Unhabits</span>
              </Link>
            </div>
            <div className="flex items-center">
              <Link
                to="/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                New Unhabit
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}