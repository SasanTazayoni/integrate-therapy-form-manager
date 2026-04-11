import "./env";
import app from "./index";
import "./server/cron/cronSetup";
import { getFrontendBaseUrl } from "./utils/getFrontendBaseUrl";

getFrontendBaseUrl();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
