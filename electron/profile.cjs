const fs=require('node:fs');const path=require('node:path');
// Keep the historical profile so the product rename does not orphan saved projects.
module.exports=function configureProfile(app,override){const profile=override||path.join(app.getPath('appData'),'Eletric Studio');fs.mkdirSync(profile,{recursive:true});app.setPath('userData',profile);return profile;};
