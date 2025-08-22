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
      className={`score-card md:flex-1 p-6 rounded-md shadow-lg text-center border-2 ${
        highlight ? "bg-yellow-200 border-yellow-400" : "border-gray-300"
      }`}
    >
      <h3 className="text-lg font-semibold mb-2">
        {title}{" "}
        {submittedAt && (
          <span className="text-gray-400">
            ({new Date(submittedAt).toLocaleDateString()})
          </span>
        )}
      </h3>
      <p className="text-lg font-bold mb-1">{value}</p>
    </div>
  );
}
