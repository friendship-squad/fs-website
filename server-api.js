const express = require('express')
const fflogs = require('./fflogs')
const router = express.Router()

const STATIC = [
  'Bees Knees',
  'Cygne Eala',
  'Kup-O Coffee',
  'Lulu Pillow',
  'Wunsucc Wahnquck',
  'Zeno Mus'
]

const cache = {}

router.get('/team', (_, response) => {
  if (cache.TEAM && cache.TEAM.timestamp > Date.now() - 86400000) {
    return response.json(cache.TEAM.value)
  }

  fflogs.getGuildReports('Friendship Squad', 'Adamantoise', 'NA')
    .then(reports => Promise.all(reports
      .filter(report => report.zone === 21)
      .map(report => fflogs.getTablesReport('deaths', report.id, { start: 0, end: Number.MAX_SAFE_INTEGER })))
    )
    .then(reports => {
      const results = {}
      for (const report of reports) {
        for (const death of report.entries) {
          const { name } = death
          results[name] = (results[name] || 0) + 1
        }
      }

      // TODO: This does not check for serverName and is not case-sensitive
      const staticResults = STATIC
        .reduce((acc, key) => {
          acc[key] = results[key]
          return acc
        }, {})

      cache.TEAM = {
        value: staticResults,
        timestamp: Date.now()
      }

      response.json(cache.TEAM.value)
    })
})

module.exports = router