import * as c from './crud';

export type DummyIn = {name:string};
export type Dummy = {id:string} & DummyIn;
export type Query = Partial<{
  offset:number;
  limit: number;
}>;
export type State = c.State<Dummy, DummyIn, Query>;
export type Action = c.Action<Dummy, DummyIn, Query>;
export const crud = c.create<Dummy, DummyIn, Query>(d => d.id);

