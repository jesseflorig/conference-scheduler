// Step 3 of 6: Generate member pairings and groups

const jsonfile = require('jsonfile');
const { difference, each, filter, find, flatten, map } = require('lodash');

const write = true
const dataPath = "/Users/jesse/Dropbox/Documents/BKBG/Rotations"
const year = "2019";
const regions = require(`./regions`);
const vendors = require(`${dataPath}/${year}/vendors`);
const members = require(`${dataPath}/${year}/members`);
const memberMods = require(`${dataPath}/${year}/member-mods`);

const groupsPath = `${dataPath}/${year}/groups.json`;

var assignedMembers = [];
var groups = [
  { name: "A", pairs: {} },
];

/* Assign mod members members */
each(memberMods, pair => {
  const member1 = getMemberByAttr("id", pair[0]);
  const member2 = getMemberByAttr("id", pair[1]);
  groups[0].pairs[groupPairIdx(0)] = [member1, member2];
});

console.log('Finished member mods.');

/* Assign everyone else */
while(assignedMembers.length < members.length){
  const groupIdx = groups.length > 1 ? getSmallestGroupIdx(groups) : 0;
  const firstMember = getMember();
  if(!firstMember){ break; }
  const secondMember = findPair(firstMember);
  groups[groupIdx].pairs[groupPairIdx(groupIdx)] = [firstMember,secondMember];
}

if(write){
  jsonfile.writeFile(groupsPath, groups, function (err) {
    err && console.error(`Error: ${err}`)
  })
  console.log('Done creating groups!')
} else {
  console.log(groups)
  console.log(`Created ${groups.length} groups`)
  const firstGroup = groups[0]
  console.log(`Group ${firstGroup.name} has ${Object.keys(firstGroup.pairs).length} pairs`)
}

function getMember(){
  const leftMembers = difference(members, assignedMembers);
  const newMember = leftMembers[0];
  assignedMembers.push(newMember);
  return newMember;
}

function getMemberByAttr(key, val){
  const nullMember = {name: ""}
  const newMember = val ? find(members, [key, val]) : nullMember;
  // console.log("DEBUG:",key, val, members.length, members[0], newMember)
  assignedMembers.push(newMember);
  // console.log(`Grouping: ${newMember.name} (${newMember.id})`);
  return newMember;
}

function findPair(member){
  const states = flatten(map(regions, region => {
    return region.states.includes(member.state) ? region.states : [];
  }));
  /* Member pair cannot be from the same region */
  const leftMembers = difference(members, assignedMembers);
  const validMembers = filter(leftMembers, (mbr) => {
    return !states.includes(mbr.state);
  });
  const newMember = validMembers[0];
  assignedMembers.push(newMember);
  return newMember || { id: null, name: "None", state: null };
}

function groupPairIdx(idx){
  return Object.keys(groups[idx].pairs).length;
}

function getSmallestGroupIdx(groups){
  const a = Object.keys(groups[0].pairs).length;
  const b = Object.keys(groups[1].pairs).length;
  return (a > b)+0;
}
