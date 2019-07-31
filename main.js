const onloadDB = require('./reads.js')

const startingInterval = setInterval(() => {
  if (onloadDB.endOfScript) {
    clearInterval(startingInterval)
    StartALL()
  }
}, 1000)

let insert

const flags = {
  array1: [],
  array2: [],
  flag4: 1,
  flag11: 0,
  flag12: 0,
  flag13: 0,
  flag14: 0
}

const cache = {
  event: [],
  sport: [],
  game: []

}

function StartALL () {
  console.log('Starting insert')
  const sqlite3 = require('sqlite3').verbose()
  const db = new sqlite3.Database('./olympic_history.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message)
    }
    console.log('Connected to the database')
    cleanTables()
  })

  function cleanTables () {
    db.run('DELETE FROM sports;', () => {
      db.run('DELETE FROM sqlite_sequence WHERE name = "sports";', () => {
        db.run('DELETE FROM events;', () => {
          db.run('DELETE FROM sqlite_sequence WHERE name = "events";', () => {
            db.run('DELETE FROM teams;', () => {
              db.run('DELETE FROM sqlite_sequence WHERE name = "teams";', () => {
                db.run('DELETE FROM games;', () => {
                  db.run('DELETE FROM sqlite_sequence WHERE name = "games";', () => {
                    db.run('DELETE FROM athletes;', () => {
                      db.run('DELETE FROM sqlite_sequence WHERE name = "athletes";', () => {
                        db.run('DELETE FROM results;', () => {
                          db.run('DELETE FROM sqlite_sequence WHERE name = "results";', () => {
                            insertingData()
                          })
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  }

  function insertingData () {
    db.all('select distinct sport sport from allinfo', (err, rows) => {
      if (err) {
        throw err
      }
      let i = 1
      insert = 'insert into sports(name) values'
      rows.forEach((row) => {
        cache.sport[i] = row.sport
        i++
        insert += '("' + row.sport + '"),'
      })

      insert = insert.slice(0, -1) + ';'
      db.run(insert, () => { flags.flag11 = 1 })
    })

    db.all('select distinct event event from allinfo', (err, rows2) => {
      if (err) {
        throw err
      }
      let i = 1
      insert = 'insert into events(name) values'
      rows2.forEach((row) => {
        if (row.event !== '') {
          cache.event[i] = row.event
          i++
          insert += '("' + row.event + '"),'
        }
      })
      insert = insert.slice(0, -1) + ';'
      db.run(insert, () => { flags.flag12 = 1 })
    })

    db.all('select distinct NOC noc, team_id team from allinfo order by NOC', (err, rows3) => {
      if (err) {
        throw err
      }
      let flag1 = 0; let flag2 = 0; let flag3 = 1
      insert = 'insert into teams(name, noc_name) values'
      rows3.forEach((row) => {
        if (flag2 !== row.noc) {
          flag1++
          flags.array1[flag1] = row.team
          flags.array2[flag1] = row.noc
          if (row.team.search(/\)/) !== -1) {
            if (flag3) {
              row.team = row.team.slice(0, row.team.search(/\(/))
              flag3--
            } else {
              row.team = row.team.slice(row.team.search(/\(/) + 1, -1)
            }
          }
          insert += '("' + row.team + '","' + row.noc + '"),'
          flag2 = row.noc
        }
      })
      insert = insert.slice(0, -1) + ';'
      db.run(insert, () => { flags.flag13 = 1 })
    })

    db.all('select distinct games game,year year,season season,city city from allinfo order by year,season', (err, rows4) => {
      if (err) {
        throw err
      }
      let i = 1
      let year1 = -1
      let season1 = 'nunn'
      insert = 'insert into games(year,season,city) values'
      rows4.forEach((row) => {
        if (row.year !== 1906) {
          cache.game[i] = row.game; i++
          if (year1 === row.year && season1 === row.season) {
            insert = insert.slice(0, -3)
            insert += ', ' + row.city + '"),'
          } else {
            year1 = row.year
            season1 = row.season
            if (row.season === 'Winter')row.season = 1
            else row.season = 0
            insert += '(' + row.year + ',' + row.season + ',"' + row.city + '"),'
          }
        }
      })
      insert = insert.slice(0, -1) + ';'
      db.run(insert, () => { flags.flag14 = 1 })
    })

    function checkAllInsertEnd () {
      if (flags.flag11 && flags.flag12 && flags.flag13 && flags.flag14) {
        setTimeout(() => {
          insertAthletes()
        }, 0)
      } else {
        setTimeout(() => {
          checkAllInsertEnd()
        }, 100)
      }
    }

    function insertAthletes () {
      db.all('select full_name name,MAX(sex) sex,MAX(year_of_birth) year_b,MAX(params) par,MAX(team_id) team,MAX(NOC) noc from allinfo group by id', (err, rows6) => {
        if (err) {
          throw err
        }
        insert = 'insert into athletes(full_name,year_of_birth,sex,params,team_id) values'
        rows6.forEach((row) => {
          if (flags.flag4 === 1) {
            flags.flag4--
          }
          let tt
          if (flags.array1.indexOf(row.team) + 1) {
            tt = flags.array1.indexOf(row.team)
          } else {
            tt = flags.array2.indexOf(row.noc)
          }
          insert += '("' + row.name + '",' + row.year_b + ',' + row.sex + ',"' + row.par + '",' + tt + '),'
        })
        insert = insert.slice(0, -1) + ';'
        db.run(insert, (res, err) => { console.log(res + '') }); setTimeout(() => { insertResultData() }, 0)
      })
    }

    checkAllInsertEnd()

    function insertResultData () {
      db.all('select distinct id id,games game,sport sport,medal medal,event event from allinfo where `year` NOT LIKE 1906', (err, rows2) => {
        if (err) {
          throw err
        }
        insert = 'insert into results(athlete_id,game_id,sport_id,event_id,medal) values '
        rows2.forEach((row) => {
          if (row.medal === 'Gold') {
            row.medal = 1
          } else {
            if (row.medal === 'Silver') {
              row.medal = 2
            } else {
              if (row.medal === 'Bronze') {
                row.medal = 3
              } else {
                row.medal = 0
              }
            }
          }
          const insert2 = '(' + row.id + ',' + cache.game.indexOf(row.game) + ',' + cache.sport.indexOf(row.sport) + ',' + cache.event.indexOf(row.event) + ',' + row.medal + '),'
          insert += insert2
        })
        insert = insert.slice(0, -1) + ';'
        db.run(insert, (res, err) => {
          if (res) {
            console.log('ERROR ' + res)
          } else console.log('FINISH')
          db.run('drop table allinfo')
        })
      })
    }
  }
}
