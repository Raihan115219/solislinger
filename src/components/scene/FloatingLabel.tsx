import type { CSSProperties } from 'react';
import { Html } from '@react-three/drei';
import type { HotspotConfig } from '@/config/hotspots';

export function FloatingLabel({ config, visible }: { config: HotspotConfig; visible: boolean }) {
  return (
    <Html position={config.labelPosition} zIndexRange={[30, 10]} style={{ pointerEvents: 'none' }}>
      <div
        className={`hs-label hs-label--${config.labelAnchor}${visible ? ' is-visible' : ''}`}
        style={{ '--accent': config.color } as CSSProperties}
        aria-hidden={!visible}
      >
        <span className="hs-label__title">{config.label}</span>
        <span className="hs-label__teaser">{config.teaser}</span>
        <span className="hs-label__tag">Coming soon</span>
      </div>
    </Html>
  );
}
