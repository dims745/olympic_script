var inf=require('./reads.js');
var nachalo=setInterval(()=>{if(inf.inte){clearInterval(nachalo);all_script();}},1000);
function all_script(){
function rasbor(n){
    switch(process.argv[n]){
        case 'Medal':p.type=1;break;
        case 'Medals':p.type=1;break;
        case 'medal':p.type=1;break;
        case 'medals':p.type=1;break;
        case 'Top-teams':p.type=2;break;
        case 'Top-team':p.type=2;break;
        case 'top-teams':p.type=2;break;
        case 'top-team':p.type=2;break;
        case 'Winter':p.season='Winter';break;
        case 'winter':p.season='Winter';break;
        case 'Summer':p.season='Summer';break;
        case 'summer':p.season='Summer';break;
        case 'Gold':p.medal='Gold';break;
        case 'gold':p.medal='Gold';break;
        case 'Silver':p.medal='Silver';break;
        case 'silver':p.medal='Silver';break;
        case 'Bronze':p.medal='Bronze';break;
        case 'bronze':p.medal='Bronze';break;
        default:p.noc_or_year=process.argv[n];console.log(process.argv[n]);
    }
};
var p={
type:-1,
season:-1,
noc_or_year:-1,
medal:-1
}
rasbor(2);rasbor(3);
if(process.argv[4] && process.argv[4]!=undefined)rasbor(4);
if(process.argv[5] && process.argv[5]!=undefined)rasbor(5);

const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./olympic_history.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the database');
    db.run('drop table tmp1',()=>{db.run('DELETE FROM sqlite_sequence WHERE name = "tmp1";',()=>{db.run('create table tmp1(name text,numb int);');});});
    
    
    let p_season;
    if(p.season=="Summer")p_season=0;if(p.season=="Winter")p_season=1;
    db.all('select distinct year year from games where `season`="'+p_season+'" order by year;',(err, rows) => {
        if (err) {
          throw err;
        }
        let n=0;
        rows.forEach((row) => {
            mas_y[n]=row.year;
            n++;
        });

        db.all('select distinct NOC noc from allinfo where `season`="'+p.season+'";',(err2, rows2) => {
            if (err2) {
              throw err2;
            }
            let n2=0;//console.log('TEST');
            rows2.forEach((row2) => {//console.log('team add '+n);
                mas_n[n2]=row2.noc;
                n2++;
            });
            f();
          });
      });
      //let query='select distinct NOC noc from allinfo where `season`="'+p_season+'";';console.log(query);
      
    
  });
var mas_y=[],mas_medal=[],flag1=0,flag2=1,flag3=0,mas_n=[],mas_team=[],max;
function medal_f(){
    console.log("Medal");console.log(p);
    db.all('select distinct NOC from allinfo where `NOC`="'+p.noc_or_year+'"',(err, rows)=>{
        if (err) {
          throw err;
        }
        rows.forEach((row) => {
                flag3++;
            });if(flag3){
    if(p.season!=-1){if(p.noc_or_year!=-1 && p.noc_or_year!=undefined){
      for(let n=0;n<mas_y.length-1;n++){  
        if(p.medal==-1){//console.log('NO MEDAL');
            db.all('select COUNT(id) count from allinfo where `NOC`="'+p.noc_or_year+'" and `medal` NOT like "NA" and `season`="'+p.season+'" and `year`='+mas_y[n]+' group by `NOC`;',(err, rows) => {
                if (err) {
                  throw err;
                }let tmp=0;
                rows.forEach((row) => {//console.log(row.count);
                   tmp=row.count;
                });
                medal_out(tmp,mas_y[n]); 
              });
                
        }
        else{//let str='select COUNT(id) count from allinfo where `NOC`="'+p.noc_or_year+'" and `medal`="'+p.medal+'" and `season`="'+p.season+'" and `year`='+mas_y[n]+' group by `NOC`;';
            //console.log(str);
            db.all('select COUNT(id) count from allinfo where `NOC`="'+p.noc_or_year+'" and `medal`="'+p.medal+'" and `season`="'+p.season+'" and `year`='+mas_y[n]+' group by `NOC`;',(err, rows) => {
                if (err) {
                  throw err;
                }let tmp=0;
                rows.forEach((row) => {//console.log(row.count);
                  tmp=row.count;
                });
                medal_out(tmp,mas_y[n]); 
              });
        }}medal_output();
    }
    else console.log('NOC is not enought');}else console.log('season is not enought');}else console.log('incorrect NOC');
    db.run('drop table tmp1');
    db.run('DELETE FROM sqlite_sequence WHERE name = "tmp1";');
    db.run('drop table allinfo');
    db.run('DELETE FROM sqlite_sequence WHERE name = "allinfo";');});
}

