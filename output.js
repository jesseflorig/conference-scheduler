// Step 5 of 6: Convert mast schedule to JSON

const { each } = require("lodash");
const fs = require("file-system");
const csv = require("fast-csv");
const jsonfile = require("jsonfile");

const dataPath = "/Users/jesse/Dropbox/Documents/BKBG/Rotations"
const year = "2019"
const scheduleJsonPath = `${dataPath}/${year}/master-schedule.json`;
const scheduleCsvPath = `${dataPath}/${year}/schedule.csv`

converMasterScheduleToJSON();

function writeCSV(path, data){
  fs.writeFile(path, data, "utf8", function (err) {
    if (err) {
      console.log(`Error: ${err}`);
    } else{
      console.log("Master schedule converted to JSON");
    }
  });
}

function converMasterScheduleToJSON(){
  var headers = true;
  var keyList = [];
  var output = []
  const stream = fs.createReadStream(scheduleCsvPath);
  const csvStream = csv()
      .on("data", function(data){
           if(headers){
             keyList = data;
             //console.log(keyList);
           }
           else {
             var item = {}
             each(data, (cell, idx) =>{
               var keyName = keyList[idx];
               if(keyName){
                 item[keyName.toLowerCase()] = data[idx] || "";
               }
             });
             output.push(item);
           }
           if(headers){ headers = false; }
      })
      .on("end", function(){
           jsonfile.writeFile(scheduleJsonPath, output, function (err) {
             err && console.error(`Error: ${err}`);
           })
           console.log("Done converting Master Schedule!");
      });

  stream.pipe(csvStream);
}
