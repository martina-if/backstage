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
import React, { Dispatch, FC, Reducer, useReducer } from 'react';
import { Action, GET_BUILDS, State } from './types';

const initialState: State = {
  id: 0,
  state: '',
};

export const AppContext = React.createContext<[State, Dispatch<Action>]>(
  [] as any,
);

const getBuilds = () => {
  return async () => {
    try {
      return await fetch('https://api.travis-ci.com/builds', {
        headers: {
          Authorization: 'token QIWw2oe09G7EaqAdo_wNZA',
          'Travis-Api-Version': '3',
        },
      })
        .then(response => response)
        .then(json => json);
    } catch (e) {
      return e;
    }
  };
};

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case GET_BUILDS:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export const AppStateProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={[state, dispatch]}>
      <>{children}</>
    </AppContext.Provider>
  );
};
