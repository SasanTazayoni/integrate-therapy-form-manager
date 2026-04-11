import "./env";
import app from "./index";
import "./server/cron/cronSetup";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
