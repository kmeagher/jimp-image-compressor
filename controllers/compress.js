
const formidable = require('formidable');
const Jimp = require('jimp');
const path = require('path');

exports.compressImage = (req, res) => {
  const form = new formidable.IncomingForm();
  form.multiples = true;
  form.uploadDir = path.join(__dirname, "../uploads");
  form.on("file", async (field, file) => {
    await doCompressImage(file).catch(error => {
      console.log("===> Compression Error <===");
      console.log(error);
    });
  });
  form.on("error", (error) => {
    res.status(400).send(error);
  });
  form.on("end", () => {
    res.status(200).send({"Status": "success"});
  });
  form.parse(req);
};

exports.doCompressImage = (file) => {
  return new Promise((resolve, reject) => {
    //const ext = file.name.split(".").pop();
    const filePath = path.join(__dirname, "../queue/" + file);
    Jimp.read(filePath).then(image => {
      image.resize(600, 600).write(path.join(__dirname, "../compressed/" + file));
      //image.quality(30).write(path.join(__dirname, "../compressed/" + file));
      resolve(image);
    }).catch(error => {
      reject(error);
    });
  });
}