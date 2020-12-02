const { getFullHour } = require("../utils/date-format");

const whiteSpace = 1, removeMS = 4

const isReport = async (report) => {
  let index = report.indexOf('REPORT')
  return index >= 0 ? true : false
}

const getReport = async (report, timestamp) => {
  return {
    // date: await getFullYear(timestamp),
    transactionHour: await getFullHour(timestamp),
    requestId: report.substring(report.indexOf('RequestId:') + 'RequestId:'.length + whiteSpace , report.indexOf('Duration:') - whiteSpace),
    duration: report.substring(report.indexOf('Duration:') + 'Duration:'.length + whiteSpace, report.indexOf('Billed') - removeMS)
  }
}

module.exports = {
  isReport,
  getReport
}