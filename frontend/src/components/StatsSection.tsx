export function StatsSection() {
  const stats = [
    { value: "5,000+", label: "URLs Scanned" },
    { value: "90%", label: "Detection Accuracy" },
    { value: "1,200+", label: "Students Protected" },
  ];

  return (
    <section className="py-20 bg-[#020617]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 px-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-gradient-to-b from-[#0b1220] to-[#060b16] rounded-2xl p-8 text-center border border-white/5 shadow-lg"
          >
            <div className="text-cyan-400 text-4xl mb-2 font-semibold">
              {stat.value}
            </div>
            <div className="text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
