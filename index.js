// Step 4 of 6: Generate the master schedule

const fs = require('file-system');
const jsonfile = require('jsonfile');
const { each, find, sortBy } = require('lodash');

const dataPath = "/Users/jesse/Dropbox/Documents/BKBG/Rotations"
const year = "2019"
const regions = require(`./regions`);
const vendors = require(`${dataPath}/${year}/vendors`);
const groupPairs = require(`${dataPath}/${year}/groups`);
const timeSlots = require(`${dataPath}/${year}/time-slots`);
const masterSchedPath = `${dataPath}/${year}/master-schedule.json`;
const scheduleCsvPath = `${dataPath}/${year}/schedule.csv`

const sortedVendors = sortBy(vendors, 'seq').reverse()
genMasterSched(sortedVendors);

function genMasterSched(vendors){
  var output = '';
  var printCount = 0;
  output += "TIMECODE,DAY,TIME,VENDOR,BOOTH,BOOTHSEQ,GROUP,MEMBER1,MEMBER2\n";
  var groupTimeOffset = [0,0];
  each(timeSlots, (day, dayOffset)=> {  // For every day...
    const ignoreGroups = day.groups.length === 1
    each(day.groups, (group) => {      // For every group (A/B)...
      // Override logical offset since A/B doesnt mean actual order
      const groupOffset = group.name == 'A' ? 0 : 1; 
      each(group.timeSlots, (timeSlot, timeOffset) => { // For every timeslot...
        // If not a break
        const altGroupOffset = !!groupOffset ? 0 : 1;
        if(!timeSlot.isBreak){           // If its not a BREAK
          // Generate every vendor slot with group members
          const currentGroup = groupPairs[groupOffset];
          each(vendors, (vendor, vendorOffset) => {
            const nullPair = [{"name":""},{"name":""}];
            const offset = vendorOffset + groupTimeOffset[groupOffset];
            const vendorMax = vendors.length;
            const pairOffset = offset % vendorMax;

            const pair = (
              (groupTimeOffset[groupOffset] < vendorMax ) &&
              (currentGroup.pairs[pairOffset])
            )? currentGroup.pairs[pairOffset]  : nullPair;

            output += `${timeSlot.timeCode},"${day.date}",${timeSlot.time},"${vendor.name}",${vendor.booth},${vendor.seq},${group.name},"${pair[0].name}","${pair[1].name}"\n`; // Write line
          });

          if(!ignoreGroups){
          // Generate opposite groups empty meeting lines
            each(groupPairs[altGroupOffset].pairs, (pair, pairOffset) => {
              output += `${timeSlot.timeCode},"${day.date}",${timeSlot.time},,,,${group.name},"${pair[0].name}","${pair[1].name}"\n`; // Write line
            });
          }
          groupTimeOffset[groupOffset] += 1;
        } else {  // Otherwise (it is a BREAK)

          //Generate vendor break lines
          each(vendors, (vendor)=>{  // For every vendor
            output += `${timeSlot.timeCode},"${day.date}",${timeSlot.time},"${vendor.name}",${vendor.booth},,${group.name},BREAK,BREAK\n`; // Write break line
          });

          // Generate member break lines
          const currentGroup = groupPairs[groupOffset];
          each(currentGroup.pairs, (pair)=>{   // And every member
            output += `${timeSlot.timeCode},"${day.date}",${timeSlot.time},BREAK,BREAK,,${group.name},"${pair[0].name}","${pair[1].name}"\n`; //Write break line
          });

          if(!ignoreGroups){
            // Generate opposite group BREAK lines
            each(groupPairs[altGroupOffset].pairs, (pair, pairOffset) => {
              output += `${timeSlot.timeCode},"${day.date}",${timeSlot.time},BREAK,BREAK,,${group.name},"${pair[0].name}","${pair[1].name}"\n`; // Write line
            });
          }
        }
      })
    })
  });
  writeFile(scheduleCsvPath, output);
}

function writeFile(path, data){
  fs.writeFile(path, data, 'utf8', function (err) {
    console.log(`Error: ${err}`);
  });
  console.log(`Finished master schedule!`)
}

function getVendorName(boothNumber){
  return find(vendors, {"booth": boothNumber}).name;
}

function getBoothByOffset(booths,offset) {
  return boothSeq[offset % booths.length];
}
