module.exports={
 appId:'com.eletricstudio.desktop',productName:'Eletric Studio',asar:true,npmRebuild:false,
 electronDist:['win32','linux'].includes(process.platform)&&process.arch==='x64'?'node_modules/electron/dist':undefined,
 directories:{output:'release',buildResources:'build/resources'},
 files:['dist/**/*','electron/**/*.cjs','src/floor/**/*.js','build/resources/icon.png','package.json'],
 artifactName:'Eletric-Studio-${version}-${os}-${arch}.${ext}',
 win:{icon:'build/resources/icon.ico',target:['nsis','portable'],signExecutable:false},
 nsis:{oneClick:false,perMachine:false,allowToChangeInstallationDirectory:true,artifactName:'Eletric-Studio-${version}-windows-${arch}-setup.${ext}'},
 portable:{artifactName:'Eletric-Studio-${version}-windows-${arch}-portable.${ext}'},
 linux:{maintainer:'Eletric Studio',icon:'build/resources/icon.png',target:['AppImage','deb'],category:'Utility',executableName:'eletric-studio',artifactName:'Eletric-Studio-${version}-linux-${arch}.${ext}'},
 mac:{icon:'build/resources/icon.icns',target:['dmg','zip'],identity:'-',hardenedRuntime:false,category:'public.app-category.productivity',artifactName:'Eletric-Studio-${version}-macos-${arch}.${ext}'}
};
