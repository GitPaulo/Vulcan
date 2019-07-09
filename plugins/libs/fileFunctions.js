
const fs   = xrequire('fs');
const path = xrequire('path');

const fileFunctions = module.exports = {};

fileFunctions.allDirFiles = (dir, fileTypes = '.js') => {
    const filesToReturn = [];

    function walkDir (currentPath) {
        const files = fs.readdirSync(currentPath);

        for (let i in files) {
            let curFile = path.join(currentPath, files[i]);

            if (fs.statSync(curFile).isFile() && fileTypes.indexOf(path.extname(curFile)) !== -1) {
                filesToReturn.push(curFile.replace(dir, ''));
            } else if (fs.statSync(curFile).isDirectory()) {
                walkDir(curFile);
            }
        }
    }

    walkDir(dir);

    return filesToReturn;
};
