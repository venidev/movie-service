import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';

const DEBOUNCE_MS = 300;

interface Props {
  value: string;
  onSearch: (query: string) => void;
}

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/** The page's headline: a large title search that updates as you type. */
export default function SearchHero({ value, onSearch }: Props) {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  // Follow URL changes (back/forward) without clobbering in-progress typing.
  useEffect(() => {
    setDraft((current) => (current.trim() === value ? current : value));
  }, [value]);

  // "/" focuses search from anywhere on the page.
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !isTypingTarget(event.target)) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const commit = (next: string, delay = 0) => {
    clearTimeout(timer.current);
    const run = () => {
      if (next.trim() !== value.trim()) onSearchRef.current(next.trim());
    };
    if (delay) timer.current = setTimeout(run, delay);
    else run();
  };

  const clear = () => {
    setDraft('');
    commit('');
    inputRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape' && draft) {
      event.preventDefault();
      clear();
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    commit(draft);
  };

  return (
    <section className="hero">
      <form role="search" className="hero-form" onSubmit={submit}>
        <label htmlFor="title-search" className="hero-label">Search films by title</label>
        <div className="hero-field">
          <input
            ref={inputRef}
            id="title-search"
            className="hero-input"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            spellCheck={false}
            maxLength={100}
            placeholder="Type a title"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              commit(event.target.value, DEBOUNCE_MS);
            }}
            onKeyDown={onKeyDown}
          />
          {draft && (
            <button type="button" className="hero-clear" onClick={clear}>
              Clear
            </button>
          )}
        </div>
        <p className="hero-hint">
          Press <kbd>/</kbd> to search from anywhere, <kbd>Esc</kbd> to clear.
        </p>
      </form>
    </section>
  );
}
