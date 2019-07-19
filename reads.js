const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();
//var r = fs.createWriteStream("./hello.html");r.write('<html>');
var db = new sqlite3.Database('./olympic_history.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    db.run('drop table allinfo',()=>{
      db.run('create table allinfo(id int,full_name text,sex int,year_of_birth text,params text,team_id text,NOC text,games text,year int,season text,city text,sport text,event text,medal text)',()=>{flag2=1;});});
    console.log('Connected to the database');
    //db.run('DELETE FROM allinfo;');
    db.run('DELETE FROM sqlite_sequence WHERE name = "allinfo";');
    //db.run('create table allinfo(id int,full_name text,sex int,year_of_birth text,params text,team_id text,NOC text,games text,year int,season text,city text,sport text,event text,medal text)');
    interval=setInterval(()=>{if(flag2){f();clearInterval(interval);}},1000);
  });
var i,ii=0,symbols='',n=0,interval;
var flag1=1,flag2=0;
function f(){
let mas=[];var chunk=fs.readFileSync("./athlete_events.csv", "utf8");chunk=''+chunk;
  function frazb(stri){let mas3=[];let st=[];let st1=[],st2=[],st3=[];
    st=stri.split('","');st1=st[2].split(',');st2=st[4].split(',');st3=st[7].split(',');
    mas3[0]=st[0]+'"';mas3[1]='"'+st[1]+'"';mas3[2]='"'+st1[0];mas3[3]=st1[1];mas3[4]=st1[2];mas3[5]=st1[3];mas3[6]=st1[4]+'"';
    mas3[7]='"'+st[3]+'"';mas3[8]='"'+st2[0];mas3[9]=st2[1];mas3[10]=st2[2]+'"';mas3[11]=st[5];mas3[12]=st[6];
    if(st.length<9){mas3[14]=st3[st3.length-1];mas3[13]='';for(let z=0;z<st3.length-1;z++){mas3[13]+=st3[z];}mas3[13]=mas3[13].slice(0,-1);}
    else {mas3[14]=st[st.length-1].slice(0,-1);mas3[13]=st[7];}
    //if(mas3[13]=='')mas3[13]==mas3[14];mas3[14]=st3[st3.lenght-1];//
    //if(st.length>9)console.log('dlina '+st.length);
    //r.write(mas3.join(';')+'<br><br>'+mas3[14]+'<br><br>');
   // if(mas3[14]=="NA" || mas3[14]=="Gold" || mas3[14]=="Silver" || mas3[14]=="Bronze")
   return mas3;
  }
  i=1;symbols=chunk[109]+chunk[110];
  //chunk=chunk.replace(/\`/g,'');
  mas=chunk.split(symbols);console.log('START '+mas.length);
  var insert=''
  function f2(flag3){if(ii==0)insert='insert into allinfo(`id`,`full_name`,`sex`,`year_of_birth`,`params`,`team_id`,NOC,games,year,season,city,sport,event,medal) values ';insert+='(';
    let mas2=[];
    //mas2=mas[i].split(',');
    //if(mas2.length!=15 && mas2.length>6){
      //if(typeof(mas2[9])!='number'){;}
      if(mas[i].length>6)mas2=frazb(mas[i]);
    //}
    for(n=0;n<mas2.length;n++){//console.log(mas2.length);
        //if(mas2[n].search(/.*\`.*/))console.log(mas2[n]);
        if(mas2[n][0]=='"'){mas2[n]=mas2[n].slice(1,-1);}
        if(n==0)insert+=mas2[n];
        if(n==1){mas2[n]=mas2[n].replace(/\(.*\)/,'');mas2[n]=mas2[n].replace(/\".*\"/,'');mas2[n]='"'+mas2[n]+'"';insert+=','+mas2[n];}
        if(n==2){if(mas2[n]=='M'){mas2[n]=1;}else{if(mas2[n]=='F')mas2[n]=2;else mas2[n]=0;}insert+=','+mas2[n];}
        if(n==3){if(mas2[n]=='NA')mas2[n]=0;else{mas2[n]=mas2[9]-mas2[n];}insert+=','+mas2[n];}
        if(n==4){
          if(mas2[n]=='NA' && mas2[n+1]=='NA')insert+=',"{}"';
          if(mas2[n]!='NA' && mas2[n+1]=='NA')insert+=',"{ height: '+mas2[n]+' }"';
          if(mas2[n]=='NA' && mas2[n+1]!='NA')insert+=',"{ weight: '+mas2[n+1]+' }"';
          if(mas2[n]!='NA' && mas2[n+1]!='NA')insert+=',"{ height: '+mas2[n]+' , weight: '+mas2[n+1]+' }"';
        }
        if(n==6){if(mas2[n]=='NA')mas2[n]='';insert+=',"'+mas2[n]+'"';}
        if(n==14){insert+=',"'+mas2[7]+'","'+mas2[8]+'",'+mas2[9]+',"'+mas2[10]+'","'+mas2[11]+'","'+mas2[12]+'","'+mas2[13]+'","'+mas2[14]+'"';}
        if(flag3)r.write('<hr>'+mas2[3]+'<br>'+mas2[9]+'<hr>');
        //r.write(mas2[n]+'<br>');
    }
    if(mas2.length==18)r.write(mas[i]+'----------------------<br><br>');
    i++;ii++;
    insert+='),';     
    //r.write('<br>');
    //if(i==mas.length)r.end('</html>');
    if(typeof(insert)!="undefined")
    {if(ii==2000 || i>=mas.length-1){insert=insert.slice(0,-1);insert+=';';f3();}else {f2();}}
    
  }
  
  function f3(){//console.log(i);
    db.run(insert,(res,erre)=>{if(i<mas.length-1){ii=0;//else{console.log(insert);}
    if(res){r.write(mas[i-1]+'<br><br>'+insert+'<br><br>');f2(1);console.log(''+res+' '+insert);//r.write(insert+'<br><br>'+res+'<br><br>');
  }
    else {f2();}
    if(erre)console.log(''+insert);}else module.exports.inte=1;});}
  f2();
  //console.log('add '+i);
  //insert=insert.slice(0,-1);
  //ii=mas[mas.length-1];
  //if(flag1==1){try{db.run(insert);r.write(''+insert);}catch(err){r.write(''+insert);console.log(err);}flag1=0;r.write('<br><br><br>');}
  }
  