/* eslint-disable no-undef */
const flags = {
  masY: [],
  masMedal: [],
  flag1: 0,
  flag2: 1,
  flag3: 0,
  flag4: 0,
  masN: [],
  masTeam: [],
  max: undefined
}
const p = {
  type: -1,
  season: -1,
  noc_or_year: -1,
  medal: -1
}
const inf = require('./reads.js')
function dataProcessing (n) {
  switch (process.argv[n]) {
    case 'Medal':p.type = 1; break
    case 'Medals':p.type = 1; break
    case 'medal':p.type = 1; break
    case 'medals':p.type = 1; break
    case 'Top-teams':p.type = 2; break
    case 'Top-team':p.type = 2; break
    case 'top-teams':p.type = 2; break
    case 'top-team':p.type = 2; break
    case 'Winter':p.season = 'Winter'; break
    case 'winter':p.season = 'Winter'; break
    case 'Summer':p.season = 'Summer'; break
    case 'summer':p.season = 'Summer'; break
    case 'Gold':p.medal = 'Gold'; break
    case 'gold':p.medal = 'Gold'; break
    case 'Silver':p.medal = 'Silver'; break
    case 'silver':p.medal = 'Silver'; break
    case 'Bronze':p.medal = 'Bronze'; break
    case 'bronze':p.medal = 'Bronze'; break
    default:p.noc_or_year = process.argv[n]
  }
};

const startingScript = setInterval(() => { if (inf.inte) { clearInterval(startingScript); allScript() } }, 1000)

