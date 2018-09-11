const csv = require('csvtojson');
const jsonfile = require('jsonfile');
const _ = require('lodash');
const memberMods = require('./data/member-mods-2017');

const vendorPath = 'data/vendors-2017.csv';
const memberPath = 'data/members-2017.csv';
const vendorJson = 'data/vendors.json';
const memberJson = 'data/members.json';

const boothSeq = [
  "109","107","105","103","101","100","102","104","108","110",
  "209","207","203","201","202","204","208","210","309","307",
  "303","301","302","304","308","310","409","407","403","401",
  "402","404","408","410","509","507","503","501","500","502",
  "506","508","214","213","114"
];

convertVendor(vendorPath, boothSeq, vendorJson);
convertMember(memberPath, memberJson);

function convertVendor(vendorPath, boothSeq, vendorJson){
  var vendorOut = [];

  csv()
  .fromFile(vendorPath)
  .on('json',(jsonObj)=>{
    var srcKeys = ['Booth','Name'];
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
    var srcKeys = ['Attendance to People::MemberVendorName','Attendance to People::State'];
    var destKeys = ['name','state'];
    var jsonStrip = _.pick(jsonObj,srcKeys)
    var jsonClean = {};

    _.each(srcKeys, (key, idx)=>{
      jsonClean[destKeys[idx]] = jsonStrip[key];
    });

    memberOut.push(jsonClean);
  })
  .on('done',(error)=>{
      _.each(memberMods, (mod) => {
          memberOut.push(mod);
      });

      memberOut = _.uniqBy(memberOut, 'name');

      jsonfile.writeFile(memberJson, memberOut, function (err) {
        console.error(err)
      });

      console.log('Done converting members!')
  })
}
