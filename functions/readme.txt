To run (make sure you are inside functions folder)
In 2 seperate terminals, run these

npm run build:watch
firebase emulators:start

URL 
http://localhost:5001/aurify-test/us-central1/FUNCTION_NAME

Troubleshooting
Make sure to build your ts code into js and that will be in lib folder. Sometimes, it gets bugged out somehow, if so delete your lib folder and rebuild again. 
