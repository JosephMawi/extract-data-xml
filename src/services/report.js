const { getFullHour, getFullYear } = require("../utils/date-format");

const isReport = async (report) => {
  let index = report.indexOf('REPORT')
  return index >= 0 ? true : false
}

const getReport = async (report, timestamp) => {
  return {
    date: await getFullYear(timestamp),
    transactionHour: await getFullHour(timestamp),
    requestId: report.substring(report.indexOf('RequestId:') + 'RequestId:'.length + 1 , report.indexOf('Duration:') - 1),
    duration: report.substring(report.indexOf('Duration:') + 'Duration:'.length + 1, report.indexOf('Billed') - 1)
  }
}

module.exports = {
  isReport,
  getReport
}