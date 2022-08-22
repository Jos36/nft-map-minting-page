const util = require("util");
const multer = require("multer");
const path = require("path");
const maxSize = 200000 * 1024 * 1024;


let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // cb(null, path.join(__dirname, '..', "/public/images/"));
        cb(null, path.resolve(__dirname,"../public/images/"));
    },
    filename: (req, file, cb) => {
        let ext = file.originalname.split('.').reverse()[0];
        cb(null, `${file.fieldname + Date.now()}.${ext}`);
    },
});


let uploadFile = multer({ storage: storage }).fields([{ name: 'logo' }, { name: 'images' }, { name: 'videos' }]);

let uploadFileMiddleware = util.promisify(uploadFile);

module.exports = uploadFileMiddleware;