call npm install
call npx tsc
set /p choice= "nazwa pliku timelog: " 
node dist/index.js %choice%

