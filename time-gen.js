const year = "2018"
const _ = require('lodash');
const moment = require('moment');
const jsonfile = require('jsonfile');

const scheduleJson = `data/${year}/time-slots.json`;
const rotationLength = 9 /* minutes */
const breakLimit = 90 /* minutes */

/* 2017
const schedule = [
  {
    date: "October 4, 2017",
    groups: [
      { name: 'B', start: '9:15', end: '12:25' },
      { name: 'A', start: '13:30', end: '17:30' }
    ]
  },
  {
    date: "October 5, 2017",
    groups: [
      { name: 'A', start: '10:15', end: '12:45' },
      { name: 'B', start: '14:15', end: '17:30' }
    ]
  }
];
*/

const schedule = [
  {
    date: "September 27, 2018",
    groups: [
      { name: "B", start: "9:30", end: "13:00" },
      { name: "A", start: "14:00", end: "18:30" },
    ]
  },
  {
    date: "September 28, 2018",
    groups: [
      { name: "A", start: "9:40", end: "13:15" },
      { name: "B", start: "14:15", end: "18:25" },
    ]
  }
]

_.each(schedule, (day) => {
  var displayDate = moment(day.date).format('dddd, MMMM Do YYYY');
  //console.log(`Schedule for ${displayDate}:`);
  _.each(day.groups, (group)=>{
    //console.log(`Group ${group.name} from ${group.start} to ${group.end}`);
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
          //console.log(`Adding BREAK at ${moment(meetingSlot).format("h:mm a")}`);
          group.timeSlots.push({
            timeCode: moment(meetingSlot).format('DDHHmm'),
            time: moment(meetingSlot).format('h:mm a'),
            isBreak: true
          })
          lastBreak = meetingSlot;
        } else {
          //console.log(`Adding time slot: ${moment(meetingSlot).format('h:mm a')}`);
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

jsonfile.writeFile(scheduleJson, schedule, function (err) {
  console.error(err)
})
console.log('Done creating time slots!')
