const multer = require("multer");
const path = require("path");

// Function to dynamically set the upload folder
const createStorage = (folderName) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      // Points to either uploads/cvs/ or uploads/resumes/
      cb(null, `uploads/${folderName}/`); 
    },
    filename: function (req, file, cb) {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname).toLowerCase()}`;
      cb(null, uniqueName);
    }
  });
};

// File filter (only pdf, doc, docx)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [".pdf", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF/DOC/DOCX files allowed"), false);
  }
};

// Create the specific middlewares
const uploadCV = multer({
  storage: createStorage("cvs"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadResume = multer({
  storage: createStorage("resumes"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Export both so you can import exactly the one you need in your routes
module.exports = { uploadCV, uploadResume };