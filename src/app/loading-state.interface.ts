interface Loading {
  state: 'loading';
  data?: string | null;
  error?: string | null;
}

interface Loaded<T> {
  state: 'loaded';
  data: T;
  error?: string | null;
}

interface Errored {
  state: 'error';
  error: Error;
  data?: string | null;
}

export type LoadingState<T = unknown> = Loading | Loaded<T> | Errored;
