import app from "./app.js";
import { env } from "./shared/db/env.js";

app.listen(env.port, () => {
    console.log(`TalentFlow API running on port ${env.port} using ${env.dataSource}`);
});
