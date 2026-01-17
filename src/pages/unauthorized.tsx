import Head from 'next/head';
import Link from 'next/link';

export default function Unauthorized() {
  return (
    <>
      <Head>
        <title>Access Denied | FPCT Mahali Pamoja</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <h1 className="text-3xl font-bold text-red-600 mb-4">⛔ Huna Ruhusa</h1>
          <p className="text-gray-700 mb-4">Samahani, huna ruhusa ya kufikia ukurasa huu.</p>
          <Link href="/" className="text-orange-600 font-medium hover:underline">
            Rudi kwenye ukurasa wa mwanzo
          </Link>
        </div>
      </div>
    </>
  );
}
