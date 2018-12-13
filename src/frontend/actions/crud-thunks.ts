import {State, Actions, Action} from './crud';
import {ThunkAction, ThunkDispatch} from 'redux-thunk';
// import {Result} from '../../types/result';
//
export interface Result<T> {
  result: T[],
  totalCount: number
}



export interface Client<Entity,EntityIn,Query> {
  fetch: (query:Query) => Promise< Result<Entity> >;
  put: (id:string, payload:Entity) => Promise<void>;
  post: (payload:EntityIn) => Promise<{id:string}>;
}

export function create<Entity,EntityIn,Query,RootState>(
  actions:Actions<Entity,EntityIn,Query>, 
  client:Client<Entity,EntityIn,Query>, 
  getCrudState:(rs:RootState) => State<Entity,EntityIn,Query>
) {
  type RootAction = Action<Entity,EntityIn,Query>;
  function fetch(queryName:string, query:Query):ThunkAction<Promise<Result<Entity> | undefined>, RootState, void, RootAction> {
    return async (dispatch:ThunkDispatch<RootState, void, RootAction>) => {

      dispatch(actions.setLoading(queryName, true));
      let r:Result<Entity> | undefined;
      try {
        r = await client.fetch(query);
      } catch (e) {
        console.error(e);
      }
      if (r) {
        dispatch(actions.storeResult(queryName, r));
      }
      dispatch(actions.setLoading(queryName, false));
      return r;
    };
  }
  function post(queryName:string, entityIn:EntityIn):ThunkAction<Promise<{id:string} | undefined>, RootState, void, RootAction> {
    return async (dispatch:ThunkDispatch<RootState, void, RootAction>, getState:() => RootState) => {
      dispatch(actions.setLoading(queryName, true));
      let r:{id:string} | undefined;
      try {
        r = await client.post(entityIn);
      } catch (e) {
        console.error(e);
      }

      dispatch(actions.setLoading(queryName, false));
      const st = getCrudState(getState());
      const query = st.queries[queryName];
      if (query) {
        dispatch(fetch(queryName, query));
      }
      return r;
    };
  }
  function put(entityId:string, entity:Entity):ThunkAction<Promise<void>, RootState, void, RootAction> {
    return async (dispatch:ThunkDispatch<RootState, void, RootAction>) => {
      dispatch(actions.setBusy(entityId, true));
      try {
        await client.put(entityId, entity);
      } catch (e) {
        console.error(e);
      }
      dispatch(actions.setEntity(entityId, entity));
      dispatch(actions.setBusy(entityId, false));
    };
  }
  return {
    fetch,
    post,
    put
  };
}
