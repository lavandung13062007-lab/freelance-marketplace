export default function Avatar({
  name,
  avatarUrl,
  size = "h-12 w-12 text-lg",
}: {
  name: string;
  avatarUrl?: string | null;
  size?: string;
}) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl} alt={name} className={`${size} shrink-0 rounded-full object-cover`} />;
  }

  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-brand-yellow font-bold text-gray-900`}
    >
      {name.charAt(0).toUpperCase() || "?"}
    </span>
  );
}
