import React from 'react'
import './App.css'
import data from './components/treemap/@mock/data'
import { Treemap } from './components'
function App () {
  return (
    <div className='App'>
      <Treemap data={data} />
    </div>
  )
}

export default App
