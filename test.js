const year = "2018"
const _ = require('lodash');
const vendors = require(`./data/${year}/vendors`);
const members = require(`./data/${year}members`);
const timeSlots = require(`./data/${year}/time-slots`);
const masterJson = require(`./output/${year}/master-schedule`);
const sortedSchedule = _.sortBy(masterJson, ['timecode'],['asc']);
const groups = require(`./data/${year}/groups`);
const opts = [
  // 'timecode',
  'time',
  'vendor',
  'booth',
  'boothseq',
  'member1',
  'member2'
];

// testMembers(members);
sortedMembers = _.sortBy(members, 'name');
testMember(sortedMembers[0].name, true);

// testVendors(vendors);
// sortedVendors = _.sortBy(vendors, 'name');
// testVendor(sortedVendors[0].name, true);
// countTimeSlots(timeSlots);
// countVendors(vendors);
// countMembers(members);
// countGroups(groups);

function countGroups(groups){
  var pCount = 0;
  _.each(groups, (group) => {
    _.each(group.pairs, (pair) => {
      pCount++;
    });
  });
  console.log(pCount);
}

function countVendors(vendors){
  console.log('Vendors:',vendors.length);
}

function countMembers(members){
  console.log('Members',members.length);
  console.log('Member Pairs',members.length/2);
}

function countTimeSlots(days){
  var slotCount = 0;
  _.each(days, (day) => {
    _.each(day.groups, (group) => {
      _.each(group.timeSlots, (slot) => {
        console.log(slot.time);
        slotCount++;
      });
    });
  });
  console.log('Found',slotCount,'slots.');
}

function testMembers(members){
  _.each(members, (member) => {
    testMember(member.name);
  });
}

function testMember(memberName, eachLineFlag = false){
  var lineCount = 0;

  _.each(sortedSchedule, (line) =>{
    var outLine = [];
    _.each(opts, (opt) => {
      outLine.push(line[opt] || '[empty]');
    });

    if(line.member1 == memberName || line.member2 == memberName){
      if(eachLineFlag){
        console.log(outLine.join('///'));
      }
      lineCount++;
    }
  });

  console.log(memberName,'-->', lineCount);
}

function testVendors(vendors){
  _.each(vendors, (vendor) => {
    testVendor(vendor.name);
  });
}

function testVendor(vendorName, eachLineFlag = false){
  var lineCount = 0;

  _.each(sortedSchedule, (line) =>{
    var outLine = [];
    _.each(opts, (opt) => {
      outLine.push(line[opt] || '[empty]');
    });

    if(line.vendor == vendorName){
      if(eachLineFlag){
        console.log(outLine.join('///'));
      }
      lineCount++;
    }
  });

  console.log(vendorName,'-->', lineCount);
}
