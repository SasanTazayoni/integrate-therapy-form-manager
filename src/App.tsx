import ProtectedForm from "./components/ProtectedForm";
import Questionnaire from "./components/Questionnaire";

function App() {
  return (
    <ProtectedForm>
      <Questionnaire />
    </ProtectedForm>
  );
}

export default App;
