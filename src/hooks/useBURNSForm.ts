import BURNS_ITEMS from "../data/BURNSItems";
import useQuestionnaireForm from "./useQuestionnaireForm";

const useBurnsForm = () => useQuestionnaireForm(BURNS_ITEMS, [0, 1, 2, 3] as const);

export default useBurnsForm;
