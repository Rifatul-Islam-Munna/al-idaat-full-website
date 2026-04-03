import { Router } from "express";
import { uploadSingleFile, uploadMultipleFiles, deleteSingleFile, deleteMultipleFiles, getAllFiles } from "../controllers/upload.controller";
import { upload } from "../middlewares/multer.middleware";
import { identifier } from "../middlewares/indentifier.middleware";

const router = Router();

router.get("/", getAllFiles);
router.post("/single", identifier, upload.single("file"), uploadSingleFile);
router.post("/multiple", identifier, upload.array("files"), uploadMultipleFiles);
router.delete("/single/:id", identifier, deleteSingleFile);
router.delete("/multiple", identifier, deleteMultipleFiles);

export default router;
