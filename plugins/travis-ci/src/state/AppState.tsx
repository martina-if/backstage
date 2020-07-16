/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { FC, useReducer, Dispatch, Reducer } from 'react';
import { travisCIApiRef } from '../api';
import type { State, Action, SettingsState } from './types';

export type { SettingsState };

export const AppContext = React.createContext<[State, Dispatch<Action>]>(
  [] as any,
);
export const STORAGE_KEY = `${travisCIApiRef.id}.settings`;

const initialState: State = {
  owner: '',
  repo: '',
  token: '',
  showSettings: false,
};

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'setCredentials':
      return {
        ...state,
        ...action.payload,
      };
    case 'showSettings':
      return { ...state, showSettings: true };
    case 'hideSettings':
      return { ...state, showSettings: false };
    default:
      return state;
  }
};

export const AppStateProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={[state, dispatch]}>
      {children}
    </AppContext.Provider>
  );
};
