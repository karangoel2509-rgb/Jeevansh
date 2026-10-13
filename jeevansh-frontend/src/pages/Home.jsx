import { Link } from 'react-router-dom';
import { mockStats, mockTestimonials } from '../services/mockData';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blood-700 via-blood-800 to-blood-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in-up">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live Network — 12,480 donors active
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up animate-delay-100">
              Every Drop<br />
              <span className="text-red-300">Counts.</span>
            </h1>
            <p className="text-lg md:text-xl text-red-100 mb-10 max-w-2xl animate-fade-in-up animate-delay-200">
              Jeevansh connects patients in critical need with compatible blood donors in their neighbourhood — instantly, transparently, and without any app downloads.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animate-delay-300">
              <Link to="/request" className="inline-flex items-center justify-center gap-2 bg-white text-blood-700 font-bold px-8 py-4 rounded-xl hover:bg-red-50 transition-all shadow-xl shadow-black/20 text-lg">
                🩸 Find Blood Now
              </Link>
              <Link to="/donor/register" className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white/40 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all text-lg">
                ❤️ Become a Donor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: mockStats.totalDonors.toLocaleString(), label: 'Registered Donors', icon: '👥' },
              { value: mockStats.livesSaved.toLocaleString(), label: 'Lives Impacted', icon: '❤️' },
              { value: mockStats.activeRequests, label: 'Active Requests', icon: '🚨' },
              { value: mockStats.citiesCovered, label: 'Cities Covered', icon: '🌍' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-extrabold text-blood-700">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How Jeevansh Works</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Three simple steps to save a life. No app downloads. No complicated forms. Just help, when it matters most.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Request Blood', desc: 'Enter the blood group needed and share your location. Our system instantly finds compatible donors nearby.', icon: '📝' },
              { step: '02', title: 'Donors Get Alerted', desc: 'Compatible donors receive a WhatsApp message with the request details. They can accept or decline with one tap.', icon: '📲' },
              { step: '03', title: 'Donation Confirmed', desc: 'Once a donor accepts, you get their contact instantly. A QR code verifies the donation at the blood bank.', icon: '✅' },
            ].map((item, i) => (
              <div key={i} className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-5xl font-extrabold text-blood-100 absolute top-6 right-6">{item.step}</div>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Stories That Matter</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Real people. Real impact. Real lives saved.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {mockTestimonials.map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <span key={j} className="text-yellow-400">★</span>)}
                </div>
                <p className="text-gray-700 italic mb-6 leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="font-bold text-gray-900">{t.name}</p>
                  <p className="text-sm text-blood-600">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blood-700 to-blood-900 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Save a Life?</h2>
          <p className="text-red-100 text-lg mb-10 max-w-2xl mx-auto">Whether you need blood or want to donate, Jeevansh makes it simple. Join our network of heroes today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/request" className="inline-flex items-center justify-center bg-white text-blood-700 font-bold px-8 py-4 rounded-xl hover:bg-red-50 transition text-lg">
              🩸 Find Blood Now
            </Link>
            <Link to="/donor/register" className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition text-lg">
              ❤️ Register as Donor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}