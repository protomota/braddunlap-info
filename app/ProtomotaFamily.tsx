import './protomota-family.css';

export function ProtomotaFamily() {
  return (
    <section className="protomota-family-block" aria-labelledby="protomota-family-title">
    <div className="shell family-shell">
      <div className="family-inner">
        <div className="family-about">
          <h2 id="protomota-family-title" className="family-title">More from Protomota</h2>
          <p>Protomota is Brad Dunlap’s independent studio for apps, creative tools, and experiments.</p>
          <a className="family-hub" href="https://protomota.com/#apps">Explore the studio <span aria-hidden="true">↗</span></a>
        </div>
        <ul className="family-apps" aria-label="Apps by Protomota">
        <li>
          <a className="family-entry" href="https://jotley.ai/">
            <img src="/protomota-apps/jotley.webp" alt="" width={34} height={34} loading="lazy" />
            <span><strong>Jotley</strong><span className="family-detail">On-device voice notes and transcripts.</span></span>
            <span className="family-arrow" aria-hidden="true">↗</span>
          </a>
          <a className="family-store" href="https://apps.apple.com/us/app/jotley-private-ai-notes/id6746770199">Available on the App Store <span aria-hidden="true">↗</span></a>
        </li>
        <li>
          <a className="family-entry" href="https://pulsecanvas.si/">
            <img src="/protomota-apps/pulsecanvas.webp" alt="" width={34} height={34} loading="lazy" />
            <span><strong>PulseCanvas Studio</strong><span className="family-detail">Turn music into video that moves to the beat.</span></span>
            <span className="family-arrow" aria-hidden="true">↗</span>
          </a>
          <a className="family-store" href="https://apps.apple.com/us/app/pulsecanvas-studio/id6821642700">Available on the App Store <span aria-hidden="true">↗</span></a>
        </li>
        <li>
          <a className="family-entry" href="https://opentalon.ai/">
            <img src="/protomota-apps/opentalon.webp" alt="" width={34} height={34} loading="lazy" />
            <span><strong>OpenTalon</strong><span className="family-detail">A personal Kanban board for Mac.</span></span>
            <span className="family-arrow" aria-hidden="true">↗</span>
          </a>
          <span className="family-soon">Coming soon</span>
        </li>
        <li>
          <a className="family-entry" href="https://inkspring.ai/">
            <img src="/protomota-apps/inkspring.webp" alt="" width={34} height={34} loading="lazy" />
            <span><strong>Inkspring</strong><span className="family-detail">A desktop studio for research and writing.</span></span>
            <span className="family-arrow" aria-hidden="true">↗</span>
          </a>
          <span className="family-soon">Coming soon</span>
        </li>
        <li>
          <a className="family-entry" href="https://voxley.si/">
            <img src="/protomota-apps/voxley.webp" alt="" width={34} height={34} loading="lazy" />
            <span><strong>Voxley</strong><span className="family-detail">Private dictation for Mac.</span></span>
            <span className="family-arrow" aria-hidden="true">↗</span>
          </a>
          <span className="family-soon">Coming soon</span>
        </li>
        <li>
          <a className="family-entry" href="https://textley.ai/">
            <img src="/protomota-apps/textley.webp" alt="" width={34} height={34} loading="lazy" />
            <span><strong>Textley</strong><span className="family-detail">A native text and code editor for Mac.</span></span>
            <span className="family-arrow" aria-hidden="true">↗</span>
          </a>
          <span className="family-soon">Coming soon</span>
        </li>
        </ul>
      </div>
    </div>
  </section>
  );
}
