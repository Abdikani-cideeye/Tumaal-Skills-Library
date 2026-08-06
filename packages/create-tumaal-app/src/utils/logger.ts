import picocolors from 'picocolors';

const { bold, cyan, green, red, yellow, gray, white } = picocolors;

export const logger = {
  banner() {
    console.log('');
    console.log(bold(cyan('  ████████╗██╗   ██╗███╗   ███╗ █████╗  █████╗ ██╗')));
    console.log(bold(cyan('     ██╔══╝██║   ██║████╗ ████║██╔══██╗██╔══██╗██║')));
    console.log(bold(cyan('     ██║   ██║   ██║██╔████╔██║███████║███████║██║')));
    console.log(bold(cyan('     ██║   ██║   ██║██║╚██╔╝██║██╔══██║██╔══██║██║')));
    console.log(bold(cyan('     ██║   ╚██████╔╝██║ ╚═╝ ██║██║  ██║██║  ██║███████╗')));
    console.log(bold(cyan('     ╚═╝    ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝')));
    console.log('');
    console.log(bold(white('  create-tumaal-app')) + gray(' — Production-grade monorepo scaffolding'));
    console.log('');
  },

  step(message: string) {
    console.log(`  ${bold(cyan('→'))} ${message}`);
  },

  success(message: string) {
    console.log(`  ${bold(green('✓'))} ${message}`);
  },

  warn(message: string) {
    console.log(`  ${bold(yellow('⚠'))} ${message}`);
  },

  fatal(message: string) {
    console.error(`  ${bold(red('✗'))} ${message}`);
  },

  done(projectName: string) {
    console.log('');
    console.log(bold(green('  ✓ Project scaffolded!')));
    console.log('');
    console.log(gray('  Next steps:'));
    console.log(`  ${gray('1.')} ${cyan(`cd ${projectName}`)}`);
    console.log(`  ${gray('2.')} ${cyan('pnpm install')}`);
    console.log(`  ${gray('3.')} ${cyan('cp .env.example .env')} ${gray('# fill in your secrets')}`);
    console.log(`  ${gray('4.')} ${cyan('cat SKILLS.md')} ${gray('# fill in the architect decision doc')}`);
    console.log(`  ${gray('5.')} ${cyan('pnpm dev')}`);
    console.log('');
    console.log(gray('  Run the Tumaal Audit skill after filling in SKILLS.md'));
    console.log('');
  },
};
