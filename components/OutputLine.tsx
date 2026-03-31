import type { OutputLine as OL } from "@/lib/types";

interface Props { line: OL }

export default function OutputLine({ line }: Props) {
  const { kind, text } = line;
  const rows = text.split("\n");

  if (kind === "img") {
    return (
      <div className="output-line output-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="qr-img" src={text} alt="QR Code" width={160} height={160} />
      </div>
    );
  }

  if (kind === "html") {
    return (
      <div
        className={`output-line output-${kind}`}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }

  return (
    <div className={`output-line ${kind}`}>
      {rows.map((row, i) => (
        <span key={i}>
          {row}
          {i < rows.length - 1 && <br />}
        </span>
      ))}
    </div>
  );
}
