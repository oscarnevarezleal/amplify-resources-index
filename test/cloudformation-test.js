const AWS = require("aws-sdk");
const debug = require("debug")('cloudformation-test');
const cloudFormation = require("../utils/cloudformation")(AWS);

const ResourceTypeStack = 'AWS::CloudFormation::Stack';

const STACK_NAME = 'amplify-amplifyplugin-dev-144443';


const normalizeOutputs = (input, carrier = [], level = 0) => {
    const header = `[level ${level}] [${(new Date()).getTime()}] `;
    let result = carrier || [];

    if (Array.isArray(input)) {

        // debug(header + " is an array -> " + JSON.stringify(input) + "\n")

        const eachResult = input.map(item => normalizeOutputs(item, result, level + 1))
        // const normalized = normalizeOutputs(input, level + 1);
        // result = { ...normalized, ...result };
    }
    else {
        // debug(header + " is an object -> " + JSON.stringify(input) + "\n")
        const { OutputKey: Name, OutputValue: Value, Description } = input;
        result.push({ Name, Value, Description });
    }

    // debug(header + " current bucket -> " + result.length + "\n")

    return result;
}

(async function() {
    const { Stacks } = await cloudFormation.describeStacks(STACK_NAME);
    const { StackResources } = await cloudFormation.describeStackResources(STACK_NAME);
    const ChildStacks = StackResources.filter(stack => stack.ResourceType == ResourceTypeStack)

    const StackIndexName = `${STACK_NAME}-index`;
    const stackOutputsExists = await cloudFormation.stackExists(StackIndexName);

    // debug(JSON.stringify(ChildStacks, null, 3))

    let childStacksArr = ChildStacks.map(async function(childStack) {
        return new Promise(async(resolve, reject) => {
            const { Stacks } = await cloudFormation.describeStacks(childStack.PhysicalResourceId)
            resolve(Stacks)
        })
    })

    // @todo, use listExports https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudFormation.html#listExports-property

    const Outputs = await Promise.all(childStacksArr)

    //debug(JSON.stringify(Outputs, null, 3))

    const childStacksOutputs = Outputs.map(e => e[0].Outputs);

    // debug(JSON.stringify(childStacksOutputs, null, 3))

    const outputsObject = normalizeOutputs(childStacksOutputs);

    if (!stackOutputsExists) {
        debug("Stack index does not exists. It will be created");
        const createIndexStack = await cloudFormation.createIndexStack({ StackName: StackIndexName, Outputs: outputsObject });
        debug(JSON.stringify(createIndexStack, null, 1))
    }
    else {
        debug("Stack index does exists. It will be updated");
        const updateIndexStack = await cloudFormation.updateIndexStack({ StackName: StackIndexName, Outputs: outputsObject });
        debug(JSON.stringify(updateIndexStack, null, 1))
    }

})();
