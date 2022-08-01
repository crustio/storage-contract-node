import { AppContext } from './context';

export interface Task {
  name: string;
  start: (context: AppContext) => void;
  stop: () => Promise<boolean>;
}
