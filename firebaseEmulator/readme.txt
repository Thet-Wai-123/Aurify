Setup
firebase login
firebase init <serviceName>

To run (make sure you are inside firebaseEmulator/functions folder)
In 2 seperate terminals, run these

npm run build:watch
firebase emulators:start


Testing (make sure to run the firebase emulator from above)

npm run test


URL 
http://127.0.0.1:5001/demo-no-project/us-central1/FUNCTION_NAME
(Note that it says demo-no-project, so this might change depending on your firebase init setup. If you skip to set firebase project, it'll default to this. Otherwise replace)
(Can also be found in terminal in firebase emulators:start)


Troubleshooting
-Make sure to translate your ts code into js and that will be in lib folder. Sometimes, it gets bugged out somehow, if so delete your lib folder and rebuild again. 
-Check the translated index.js inside lib/functions/index.js matches with package.json, "main": "lib/functions/index.js"
-Debugger doesn't work?
-a few properties about FMC token, you can only send to legit tokens generated, otherwise it'll say permission denied.
-The token must be legit, and created by firebase, if you just pass in a random token without the user existing, it'll be error.

Todo
-set up test cases for security rules, firebase functions