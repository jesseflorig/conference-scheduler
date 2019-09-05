// Step 1 of 6: Convert attendees CSV to Vendor and Member JSON

const dataPath = "/Users/jesse/Dropbox/Documents/BKBG/Rotations"
const year = "2019";
const fs = require("fs")
const csv = require("csvtojson");
const jsonfile = require("jsonfile");
const _ = require("lodash");

// File paths
const boothPath = `${dataPath}/${year}/booths.json`;
const attendeePath = `${dataPath}/${year}/attendees.csv`;
const vendorOutPath = `${dataPath}/${year}/vendors.json`;
const memberOutPath = `${dataPath}/${year}/members.json`;

const boothData = fs.readFileSync(boothPath,"utf-8")
const boothSeq = JSON.parse(boothData)

convertAttendees(attendeePath);

function convertAttendees(attendeePath){
  const write = true
  let vendorCount = 0;
  let memberCount = 0;
  const vendors = [];
  const members = [];

  csv()
    .fromFile(attendeePath)
    .on("json",(jsonObj)=>{
      //console.log(jsonObj);
      const isVendor = jsonObj["Member Type"] === "Vendor";
      const srcTypeKeys = isVendor ? ["Company", "Booth#"] : ["Company", "State"];
      const srcDestKeys = isVendor ? ["name", "booth"] : ["name", "state"];
      const srcKeys = ["Company ID", ...srcTypeKeys]
      const destKeys = ["id" , ...srcDestKeys]

      const jsonStrip = _.pick(jsonObj, srcKeys);
      const jsonClean = {};

      _.each(srcKeys, (key, idx) => {
        jsonClean[destKeys[idx]] = jsonStrip[key]
      })

      if(isVendor){
        jsonClean["seq"] = _.findIndex(boothSeq, (item)=>{
          return item == jsonObj["Booth#"];
        });
        // console.log(`Vendor: ${JSON.stringify(jsonClean)}`)
        vendors.push(jsonClean);
      } else {
        members.push(jsonClean);
      }

    }).on("done", () => {
      /* 2018 should be 117 members; 43 vendors */
      /* 2019 should be  123 members; 40 vendors */
      const uniqKey = "id"
      const vendorOut = _.uniqBy(vendors, uniqKey);
      const memberOut = _.uniqBy(members, uniqKey);

      // Vendor count needs to be greater than or equal to 
      // largest group members divided by 2 (rounded up)
      // If needed pad vendors with empty booths
      // IMPORTANT: currently only works with a single group
      const vendorCount = vendorOut.length
      const memberCount = memberOut.length
      const padVendor = { "id": null, "name": "", "booth": ""}
      const padCount = Math.ceil(memberCount / 2) - vendorCount

      for (let i = 0; i < padCount; i++){
        vendorOut.push(padVendor)
      }

      if(write){
        // Write out vendors json
        jsonfile.writeFile(vendorOutPath, vendorOut, function (err) {
          err && console.error(`Error ${err}`)
        });
        console.log(`Done converting ${vendorCount} (+${padCount}) vendors!`)

        // Write out members json
        jsonfile.writeFile(memberOutPath, memberOut, function (err) {
          err && console.error(`Error ${err}`)
        });
        console.log(`Done converting ${memberCount} members!`)
      } else {
        console.log("Skipping write...")
        console.log(`Vendors: ${vendorCount} (+${padCount}), Members: ${memberCount}`)
      }
    });
}
