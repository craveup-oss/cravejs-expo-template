import { spawn } from 'node:child_process';

// An explicit profile; normal ios/android/web scripts still require a real environment.
const child = spawn(
  process.execPath,
  ['node_modules/expo/bin/cli', 'start', ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      EXPO_NO_DOTENV: '1',
      EXPO_PUBLIC_CRAVEUP_API_URL: 'https://demo.maple-main.example',
      EXPO_PUBLIC_CRAVEUP_MERCHANT_SLUG: 'maple-main',
      EXPO_PUBLIC_CRAVEUP_LOCATION_ID: '0123456789abcdef01234567',
      EXPO_PUBLIC_CRAVEUP_CHECKOUT_ORIGIN:
        'https://checkout.maple-main.example',
    },
  },
);
child.on('exit', (code) => process.exit(code ?? 1));
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => child.kill(signal));
