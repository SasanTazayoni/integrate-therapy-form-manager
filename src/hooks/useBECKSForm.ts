import BECKS_ITEMS from "../data/BECKSItems";
import useQuestionnaireForm from "./useQuestionnaireForm";

const useBecksForm = () => useQuestionnaireForm(BECKS_ITEMS, [0, 1, 2, 3] as const);

export default useBecksForm;
