import { env } from "./src/config/env"; // ✅ use validated env
import app from "./src/app";
import connectDB from "./src/config/db";
import { initMinio } from "./src/services/MinoService/minio.service";
import { seedAdmin } from "./src/utils/seedAdmin";

connectDB().then( async () => {
     await initMinio();
  await seedAdmin();
    app.listen(env.PORT, () => {
        console.log(`🚀 Server running on ${env.PORT}`);
        console.log(`APi docs  on ${env.PORT}/api-docs`);
    });
});
