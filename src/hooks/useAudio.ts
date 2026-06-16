export interface HTMLAudioState {
  volume: number;
  playing: boolean;
}

export interface HTMLAudioProps {
  src: string;
  autoReplay?: boolean;
}

export function useAudio(props: HTMLAudioProps) {
  // Stable across renders: one Audio element per src, released on unmount.
  const element = useMemo(() => new Audio(props.src), [props.src]);
  const ref = useRef<HTMLAudioElement>(element);
  // Keep the ref pointed at the live element when src changes.
  ref.current = element;

  const [state, setState] = useState<HTMLAudioState>({
    volume: 1,
    playing: false
  });

  // Functional updates eliminate the stale-closure races; toggle reads the
  // live element so the state read is also race-free.
  const controls = useMemo(
    () => ({
      play: (): Promise<void> | void => {
        const el = ref.current;
        if (!el) return;
        setState((s) => ({ ...s, playing: true }));
        return el.play();
      },

      pause: (): Promise<void> | void => {
        const el = ref.current;
        if (!el) return;
        setState((s) => ({ ...s, playing: false }));
        return el.pause();
      },

      toggle: (): Promise<void> | void => {
        const el = ref.current;
        if (!el) return;
        const wasPlaying = !el.paused;
        const promise = wasPlaying ? el.pause() : el.play();
        setState((s) => ({ ...s, playing: !wasPlaying }));
        return promise;
      },

      volume: (value: number): void => {
        const el = ref.current;
        if (!el) return;
        const clamped = Math.min(1, Math.max(0, value));
        el.volume = clamped;
        setState((s) => ({ ...s, volume: clamped }));
      }
    }),
    []
  );

  useEffect(() => {
    const handler = () => {
      if (props.autoReplay) controls.play();
    };

    element.addEventListener("ended", handler);
    return () => {
      element.removeEventListener("ended", handler);
      // Release the element on unmount / src change.
      element.pause();
      element.removeAttribute("src");
      element.load();
    };
  }, [element, controls, props.autoReplay]);

  useEffect(() => {
    const el = ref.current;

    if (!el) return;

    setState({
      volume: el.volume,
      playing: !el.paused
    });
  }, [props.src]);

  return [element, state, controls, ref] as const;
}
