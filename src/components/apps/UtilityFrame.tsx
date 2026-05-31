interface UtilityFrameProps {
  src: string;
  title: string;
}

export default function UtilityFrame({ src, title }: UtilityFrameProps) {
  return <iframe className="size-full bg-[#202020]" src={src} title={title} />;
}
