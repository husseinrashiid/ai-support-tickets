export function AttachmentThumbnail({
  attachment,
}: {
  attachment: { id: string; filename: string };
}) {
  return (
    <a
      href={`/api/attachments/${attachment.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-block overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/attachments/${attachment.id}`}
        alt={attachment.filename}
        className="h-28 w-28 object-cover"
      />
    </a>
  );
}
