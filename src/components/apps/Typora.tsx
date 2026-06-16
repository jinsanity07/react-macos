import { Editor, rootCtx, defaultValueCtx } from "@milkdown/core";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { commonmark } from "@milkdown/preset-commonmark";
import { gfm } from "@milkdown/preset-gfm";
import { history } from "@milkdown/plugin-history";
import { listener, listenerCtx } from "@milkdown/plugin-listener";

const MilkdownEditor = () => {
  // Select individually so the selector identity stays stable across renders.
  const typoraMd = useStore((s) => s.typoraMd);
  const setTyporaMd = useStore((s) => s.setTyporaMd);

  // Mirror the latest values into refs so the useEditor config (which runs
  // once on mount) can read the current typoraMd and write through the current
  // setTyporaMd without re-binding.
  const typoraMdRef = useRef(typoraMd);
  const setTyporaMdRef = useRef(setTyporaMd);
  useEffect(() => {
    typoraMdRef.current = typoraMd;
  }, [typoraMd]);
  useEffect(() => {
    setTyporaMdRef.current = setTyporaMd;
  }, [setTyporaMd]);

  useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, typoraMdRef.current);
        ctx
          .get(listenerCtx)
          .mounted((ctx) => {
            const wrapper = ctx.get(rootCtx) as HTMLDivElement;
            const editor = wrapper.querySelector(
              ".editor[role='textbox']"
            ) as HTMLDivElement;
            wrapper.onclick = () => editor?.focus();
          })
          .markdownUpdated((_, markdown) => setTyporaMdRef.current(markdown));

        root.className =
          "typora bg-white dark:bg-gray-800 text-c-700 h-full overflow-y-scroll";
      })
      .use(listener)
      .use(commonmark)
      .use(gfm)
      .use(history)
  );

  return <Milkdown />;
};

export default function Typora() {
  return (
    <MilkdownProvider>
      <MilkdownEditor />
    </MilkdownProvider>
  );
}
