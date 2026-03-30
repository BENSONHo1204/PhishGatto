export default function HowItWorks() {
  return (
    <section className="pb-32 px-6 bg-[#020617]">
      <div className="max-w-6xl mx-auto bg-gradient-to-b from-[#0b1220] to-[#060b16] rounded-2xl p-12 border border-white/5">
        <h2 className="text-2xl font-semibold text-center mb-12 text-white">
          How It Works
        </h2>

        <div className="grid md:grid-cols-4 gap-6 text-white">
          {[
            ["1", "Paste URL", "Copy and paste the suspicious link"],
            ["2", "AI Analysis", "Our AI examines the URL"],
            ["3", "Get Results", "Receive a threat score"],
            ["4", "Stay Safe", "Follow protection tips"],
          ].map(([n, title, desc]) => (
            <div
              key={n}
              className="bg-[#0b1220] rounded-xl p-6 text-center border border-white/5"
            >
              <div className="w-10 h-10 mx-auto mb-4 rounded-full bg-cyan-500 text-black flex items-center justify-center font-bold">
                {n}
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
