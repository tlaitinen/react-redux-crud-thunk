import {ActionType, createAction, getType} from 'typesafe-actions';
import {Result} from '../../types/result';
export interface Results {
  result: string[];
  totalCount: number;
  loading: boolean;
}
export interface State<Entity,EntityIn,Query> {
  queries: {
    [queryName:string]: Query | undefined;
  };
  results: {
    [queryName:string]: Results | undefined;
  };
  entities: {
    [entityId:string]: Entity | undefined;
  };
  entitiesIn: {
    [editorId:string]: EntityIn | undefined;
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

export interface SetQueryAction<Query> {
  type: 'CRUD_SET_QUERY';
  payload: {
    crudId: number;
    queryName: string;
    query: Query;
  };
}
export interface StoreResultAction<Entity> {
  type: 'CRUD_STORE_RESULT';
  payload: {
    crudId: number;
    queryName: string;
    result: Result<Entity>;
  };
}

export interface SetLoadingAction {
  type: 'CRUD_SET_LOADING';
  payload: {
    crudId: number;
    queryName: string;
    loading: boolean;
  };
}

export interface SetBusyAction {
  type: 'CRUD_SET_BUSY';
  payload: {
    crudId: number;
    entityId: string;
    busy: boolean;
  };
}

export interface SetEntityAction<Entity> {
  type: 'CRUD_SET_ENTITY';
  payload: {
    crudId: number;
    entityId: string;
    entity: Entity;
  };
}
export interface SetEntityInAction<EntityIn> {
  type: 'CRUD_SET_ENTITY_IN';
  payload: {
    crudId: number;
    editorId: string;
    entityIn: EntityIn;
  };
}
export interface SetSelectedAction {
  type: 'CRUD_SET_SELECTED';
  payload: {
    crudId: number;
    queryName: string;
    selected: {
      [entityId:string]: boolean | undefined
    };
  };
}
export interface ClearSelectedAction {
  type: 'CRUD_CLEAR_SELECTED';
  payload: {
    crudId: number;
    queryName: string;
  };
}
export type Action<Entity,EntityIn,Query> = SetQueryAction<Query>
  | StoreResultAction<Entity>
  | SetLoadingAction
  | SetBusyAction
  | SetEntityAction<Entity>
  | SetEntityInAction<EntityIn>
  | SetSelectedAction
  | ClearSelectedAction;

export const defEditorId = 'default';
export interface Actions<Entity,EntityIn,Query> {
  setQuery: (queryName:string, query:Query) => SetQueryAction<Query>;
  storeResult: (queryName:string, result:Result<Entity>) => StoreResultAction<Entity>;
  setLoading: (queryName:string, loading:boolean) => SetLoadingAction;
  setBusy: (entityId:string, busy:boolean) => SetBusyAction;
  setEntity: (entityId:string, entity:Entity) => SetEntityAction<Entity>;
  setEntityIn: (editorId:string, entityIn:EntityIn) => SetEntityInAction<EntityIn>;
  setSelected: (queryName:string, selected:{[entityId:string]: boolean | undefined}) => SetSelectedAction;
  clearSelected: (queryName:string) => ClearSelectedAction;
};

export const defQueryName = 'default';
export function create<Entity,EntityIn,Query>(getEntityId: (entity:Entity) => string) {
  const crudId = nextCrudId++;

  const defState:State<Entity,EntityIn,Query> = {
    queries: {},
    results: {},
    entities: {},
    entitiesIn: {},
    busy: {},
    selected: {}
  };
  const actions = {
    setQuery: createAction('CRUD_SET_QUERY', 
      resolve => (queryName: string, query:Query) => resolve({
        crudId,
        queryName,
        query
      })
    ),
    storeResult: createAction('CRUD_STORE_RESULT',
      resolve => (queryName:string, result:Result<Entity>) => resolve({
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
      resolve => (entityId:string, entity:Entity) => resolve({
        crudId,
        entityId,
        entity
      })
    ),
    setEntityIn: createAction('CRUD_SET_ENTITY_IN',
      resolve => (editorId:string, entityIn:EntityIn) => resolve({
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
  function reducer(state:State<Entity,EntityIn,Query> = defState, action:ActionType<typeof actions>) {
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
        const entities:{[entityId:string]: Entity | undefined} = {};
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
          results: {
            ...state.queries,
            [action.payload.queryName]: {
              result: r.result.map(e => getEntityId(e)),
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
              result: [],
              totalCount: 0,
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
