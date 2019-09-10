var express = require('express');
var router = express.Router();
var ExifParserFactory = require('ts-exif-parser');
const fs= require('fs');
const jpegExif = require('jpeg-exif');
const exif = require('exif-parser')


var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_ID, 
  api_secret: process.env.API_SECRET
}); 

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register',function(request,response){
  response.render('register');
});

router.post('/register',upload.single('profile'), async(req,res)=>{
  console.log('File Info '+req.file+' Size'+req.file.size);
  //const data = ExifParserFactory.create(req.file).parse();

  var buffer = fs.readFileSync(req.file.path);
  const parser = exif.create(buffer)
  const exifResult = parser.parse()
  //console.log('Exif Data'+JSON.stringify(exifResult, null, 2));

  var jpegParsedData = jpegExif.parseSync(req.file.path);
  console.log('Jpeg PArsed Data'+JSON.stringify(jpegParsedData));
  var parsedData =JSON.stringify(jpegParsedData)
  console.log('Date Time '+parsedData.DateTime)

 
  console.log('process.env.CLOUD_NAME '+process.env.CLOUD_NAME);
  console.log('Name '+req.body.name);
  console.log('Email '+req.body.email);
  console.log('req.file.path '+req.file.path);
 /* cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        //req.flash('error', err.message);
        console.log('err'+err);
        return ;
      }
      console.log('result.secure_url '+result.secure_url) ;
      res.send(result);
    }); */

    const result = await cloudinary.v2.uploader.upload(req.file.path)
    res.send(result);

});

module.exports = router;