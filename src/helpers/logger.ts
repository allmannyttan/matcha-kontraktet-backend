const createOutputJson = (
  level: string,
  message: string,
  httpStatus?: number,
  url?: string,
  stacktrace?: string
): string => {
  return `{
  "level": "${level}",
  "message": "${message}",
  "httpStatus": "${httpStatus ?? ''}",
  "url": "${url ?? ''}",
  "stacktrace": "${stacktrace ?? ''}",
}`
}

const debug = (
  message: string,
  httpStatus?: number,
  url?: string,
  stacktrace?: string
) => {
  console.debug(createOutputJson('debug', message, httpStatus, url, stacktrace))
}

const info = (
  message: string,
  httpStatus?: number,
  url?: string,
  stacktrace?: string
) => {
  console.info(createOutputJson('info', message, httpStatus, url, stacktrace))
}

const warn = (
  message: string,
  httpStatus?: number,
  url?: string,
  stacktrace?: string
) => {
  console.warn(createOutputJson('warn', message, httpStatus, url, stacktrace))
}

const error = (
  message: string,
  httpStatus?: number,
  url?: string,
  stacktrace?: string
) => {
  console.warn(createOutputJson('error', message, httpStatus, url, stacktrace))
}

export default {
  debug,
  info,
  warn,
  error,
}
