export enum OnboardingStep {
  /**
   * One checklist for every permission. A device part-way through the old
   * two-screen flow decodes to no known step and simply sees the checklist
   * once; `Complete` keeps its value, so nobody already onboarded repeats it.
   */
  Permissions = 'permissions',
  Complete = 'complete',
}
