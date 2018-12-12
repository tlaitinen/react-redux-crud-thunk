import {ActionType, createAction, getType} from 'typesafe-actions';
import {Result} from '../../types/result';
export interface Results {
  result: string[];
  totalCount: number;
  loading: boolean;
}
export interface State<E,EI,Q> {
  queries: {
    [queryName:string]: Q | undefined;
  };
  results: {
    [queryName:string]: Results | undefined;
  };
  entities: {
    [entityId:string]: E | undefined;
  };
  entitiesIn: {
    [editorId:string]: EI | undefined;
  };
  busy: {
    [entityId:string]: boolean | undefined;
  };
  selected: {
    [queryName:string]: {
      [entityId:string]: boolean | undefined;
    } | undefined;
  };
}
let nextCrudId = 1;

export interface SetQueryAction<Q> {
  type: 'CRUD_SET_QUERY';
  payload: {
    queryName: string;
    query: Q;
  };
}
export interface StoreResultAction<E> {
  type: 'CRUD_STORE_RESULT';
  payload: {
    queryName: string;
    result: Result<E>;
  };
}

export interface SetLoadingAction {
  type: 'CRUD_SET_LOADING';
  payload: {
    queryName: string;
    loading: boolean;
  };
}

export interface SetBusyAction {
  type: 'CRUD_SET_BUSY';
  payload: {
    entityId: string;
    busy: boolean;
  };
}

export interface SetEntityAction<E> {
  type: 'CRUD_SET_ENTITY';
  payload: {
    entityId: string;
    entity: E;
  };
}
export interface SetEntityInAction<EI> {
  type: 'CRUD_SET_ENTITY_IN';
  payload: {
    editorId: string;
    entityIn: EI;
  };
}
export interface SetSelectedAction {
  type: 'CRUD_SET_SELECTED';
  payload: {
    queryName: string;
    selected: {
      [entityId:string]: boolean | undefined
    };
  };
}
export interface ClearSelectedAction {
  type: 'CRUD_CLEAR_SELECTED';
  payload: {
    queryName: string;
  };
}
export type Action<E,EI,Q> = SetQueryAction<Q>
  | StoreResultAction<E>
  | SetLoadingAction
  | SetBusyAction
  | SetEntityAction<E>
  | SetEntityInAction<EI>
  | SetSelectedAction
  | ClearSelectedAction;

export const defEditorId = 'default';
export interface Actions<E,EI,Q> {
  setQuery: (queryName:string, query:Q) => SetQueryAction<Q>;
  storeResult: (queryName:string, result:Result<E>) => StoreResultAction<E>;
  setLoading: (queryName:string, loading:boolean) => SetLoadingAction;
  setBusy: (entityId:string, busy:boolean) => SetBusyAction;
  setEntity: (entityId:string, entity:E) => SetEntityAction<E>;
  setEntityIn: (editorId:string, entityIn:EI) => SetEntityInAction<EI>;
  setSelected: (queryName:string, selected:{[entityId:string]: boolean | undefined}) => SetSelectedAction;
  clearSelected: (queryName:string) => ClearSelectedAction;
};

export const defQueryName = 'default';
export function create<E,EI,Q>(getEntityId: (entity:E) => string) {
  const crudId = nextCrudId++;

  const defState:State<E,EI,Q> = {
    queries: {},
    results: {},
    entities: {},
    entitiesIn: {},
    busy: {},
    selected: {}
  };
  const actions = {
    setQuery: createAction('CRUD_SET_QUERY', 
      resolve => (queryName: string, query:Q) => resolve({
        crudId,
        queryName,
        query
      })
    ),
    storeResult: createAction('CRUD_STORE_RESULT',
      resolve => (queryName:string, result:Result<E>) => resolve({
        crudId,
        queryName,
        result
      })
    ),
    setLoading: createAction('CRUD_SET_LOADING',
      resolve => (queryName:string, loading:boolean) => resolve({
        crudId,
        queryName,
        loading
      })
    ),
    setBusy: createAction('CRUD_SET_BUSY',
      resolve => (entityId:string, busy:boolean) => resolve({
        crudId,
        entityId,
        busy
      })
    ),
    setEntity: createAction('CRUD_SET_ENTITY',
      resolve => (entityId:string, entity:E) => resolve({
        crudId,
        entityId,
        entity
      })
    ),
    setEntityIn: createAction('CRUD_SET_ENTITY_IN',
      resolve => (editorId:string, entityIn:EI) => resolve({
        crudId,
        editorId,
        entityIn
      })
    ),
    setSelected: createAction('CRUD_SET_SELECTED',
      resolve => (
        queryName:string,
        selected:{[entityId:string]: boolean | undefined}
      ) => resolve({
        crudId,
        queryName,
        selected
      })
    ),
    clearSelected: createAction('CRUD_CLEAR_SELECTED',
      resolve => (queryName:string) => resolve({
        crudId,
        queryName
      })
    )
  };
  function reducer(state:State<E,EI,Q> = defState, action:ActionType<typeof actions>) {
    if (action.payload.crudId !== crudId) {
      return state;
    }

    switch(action.type) {
      case getType(actions.setQuery):
        return {
          ...state,
          queries: {
            ...state.queries,
            [action.payload.queryName]: action.payload.query
          }
        };
      case getType(actions.storeResult):
        const entities:{[entityId:string]: E | undefined} = {};
        const r = action.payload.result;
        r.result.forEach(e => {
          entities[getEntityId(e)] = e;
        });
        return {
          ...state,
          entities: {
            ...state.entities,
            ...entities
          },
          queries: {
            ...state.queries,
            [action.payload.queryName]: {
              results: r.result.map(e => getEntityId(e)),
              totalCount: r.totalCount,
              loading: false
            }
          }
        };
      case getType(actions.setLoading):
        return {
          ...state,
          results: {
            ...state.results,
            [action.payload.queryName]: {
              ...state.results[action.payload.queryName],
              loading: action.payload.loading
            }
          }         
        };
      case getType(actions.setBusy):
        return {
          ...state,
          busy: {
            ...state.busy,
            [action.payload.entityId]: action.payload.busy
          }
        };
      case getType(actions.setEntity):
        return {
          ...state,
          entities: {
            ...state.entities,
            [action.payload.entityId]: action.payload.entity
          }
        };
      case getType(actions.setEntityIn):
        return {
          ...state,
          entitiesIn: {
            ...state.entitiesIn,
            [action.payload.editorId]: action.payload.entityIn
          }
        };
      case getType(actions.setSelected):
        return {
          ...state,
          selected: {
            ...state.selected,
            [action.payload.queryName]: {
              ...state.selected[action.payload.queryName],
              ...action.payload.selected
            }
          }
        };
      case getType(actions.clearSelected):
        return {
          ...state,
          selected: {
            ...state.selected,
            [action.payload.queryName]: {}
          }
        };
      default:
        return state;
    }
  }
  return {
    actions,
    reducer
  };
}
