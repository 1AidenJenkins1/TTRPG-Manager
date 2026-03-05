// GS-Appscript.gs \\

/*
global variables are in snake_case
other variables are in camelCase

google script, and javascript strings are in ""
html and CSS strings are in ''
*/

// global variables
const VERSION = "Alpha";

const USER_PROPERTIES = PropertiesService.getUserProperties();
const USER_TIME_ZONE = Session.getTimeZone();
const USER_DRIVE = DriveApp;
const USER_DRIVE_ROOT = USER_DRIVE.getRootFolder();

const FILE_TAG = "FO-N-CMC";

const MAIN_FOLDER_NAME = ("FO-NUCLEAR-CMC");
const MAIN_FOLDER_REF = validateDriveItem({ folderName: (MAIN_FOLDER_NAME), expectedLocation: (USER_DRIVE) });

const CHARACTERS_FOLDER_NAME = (FILE_TAG + " | CHARACTERS |");
const CLASSES_FOLDER_NAME = (FILE_TAG + " | CLASSES |");
const ITEMS_FOLDER_NAME = (FILE_TAG + " | ITEMS |");

const CHARACTERS_FOLDER_REF = validateDriveItem({ folderName: (CHARACTERS_FOLDER_NAME), expectedLocation: (MAIN_FOLDER_REF) });
const CLASSES_FOLDER_REF = validateDriveItem({ folderName: (CLASSES_FOLDER_NAME), expectedLocation: (MAIN_FOLDER_REF) });
const ITEMS_FOLDER_REF = validateDriveItem({ folderName: (ITEMS_FOLDER_NAME), expectedLocation: (MAIN_FOLDER_REF) });


// create page
function doGet() { 
  let html = HtmlService.createTemplateFromFile('Index').evaluate().setTitle('Fallout N.U.C.L.E.A.R CMC'); return html; 
}

// include | adds html files
function include(filename) { 
  return HtmlService.createHtmlOutputFromFile(filename).getContent(); 
}

// gets Page content
function getContent(fileName) {
  const html = HtmlService.createTemplateFromFile(fileName).evaluate();
  const content = html.getContent();
  return content;
}

// validateDriveItem 
function validateDriveItem ({ folderName, fileName, fileData, fileMimeType , expectedLocation }) {
  parentFolder = expectedLocation;

  if (folderName) {
    childFolder = expectedLocation.getFoldersByName(folderName);

    if (childFolder.hasNext()) 
    { childFolder = childFolder.next(); } 
    else
    { childFolder = parentFolder.createFolder(folderName); } 

    return childFolder;
  }

  if (fileName) {
    parentFolder = expectedLocation;
    childFile = expectedLocation.getFilesByName(fileName);

    if (childFile.hasNext()) 
    { childFile = childFile.next(); } 
    else
    { childFile = parentFolder.createFile(fileName, fileData, fileMimeType); } 

    return childFile;
  }

  return null;
}



// basic file data \\
/*
function getFileData(type){
  if (type) {
    let data = "";
    switch (type) {
      case "races":
      data = `
      { 
        
      (raceName="Human")
      (sizeClasses="[small, medium]")
      (minWeight="100")
      (maxWeight="250")

      (baseBallisticResistance="0")
      (baseEnergyResistance="0")
      (baseRadiationResistance="0")

      (strengthMod="0")
      (perceptionMod="0")
      (enderanceMod="0")
      (charismaMod="0")
      (intelligenceMod="0")
      (agilityMod="0")
      (luckMod="0")

      (hungerPerDay="1")
      (thirstPerDay="1")
      (powerPerDay="0")
      (isRobot?="false")
      (vulnerableToRadiation?="true")
      (vulnerableToDisease?="true")

      }`;
      break;
    }
    return data;
  } else {
    console.log("ERROR: no data to get");
    return null;
  }
}
*/


// save data of input type
function saveData(type, args = {}) {
  type = type || "all";

  // save a character
  if (type == "Character") {
    // define defaults
    const {
     saveType = "SAVE", 
     saveName = "My Save", 
     data = {},
     name = data.name || "Unnamed Character",
     id = data.id || createId()
    } = args;

    // define save date
    const saveDate = Utilities.formatDate(new Date(), USER_TIME_ZONE, "dd/MM/yyyy hh:mm:ss aaa");
    data.saveDate = saveDate;

    // get character save folder
    const saveFolder = validateDriveItem({ 
      folderName: (`${FILE_TAG} | CHARACTER | ${id} | ${name}`), 
      expectedLocation: (CHARACTERS_FOLDER_REF) 
    });

    // define and set the save file name
    let saveFileName = null;
    if (saveType == 'AUTOSAVE' || saveType == "QUICKSAVE") 
    { saveFileName = `${FILE_TAG} | ${saveType} | ${name}`; } 
    else 
    { saveFileName = `${FILE_TAG} | ${saveType} | ${saveDate} | ${saveName} | ${name}` }

    // turn current character save into JSON data
    const jsonData = JSON.stringify(data);

    // get charactaer save file
    let characterSaveRef = validateDriveItem({ 
      fileName: (saveFileName), 
      fileData: (jsonData), 
      fileMimeType: ("application/json") , 
      expectedLocation: (saveFolder) 
    });

    // if autosave or quicksave overwrite the previous data
    if (saveType == "AUTOSAVE" || saveType == "QUICKSAVE") 
    { characterSaveRef.setContent(jsonData); } 

    // saving was successful
    return true;
  }

  // saving failed
  return null;
}

// return a unique ID as a string
function createId() {
  const id = Date.now() + Math.floor(Math.random() * 1000);
  return id;
}