function allScript () {
  dataProcessing(2)
  dataProcessing(3)
  if (process.argv[4] && process.argv[4] !== undefined)dataProcessing(4)
  if (process.argv[5] && process.argv[5] !== undefined)dataProcessing(5)
  const sqlite3 = require('sqlite3').verbose()
  const db = new sqlite3.Database('./olympic_history.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message)
    }
    console.log('Connected to the database')
    db.run('DROP TABLE tmp1', () => {
      db.run('DELETE FROM sqlite_sequence WHERE name = "tmp1";', () => {
        db.run('CREATE TABLE tmp1(name text,numb int);')
      })
    })
    let season
    if (p.season === 'Summer')season = 0
    if (p.season === 'Winter')season = 1
    db.all('SELECT DISTINCT year year FROM games WHERE `season`="' + season + '" ORDER BY year;', (err, rows) => {
      if (err) {
        throw err
      }
      let n = 0
      rows.forEach((row) => {
        flags.masY[n] = row.year
        n++
      })

      db.all('SELECT DISTINCT NOC noc FROM allinfo WHERE `season`="' + p.season + '";', (err2, rows2) => {
        if (err2) {
          throw err2
        }
        let n2 = 0
        rows2.forEach((row2) => {
          flags.masN[n2] = row2.noc
          n2++
        })
        f()
      })
    })
  })

  function medalF () {
    console.log('Medal')
    console.log(p)
    db.all('SELECT DISTINCT NOC FROM allinfo WHERE `NOC`="' + p.noc_or_year + '"', (err, rows) => {
      if (err) {
        throw err
      }
      rows.forEach(() => {
        flags.flag3++
      }); if (flags.flag3) {
        if (p.season !== -1) {
          if (p.noc_or_year !== -1 && p.noc_or_year !== undefined) {
            for (let n = 0; n < flags.masY.length - 1; n++) {
              if (p.medal === -1) {
                db.all('SELECT COUNT(id) count FROM allinfo WHERE `NOC`="' + p.noc_or_year + '" AND `medal` NOT LIKE "NA" AND `season`="' + p.season + '" AND `year`=' + flags.masY[n] + ' GROUP BY `NOC`;', (err, rows) => {
                  if (err) {
                    throw err
                  } let tmp = 0
                  rows.forEach((row) => {
                    tmp = row.count
                  })
                  medalOut(tmp, flags.masY[n])
                })
              } else {
                db.all('SELECT COUNT(id) count FROM allinfo WHERE `NOC`="' + p.noc_or_year + '" AND `medal`="' + p.medal + '" AND `season`="' + p.season + '" AND `year`=' + flags.masY[n] + ' GROUP BY `NOC`;', (err, rows) => {
                  if (err) {
                    throw err
                  }
                  let tmp = 0
                  rows.forEach((row) => {
                    tmp = row.count
                  })
                  medalOut(tmp, flags.masY[n])
                })
              }
            }
            medalOutput()
          } else console.log('NOC is not enought')
        } else console.log('season is not enought')
      } else console.log('incorrect NOC')
    })
  }

  function medalOut (n, year) {
    flags.masMedal[year] = n
    flags.flag1++
  }

  function medalOutput () {
    if (flags.flag1 !== flags.masY.length - 1) {
      inter = setInterval(() => {
        if (flags.flag1 === flags.masY.length - 1) {
          clearInterval(inter); medalOutput()
        }
      }, 1000)
    } else {
      for (let n = 0; n < flags.masY.length - 1; n++) {
        const rik = flags.masY[n]
        if (flags.max === undefined) {
          const tt = flags.masMedal
          flags.max = tt[0]
          for (let t = 1; t < tt.length - 1; t++) {
            if (tt[t] > flags.max)flags.max = tt[t]
          }
        }
        makeGistogramm(rik, flags.masMedal[rik])
      }
      db.run('DROP TABLE tmp1')
      db.run('DELETE FROM sqlite_sequence WHERE name = "tmp1";')
      db.run('DROP TABLE allinfo')
      db.run('DELETE FROM sqlite_sequence WHERE name = "allinfo";')
    }
  }

  function f () {
    if (p.type.toString() === '1')medalF(); else {
      if (p.type.toString() === '2')teamF(); else console.log('type is not enought')
    }
  }

  function teamF () {
    console.log('Top_teams')
    console.log(p)
    db.all('SELECT year FROM games WHERE `year`=' + p.noc_or_year, (err, rows) => {
      if (err) {
        setTimeout(() => {
          console.log('incorrect year')
          db.run('DROP TABLE tmp1')
          db.run('DELETE FROM sqlite_sequence WHERE name = "tmp1";')
          db.run('DROP TABLE allinfo')
          db.run('DELETE FROM sqlite_sequence WHERE name = "allinfo";')
        }, 0)
      }
      if (p.noc_or_year === -1) {
        flags.flag3++
      }
      rows.forEach(() => {
        flags.flag3++
      })
      if (flags.flag3) {
        if (p.season !== -1) {
          if (p.noc_or_year !== -1 && p.noc_or_year !== undefined) {
            for (let n = 0; n < flags.masN.length - 1; n++) {
              if (p.medal === -1) {
                db.all('SELECT COUNT(id) count FROM allinfo WHERE `year`=' + p.noc_or_year + ' AND `medal` NOT like "NA" AND `season`="' + p.season + '" AND `NOC`="' + flags.masN[n] + '" GROUP BY `NOC`;', (err, rows) => {
                  if (err) {
                    throw err
                  } let tmp = 0
                  rows.forEach((row) => {
                    tmp = row.count
                  })
                  teamOut(tmp, flags.masN[n])
                  flags.flag4 = 1
                })
              } else {
                db.all('SELECT COUNT(id) count FROM allinfo WHERE `year`=' + p.noc_or_year + ' AND `medal`="' + p.medal + '" AND `season`="' + p.season + '" AND `NOC`="' + flags.masN[n] + '" GROUP BY `NOC`;', (err, rows) => {
                  if (err) {
                    throw err
                  } let tmp = 0
                  rows.forEach((row) => {
                    tmp = row.count
                  })
                  teamOut(tmp, flags.masN[n])
                  flags.flag4 = 1
                })
              }
            }
            teamOutput()
          } else {
            for (let n = 0; n < flags.masN.length - 1; n++) {
              if (p.medal === -1) {
                db.all('SELECT COUNT(id) count FROM allinfo WHERE `medal` NOT like "NA" AND `season`="' + p.season + '" AND `NOC`="' + flags.masN[n] + '" GROUP BY `NOC`;', (err, rows) => {
                  if (err) {
                    throw err
                  } let tmp = 0
                  rows.forEach((row) => {
                    tmp = row.count
                  })
                  teamOut(tmp, flags.masN[n])
                  flags.flag4 = 1
                })
              } else {
                db.all('SELECT COUNT(id) count FROM allinfo WHERE `medal`="' + p.medal + '" AND `season`="' + p.season + '" AND `NOC`="' + flags.masN[n] + '" GROUP BY `NOC`;', (err, rows) => {
                  if (err) {
                    throw err
                  } let tmp = 0
                  rows.forEach((row) => {
                    tmp = row.count
                  })
                  teamOut(tmp, flags.masN[n])
                  flags.flag4 = 1
                })
              }
            }
            teamOutput()
          }
        } else console.log('season is not enought')
      } else console.log('incorrect year' + flags.flag3)
    })
  }

  function teamOut (n, year) {
    flags.masTeam[year] = n
    db.run('INSERT INTO tmp1(name,numb) VALUES ("' + year + '",' + n + ');', () => {
      flags.flag1++
    })
  }

  function teamOutput () {
    if (flags.flag1 !== flags.masN.length - 1) {
      inter = setInterval(() => {
        if (flags.flag1 === flags.masN.length - 1) {
          clearInterval(inter)
          teamOutput()
        }
      }, 1000)
    } else {
      db.all('SELECT name name,numb numb FROM tmp1 WHERE numb>(SELECT avg(numb) FROM tmp1) GROUP BY numb ORDER BY numb DESC;', (err, rows) => {
        if (err) {
          throw err
        }
        rows.forEach((row) => {
          if (flags.flag2) {
            flags.max = row.numb
            flags.flag2--
          }
          makeGistogramm(row.name, row.numb)
        })
      })
      db.run('DROP TABLE tmp1')
      db.run('DELETE FROM sqlite_sequence WHERE name = "tmp1";')
      db.run('DROP TABLE allinfo')
      db.run('DELETE FROM sqlite_sequence WHERE name = "allinfo";')
    }
  }

  function makeGistogramm (nam, num) {
    let vv; let vv2 = ''
    if (flags.max > 200) { vv = num * (200 / flags.max) } else { vv = num }
    for (let z = 1; z < vv; z++) { vv2 += '█' }
    console.log()
    console.log(nam + ' ' + ' ' + vv2)
  }
}
