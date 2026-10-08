import { Download, RotateCcw } from 'lucide-react';
import type { SavedState, Settings as SettingsType } from '../types';
import { PageHeading, Panel } from '../components/UI';
export default function Settings({
  state,
  onChange,
  onReset,
}: {
  state: SavedState;
  onChange: (settings: SettingsType) => void;
  onReset: () => void;
}) {
  const settings = state.settings;
  const update = <K extends keyof SettingsType>(key: K, value: SettingsType[K]) =>
    onChange({ ...settings, [key]: value });
  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cyberops-training-progress.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <>
      <PageHeading
        eyebrow="WORKSPACE / PREFERENCES"
        title="Lab settings"
        description="Make this workspace fit your training routine."
      />
      <div className="settings-layout">
        <Panel title="Training preferences">
          <div className="settings-rows">
            <div>
              <label htmlFor="difficulty-setting">
                <strong>Default difficulty</strong>
                <span>Filters your recommended cases and practice queues.</span>
              </label>
              <select
                id="difficulty-setting"
                value={settings.difficulty}
                onChange={(e) => update('difficulty', e.target.value as SettingsType['difficulty'])}
              >
                {['All levels', 'Beginner', 'Intermediate', 'Advanced', 'Expert'].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="mode-setting">
                <strong>Play style</strong>
                <span>Training shows hints. Assessment reveals guidance after submission.</span>
              </label>
              <select
                id="mode-setting"
                value={settings.mode}
                onChange={(e) => update('mode', e.target.value as SettingsType['mode'])}
              >
                <option>Training</option>
                <option>Assessment</option>
              </select>
            </div>
            <div>
              <label htmlFor="theme-setting">
                <strong>Theme</strong>
                <span>Select the appearance of your operations console.</span>
              </label>
              <select
                id="theme-setting"
                value={settings.theme}
                onChange={(e) => update('theme', e.target.value as SettingsType['theme'])}
              >
                <option>Dark</option>
                <option>Light</option>
              </select>
            </div>
            <div>
              <label htmlFor="timer-setting">
                <strong>Investigation timer</strong>
                <span>Shows elapsed time. Duration never reduces your score.</span>
              </label>
              <input
                className="toggle-input"
                id="timer-setting"
                type="checkbox"
                checked={settings.timer}
                onChange={(e) => update('timer', e.target.checked)}
              />
            </div>
            <div>
              <label htmlFor="sound-setting">
                <strong>Completion sound</strong>
                <span>A short tone plays when you submit an investigation.</span>
              </label>
              <input
                className="toggle-input"
                id="sound-setting"
                type="checkbox"
                checked={settings.sound}
                onChange={(e) => update('sound', e.target.checked)}
              />
            </div>
          </div>
        </Panel>
        <Panel title="Local data">
          <div className="panel-body">
            <h3>Your browser is your workspace</h3>
            <p className="muted">
              Scores, XP, history, and settings are saved in localStorage for this browser and site
              address. Changing browsers, ports, or clearing site data creates a separate workspace.
            </p>
            <button className="button button-secondary full-width" onClick={exportData}>
              <Download size={15} />
              Export progress JSON
            </button>
            <hr />
            <h3>Reset training progress</h3>
            <p className="muted">
              Remove case history, XP, streaks, and achievements. Your preferences are retained.
            </p>
            <button className="button button-danger full-width" onClick={onReset}>
              <RotateCcw size={15} />
              Reset progress
            </button>
          </div>
        </Panel>
      </div>
      <p className="page-footnote">
        CyberOps Triage Lab v1.0 · Simulated environments only · No external API connections
      </p>
    </>
  );
}
