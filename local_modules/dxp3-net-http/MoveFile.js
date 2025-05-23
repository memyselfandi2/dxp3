const { promises: filesystem } = require("fs");
const fs = require('fs');

async function getFiles(path = "C:\\temp\\") {
    const entries = await filesystem.readdir(path, { withFileTypes: true });

    // Get files within the current directory and add a path key to the file objects
    const files = entries
        .filter(file => !file.isDirectory())
        .map(file => ({ ...file, path: path + file.name }));

    // Get folders within the current directory
    const folders = entries.filter(folder => folder.isDirectory());

    for (const folder of folders)
        /*
          Add the found files within the subdirectory to the files array by calling the
          current function itself
        */
        files.push(...await getFiles(`${path}${folder.name}/`));

    return files;
}

async function blaat() {
	let files = await getFiles();

	for(const file of files) {
		let newFile = 'C:\\temp\\' + file.name;
		// console.log(file.path + ' -> ' + newFile);
		if(fs.existsSync(newFile)) {
			console.log('exists already:' + file.path);
		} else if(newFile === file.path) {
			console.log('Same file: ' + file.path);
		} else {
			filesystem.rename(file.path, newFile)
			.then(()=>{})
			.catch((error)=>{console.log(error)});
		}
	}
}

blaat();