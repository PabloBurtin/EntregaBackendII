import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './public/Imagenes') 
    },
    filename: (req, file, callback) => {
        const newFilename = Date.now() + "-" + file.originalname;
        callback(null, newFilename); 
    }
})

//creamos el middleware

const uploader = multer ({ storage })

export default uploader;