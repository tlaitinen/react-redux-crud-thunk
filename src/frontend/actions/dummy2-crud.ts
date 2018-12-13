import * as c from './crud';

export type Dummy2In = {name2:string};
export type Dummy2 = {id:string} & Dummy2In;
export type Query = Partial<{
  offset:number;
  limit: number;
}>;
export type State = c.State<Dummy2, Dummy2In, Query>;
export type Action = c.Action<Dummy2, Dummy2In, Query>;
export const crud = c.create<Dummy2, Dummy2In, Query>(d => d.id);

