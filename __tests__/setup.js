global.console = {
  error: jest.fn(), // console.error are ignored in tests

  // Keep native behaviour for other methods, use those to print out things in your own tests, not `console.error`
  log: console.log,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
}
