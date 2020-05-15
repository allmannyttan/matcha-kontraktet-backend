import configPackage from '@iteam/config'

export interface Config {
  port: number
}

const config = configPackage({
  file: `${__dirname}/../config.json`,
  defaults: {
    port: 9000,
  },
})

export default {
  port: config.get('port'),
} as Config
