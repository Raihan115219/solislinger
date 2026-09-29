'use client';

import { Component, useCallback, useEffect, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { ErrorPanel, Hud, LoadingScreen, Toast, WelcomePlaque } from './ui/Overlays';

const SaloonCanvas = dynamic(() => import('./scene/SaloonCanvas'), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error('[Solslinger] 3D scene crashed', error);
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function detectWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

type SceneState = 'checking' | 'ok' | 'unsupported' | 'failed';

export default function Experience() {
  const [scene, setScene] = useState<SceneState>('checking');
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onSceneError = useCallback(() => setScene('failed'), []);

  useEffect(() => {
    setScene(detectWebGL() ? 'ok' : 'unsupported');
  }, []);

  const failed = scene === 'unsupported' || scene === 'failed';

  return (
    <main className="shell">
      <div className="stage">
        {scene === 'ok' && (
          <SceneBoundary onError={onSceneError}>
            <SaloonCanvas onReady={onReady} />
          </SceneBoundary>
        )}
        {scene === 'unsupported' && (
          <ErrorPanel
            title="3D isn’t available here"
            body="This demo needs WebGL. Try a recent Chrome, Safari or Firefox with hardware acceleration turned on."
          />
        )}
        {scene === 'failed' && (
          <ErrorPanel
            title="The saloon couldn’t load"
            body="Something went wrong rendering the scene. Please refresh the page to try again."
          />
        )}
        <div className="vignette" aria-hidden />
        <Hud />
        <Toast />
        <WelcomePlaque ready={ready && !failed} />
        <LoadingScreen done={ready || failed} />
      </div>
    </main>
  );
}
