const year = "2018"
const _ = require('lodash');
const fs = require('file-system');
const jsonfile = require('jsonfile');
const vendors = require(`./data/${year}/vendors`);
const regions = require(`./data/${year}/regions`);
const groupPairs = require(`./data/${year}/groups`);
const schedule = require(`./data/${year}/time-slots`);

const masterSched = `data/${year}/master-schedule.json`;
const sortedVendors = _.sortBy(vendors, 'seq').reverse();
//console.log('sorted vendors',sortedVendors);
genMasterSched(sortedVendors);

function genMasterSched(vendors){
  var output = '';
  var printCount = 0;
  output += "TIMECODE,DAY,TIME,VENDOR,BOOTH,BOOTHSEQ,GROUP,MEMBER1,MEMBER2\n";
  var groupTimeOffset = [0,0];
  _.each(schedule, (day, dayOffset)=> {  // For every day...
    _.each(day.groups, (group) => {      // For every group (A/B)...
      // Override logical offset since A/B doesnt mean actual order
      var groupOffset = group.name == 'A' ? 0 : 1; 
      _.each(group.timeSlots, (timeSlot, timeOffset) => { // For every timeslot...
        // If not a break
        var altGroupOffset = !!groupOffset ? 0 : 1;
        if(!timeSlot.isBreak){           // If its not a BREAK
          // Generate every vendor slot with group members
          const currentGroup = groupPairs[groupOffset];
          _.each(vendors, (vendor, vendorOffset) => {
            const nullPair = [{"name":""},{"name":""}];
            const offset = vendorOffset + groupTimeOffset[groupOffset];
            const vendorMax = vendors.length;
            const pairOffset = offset % vendorMax;

            const pair = (
              (groupTimeOffset[groupOffset] < vendorMax ) &&
              (currentGroup.pairs[pairOffset])
            )? currentGroup.pairs[pairOffset]  : nullPair;
            /*const pair = currentGroup.pairs[pairOffset] || nullPair;
            if(
              pair[0].name == "Allied Kitchen & Bath" &&
              vendor.booth == 306
            ){
              console.log(vendorOffset, groupTimeOffset[groupOffset], pairOffset, offset, vendorMax);
            }*/

            output += `${timeSlot.timeCode},"${day.date}",${timeSlot.time},"${vendor.name}",${vendor.booth},${vendor.seq},${group.name},"${pair[0].name}","${pair[1].name}"\n`; // Write line
          });

          // Generate opposite groups empty meeting lines
          _.each(groupPairs[altGroupOffset].pairs, (pair, pairOffset) => {
            output += `${timeSlot.timeCode},"${day.date}",${timeSlot.time},,,,${group.name},"${pair[0].name}","${pair[1].name}"\n`; // Write line
          });
          groupTimeOffset[groupOffset] += 1;
        } else {  // Otherwise
          //Generate vendor break lines
          _.each(vendors, (vendor)=>{  // For every vendor
            output += `${timeSlot.timeCode},"${day.date}",${timeSlot.time},"${vendor.name}",${vendor.booth},,${group.name},BREAK,BREAK\n`; // Write break line
          });
          // Generate member break lines
          const currentGroup = groupPairs[groupOffset];
          _.each(currentGroup.pairs, (pair)=>{   // And every member
            output += `${timeSlot.timeCode},"${day.date}",${timeSlot.time},BREAK,BREAK,,${group.name},"${pair[0].name}","${pair[1].name}"\n`; //Write break line
          });
          // Generate opposite group BREAK lines
          _.each(groupPairs[altGroupOffset].pairs, (pair, pairOffset) => {
            output += `${timeSlot.timeCode},"${day.date}",${timeSlot.time},BREAK,BREAK,,${group.name},"${pair[0].name}","${pair[1].name}"\n`; // Write line
          });
        }
      })
    })
  });

  writeFile(`output/${year}/master-schedule.csv`, output);
}

function writeFile(path, data){
  fs.writeFile(path, data, 'utf8', function (err) {
    console.log('Some error occured - file either not saved or corrupted file saved:',err);
  });
}

function getVendorName(boothNumber){
  return _.find(vendors, {"booth": boothNumber}).name;
}

function getBoothByOffset(booths,offset) {
  return boothSeq[offset % booths.length];
}
