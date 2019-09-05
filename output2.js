// Step 6 of 6: Generate member and vendor schedules

const { each, orderBy, sortBy } = require("lodash");
const fs = require("file-system");
const csv = require("fast-csv");
const jsonfile = require("jsonfile");

const dataPath = "/Users/jesse/Dropbox/Documents/BKBG/Rotations"
const year = "2019"
const masterJson = require(`${dataPath}/${year}/master-schedule.json`);
const scheduleCsvPath = `${dataPath}/${year}/schedule.csv`
const memberScheduleCsvPath = `${dataPath}/${year}/member-schedule.csv`
const vendorScheduleCsvPath = `${dataPath}/${year}/vendor-schedule.csv`

exportMasterVendorSchedule(masterJson);
exportMasterMemberSchedule(masterJson);

function exportMasterMemberSchedule(schedule){
  var output = [];
  var outputLine = '';
  var headerLine = '';
  var lastTime = null
  schedule = orderBy(schedule, ['timecode','member1'],['asc','asc']);
  each(schedule, (timeSlot) => {
    if(timeSlot.time != lastTime){      // If its the next time slot...
      if(lastTime && outputLine != ''){ // And there was a previous time...
        outputLine += "\n";             // End the line
        output += outputLine;           // Append the line to the output
        outputLine = '';                // Reset the line
      }
      lastTime = timeSlot.time;         // Either way, set the new time
    }

    if(!!timeSlot.member1 & timeSlot.member1 != 'BREAK'){
      if(output == ''){                   // If there is no output yet, we are on the first slot series...
        headerLine += `"${timeSlot.member1}",,,"${timeSlot.member2}",,,`;
      }
      outputLine += `${timeSlot.time},"${timeSlot.vendor}","${timeSlot.booth}",`;
      outputLine += `${timeSlot.time},"${timeSlot.vendor}","${timeSlot.booth}",`;
    }
  });
  // console.log(output);
  writeCSV(memberScheduleCsvPath, `${headerLine}\n${output}${outputLine}`, "Master member schedule");
}

function exportMasterVendorSchedule(schedule){
  var output = '';
  var outputLine = '';
  var headerLine = '';
  var lastTime = null

  schedule = sortBy(schedule, ['timecode', 'vendor'],['asc','asc']);
  each(schedule, (timeSlot) => {
    if(timeSlot.time != lastTime){      // If its the next time slot...
      if(lastTime && outputLine != ''){ // And there was a previous time...
        outputLine += "\n";             // End the line
        output += outputLine;           // Append the line to the output
        outputLine = '';                // Reset the line
      }
      lastTime = timeSlot.time;         // Either way, set the new time
    }

    if(!!timeSlot.vendor & timeSlot.vendor != 'BREAK'){
      if(output == ''){                   // If there is no output yet, we are on the first slot series...
        headerLine += `"${timeSlot.vendor} (Booth #${timeSlot.booth})",,,`
      }
      outputLine += `${timeSlot.time},"${timeSlot.member1}","${timeSlot.member2}",`;
    }
  });
  writeCSV(vendorScheduleCsvPath,`${headerLine}\n${output}${outputLine}`, "Master vendor schedule");
}

function writeCSV(path, data, docLabel){
  fs.writeFile(path, data, 'utf8', function (err) {
    err && console.log(`Error: ${err}`);
  })
  console.log(`${docLabel} saved!`);
}

