#!/usr/bin/env node
import { runWizard } from './wizard';
import { scaffold } from './scaffold';
import { logger } from './utils/logger';


async function main() {
  logger.banner();
  const context = await runWizard();
  await scaffold(context);
  logger.done(context.projectName);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  logger.fatal(message);
  process.exit(1);
});
