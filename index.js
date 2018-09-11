const _ = require('lodash');
const fs = require('file-system');
const jsonfile = require('jsonfile');
const vendors = require('./data/vendors');
const regions = require('./data/regions');
const groupPairs = require('./data/groups');
const schedule = require('./data/time-slots');

const masterSched = "data/master-schedule.json";
// const boothSeq = [
//   "109","107","105","103","101","100","102","104","108","110",
//   "209","207","203","201","202","204","208","210","309","307",
//   "303","301","302","304","308","310","409","407","403","401",
//   "402","404","408","410","509","507","503","501","500","502",
//   "506","508","214","213","114"
// ];

// const sortedVendors = getVendorSeq(vendors, boothSeq);
const sortedVendors = _.sortBy(vendors, 'seq');
genMasterSched(sortedVendors);

// function getVendorSeq(vendors, sequence){
//   var result = [];
//   _.each(sequence, (boothNum)=> {
//     const currentVendor = _.find(vendors, {'booth': boothNum});
//     result.push(currentVendor);
//   });
//   return result;
// }

function genMasterSched(vendors){
  var output = '';
  var printCount = 0;
  output += "TIMECODE,DAY,TIME,VENDOR,BOOTH,BOOTHSEQ,GROUP,MEMBER1,MEMBER2\n";
  var groupTimeOffset = [0,0];
  _.each(schedule, (day, dayOffset)=> {                                           // For every day...
    _.each(day.groups, (group) => {                                                 // For every group (A/B)...
      var groupOffset = group.name == 'B' ? 0 : 1;  // Override logical offset since A/B doesnt mean actual order
      _.each(group.timeSlots, (timeSlot, timeOffset) => {                         // For every timeslot...
        // If not a break
        var altGroupOffset = !!groupOffset ? 0 : 1;
        if(!timeSlot.isBreak){                                                    // If its not a BREAK
          // Generate every vendor slot with group members
          const currentGroup = groupPairs[groupOffset];
          _.each(vendors, (vendor, vendorOffset) => {
            const nullPair = [{"name":""},{"name":""}];
            const offset = vendorOffset + groupTimeOffset[groupOffset];
            const vendorMax = vendors.length;
            const pairOffset = (offset) % vendorMax;
            const pair = currentGroup.pairs[pairOffset] || nullPair;

            // if(printCount < 700){
              console.log(
                'timeCode', timeSlot.timeCode,
                'group', group.name,
                'dayOffset', dayOffset,
                'vendorOffset',vendorOffset,
                'groupTimeOffset', groupTimeOffset[groupOffset],
                'offset', offset,
                'timeOffset', timeOffset,
                // 'vendorBooth', vendor.booth,
                'vendorSeq', vendor.seq,
                'pairOffset', pairOffset
              );
              printCount++;
            // }

            output += `${timeSlot.timeCode},"${day.date}",${timeSlot.time},"${vendor.name}",${vendor.booth},${vendor.seq},${group.name},"${pair[0].name}","${pair[1].name}"\n`; // Write line
          });
          // Generate opposite groups empty meeting lines
          _.each(groupPairs[altGroupOffset].pairs, (pair, pairOffset) => {
            output += `${timeSlot.timeCode},"${day.date}",${timeSlot.time},,,,${group.name},"${pair[0].name}","${pair[1].name}"\n`; // Write line
          });
          groupTimeOffset[groupOffset] += 1;
        } else {                                                                  // Otherwise
          //Generate vendor break lines
          _.each(vendors, (vendor)=>{                                             // For every vendor
            output += `${timeSlot.timeCode},"${day.date}",${timeSlot.time},"${vendor.name}",${vendor.booth},,${group.name},BREAK,BREAK\n`; // Write break line
          });
          // Generate member break lines
          const currentGroup = groupPairs[groupOffset];
          _.each(currentGroup.pairs, (pair)=>{                                    // And every member
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

  writeFile('output/master-schedule.csv', output);
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
