export default function FeaturesSection() {
  return (
    <section className="py-24 max-w-6xl mx-auto px-6">
      <h2 className="text-2xl font-semibold text-center mb-14">
        How PhishGatto Protects You
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="feature-card">
          <div className="icon">🛡️</div>
          <h3>URL Analysis</h3>
          <p>
            Detects suspicious patterns such as domain mismatches, IP usage,
            and unusual symbols.
          </p>
        </div>

        <div className="feature-card">
          <div className="icon">👁️</div>
          <h3>Visual Cloning Detection</h3>
          <p>
            Identifies fake websites mimicking legitimate brands through visual
            analysis.
          </p>
        </div>

        <div className="feature-card">
          <div className="icon">💡</div>
          <h3>Explainable AI</h3>
          <p>
            Provides clear explanations so you understand every detection
            decision.
          </p>
        </div>
      </div>
    </section>
  );
}
