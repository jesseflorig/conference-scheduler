const year = "2018"
const _ = require('lodash');
const fs = require('file-system');
const csv = require("fast-csv");
const jsonfile = require('jsonfile');
//const masterJson = require(`./output/${year}/master-schedule`);

const schedJson = `output/${year}/master-schedule.json`;

converMasterScheduleToJSON();
//exportMasterVendorSchedule(masterJson);
//exportMasterMemberSchedule(masterJson);
// testMember(masterJson,'Carmike Kitchens');
// testVendor(masterJson,'BKBG');

function testMember(schedule, memberName){
  _.each(schedule, (line) => {
    if(line.member1 == memberName){
      console.log(line.time, line.vendor);
    }
  });
}

function testVendor(schedule, vendorName){
  var slotCount = 0;
  schedule = _.sortBy(schedule,['timecode', 'vendor']);
  _.each(schedule, (line) => {
    if(line.vendor == vendorName){
      console.log(line.time, line.member1);
      slotCount++;
    }
  });
  console.log(vendorName,'-->',slotCount);
}

function exportMasterMemberSchedule(schedule){
  var output = [];
  var outputLine = '';
  var headerLine = '';
  var lastTime = null
  schedule = _.orderBy(schedule, ['timecode','member1'],['asc','asc']);
  _.each(schedule, (timeSlot) => {
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
  writeCSV(`output/${year}/master-member-schedule.csv`, `${headerLine}\n${output}${outputLine}`);
}

function exportMasterVendorSchedule(schedule){
  var output = '';
  var outputLine = '';
  var headerLine = '';
  var lastTime = null

  schedule = _.sortBy(schedule, ['timecode', 'vendor'],['asc','asc']);
  _.each(schedule, (timeSlot) => {
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
  writeCSV(`output/${year}/master-vendor-schedule.csv`,`${headerLine}\n${output}${outputLine}`);
}

function writeCSV(path, data){
  fs.writeFile(path, data, 'utf8', function (err) {
    if (err) {
      console.log('Some error occured - file either not saved or corrupted file saved.');
    } else{
      console.log('It\'s saved!');
    }
  });
}

function converMasterScheduleToJSON(){
  var headers = true;
  var keyList = [];
  var output = []
  const stream = fs.createReadStream(`./output/${year}/master-schedule.csv`);
  const csvStream = csv()
      .on("data", function(data){
           if(headers){
             keyList = data;
             //console.log(keyList);
           }
           else {
             var item = {}
             _.each(data, (cell, idx) =>{
               var keyName = keyList[idx];
               if(keyName){
                 item[keyName.toLowerCase()] = data[idx] || '';
               }
             });
             output.push(item);
           }
           if(headers){ headers = false; }
      })
      .on("end", function(){
           jsonfile.writeFile(schedJson, output, function (err) {
             console.error(err);
           })
           console.log('Done converting Master Schedule!');
      });

  stream.pipe(csvStream);
}
