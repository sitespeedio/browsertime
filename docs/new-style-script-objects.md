# New-style script objects:

A new-style object allows the user to write a script that executes in an environment that meets certain requirements. The script writer specifies the requirements for their script and the browser will meet those requirements before executing the script's functionality. If the requirements cannot be met, then the script's functionality will not be executed.

A new-style script object is defined in a script file by a single object that is assigned to `module.exports`. A new-style script object has the following keys:

  * *requires*: An object whose keys define the requirements for executing this script object's functionality.
  * *function*: A possibly asynchronous function that actually performs the script object's actions. The function will be invoked with no parameters. If the function is asynchronous, it must return a `Promise`. The value `resolve`d by that promise is serialized into browsertime's result output. If the function is not asynchronous, any value returned by this function is written into browsertime's result output.

At the moment, browsertime only supports one requirement in new-style script objects, the `privilege` requirement. If the `privilege` requirement is set to `true`, the new-style script object's functionality will execute with access to the browser's privileged APIs (which is currently only available in Firefox). If the browser cannot guarantee that the script can execute with access to the browser's privileged API (for whatever reason), it will not be executed.

For example,

    module.exports = {
        requires: { privilege: true },
        function: function() {
            const { AppConstants } = ChromeUtils.import(
                'resource://gre/modules/AppConstants.jsm'
            );
            return AppConstants;
        }
    };

defines a new-style script object that requires access to the browser's privileged API in order to fetch its constants.

The equivalent functionality can be accomplished asynchronously:

    module.exports = {
        requires: { privilege: true },
        function: async function() {
                return new Promise(resolve => {
                        const { AppConstants } = ChromeUtils.import(
                                'resource://gre/modules/AppConstants.jsm'
                        );
                        resolve(AppConstants);
                });
        }
    };