function medal_out(n,year){mas_medal[year]=n;flag1++;}
function medal_output(){
    if(flag1!=mas_y.length-1){
        inter=setInterval(()=>{
    if(flag1==mas_y.length-1){
        clearInterval(inter);medal_output();
    }
    //console.log('wait '+flag1+' of '+mas_y.length);
        },1000);
    }
else{
    for(let n=0;n<mas_y.length-1;n++){
        let rik=mas_y[n];if(max==undefined){let tt=mas_medal;max=tt[0];for(let t=1;t<tt.length-1;t++){if(tt[t]>max)max=tt[t];}}
        //console.log('year: '+rik+' count: '+mas_medal[rik]);
        make_gistogramm(rik,mas_medal[rik]);
    }
    db.run('drop table tmp1');
    db.run('DELETE FROM sqlite_sequence WHERE name = "tmp1";');
    db.run('drop table allinfo');
    db.run('DELETE FROM sqlite_sequence WHERE name = "allinfo";');
    }
}
function f(){
if(p.type=='1')medal_f();else{
    if(p.type=='2' || typeof(p.noc_or_year)=='number')team_f();else console.log('type is not enought');}
}
function team_f(){
    console.log("Top_teams");console.log(p);
    db.all('select year from games where `year`='+p.noc_or_year,(err, rows)=>{
        if (err) {setTimeout(()=>{
        db.run('drop table tmp1');
        db.run('DELETE FROM sqlite_sequence WHERE name = "tmp1";');
        db.run('drop table allinfo');
        db.run('DELETE FROM sqlite_sequence WHERE name = "allinfo";');},0);
            
            throw 'incorrect year';
        }
        rows.forEach((row) => {
                flag3++;
            });if(flag3){
    if(p.season!=-1){if(p.noc_or_year!=-1 && p.noc_or_year!=undefined){
      for(let n=0;n<mas_n.length-1;n++){  
        if(p.medal==-1){//console.log('NO MEDAL');
            db.all('select COUNT(id) count from allinfo where `year`='+p.noc_or_year+' and `medal` NOT like "NA" and `season`="'+p.season+'" and `NOC`="'+mas_n[n]+'" group by `NOC`;',(err, rows) => {
                if (err) {
                  throw err;
                }let tmp=0;
                rows.forEach((row) => {//console.log(row.count);
                   tmp=row.count;
                });
                team_out(tmp,mas_n[n]); 
              });
                
        }
        else{//let str='select COUNT(id) count from allinfo where `NOC`="'+p.noc_or_year+'" and `medal`="'+p.medal+'" and `season`="'+p.season+'" and `year`='+mas_y[n]+' group by `NOC`;';
            //console.log(str);
            db.all('select COUNT(id) count from allinfo where `year`='+p.noc_or_year+' and `medal`="'+p.medal+'" and `season`="'+p.season+'" and `NOC`="'+mas_n[n]+'" group by `NOC`;',(err, rows) => {
                if (err) {
                  throw err;
                }let tmp=0;
                rows.forEach((row) => {//console.log(row.count);
                  tmp=row.count;
                });
                team_out(tmp,mas_n[n]); 
              });
        }}team_output();
    }
    else {
        for(let n=0;n<mas_n.length-1;n++){  
            if(p.medal==-1){//console.log('NO MEDAL');
                db.all('select COUNT(id) count from allinfo where `medal` NOT like "NA" and `season`="'+p.season+'" and `NOC`="'+mas_n[n]+'" group by `NOC`;',(err, rows) => {
                    if (err) {
                      throw err;
                    }let tmp=0;
                    rows.forEach((row) => {//console.log(row.count);
                       tmp=row.count;
                    });
                    team_out(tmp,mas_n[n]); 
                  });
                    
            }
            else{//let str='select COUNT(id) count from allinfo where `NOC`="'+p.noc_or_year+'" and `medal`="'+p.medal+'" and `season`="'+p.season+'" and `year`='+mas_y[n]+' group by `NOC`;';
                //console.log(str);
                db.all('select COUNT(id) count from allinfo where `medal`="'+p.medal+'" and `season`="'+p.season+'" and `NOC`="'+mas_n[n]+'" group by `NOC`;',(err, rows) => {
                    if (err) {
                      throw err;
                    }let tmp=0;
                    rows.forEach((row) => {//console.log(row.count);
                      tmp=row.count;
                    });
                    team_out(tmp,mas_n[n]); 
                  });
            }}team_output();
    }
}else console.log('season is not enought');}else console.log('incorrect year');
    db.run('drop table tmp1');
    db.run('DELETE FROM sqlite_sequence WHERE name = "tmp1";');
    db.run('drop table allinfo');
    db.run('DELETE FROM sqlite_sequence WHERE name = "allinfo";');});
}

function team_out(n,year){mas_team[year]=n;//console.log('insert into tmp1(name,numb) values ('+year+','+n+');');
    db.run('insert into tmp1(name,numb) values ("'+year+'",'+n+');',(res,err)=>{
        //if(res)console.log(res);
        flag1++;});
}
function team_output(){
    if(flag1!=mas_n.length-1){
        inter=setInterval(()=>{
    if(flag1==mas_n.length-1){
        clearInterval(inter);team_output();
    }
    //console.log('wait '+flag1+' of '+mas_n.length);
        },1000);
    }
else{
    db.all('select name name,numb numb from tmp1 where numb>(select avg(numb) from tmp1) group by numb order by numb DESC;',(err, rows) => {
        if (err) {
          throw err;
        }
        rows.forEach((row) => {if(flag2){max=row.numb;flag2--;}
          make_gistogramm(row.name,row.numb);
        });
         
      });
      db.run('drop table tmp1');
      db.run('DELETE FROM sqlite_sequence WHERE name = "tmp1";');
      db.run('drop table allinfo');
      db.run('DELETE FROM sqlite_sequence WHERE name = "allinfo";');
    }
}
function make_gistogramm(nam,num){let vv,vv2='';
if(max>200){vv=num*(200/max);}else{vv=num;}
for(let z=1;z<vv;z++){vv2+='█';}
console.log(nam+' '+' '+vv2);console.log();
}
}