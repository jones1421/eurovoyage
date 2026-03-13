import Link from 'next/link';

const FEATURES = [
  { emoji: '🧠', title: 'AI Destination Picker', desc: 'Claude recommends 4-5 European destinations tailored to your travel style, weather preference, and time of year.' },
  { emoji: '✈️', title: 'Smart Flight Search', desc: 'Instant AI price estimates across PHL, JFK & EWR — plus real-time Skyscanner prices when you\'re ready to book.' },
  { emoji: '🏨', title: 'Curated Accommodations', desc: 'Real Booking.com listings hand-picked by AI based on your neighborhood preferences and nearby attractions.' },
  { emoji: '📋', title: 'Full Itinerary', desc: 'A personalized day-by-day trip plan with cost breakdown, inter-city transport tips, and direct booking links.' },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4f7a] to-[#1e3a5f] text-white py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-6">🌍</div>
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            Plan Your European Adventure
          </h1>
          <p className="text-xl text-blue-200 mb-8 leading-relaxed">
            AI-powered trip planning from Philadelphia or NYC.
            Destinations, flights, and hotels — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/plan"
              className="bg-[#ff6b6b] hover:bg-[#ff5252] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              Start Planning →
            </Link>
          </div>
          <p className="text-blue-300 text-sm mt-4">
            Premium economy · PHL, JFK, EWR · 1-4 travelers
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#1e3a5f] mb-12">
            Everything you need to plan the perfect European trip
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{f.emoji}</div>
                <h3 className="font-bold text-[#1e3a5f] text-lg mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-[#f8f9fa]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#1e3a5f] mb-12">How it works</h2>
          <div className="flex flex-col sm:flex-row gap-4 text-center">
            {[
              { step: '1', title: 'Set your preferences', desc: 'Month, weather, trip style, budget' },
              { step: '2', title: 'Pick destinations', desc: 'AI recommends the best European spots' },
              { step: '3', title: 'Compare flights', desc: 'See estimates, then get live prices' },
              { step: '4', title: 'Book your stay', desc: 'AI-curated hotels and apartments' },
            ].map((item) => (
              <div key={item.step} className="flex-1">
                <div className="w-10 h-10 rounded-full bg-[#1e3a5f] text-white font-bold flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
          <Link
            href="/plan"
            className="inline-block mt-12 bg-[#ff6b6b] hover:bg-[#ff5252] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all"
          >
            Plan My Trip →
          </Link>
        </div>
      </section>
    </div>
  );
}
