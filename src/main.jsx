import React from 'react'
import ReactDOM from 'react-dom/client'
import Hover from './Hover'
import './index.scss'

const root = document.createElement('div')
root.id = 'crx-root'
document.body.append(root)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Hover />
  </React.StrictMode>,
  root
)
