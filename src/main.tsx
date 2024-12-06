import "reflect-metadata";

import { createRoot } from 'react-dom/client'
import './index.css'
import { Application } from './application/application.tsx'

createRoot(document.getElementById('root')!).render(
  <Application/>
)