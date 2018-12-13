import {
  combineReducers,
  ReducersMapObject
} from 'redux';

import {
  crud as dummy, 
  Action as DummyAction, 
  State as DummyState
} from './actions/dummy-crud';

import {createStandardAction, ActionType} from 'typesafe-actions';

export interface RootState {
  dummy: DummyState;
}

export const actions = {
  test: createStandardAction('TEST_ACTION')<{test:string}>()
};

type TestAction = ActionType<typeof actions>;

export type RootAction = DummyAction | TestAction;

const reducers:ReducersMapObject<RootState, RootAction> = {
  dummy: dummy.reducer
}; 
export const rootReducer = combineReducers(reducers);

