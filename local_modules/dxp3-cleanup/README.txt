****************************************
* DXP3 - Digital Experience Platform 3 *
*                                      *
* MODULE: dxp3-cleanup                 *
****************************************

The dxp3-cleanup module allows objects to register and get notified when
the application/process exits. It is to be used as a library as it does not
contain any executable class.
Make sure this local module is defined as a dependency in your package.json.
Typically the dependency is defined by a file reference using a relative path.
Obviously that relative path may be different for different modules.
Here is an example of such a dependency in a package.json:
"dependencies": {
  "dxp3-cleanup": "file:../../../local_modules/dxp3-cleanup"
}

****************************************
* CODE EXAMPLES                        *
****************************************

// Get a reference to our cleanup code.
const cleanup = require('dxp3-cleanup');
// Make sure to initialize our cleanup manager.
// One may opt to omit this call, because the first function that registers will
// automatically initialize the cleanup manager. 
cleanup.Manager.init();
// Next we are ready to register cleanup functions.
cleanup.Manager.addFinishListener(()) => {
  // listener code here...
  // This listener is executed when the exit code of the process exit event is 0.
  // It indicates a normal termination. The program has reached its end.
  console.log('The application has finished.');
  console.log('Maybe there is some cleanup to do before we completely exit.');
});
cleanup.Manager.addInterruptListener(() => {
  // listener code here...
  console.log('The application has been interrupted.');
  console.log('Lets do some cleanup before we completely exit.');
  // One could choose to kill the process when interrupted.
  process.exit(10);
});
cleanup.Manager.addKillListener((_exitCode) => {
  // kill code here...
  console.log('The application has been killed.');
  console.log('Lets attempt to do some cleanup before we completely exit.');
});