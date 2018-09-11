const _ = require('lodash');
const jsonfile = require('jsonfile');
const vendors = require('./data/vendors');
const members = require('./data/members');
const regions = require('./data/regions');

const groupsJson = 'data/groups.json';


var assignedMembers = [];
var groups = [
  { name: "A", pairs: {} },
  { name: "B", pairs: {} }
];
var pairIdx = [0,0];
var toggleGroup = false;

while(assignedMembers < members){
  const firstMember = getMember();
  if(!firstMember){ break; }
  const secondMember = findPair(firstMember);
  const pairKey = pairIdx[toggleGroup+0];
  groups[toggleGroup+0].pairs[pairKey] = [firstMember,secondMember];
  pairIdx[toggleGroup+0]++;
  toggleGroup = !toggleGroup;
}

jsonfile.writeFile(groupsJson, groups, function (err) {
  console.error(err)
})
console.log('Done creating groups!')

function getMember( ){
  const leftMembers = _.difference(members, assignedMembers);
  const newMember = leftMembers[0];
  assignedMembers.push(newMember);
  return newMember;
}

function findPair(member){
  const region = _.flatten(_.map(regions, (region) => {
    return region.includes(member.state)? region : [];
  }));
  /* Member pair cannon be from the same region */
  const leftMembers = _.difference(members, assignedMembers);
  const validMembers = _.filter(leftMembers, (mbr) => {
    return !region.includes(mbr.state);
  });
  const newMember = validMembers[0];
  assignedMembers.push(newMember);
  return newMember || { name: "None", state: null };
}
