const eventName = 'PrePush';

const fs = require("fs")


async function run(context, args) {

  const data = JSON.stringify(context, null, 3);
  fs.writeFileSync(`${eventName}-latest-event.json`, data)

  // insert your code to handle the amplify cli PostInit event
  context.print.info(`Event handler ${eventName} to be implemented.`);
}

module.exports = {
  run,
};
