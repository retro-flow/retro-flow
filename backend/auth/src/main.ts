import { argv } from 'node:process'
import { fileURLToPath } from 'node:url'

import cookieParser from 'cookie-parser'
import { Logger as NestLogger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ExpressAdapter, type NestExpressApplication } from '@nestjs/platform-express'

import { AppModule } from './app-module'

async function createApp() {
  if (import.meta.hot) {
    const inputSemaphore = import.meta.hot.data.semaphore
    // NOTE: Дожидаемся закрытия предыдущего инстанса приложения, если он есть в HMR.
    if (inputSemaphore) {
      await inputSemaphore
    }
  }

  const unhandledErrors = onUnhandledErrors()

  const adapter = new ExpressAdapter()
  const app = await NestFactory.create<NestExpressApplication>(AppModule, adapter, {
    bufferLogs: true,
  })

  app.use(cookieParser())

  app.enable('trust proxy')
  app.disable('x-powered-by')

  await app.init()

  app.flushLogs()

  if (isMainModule(import.meta.url)) {
    await app.listen(process.env.PORT ?? 3000)
  }

  unhandledErrors()

  return app
}

function onUnhandledErrors() {
  const flushNestLogsOnError = () => {
    NestLogger.flush()
  }

  process.on('uncaughtException', flushNestLogsOnError)
  process.on('unhandledRejection', flushNestLogsOnError)

  return () => {
    process.off('uncaughtException', flushNestLogsOnError)
    process.off('unhandledRejection', flushNestLogsOnError)
  }
}

function handleUncaught(error: Error) {
  console.error(`Unhandled error: ${error}`)
  process.exit(1)
}

function isMainModule(url: string): boolean {
  return url.startsWith('file:') && argv[1] === fileURLToPath(url)
}

process.on('uncaughtException', handleUncaught)
process.on('unhandledRejection', handleUncaught)

const app = await createApp()
const onRequest = app.getHttpAdapter().getInstance()

export default onRequest

if (import.meta.hot) {
  import.meta.hot.accept()

  import.meta.hot.dispose((data) => {
    data.semaphore = app.close()
  })
}
