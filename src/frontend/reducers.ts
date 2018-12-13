import {
  combineReducers,
  ReducersMapObject
} from 'redux';

import {
  crud as dummy, 
  Action as DummyAction, 
  State as DummyState
} from './actions/dummy-crud';

import {
  crud as dummy2, 
  Action as Dummy2Action, 
  State as Dummy2State
} from './actions/dummy2-crud';

export interface RootState {
  dummy: DummyState;
  dummy2: Dummy2State;
}

export type RootAction = DummyAction | Dummy2Action;

const reducers:ReducersMapObject<RootState, RootAction> = {
  dummy: dummy.reducer,
  dummy2: dummy2.reducer
}; 
export const rootReducer = combineReducers(reducers);

