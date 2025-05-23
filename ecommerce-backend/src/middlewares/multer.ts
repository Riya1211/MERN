import multer from "multer";
import {v4 as uuid} from "uuid";
// creating storage (hardware)

const storage = multer.diskStorage({
    destination(req, file, callback){

        const dir = 'uploads';
        callback(null, dir);
    },
    filename(req, file, callback){
        const id = uuid();
        const extName = file.originalname.split(".").pop();
        const fileName = `${id}.${extName}`;
        
        callback(null, fileName);
    }
});

export const singleUpload = multer({storage}).single("photo");