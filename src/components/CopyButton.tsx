import { useState, useEffect, useRef } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';

interface CopyButtonProps {
  text: string;
}

type CopyState = 'idle' | 'copied' | 'error';

export function CopyButton({ text }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset to idle whenever the text to copy changes
  useEffect(() => {
    setState('idle');
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [text]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const reset = () => {
    timerRef.current = setTimeout(() => setState('idle'), 2200);
  };

  const handleCopy = async () => {
    if (!text) return;

    // ── Primary: modern Clipboard API ──────────────────────────────
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        setState('copied');
        reset();
        return;
      } catch {
        // Fall through to legacy method
      }
    }

    // ── Fallback: textarea + execCommand ───────────────────────────
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      // Place off-screen but still in the document flow so select() works
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;width:2em;height:2em;opacity:0;';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) {
        setState('copied');
      } else {
        setState('error');
      }
      reset();
    } catch {
      setState('error');
      reset();
    }
  };

  const label = state === 'copied' ? 'Copied!'
              : state === 'error'  ? 'Failed'
              : 'Copy';

  const ariaLabel = state === 'copied' ? 'Copied to clipboard'
                  : state === 'error'  ? 'Copy failed — please copy manually'
                  : 'Copy Points Data';

  return (
    <button
      className={`copy-btn copy-btn--${state}`}
      onClick={handleCopy}
      aria-label={ariaLabel}
      title={state === 'error' ? 'Could not access clipboard. Try Ctrl+C after selecting the text.' : ariaLabel}
      disabled={!text}
    >
      <span className="copy-btn__icon">
        {state === 'copied' && <Check size={14} strokeWidth={2.5} />}
        {state === 'error'  && <AlertCircle size={14} />}
        {state === 'idle'   && <Copy size={14} />}
      </span>
      <span className="copy-btn__label">{label}</span>
    </button>
  );
}
