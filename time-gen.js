// Step 2 of 6: Generate time slots from a schedule

const year = "2019"
const fs = require("fs")
const { each } = require('lodash');
const moment = require('moment');
const jsonfile = require('jsonfile');

const dataPath = "/Users/jesse/Dropbox/Documents/BKBG/Rotations"
const schedulePath = `${dataPath}/${year}/schedule.json`
const timeSlotsPath = `${dataPath}/${year}/time-slots.json`
const rotationLength = 8 /* minutes */
const breakLimit = 80 /* minutes */

const scheduleData = fs.readFileSync(schedulePath,"utf-8")
const schedule = JSON.parse(scheduleData)

each(schedule, (day) => {
  var displayDate = moment(day.date).format('dddd, MMMM Do YYYY');
  console.log(`Schedule for ${displayDate}:`);
  console.log("Day groups", day.groups)
  each(day.groups, (group)=>{
    console.log(`Group ${group.name} from ${group.start} to ${group.end}`);
    group.timeSlots = [];
    var startTime = `${day.date} ${group.start}`;
    var endTime = `${day.date} ${group.end}`;
    var idx = 0;
    var lastBreak = moment(startTime);
    var breakCount = 0;

    while (startTime){
      var meetingSlot = moment(startTime)
                          .add(rotationLength * idx, 'minutes');
      var endSlot = moment(meetingSlot)
                          .add(rotationLength, 'minutes');
      if( moment(endSlot) > moment(endTime)){
        break;
      }
      else {
        /* check if time slot is break */
        var duration = moment
                          .duration(meetingSlot.diff(lastBreak))
                          .asMinutes();
        if(duration >= breakLimit) {
          console.log(`Adding BREAK at ${moment(meetingSlot).format("h:mm a")}`);
          group.timeSlots.push({
            timeCode: moment(meetingSlot).format('DDHHmm'),
            time: moment(meetingSlot).format('h:mm a'),
            isBreak: true
          })
          lastBreak = meetingSlot;
        } else {
          console.log(`Adding time slot: ${moment(meetingSlot).format('h:mm a')}`);
          group.timeSlots.push({
            timeCode: moment(meetingSlot).format('DDHHmm'),
            time: moment(meetingSlot).format('h:mm a'),
            isBreak: false
          })
        }
        idx++;
      }
    }
  });
});

jsonfile.writeFile(timeSlotsPath, schedule, function (err) {
  err && console.error(`Error: ${err}`)
})
console.log('Done creating time slots!')
