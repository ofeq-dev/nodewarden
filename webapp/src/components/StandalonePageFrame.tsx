import { KeyRound } from 'lucide-preact';
import type { ComponentChildren } from 'preact';
import { APP_NAME, APP_VERSION } from '@shared/app-version';

interface StandalonePageFrameProps {
  title: string;
  eyebrow?: ComponentChildren;
  titleAccessory?: ComponentChildren;
  children: ComponentChildren;
}

export default function StandalonePageFrame(props: StandalonePageFrameProps) {
  return (
    <div className="standalone-shell">
      <div className="standalone-brand standalone-brand-outside">
        <span className="brand-mark" aria-hidden="true">
          <KeyRound size={16} />
        </span>
        <span className="standalone-brand-name">{APP_NAME}</span>
      </div>

      <div className="auth-card">
        {props.eyebrow && <div className="standalone-eyebrow">{props.eyebrow}</div>}
        <div className="standalone-title-row">
          <h1 className="standalone-title">{props.title}</h1>
          {props.titleAccessory}
        </div>
        {props.children}
      </div>

      <div className="standalone-footer">Version {APP_VERSION}</div>
    </div>
  );
}
