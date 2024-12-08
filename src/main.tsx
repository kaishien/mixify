import "reflect-metadata";

import { createRoot } from 'react-dom/client'
import './index.css'
import { Application } from './application/application.tsx'

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById('root')!).render(
  <Application/>
)