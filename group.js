const year = "2018";
const _ = require('lodash');
const jsonfile = require('jsonfile');
const vendors = require(`./data/${year}/vendors`);
const members = require(`./data/${year}/members`);
const regions = require(`./data/${year}/regions`);
const memberMods = require(`./data/${year}/member-mods-${year}`);
const forceGroups = require(`./data/${year}/member-mods-${year}-2`);

const groupsJson = `data/${year}/groups.json`;

var assignedMembers = [];
var groups = [
  { name: "A", pairs: {} },
  { name: "B", pairs: {} }
];

/* Assign mod members members */
_.each(memberMods, pair => {
  const member = getMemberByName(pair[0]);
  const secondMember = getMemberByName(pair[1]);
  groups[0].pairs[groupPairIdx(0)] = [member, secondMember];
});

console.log('done mod 1');

forceGroup(forceGroups["A"], 0);
forceGroup(forceGroups["B"], 1);

function forceGroup(members, groupIdx) {
  _.each(members, name => {
    const member = getMemberByName(name);
    const secondMember = findPair(member);
    groups[groupIdx].pairs[groupPairIdx(groupIdx)] = [member,secondMember];
  });
}

console.log('done mod 2');

/* Assign everyone else */
//while(assignedMembers < members){
while(_.intersection(assignedMembers,members) != members){
  const groupIdx = getSmallestGroupIdx(groups);
  const firstMember = getMember();
  if(!firstMember){ break; }
  const secondMember = findPair(firstMember);
  groups[groupIdx].pairs[groupPairIdx(groupIdx)] = [firstMember,secondMember];
}

jsonfile.writeFile(groupsJson, groups, function (err) {
  console.error(err)
})
console.log('Done creating groups!')

function getMember(){
  const leftMembers = _.difference(members, assignedMembers);
  const newMember = leftMembers[0];
  assignedMembers.push(newMember);
  return newMember;
}

function getMemberByName(name){
  const newMember = _.find(members, {"name": name});
  assignedMembers.push(newMember);
  console.log('grouping',name);
  return newMember;
}

function findPair(member){
  const region = _.flatten(_.map(regions, (region) => {
    return region.includes(member.state)? region : [];
  }));
  /* Member pair cannot be from the same region */
  const leftMembers = _.difference(members, assignedMembers);
  const validMembers = _.filter(leftMembers, (mbr) => {
    return !region.includes(mbr.state);
  });
  const newMember = validMembers[0];
  assignedMembers.push(newMember);
  return newMember || { name: "None", state: null };
}

function groupPairIdx(idx){
  //console.log(idx,'pair count',Object.keys(groups[idx].pairs).length);
  return Object.keys(groups[idx].pairs).length;
}

function getSmallestGroupIdx(groups){
  const a = Object.keys(groups[0].pairs).length;
  const b = Object.keys(groups[1].pairs).length;
  //console.log('a',a,'b',b,'=',(a > b)+0);
  return (a > b)+0;
}
