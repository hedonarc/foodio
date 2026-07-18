import type { UserConfig } from '@commitlint/types';

// Read more about commit message format at https://www.conventionalcommits.org/en/v1.0.0/
const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
};

export default config;
