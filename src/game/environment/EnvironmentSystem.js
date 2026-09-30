/**
 * Score-based environment state and transition controller.
 * The renderer consumes this state; gameplay systems only provide the score.
 */

export const ENVIRONMENTS = {
  MORNING: 'morning',
  NIGHT: 'night',
  SUNSET: 'sunset',
};

export const ENVIRONMENT_THRESHOLDS = [
  { score: 0, environment: ENVIRONMENTS.MORNING },
  { score: 50, environment: ENVIRONMENTS.NIGHT },
  { score: 100, environment: ENVIRONMENTS.SUNSET },
  { score: 150, environment: ENVIRONMENTS.MORNING },
];

export function getEnvironmentForScore(score) {
  const safeScore = Math.max(0, Number(score) || 0);
  let environment = ENVIRONMENTS.MORNING;

  for (const threshold of ENVIRONMENT_THRESHOLDS) {
    if (safeScore >= threshold.score) {
      environment = threshold.environment;
    } else {
      break;
    }
  }

  return environment;
}

export class EnvironmentSystem {
  constructor(transitionDuration = 0.75) {
    this.transitionDuration = transitionDuration;
    this.current = ENVIRONMENTS.MORNING;
    this.previous = ENVIRONMENTS.MORNING;
    this.transitionTime = transitionDuration;
  }

  setScore(score) {
    const nextEnvironment = getEnvironmentForScore(score);
    if (nextEnvironment === this.current) return false;

    this.previous = this.current;
    this.current = nextEnvironment;
    this.transitionTime = 0;
    return true;
  }

  update(dt) {
    if (this.transitionTime < this.transitionDuration) {
      this.transitionTime = Math.min(
        this.transitionDuration,
        this.transitionTime + dt
      );
    }
  }

  getTransition() {
    const progress = this.transitionDuration === 0
      ? 1
      : Math.min(1, this.transitionTime / this.transitionDuration);

    return {
      current: this.current,
      previous: this.previous,
      progress,
      isTransitioning: progress < 1,
    };
  }

  reset(score = 0) {
    const environment = getEnvironmentForScore(score);
    this.current = environment;
    this.previous = environment;
    this.transitionTime = this.transitionDuration;
  }
}
