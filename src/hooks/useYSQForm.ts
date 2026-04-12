import YSQAllItems from "../data/YSQAllItems";
import useQuestionnaireForm from "./useQuestionnaireForm";

const useYSQForm = () => useQuestionnaireForm(YSQAllItems, [1, 2, 3, 4, 5, 6] as const);

export default useYSQForm;
