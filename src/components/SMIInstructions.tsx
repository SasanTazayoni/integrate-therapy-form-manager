const SMIInstructions = () => {
  return (
    <>
      <div className="mb-2 md:mb-6 p-2 md:p-4 border-2 border-gray-400 rounded-lg">
        <p className="font-bold mb-2">INSTRUCTIONS:</p>
        <p className="mb-4 text-gray-900">
          Listed below are statements that people might use to describe
          themselves. Please rate each item on how often you have believed or
          felt each statement in general using the frequency scale. If you
          forget the rating scale, you can check the icon at the top right of
          the screen.
        </p>
      </div>

      <div className="mb-2 md:mb-6 p-2 md:p-4 border-2 border-gray-400 rounded-lg">
        <p className="font-bold mb-1">FREQUENCY:</p>
        <ul className="list-none space-y-1 text-gray-900">
          <li>1 = Never or Almost Never</li>
          <li>2 = Rarely</li>
          <li>3 = Occasionally</li>
          <li>4 = Frequently</li>
          <li>5 = Most of the time</li>
          <li>6 = All of the time</li>
        </ul>
      </div>
    </>
  );
};

export default SMIInstructions;
