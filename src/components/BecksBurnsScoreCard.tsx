type ScoreCardProps = {
  title: string;
  value: string;
  submittedAt?: string;
  highlight?: boolean;
};

export default function ScoreCard({
  title,
  value,
  submittedAt,
  highlight = false,
}: ScoreCardProps) {
  return (
    <div
      className={`flex-1 min-w-[140px] p-6 rounded-md shadow-lg text-center border-2 ${
        highlight ? "bg-yellow-200 border-yellow-400" : "border-gray-300"
      }`}
    >
      <h3 className="text-lg font-semibold text-[--color-link] mb-2">
        {title}{" "}
        {submittedAt && (
          <span className="text-gray-400 text-md">
            ({new Date(submittedAt).toLocaleDateString()})
          </span>
        )}
      </h3>
      <p className="text-xl font-bold mb-1">{value}</p>
    </div>
  );
}
