import SMIItems from "../data/SMIItems";
import useQuestionnaireForm from "./useQuestionnaireForm";

const useSMIForm = () => useQuestionnaireForm(SMIItems, [1, 2, 3, 4, 5, 6] as const);

export default useSMIForm;
