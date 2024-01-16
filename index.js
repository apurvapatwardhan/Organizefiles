const fsPromises = require("fs").promises;
const path = require("path");

const [,,src,dst] = process.argv;
organizeFacade(src, dst);

async function organizeFacade(src, dst) {
  try {
    await fsPromises.mkdir(dst, { recursive: true }); //create directory
    await organize(src, dst); // execute organize
  } catch (err) {
    console.log(err);
  }
}

async function isFolder(fp) {
  try {
    const status = await fsPromises.stat(fp);
    return status.isDirectory();
  } catch (err) {
    if (err.code == "ENOENT") {
      return false;
    }
  }
}

async function organize(src, dst) {
  const files = await fsPromises.readdir(src); // gives array of just file and folder names 
  for (fileName of files) {
    const srcFilePath = path.join(src, fileName);
    const status = await fsPromises.stat(srcFilePath);
    if (status.isDirectory()) {
      await organize(srcFilePath, dst); //recursively work on the folder
    } else if (status.isFile()) {
      const extName = path.extname(fileName);
      const fp = path.join(dst, extName.slice(1)); // create destination folder with folder name as extension
      const isFolderPresent = await isFolder(fp);
      if (!isFolderPresent) {
        await fsPromises.mkdir(fp, { recursive: true }); //create destination directory if not present
      }
      await fsPromises.copyFile(srcFilePath, path.join(fp,fileName));
    }
  }
}


