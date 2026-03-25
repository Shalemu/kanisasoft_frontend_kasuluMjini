'use client';

import { useState } from 'react';
import Head from 'next/head';
import { FaPlus } from 'react-icons/fa';
import MahudhurioTab from './components/mahudhurio';
import OngezaMahudhurio from './components/ongezaMahudhurio';

export default function MahudhurioPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <Head>
        <title>Mahudhurio | Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Mahudhurio
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          >
            <FaPlus /> Ongeza Mahudhurio
          </button>
        </div>

        <MahudhurioTab />

        {showAddModal && (
          <OngezaMahudhurio onClose={() => setShowAddModal(false)} />
        )}
      </div>
    </>
  );
}