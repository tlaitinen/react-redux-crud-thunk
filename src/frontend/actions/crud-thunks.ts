import {State, Actions, Action} from './crud';
import {Action as ReduxAction} from 'redux';
import {ThunkAction, ThunkDispatch} from 'redux-thunk';
import {Result} from '../../types/result';

export interface Client<E,EI,Q> {
  fetch: (query:Q) => Promise< Result<E> >;
  put: (id:string, payload:E) => Promise<void>;
  post: (payload:EI) => Promise<{id:string}>;
}

export function create<
  E,EI,Q,RS, RA extends Action<E,EI,Q> & ReduxAction<any>
>(
  actions:Actions<E,EI,Q>, 
  client:Client<E,EI,Q>, 
  getCrudState:(rs:RS) => State<E,EI,Q>
) {
  function fetch(queryName:string, query:Q):ThunkAction<Promise<Result<E> | undefined>, RS, void, RA> {
    return async (dispatch:ThunkDispatch<RS, void, RA>) => {
      try {
        dispatch(actions.setLoading(queryName, true));
        const r = await client.fetch(query);
        dispatch(actions.storeResult(queryName, r));
        dispatch(actions.setLoading(queryName, false));
        return r;
      } catch (e) {
        dispatch(actions.setLoading(queryName, false));
        console.error(e);
      }
    };
  }
  function post(queryName:string, entityIn:EI):ThunkAction<Promise<{id:string} | undefined>, RS, void, RA> {
    return async (dispatch:ThunkDispatch<RS, void, RA>, getState:() => RS) => {
      try {
        dispatch(actions.setLoading(queryName, true));
        const r = await client.post(entityIn);
        dispatch(actions.setLoading(queryName, false));
        const st = getCrudState(getState());
        const query = st.queries[queryName];
        if (query) {
          dispatch(fetch(queryName, query));
        }
        return r;
      } catch (e) {
        console.error(e);
        dispatch(actions.setLoading(queryName, false));
      }
    };
  }
  function put(entityId:string, entity:E):ThunkAction<Promise<void>, RS, void, RA> {
    return async (dispatch:ThunkDispatch<RS, void, RA>) => {
      try {
        dispatch(actions.setBusy(entityId, true));
        await client.put(entityId, entity);
        dispatch(actions.setEntity(entityId, entity));
        dispatch(actions.setBusy(entityId, false));
      } catch (e) {
        dispatch(actions.setBusy(entityId, false));
        console.error(e);
      }
    };
  }
  return {
    fetch,
    post,
    put
  };
}
