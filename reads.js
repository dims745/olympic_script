const fs = require('fs')
const sqlite3 = require('sqlite3').verbose()
const flags = {
  i: 0,
  ii: 0,
  symbols: '',
  n: 0,
  countOperationByTime: 2000
}
const db = new sqlite3.Database('./olympic_history.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message)
  }
  db.run('drop table allinfo', () => {
    db.run('DELETE FROM sqlite_sequence WHERE name = "allinfo";', () => {
      db.run('create table allinfo(id int,full_name text,sex int,year_of_birth text,params text,team_id text,NOC text,games text,year int,season text,city text,sport text,event text,medal text)', () => {
        f()
      })
    })
  })
  console.log('Connected to the database')
})
function f () {
  let mas = []
  const chunk = fs.readFileSync('./athlete_events.csv', 'utf8')
  function splitRow (rowString) {
    const mas3 = []
    let st = []; let st1 = []; let st2 = []; let st3 = []
    st = rowString.split('","'); st1 = st[2].split(','); st2 = st[4].split(','); st3 = st[7].split(',')
    mas3[0] = st[0] + '"'; mas3[1] = '"' + st[1] + '"'; mas3[2] = '"' + st1[0]
    mas3[3] = st1[1]; mas3[4] = st1[2]; mas3[5] = st1[3]; mas3[6] = st1[4] + '"'
    mas3[7] = '"' + st[3] + '"'; mas3[8] = '"' + st2[0]; mas3[9] = st2[1]
    mas3[10] = st2[2] + '"'; mas3[11] = st[5]; mas3[12] = st[6]
    if (st.length < 9) {
      mas3[14] = st3[st3.length - 1]
      mas3[13] = ''
      for (let z = 0; z < st3.length - 1; z++) {
        mas3[13] += st3[z]
      }
      mas3[13] = mas3[13].slice(0, -1)
    } else {
      mas3[14] = st[st.length - 1].slice(0, -1)
      mas3[13] = st[7]
    }
    return mas3
  }
  flags.i = 1
  flags.symbols = chunk[109] + chunk[110]
  mas = chunk.split(flags.symbols); console.log('START ' + mas.length)
  let insert = ''
  function processingRow () {
    if (flags.ii === 0)insert = 'insert into allinfo(`id`,`full_name`,`sex`,`year_of_birth`,`params`,`team_id`,NOC,games,year,season,city,sport,event,medal) values '
    insert += '('
    let mas2 = []
    if (mas[flags.i].length > 6)mas2 = splitRow(mas[flags.i])
    for (flags.n = 0; flags.n < mas2.length; flags.n++) {
      if (mas2[flags.n][0] === '"') mas2[flags.n] = mas2[flags.n].slice(1, -1)
      if (flags.n === 0)insert += mas2[flags.n]
      if (flags.n === 1) {
        mas2[flags.n] = mas2[flags.n].replace(/\(.*\)/, '')
        mas2[flags.n] = mas2[flags.n].replace(/".*"/, '')
        mas2[flags.n] = '"' + mas2[flags.n] + '"'; insert += ',' + mas2[flags.n]
      }
      if (flags.n === 2) {
        if (mas2[flags.n] === 'M') {
          mas2[flags.n] = 1
        } else {
          if (mas2[flags.n] === 'F')mas2[flags.n] = 2
          else mas2[flags.n] = 0
        }
        insert += ',' + mas2[flags.n]
      }
      if (flags.n === 3) {
        if (mas2[flags.n] === 'NA')mas2[flags.n] = 0
        else {
          mas2[flags.n] = mas2[9] - mas2[flags.n]
        }
        insert += ',' + mas2[flags.n]
      }
      if (flags.n === 4) {
        if (mas2[flags.n] === 'NA' && mas2[flags.n + 1] === 'NA')insert += ',"{}"'
        if (mas2[flags.n] !== 'NA' && mas2[flags.n + 1] === 'NA')insert += ',"{ height: ' + mas2[flags.n] + ' }"'
        if (mas2[flags.n] === 'NA' && mas2[flags.n + 1] !== 'NA')insert += ',"{ weight: ' + mas2[flags.n + 1] + ' }"'
        if (mas2[flags.n] !== 'NA' && mas2[flags.n + 1] !== 'NA')insert += ',"{ height: ' + mas2[flags.n] + ' , weight: ' + mas2[flags.n + 1] + ' }"'
      }
      if (flags.n === 6) {
        if (mas2[flags.n] === 'NA')mas2[flags.n] = ''
        insert += ',"' + mas2[flags.n] + '"'
      }
      if (flags.n === 14) insert += ',"' + mas2[7] + '","' + mas2[8] + '",' + mas2[9] + ',"' + mas2[10] + '","' + mas2[11] + '","' + mas2[12] + '","' + mas2[13] + '","' + mas2[14] + '"'
    }
    flags.i++
    flags.ii++
    insert += '),'
    if (typeof (insert) !== 'undefined') {
      if (flags.ii === flags.countOperationByTime || flags.i >= mas.length - 1) {
        insert = insert.slice(0, -1)
        insert += ';'
        insertData()
      } else {
        processingRow()
      }
    }
  }

  function insertData () {
    db.run(insert, (result, error) => {
      if (flags.i < mas.length - 1) {
        flags.ii = 0
        if (result) {
          processingRow()
          console.log('error')
        } else { processingRow() }
        if (error)console.log('error')
      } else module.exports.endOfScript = 1
    })
  }
  processingRow()
}
