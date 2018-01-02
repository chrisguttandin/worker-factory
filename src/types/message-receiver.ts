import { TMessage } from './message';

export type TMessageReceiver<T extends TMessage> = (params: T['params']) => T['response'];
