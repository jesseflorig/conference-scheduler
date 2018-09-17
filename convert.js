const year = "2018";
const csv = require('csvtojson');
const jsonfile = require('jsonfile');
const _ = require('lodash');
const memberMods = require(`./data/${year}/member-mods-${year}`);

const attendeePath = `data/${year}/attendees-${year}.csv`;
const vendorPath = `data/${year}/vendors-${year}.csv`;
const memberPath = `data/${year}/members-${year}.csv`;
const vendorJson = `data/${year}/vendors.json`;
const memberJson = `data/${year}/members.json`;

/* 2017 /
const boothSeq = [
  "109","107","105","103","101","100","102","104","108","110",
  "209","207","203","201","202","204","208","210",
  "309","307","303","301","302","304","308","310",
  "409","407","403","401","402","404","408","410",
  "509","507","503","501","500","502","506","508",
  "214","213","114"
];
*/

boothSeq = [
  "101","105","111","113","115","116","114","112","106","104","102",
  "201","203","205","211","213","215","216","214","212","206","204","202",
  "301","303","305","311","313","315","316","314","312","306","304","302",
  "401","403","405","411","413","415","414","412","406","404","402"
]

convertAttendees(attendeePath);
//convertVendor(vendorPath, boothSeq, vendorJson);
//convertMember(memberPath, memberJson);

function convertAttendees(attendeePath){
  var vendorCount = 0;
  var memberCount = 0;
  var vendorOut = [];
  var memberOut = [];

  csv()
    .fromFile(attendeePath)
    .on('json',(jsonObj)=>{
      //console.log(jsonObj);
      var isVendor = jsonObj['Member Type'] === 'Vendor';
      var srcKeys = isVendor ? ['Company', 'Booth#'] : ['Company', 'State'];
      var destKeys = isVendor ? ['name', 'booth'] : ['name', 'state'];
      var jsonStrip = _.pick(jsonObj, srcKeys);
      var jsonClean = {};

      _.each(srcKeys, (key, idx) => {
        jsonClean[destKeys[idx]] = jsonStrip[key]
      })

      if(isVendor){
        jsonClean['seq'] = _.findIndex(boothSeq, (item)=>{
          return item == jsonObj['Booth#'];
        });

        vendorOut.push(jsonClean);
      } else {
        memberOut.push(jsonClean);
      }

    }).on('done', () => {
      /* 2018 should be 117 members; 43 vendors */

      vendorOut = _.uniqBy(vendorOut, 'name');
      jsonfile.writeFile(vendorJson, vendorOut, function (err) {
        console.error(err)
      });
      console.log('Done converting',vendorOut.length,'vendors!')

      memberOut = _.uniqBy(memberOut, 'name');
      jsonfile.writeFile(memberJson, memberOut, function (err) {
        console.error(err)
      });
      console.log('Done converting',memberOut.length,'members!')

    });
}

function convertVendor(vendorPath, boothSeq, vendorJson){
  var vendorOut = [];

  csv()
  .fromFile(vendorPath)
  .on('json',(jsonObj)=>{
    var srcKeys = ['Booth','Company'];
    var destKeys = ['booth','name'];
    var jsonStrip = _.pick(jsonObj, srcKeys);
    var jsonClean = {};

    _.each(srcKeys, (key, idx)=>{
      jsonClean[destKeys[idx]] = jsonStrip[key];
    });

    jsonClean['seq'] = _.findIndex(boothSeq, (item)=>{
      return item == jsonObj['Booth'];
    });

    console.log(jsonClean['seq'],jsonObj['Booth']);

    vendorOut.push(jsonClean);
  })
  .on('done',(error)=>{
      vendorOut = _.uniqBy(vendorOut, 'name');

      jsonfile.writeFile(vendorJson, vendorOut, function (err) {
        console.error(err);
      })
      console.log('Done converting vendors!');
  })
}

function convertMember(memberPath, memberJson){
  var memberOut = []

  csv()
  .fromFile(memberPath)
  .on('json',(jsonObj)=>{
    var srcKeys = ['Company','State'];
    var destKeys = ['name','state'];
    var jsonStrip = _.pick(jsonObj,srcKeys)
    var jsonClean = {};

    _.each(srcKeys, (key, idx)=>{
      jsonClean[destKeys[idx]] = jsonStrip[key];
    });

    memberOut.push(jsonClean);
  })
  .on('done',(error)=>{
    /* Not sure why this was happening here
      _.each(memberMods, (mod) => {
          memberOut.push(mod);
      });*/

      memberOut = _.uniqBy(memberOut, 'name');

      jsonfile.writeFile(memberJson, memberOut, function (err) {
        console.error(err)
      });

      console.log('Done converting members!')
  })
}
