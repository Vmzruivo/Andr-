import fs from 'node:fs';
const file='scripts/patch-settings.mjs';
let s=fs.readFileSync(file,'utf8');
const a=s.indexOf(' const css=`');
const b=s.indexOf('`;\n s=s.replace',a);
if(a>=0&&b>a){const block=s.slice(a,b).replaceAll('${','\\${');s=s.slice(0,a)+block+s.slice(b);}
fs.writeFileSync(file,s);
console.log('settings patch prepared');
