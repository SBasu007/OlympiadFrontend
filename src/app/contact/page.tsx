"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    subject: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire up to backend
    setSubmitted(true);
  }

  const cards = [
    {
      icon: (
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
        </svg>
      ),
      title: "Address",
      detail: "95, Baburam Ghosh Road, Tollygunge Kolkata 700040 West Bengal. India",
    },
    {
      icon: (
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.02l-2.21 2.2z" />
        </svg>
      ),
      title: "Phone Number",
      detail: "9432594197",
    },
    {
      icon: (
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      ),
      title: "Email",
      detail: "smarttalentkolkata@gmail.com",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 py-6 mt-16" style={{ backgroundColor: "#ffffff", color: "#111111" }}>
        <div className="max-w-4xl mx-auto">
          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {cards.map((card, index) => (
              <div
                key={card.title}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group flex flex-col items-center text-center rounded-xl border p-8 min-h-[230px] cursor-default transition-colors duration-200 ${
                  hoveredCard === index
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "bg-white border-gray-200"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-colors duration-200 ${
                    hoveredCard === index
                      ? "bg-orange-400 text-white"
                      : "bg-orange-100 text-orange-500"
                  }`}
                >
                  {card.icon}
                </div>
                <span
                  className={`font-bold text-lg mb-1 transition-colors duration-200 ${
                    hoveredCard === index ? "text-white" : "text-[#1a2e5a]"
                  }`}
                >
                  {card.title}
                </span>
                {card.detail && (
                  <p
                    className={`transition-colors duration-200 text-sm mt-1 leading-relaxed ${
                      hoveredCard === index ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {card.detail}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Contact form */}
          <h2 className="text-center text-xl font-bold text-[#1a2e5a] mb-5">
            Let&apos;s Get In Touch!
          </h2>

          {submitted ? (
            <p className="text-center text-green-600 font-medium">
              Thank you! Your message has been sent.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-orange-400"
                  style={{ backgroundColor: "#ffffff", color: "#111111" }}
                />
                <input
                  type="text"
                  name="subject"
                  placeholder="Your Subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-orange-400"
                  style={{ backgroundColor: "#ffffff", color: "#111111" }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email Address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-orange-400"
                  style={{ backgroundColor: "#ffffff", color: "#111111" }}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Your Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-orange-400"
                  style={{ backgroundColor: "#ffffff", color: "#111111" }}
                />
              </div>

              <textarea
                name="message"
                placeholder="Your Message"
                rows={4}
                value={form.message}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-orange-400 resize-y"
                style={{ backgroundColor: "#ffffff", color: "#111111" }}
              />

              <div className="flex justify-center pt-1">
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-2.5 rounded text-sm transition-colors duration-200"
                >
                  Send your message
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
