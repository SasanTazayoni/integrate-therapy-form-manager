const YSQInstructions = () => {
  return (
    <>
      <div className="mb-6 p-4 border-2 border-gray-400 divide-gray-400 rounded-lg">
        <p className="font-bold mb-2">INSTRUCTIONS:</p>
        <p className="mb-4 text-gray-900">
          Listed below are statements that you might use to describe yourself.
          Please read each statement and decide how well it describes you. When
          you are not sure, base your answer on what you emotionally feel, not
          on what you think to be true. If you desire, reword the statement so
          that it would be even more accurate in describing you (but do not
          change the basic meaning of the question). Then choose the highest
          rating from 1 to 6 that best describes you (including your revisions)
          and write the number on the line before each statement.
        </p>

        <p className="font-bold mb-1">Rating Scale:</p>
        <ul className="list-none space-y-1">
          <li>1 – Completely untrue of me</li>
          <li>2 – Mostly untrue of me</li>
          <li>3 – Slightly more true than untrue</li>
          <li>4 – Moderately true of me</li>
          <li>5 – Mostly true of me</li>
          <li>6 – Describes me perfectly</li>
        </ul>
      </div>

      <div className="mb-6 p-4 border-2 border-gray-400 divide-gray-400 rounded-lg">
        <p className="font-bold">Example:</p>
        <p className="text-gray-900">
          I worry that people{" "}
          <em className="text-blue-600 font-bold">I care about</em> will not
          like me.
        </p>
      </div>
    </>
  );
};

export default YSQInstructions;
