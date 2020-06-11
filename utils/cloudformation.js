const debug = require("debug")('cloudformation-module');

module.exports = (AWS) => {

    const cloudformation = new AWS.CloudFormation({ apiVersion: '2010-05-15', region: 'us-east-1' });

    async function __invokeAsPromise(method, params) {
        return await new Promise((resolve, reject) => {
            cloudformation[method](params, (err, data) => {
                if (err) throw (err); // an error occurred
                else resolve(data); // successful response
            });
        })
    }


    // describeStackResources
    const describeStackResources = (StackName) => __invokeAsPromise('describeStackResources', { StackName })

    // describeStack
    const describeStacks = (StackName) => __invokeAsPromise('describeStacks', { StackName })

    // stackExists
    const stackExists = async(StackName) => {

        return await new Promise((resolve, reject) => {
            cloudformation['describeStacks']({ StackName }, (err, data) => {
                if (err) resolve(false); // an error occurred
                else resolve(true); // successful response
            });
        })
    }



    async function updateIndexStack({ StackName, Outputs }) {

        let TemplateBody = {
            "AWSTemplateFormatVersion": "2010-09-09",
            "Description": "This is read only stack with no resources associated to it, just a set of Outputs from related stacks",
            "Parameters": {
                "EnvType": {
                    "Description": "Environment type.",
                    "Default": "test",
                    "Type": "String",
                    "AllowedValues": ["prod", "dev", "test"]
                }
            },
            "Conditions": {
                "CreateResources": { "Fn::Equals": [{ "Ref": "EnvType" }, "prod"] }
            },
            "Resources": {
                "S3Bucket": {
                    "Type": "AWS::S3::Bucket",
                    "Condition": "CreateResources",
                    "DeletionPolicy": "Retain",
                    "Properties": {
                        "BucketName": "Avengers"
                    }
                }
            },
            "Outputs": {}
        }

        const _Outputs = [...Outputs, {
            Name: 'lastUpdatedAt',
            Value: (new Date()).getTime(),
            Description: "The last time this stack was modified"
        }]

        const outputsAsObject = _Outputs.forEach(e => {
            const { Name, Value, Description = '' } = e;
            TemplateBody.Outputs[Name] = {
                Value,
                Description,
                Export: {
                    "Name": {
                        "Fn::Sub": ["${StackName}-${Name}-${EnvType}",
                            {
                                StackName,
                                Name,
                                EnvType: { "Ref": "EnvType" }
                            }
                        ]
                    }
                }
            };
        });


        // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudFormation.html
        var params = {
            StackName,
            TemplateBody: JSON.stringify(TemplateBody, null, 3),
            UsePreviousTemplate: false
        };

        cloudformation.updateStack(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(data); // successful response
        });

    }

    async function createIndexStack({ StackName, Outputs }) {

        let TemplateBody = {
            "AWSTemplateFormatVersion": "2010-09-09",
            "Description": "This is read only stack with no resources associated to it, just a set of Outputs from related stacks",
            "Parameters": {
                "EnvType": {
                    "Description": "Environment type.",
                    "Default": "test",
                    "Type": "String",
                    "AllowedValues": ["prod", "dev", "test"]
                }
            },
            "Conditions": {
                "CreateResources": { "Fn::Equals": [{ "Ref": "EnvType" }, "prod"] }
            },
            "Resources": {
                "S3Bucket": {
                    "Type": "AWS::S3::Bucket",
                    "Condition": "CreateResources",
                    "DeletionPolicy": "Retain",
                    "Properties": {
                        "BucketName": "Avengers"
                    }
                }
            },
            "Outputs": {}
        }


        // For nested stacks
        // https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-stack.html

        const _Outputs = [...Outputs, {
            Name: 'lastUpdatedAt',
            Value: (new Date()).getTime(),
            Description: "The last time this stack was modified"
        }]

        const outputsAsObject = _Outputs.forEach(e => {
            const { Name, Value, Description = '' } = e;
            TemplateBody.Outputs[Name] = {
                Value,
                Description,
                Export: {
                    "Name": {
                        "Fn::Sub": ["${StackName}-${Name}-${EnvType}",
                            {
                                StackName,
                                Name,
                                EnvType: { "Ref": "EnvType" }
                            }
                        ]
                    }
                }
            };
        });



        // debug(TemplateBody);
        //return;

        var params = {
            StackName,
            /* required */
            // Capabilities: [
            //     CAPABILITY_IAM | CAPABILITY_NAMED_IAM | CAPABILITY_AUTO_EXPAND,
            //     /* more items */
            // ],
            // ClientRequestToken: 'STRING_VALUE',
            // DisableRollback: true || false,
            // EnableTerminationProtection: true || false,
            // NotificationARNs: [
            //     'STRING_VALUE',
            //     /* more items */
            // ],
            // OnFailure: DO_NOTHING | ROLLBACK | DELETE,
            // Parameters: [{
            //         ParameterKey: 'RootStackName',
            //         ParameterValue: StackName,
            //         // ResolvedValue: 'STRING_VALUE',
            //         // UsePreviousValue: true || false
            //     },
            //     //     /* more items */
            // ],
            // ResourceTypes: [
            //     'STRING_VALUE',
            //     /* more items */
            // ],
            // RoleARN: 'STRING_VALUE',
            // RollbackConfiguration: {
            //     MonitoringTimeInMinutes: 'NUMBER_VALUE',
            //     RollbackTriggers: [{
            //             Arn: 'STRING_VALUE',
            //             /* required */
            //             Type: 'STRING_VALUE' /* required */
            //         },
            //         /* more items */
            //     ]
            // },
            // StackPolicyBody: 'STRING_VALUE',
            // StackPolicyURL: 'STRING_VALUE',
            // Tags: [{
            //         Key: 'STRING_VALUE',
            //         /* required */
            //         Value: 'STRING_VALUE' /* required */
            //     },
            //     /* more items */
            // ],
            TemplateBody: JSON.stringify(TemplateBody, null, 3),
            // TemplateURL: 'STRING_VALUE',
            // TimeoutInMinutes: 'NUMBER_VALUE'
        };

        // {
        //     "Name": {
        //             "Value": {
        //                 "Ref": "LambdaFunction"
        //             }
        //         },
        //         "Arn": {
        //             "Value": {
        //                 "Fn::GetAtt": [
        //                     "LambdaFunction",
        //                     "Arn"
        //                 ]
        //             }
        //         },
        //         "Region": {
        //             "Value": {
        //                 "Ref": "AWS::Region"
        //             }
        //         },
        //         "LambdaExecutionRole": {
        //             "Value": {
        //                 "Ref": "LambdaExecutionRole"
        //             }
        //         }
        // }

        return await new Promise((resolve, reject) => {
            cloudformation.createStack(params, function(err, data) {
                // console.log(err, data)
                if (err) reject(err); // an error occurred
                else resolve(data); // successful response
            });
        })
    }

    return {
        stackExists,
        describeStacks,
        describeStackResources,
        createIndexStack,
        updateIndexStack
    };

}
