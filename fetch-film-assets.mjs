import fs from 'node:fs/promises';
const groups=[
 {title:'草原：一个民族的生存之战',en:'Grass: A Nation’s Battle for Life',year:1925,files:['Grass (1925) - Ernest Schoedsack & Merian Cooper.jpg','Grass (1925) - Ernest Schoedsack.jpg','Grass (1925) - Marguerite Harrison.jpg']},
 {title:'北方的纳努克',en:'Nanook of the North',year:1922,files:['Nanook of the North (1922) - 1.jpg','Nanook of the North (1922) - 2.jpg','Nanook of the North (1922) - 6.jpg','Nanook of the North (1922) - 7.jpg','Nanook of the North (1922) - Hunt.jpg']},
 {title:'持摄影机的人',en:'Man with a Movie Camera',year:1929,files:['Man with a movie camera 1929 1.png','Man with a movie camera 1929 2.png','Man with a movie camera 1929 3.png','Man with a Movie Camera by Dziga Vertov.jpg','SS Lenin Man with a Movie Camera.png']},
 {title:'莫阿纳',en:'Moana',year:1926,files:['Moana (1926) - 1.jpg','Moana (1926) - 2.jpg','Moana (1926) - 3.jpg','Moana making cloth.jpg','Moana peli.jpg']},
 {title:'猎头者的国度',en:'In the Land of the Head Hunters',year:1914,files:['Masked-Dancers-in-Canoes.jpg','Incident-Winter-Dance.jpg','Indian-Wedding-Party.jpg']},
 {title:'大象：荒野的戏剧',en:'Chang: A Drama of the Wilderness',year:1927,files:['Chang A Drama of the Wilderness (1927) - 1.jpg']},
 {title:'巴厘岛的恍惚与舞蹈',en:'Trance and Dance in Bali',year:1952,files:['Trance and dance in Bali Bateson Mead still 1.jpg','Trance and dance in Bali Bateson Mead still 3.jpg','Trance and dance in Bali Bateson Mead still 5.jpg']},
 {title:'斯凡涅季的盐',en:'Salt for Svanetia',year:1930,files:['Salt for svanetia.jpg']}
];
await fs.mkdir('assets/films',{recursive:true});
// Append without changing existing asset paths; repeated runs skip saved files.
const assets=process.argv.includes('--append')?JSON.parse(await fs.readFile('films.json','utf8')):[];
for(const group of groups){
 const pending=group.files.filter(file=>!assets.some(asset=>asset.file==='File:'+file));
 if(!pending.length)continue;
 const url=new URL('https://commons.wikimedia.org/w/api.php');
 url.search=new URLSearchParams({action:'query',format:'json',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'480',titles:pending.map(x=>'File:'+x).join('|')});
 const response=await fetch(url,{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'StillPortfolio/1.0 (film archive attribution)'}});
 if(!response.ok)throw Error('Wikimedia response '+response.status);
 const data=await response.json();
 for(const page of Object.values(data.query.pages)){
  const info=page.imageinfo?.[0];if(!info)continue;
  const src=info.thumburl||info.url; const r=await fetch(src,{signal:AbortSignal.timeout(30000)});if(!r.ok){console.log('Skipped '+page.title+' '+r.status);continue;}
  const filename=`frame-${String(assets.length+1).padStart(2,'0')}.${new URL(src).pathname.endsWith('.png')?'png':'jpg'}`;
  await fs.writeFile('assets/films/'+filename,Buffer.from(await r.arrayBuffer()));
  assets.push({title:group.title,en:group.en,year:group.year,src:'assets/films/'+filename,source:info.descriptionurl,file:page.title,license:info.extmetadata?.LicenseShortName?.value||'See source',artist:info.extmetadata?.Artist?.value||'',credit:info.extmetadata?.Credit?.value||''});
 }
}
await fs.writeFile('films.json',JSON.stringify(assets,null,2)+'\n');
console.log('Saved '+assets.length+' film stills with source metadata.');
