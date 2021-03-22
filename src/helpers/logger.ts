const createOutputJson = (
  level: string,
  message: string,
  httpStatus?: number,
  stacktrace?: string
): string => {
  return `{
  "level": "${level}",
  "message": "${message}",
  "httpStatus": "${httpStatus}"
  "stacktrace": "${stacktrace ?? ''}"
}`
}

const debug = (message: string, httpStatus?: number, stacktrace?: string) => {
  console.debug(createOutputJson('debug', message, httpStatus, stacktrace))
}

const info = (message: string, httpStatus?: number, stacktrace?: string) => {
  console.info(createOutputJson('info', message, httpStatus, stacktrace))
}

const warn = (message: string, httpStatus?: number, stacktrace?: string) => {
  console.warn(createOutputJson('warn', message, httpStatus, stacktrace))
}

const error = (message: string, httpStatus?: number, stacktrace?: string) => {
  console.warn(createOutputJson('error', message, httpStatus, stacktrace))
}

export default {
  debug,
  info,
  warn,
  error,
}
