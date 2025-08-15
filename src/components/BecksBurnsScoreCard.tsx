type ScoreCardProps = {
  title: string;
  value: string | number;
};

export default function ScoreCard({ title, value }: ScoreCardProps) {
  return (
    <div className="flex-1 min-w-[140px] p-6 rounded-md shadow-lg text-center border-2 border-gray-300">
      <h3 className="text-lg font-semibold text-[--color-link] mb-2">
        {title}
      </h3>
      <p className="text-3xl font-bold text-[--color-secondary] mb-1">
        {value}
      </p>
    </div>
  );
}
