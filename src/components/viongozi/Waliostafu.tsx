'use client';

import { useWaliostafu } from './hooks/useWaliostafu';

export default function WaliostafuPage() {
  const { leaders } = useWaliostafu();

  return (
    <div className="p-6 bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-white/90">

      <div className="bg-white p-5 rounded-xl shadow dark:bg-white/[0.03]">

        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white/90">
          Viongozi Waliostaafu
        </h1>

        {leaders.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Hakuna viongozi waliostaafu</p>
        ) : (
          <table className="w-full border border-gray-200 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-300">
            <thead className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
              <tr>
                <th className="p-2 text-left">Jina</th>
                <th className="p-2 text-left">Simu</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Nafasi</th>
              </tr>
            </thead>

            <tbody>
              {leaders.map((l: any) => (
                <tr key={l.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="p-2">{l.name?.toUpperCase()}</td>
                  <td className="p-2">{l.phone}</td>
                  <td className="p-2">{l.email}</td>
                  <td className="p-2">
                    {l.roles?.map((r: string, i: number) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-200 px-2 py-1 rounded mr-1 text-gray-700 dark:bg-white/[0.08] dark:text-gray-300"
                      >
                        {r}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        )}

      </div>

    </div>
  );
}
