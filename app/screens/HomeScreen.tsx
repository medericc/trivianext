'use client';
import Link from 'next/link';

export default function HomeScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-beige via-sand to-leather flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-parchment/90 rounded-lg p-6 shadow-lg border-2 border-brown-800">
          <h1 className="text-3xl md:text-4xl font-bold text-brown-900 font-times text-center tracking-wider mb-4">
            TRIVIA BIBLIQUE
          </h1>
          
          <div className="border-t border-brown-600 my-6"></div>
          
          <div className="text-brown-700 text-6xl text-center mb-4">📖</div>
          
          <p className="text-brown-800 text-lg italic text-center mb-6">
            Testez votre connaissance<br />des Saintes Écritures
          </p>
          
          <div className="text-center">
            <Link href="/setup">
              <button className="bg-brown-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-brown-800 transition-colors border border-brown-900">
                COMMENCER LE JEU
              </button>
            </Link>
          </div>
        </div>
        
        <p className="text-brown-800 italic text-center mt-8">
          « Ta parole est une lampe à mes pieds » - Psaume 119:105
        </p>
      </div>
    </div>
  );
}