var db1=require('./reads.js');//setInterval(()=>{console.log(db1.inte);},1000);
var interval=setInterval(()=>{if(db1.inte){clearInterval(interval);fosn();}},1000);
function fosn(){console.log('NACHALO 2');
const fs = require("fs");
//var r = fs.createWriteStream("./hello.html");r.write('<html>');
const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./olympic_history.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    //try{db.run('drop table allinfo');}
    console.log('Connected to the database');
    //db.run('create table allinfo(id int,full_name text,sex int,year_of_birth text,params text,team_id text,NOC text,games text,year int,season text,city text,sport text,event text,medal text)');
    f();
  });
var mas=[],mas2=[],flag4=1,flag11=0,flag12=0,flag13=0,flag14=0;
var cacheEVENT=[],cacheSPORT=[],cacheGAME=[];
function f(){
    db.run('DELETE FROM sports;');
    db.run('DELETE FROM sqlite_sequence WHERE name = "sports";');
    db.run('DELETE FROM events;');
    db.run('DELETE FROM sqlite_sequence WHERE name = "events";');
    db.run('DELETE FROM teams;');
    db.run('DELETE FROM sqlite_sequence WHERE name = "teams";');
    db.run('DELETE FROM games;');
    db.run('DELETE FROM sqlite_sequence WHERE name = "games";');
    db.run('DELETE FROM athletes;');
    db.run('DELETE FROM sqlite_sequence WHERE name = "athletes";');
    db.run('DELETE FROM results;');
    db.run('DELETE FROM sqlite_sequence WHERE name = "results";');
    setTimeout(()=>{f2();},100);
}
function f2(){

db.all('select distinct sport sport from allinfo',(err, rows) => {
    if (err) {
      throw err;
    }
    let i=1;
    var insert='insert into sports(name) values';
    rows.forEach((row) => {cacheSPORT[i]=row.sport;i++;
      insert+='("'+row.sport+'"),';
    });flag12=1;
    //r.write(insert);
    insert=insert.slice(0,-1)+';';
    db.run(insert);
  });

db.all('select distinct event event from allinfo',(err, rows2) => {
    if (err) {
      throw err;
    }let i=1;
    insert='insert into events(name) values';
    rows2.forEach((row) => {if(row.event!=''){cacheEVENT[i]=row.event;i++;
      insert+='("'+row.event+'"),';}
    });flag13=1;
    //r.write(insert+'');
    insert=insert.slice(0,-1)+';';
    db.run(insert);
  });
db.all('select distinct NOC noc, team_id team from allinfo order by NOC',(err, rows3) => {
    if (err) {
      throw err;
    }
    var flag1=0,flag2=0,flag3=1;
    insert='insert into teams(name, noc_name) values';
    rows3.forEach((row) => {
        
        if(flag2!=row.noc){flag1++;mas[flag1]=row.team;mas2[flag1]=row.noc;//r.write(' team: '+mas[flag1]+' NOC: '+mas2[flag1]+'<br><br>');
        if(row.team.search(/\)/)!=-1){if(flag3){row.team=row.team.slice(0,row.team.search(/\(/));flag3--;}
        else{row.team=row.team.slice(row.team.search(/\(/)+1,-1);}}
        insert+='("'+row.team+'","'+row.noc+'"),';
        flag2=row.noc;
        }
    });console.log(flag1);flag11=1;
    //setTimeout(()=>{db.run('drop table `tmp`;');console.log('delete');},4000);
    //r.write(insert+'</html>');
    insert=insert.slice(0,-1)+';';
    db.run(insert);
  });
db.all('select distinct games game,year year,season season,city city from allinfo order by year,season',(err, rows4) => {
    if (err) {
      throw err;
    }let i=1;
    var year1=-1,season1='nunn';
    insert='insert into games(year,season,city) values';
    rows4.forEach((row) => {if(row.year!=1906){cacheGAME[i]=row.game;i++;
      if(year1==row.year && season1==row.season){
        insert=insert.slice(0,-3);insert+=', '+row.city+'"),';//console.log(row.year+'  '+row.season);
      }
      else {
        year1=row.year;season1=row.season;
        if(row.season=="Winter")row.season=1;else row.season=0;
        insert+='('+row.year+','+row.season+',"'+row.city+'"),';
      }}
    });flag14=1;
    //r.write(insert+'</html>');
    insert=insert.slice(0,-1)+';';
    db.run(insert);
  });
/*db.all('select distinct id id,name name from teams',(err, rows5) => {
    if (err) {console.log('ERR');
      throw err;
    }
    console.log('test');
    rows5.forEach((row) => {let n=row.id;
     mas[n]=row.name;r.write(mas[n]+'<br>'); console.log('111'+mas[n]);
    });
  });*/
function f4(){if(flag11 && flag12 && flag13 && flag14)setTimeout(()=>{f3();},0);else setTimeout(()=>{f4();},0);}
function f3(){db.all('select full_name name,MAX(sex) sex,MAX(year_of_birth) year_b,MAX(params) par,MAX(team_id) team,MAX(NOC) noc from allinfo group by id',(err, rows6) => {
    if (err) {
      throw err;
    }
    insert='insert into athletes(full_name,year_of_birth,sex,params,team_id) values';
    rows6.forEach((row) => {if(flag4==1){console.log('FIND');flag4--;}
      let tt;if(mas.indexOf(row.team)+1){tt=mas.indexOf(row.team);}else {tt=mas2.indexOf(row.noc);}
      insert+='("'+row.name+'",'+row.year_b+','+row.sex+',"'+row.par+'",'+tt+'),';
    });
    //r.write(mas.toString());
    insert=insert.slice(0,-1)+';';
    db.run(insert,(res,err)=>{console.log(res+'');});setTimeout(()=>{f5();},0);
  });};
  f4();
  function f5(){let last1,last2;
    //r.write("SPORT<br>"+cacheSPORT.join('<br>'));r.write('<br><br><hr><br>');
    //r.write("EVENT<br>"+cacheEVENT.join('<br>'));r.write('<br><br><hr><br>');
    //r.write("GAME<br>"+cacheGAME.join('<br>'));
    db.all('select distinct id id,games game,sport sport,medal medal,event event from allinfo where `year` NOT LIKE 1906',(err, rows2) => {
      if (err) {
        throw err;
      }
      insert='insert into results(athlete_id,game_id,sport_id,event_id,medal) values ';
      rows2.forEach((row) => {
        //let countf=0;
        if(row.medal=="Gold"){row.medal=1;}else{if(row.medal=="Silver"){row.medal=2;}else{if(row.medal=="Bronze"){row.medal=3;}else{row.medal=0;}}}
        let insert2='('+row.id+","+cacheGAME.indexOf(row.game)+","+cacheSPORT.indexOf(row.sport)+","+cacheEVENT.indexOf(row.event)+","+row.medal+"),";
        //if(cacheGAME.indexOf(row.game)==-1 && cacheEVENT.indexOf(row.event)==-1 && countf<20){r.write("<hr>"+insert2+"<hr>");countf++;}
        //last1=row.game;last2=row.event;
        insert+=insert2;
      });
      //r.write(insert+'');
      //r.write(last1+'<br><br>'+last2)
      insert=insert.slice(0,-1)+';';
      db.run(insert,(res,err)=>{if(res){console.log(res);}else console.log("FINISH");db.run('drop table allinfo');});
    });
  }
}}