const SubmittedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="modal">
        <h1 className="text-2xl font-bold mb-4">Thank you!</h1>
        <p className="mb-2">Your form has been successfully submitted.</p>
        <p className="text-sm text-gray-700">
          You may now safely close this tab or browser window.
        </p>
      </div>
    </div>
  );
};

export default SubmittedPage;
