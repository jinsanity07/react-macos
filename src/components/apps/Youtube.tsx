export default function Youtube() {
  return (
    <iframe
      className="w-full h-full"
      src="https://www.youtube.com/embed/Wj0bFJLs92A?si=cYOhl25FChFiOWjU"
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  );
}
