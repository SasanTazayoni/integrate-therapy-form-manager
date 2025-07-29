import NotFoundModal from "../components/modals/NotFoundModal";

export default function NotFoundPage() {
  return (
    <div className="relative min-h-screen">
      <div className="blurred">
        <h1 className="sr-only">404</h1>
      </div>

      <NotFoundModal />
    </div>
  );
}
